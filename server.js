const mysql = require('mysql');

const db_config = {
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'sozopol'
};

const gets = require("./get_handler.js");
const database = require("./database_access.js");
const Judge = require("./Admin.js").Judge;

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
database.loadCompetitions(connection, competitions, () => {
    //console.log(competitions);
    for (let i=0; i<competitions.length; ++i){
        runServer(competitions[i]);
    }
});

function runServer(competition){
    let express = require("express");
    let app = express();
    let http = require("http").Server(app);
    let io = require("socket.io")(http);

    gets.handle(express, app);
    app.get("/", (req, res) => {
        res.sendFile(__dirname + "/views/index.html");
    });
    app.get("/objects.js", (req, res) => {
        res.sendFile(__dirname + "/objects.js");
    });
    app.get("/*", (req, res) => {
        res.sendFile(__dirname + "/views" + req.url);
    });
    
    let players = [], indForPid = [];
    let teams = [], indForTid = [];
    let battles = [], indForBid = [];
    database.loadPlayers(connection, competition.id, players, indForPid, () => {
        database.loadTeams(connection, competition.id, players, teams, indForTid);
    });
    database.loadBattles(connection, competition.id, battles, indForBid);
    
    io.on('connection', (socket) => {
        let currentJudge;
        let success = 0;
        socket.emit('init', competition.name, players, indForPid, teams, indForTid, battles, indForBid);
        
        socket.on('login', (loginData) => {
            currentJudge = new Judge(connection, "", loginData.username, loginData.password, 0, (succ) => {
                success = succ;
                socket.emit('l', succ, succ && currentJudge.isAdmin);
            });
        });
    });

    http.listen(competition.port, () => {
        console.log(competition.name + " on port " + competition.port);
    });
}