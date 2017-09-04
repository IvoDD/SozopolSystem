const mysql = require('mysql');
var xlsx = require('xlsx');

const max_competitions = 3;
const max_days = 5;
const max_problems = 8;

var probs = xlsx.readFile('problems.xlsx').Sheets['problems'];

var problems = [];
for (let i = 0; i < max_competitions; ++i){
    problems[i] = [];
    for (let j = 0; j < max_days; ++j){
        problems[i][j] = [];
        for (let k = 0; k < max_problems; ++k){
            problems[i][j][k] = 0;
        }
    }
}
for (let i = 1; probs["A" + i] != undefined; ++i){
    problems[probs["A" + i].v - 1][probs["B" + i].v - 1][probs["C" + i].v - 1] = probs["D" + i].v;
}

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
    let judges = [];
    database.loadPlayers(connection, competition.id, players, indForPid, () => {
        database.loadTeams(connection, competition.id, players, teams, indForTid);
    });
    database.loadBattles(connection, competition.id, battles, indForBid);
    database.loadJudges(connection, judges);
    
    io.on('connection', (socket) => {
        let currentJudge;
        let success = 0;
        socket.emit('init', competition.name, players, indForPid, teams, indForTid, battles, indForBid, judges);
        
        socket.on('login', (loginData) => {
            currentJudge = new Judge(connection, "", loginData.username, loginData.password, 0, (succ, curr) => {
                success = succ;
                currentJudge = curr;
                if (succ){
                    socket.emit('l', succ, (succ && currentJudge.isAdmin), currentJudge.id);
                }else{
                    socket.emit('l', 0, 0, -1);
                }
            });
        });
        
        socket.on('sb', (newBattles)=>{
            if (!success || !currentJudge.isAdmin){console.log("unauthorized access try"); return;}
            let done = 0;
            for (let battle of newBattles){
                database.insertBattle(connection, battle, (id)=>{
                    battle.id = id;
                    indForBid[id] = battles.length;
                    battles.push(battle);
                    ++done;
                    if (done == newBattles.length){
                        io.emit('b', battles, indForBid);
                    }
                });
            }
        });
        
        socket.on('c', (battleId, challenges) => {
            if (!(success && (currentJudge.isAdmin || checkAdmin(battles[indForBid[battleId]], currentJudge.id)))){console.log("unauthorized access try"); return;}
            updateChallenges(competition.id, battleId, challenges, players, indForPid, teams, indForTid, battles, indForBid, () => {
                io.emit('r', players, indForPid, teams, indForTid, battles, indForBid);
            });
        });
        
        socket.on('ij', (battleId, judgeId) => {
            if (!success || !currentJudge.isAdmin){console.log("unauthorized access try"); return;}
            if (!checkAdmin(battles[indForBid[battleId]], judgeId)){
                battles[indForBid[battleId]].judges.push(judgeId);
                database.updateBattle(connection, battles[indForBid[battleId]]);
                io.emit('b', battles, indForBid);
            }
        });
    });

    http.listen(competition.port, () => {
        console.log(competition.name + " on port " + competition.port);
    });
}

function checkAdmin(battle, judgeId){
    for (let j of battle.judges){
        if (j == judgeId){return 1;}
    }
    return 0;
}

getProblemType = function(competition, day, problem){
    return problems[competition - 1][day - 1][problem - 1];
}

updateChallenges = function (competition_id, battle_id, challenges, players, indForPid, teams, indForTid, battles, indForBid, callback){
    let battle = battles[indForBid[battle_id]];
    if (battle.challenges){
        for (let chal of battle.challenges){
            players[indForPid[chal.player1]][getProblemType(competition_id, battle.day, chal.problem)] -= chal.points1;
            players[indForPid[chal.player2]][getProblemType(competition_id, battle.day, chal.problem)] -= chal.points2;
        }
    }
    teams[indForTid[battle.team1]].points -= pointsForResult(battle.points1, battle.points2);
    teams[indForTid[battle.team2]].points -= pointsForResult(battle.points2, battle.points1);
    teams[indForTid[battle.team1]].point_difference -= battle.points1 - battle.points2;
    teams[indForTid[battle.team2]].point_difference -= battle.points2 - battle.points1;
    let points1 = 0;
    let points2 = 0;
    if (challenges){
        for (let chal of challenges){
            points1 += chal.points1;
            points2 += chal.points2;
            players[indForPid[chal.player1]][getProblemType(competition_id, battle.day, chal.problem)] += chal.points1;
            players[indForPid[chal.player2]][getProblemType(competition_id, battle.day, chal.problem)] += chal.points2;
        }
    }
    battles[indForBid[battle_id]].challenges = challenges;
    battles[indForBid[battle_id]].points1 = points1;
    battles[indForBid[battle_id]].points2 = points2;

    teams[indForTid[battle.team1]].points += pointsForResult(points1, points2);
    teams[indForTid[battle.team2]].points += pointsForResult(points2, points1);
    teams[indForTid[battle.team1]].point_difference += points1 - points2;
    teams[indForTid[battle.team2]].point_difference += points2 - points1;
    
    database.updateBattle(connection, battles[indForBid[battle_id]]);
    database.updateTeam(connection, teams[indForTid[battle.team1]]);
    database.updateTeam(connection, teams[indForTid[battle.team2]]);
    for (let pid of teams[indForTid[battle.team1]].player_ids){
        database.updatePlayer(connection, players[indForPid[pid]]);
    }
    for (let pid of teams[indForTid[battle.team2]].player_ids){
        database.updatePlayer(connection, players[indForPid[pid]]);
    }
    if(callback) callback();
}
function pointsForResult(a, b){
    if (a==0 && b==0){return 0;}
    if (a>b+3){return 2;}
    if (a>=b-3){return 1;}
    return 0;
}
