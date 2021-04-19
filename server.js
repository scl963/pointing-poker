const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

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
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
});
