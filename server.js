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

app.use(cors());

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");

  if (!socket.userId) {
    socket.userId = uuid();
  }

  console.log(socket.userId);

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
  });

  // Leaving room logic happens in disconnecting because on disconnect there's no record
  // of which rooms a user just left
  socket.on("disconnecting", () => {
    const rooms = io.of("/").adapter.rooms;

    socket.rooms.forEach((roomId) => {
      if (rooms.has(roomId)) {
        const roomSize = rooms.get(roomId).size - 1;
        io.to(roomId).emit("Room size changed", roomSize);
      }
    });
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  socket.on("create-new-room", function (callback) {
    const newRoomId = String(currRoomIdx);
    currRoomIdx += 1;

    socket.join(newRoomId);

    callback({
      roomId: newRoomId,
    });
  });

  socket.on("join-room-by-id", function (roomId, callback) {
    const rooms = io.of("/").adapter.rooms;

    if (rooms.has(roomId)) {
      socket.join(roomId);

      const roomSize = rooms.get(roomId).size;
      io.to(roomId).emit("Room size changed", roomSize);

      callback({
        status: "success",
      });
    } else {
      callback({
        status: "error",
      });
    }
  });

  socket.on("assign-point-value", function (roomId, pointValue, callback) {
    const rooms = io.of("/").adapter.rooms;

    console.log("Assigning point value", roomId, pointValue, callback);

    if (rooms.has(roomId)) {
      if (pointValues.has(pointValue)) {
        socket
          .to(roomId)
          .emit("point-value-assigned", socket.userId, pointValue);
      } else {
        callback("Invalid point value");
      }
    } else {
      callback("Room does not exist");
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
