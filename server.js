var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var gets = require("./get_handler.js");
gets.handle(express, app);
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

http.listen(3000, () => {
    console.log("server started");
});