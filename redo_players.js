const mysql = require('mysql');
const xlsx = require('xlsx');

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

const database = require("./database_access.js");

const db_config = {
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj',
    database: 'sozopol'
};

var connection;
connection = mysql.createConnection(db_config);

var competitions = [];


getProblemType = function(competition, day, problem){
    return problems[competition - 1][day - 1][problem - 1];
}

database.loadCompetitions(connection, competitions, ()=>{
    for (let competition of competitions){
        let players = [], indForPid = [];
        let battles = [], indForBid = [];
        let judges = [];
        database.loadPlayers(connection, competition.id, players, indForPid, () => {
            for (let p of players){
                p.alg = p.geo = p.numb = p.comb = 0;
            }
            database.loadBattles(connection, competition.id, battles, indForBid, () => {
                for (let b of battles){
                    for (let chal of b.challenges){
                        players[indForPid[chal.player1]][getProblemType(competition.id, b.day, chal.problem)] += chal.points1;
                        players[indForPid[chal.player2]][getProblemType(competition.id, b.day, chal.problem)] += chal.points2;
                    }
                }
                for (let p of players){
                    console.log(p.name);
                    database.updatePlayer(connection, p);
                }
            });
        });
    }
});