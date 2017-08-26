const mysql = require('mysql');

const db_config = {
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'sozopol'
};

const gets = require("./get_handler.js");
const database = require("./database_access.js");

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 5000);
        }else{
            console.log("Successfull database load.");
        }
    });

    connection.on('error', function(err) {
        console.log('db error', err);
        setTimeout(handleDisconnect, 5000); 
    });
}

handleDisconnect();

var competitions = [];
database.loadCompetitions(connection, competitions);

function runServer(competition){
    let express = require("express");
    let app = express();
    let http = require("http").Server(app);
    let io = require("socket.io")(http);

    gets.handle(express, app);
    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/views/index.html");
    });

    http.listen(3000, () => {
        console.log("server started");
});
}