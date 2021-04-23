const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

let currRoomIdx = 1;

app.use(cors());

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on('chat message', (msg) => {
   console.log('message: ' + msg);
 });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });

  socket.on("create-new-room", function (callback) {
    const newRoomId = String(currRoomIdx);
    currRoomIdx += 1;

    socket.join(newRoomId);

    console.log(`User joined room ${newRoomId}`);

    callback({
      roomId: newRoomId
    })

    // socket.emit('Room joined', {
    //   roomId: newRoomId
    // })
  })
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Need to user server here rather than app or else the sockets won't work
server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});
