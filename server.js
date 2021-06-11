const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const uuid = require("uuid").v4;

let currRoomIdx = 1;
const pointValues = new Set([0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]);

// We create an in memory cache of rooms with metadata and assigned point values, since we
// can't use socket.io to store data for a room
const roomStateCache = {};

app.use(cors());

app.use("/build", express.static("public/build"));

io.on("connection", (socket) => {
  console.log("a user connected");

  if (!socket.userId) {
    socket.userId = uuid();
  }

  function broadcastStateChange(roomId) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.has(roomId) && roomStateCache.hasOwnProperty(roomId)) {
      const roomState = roomStateCache[roomId];
      io.to(roomId).emit("state-change", roomState);
    } else {
      console.log("Attempted to broadcast to non-existent room");
    }
  }

  // Leaving room logic happens in disconnecting because on disconnect there's no record
  // of which rooms a user just left and we need to keep the cache in sync with socket.io
  socket.on("disconnecting", () => {
    const rooms = io.of("/").adapter.rooms;

    socket.rooms.forEach((roomId) => {
      if (rooms.has(roomId) && roomStateCache.hasOwnProperty(roomId)) {
        // Remove user from pointing map
        delete roomStateCache[roomId].points[socket.id];

        // If user was admin promote another
        if (roomStateCache[roomId].admin === socket.id) {
          const remainingUsers = Object.keys(roomStateCache[roomId].points);

          // Check whether there are still users in room, and if not, delete it
          if (remainingUsers.length) {
            roomStateCache[roomId].admin = remainingUsers[0];
          } else {
            delete roomStateCache[roomId];
            return;
          }
        }

        broadcastStateChange(roomId);
      }
    });
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  // TODO: Use uuids for room identification
  socket.on("create-new-room", function (callback) {
    const newRoomId = String(currRoomIdx);
    currRoomIdx += 1;

    socket.join(newRoomId);

    roomStateCache[newRoomId] = {
      admin: socket.id,
      points: {},
      showPoints: false,
    };
    roomStateCache[newRoomId].points[socket.id] = null;

    callback({
      roomId: newRoomId,
    });
  });

  // TODO: implement max room size
  socket.on("join-room-by-id", function (roomId, callback) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.has(roomId)) {
      socket.join(roomId);

      callback({
        status: "success",
        roomData: roomStateCache[roomId],
      });
      roomStateCache[roomId].points[socket.id] = null;
      broadcastStateChange(roomId);
    } else {
      callback({
        status: "error",
      });
    }
  });

  socket.on("assign-point-value", function (roomId, pointValue, callback) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.has(roomId)) {
      if (pointValues.has(pointValue)) {
        roomStateCache[roomId].points[socket.id] = pointValue;
        broadcastStateChange(roomId);
      } else {
        callback("Invalid point value");
      }
    } else {
      callback("Room does not exist");
    }
  });

  socket.on("admin-show-points", function (roomId) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.has(roomId)) {
      if (roomStateCache[roomId].admin === socket.id) {
        roomStateCache[roomId].showPoints = true;
        broadcastStateChange(roomId);
      }
    }
  });

  socket.on("admin-reset-points", function (roomId) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.has(roomId)) {
      roomStateCache[roomId].showPoints = false;
      for (const userId in roomStateCache[roomId].points) {
        roomStateCache[roomId].points[userId] = null;
      }

      broadcastStateChange(roomId);
    }
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Need to use server here rather than app or else the sockets won't work
server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});
