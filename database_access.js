const objects = require("./objects.js");
var exports = module.exports = {};

exports.loadCompetitions = function (connection, competitions, callback){
    connection.query("SELECT * FROM competitions", (err, rows, fields) => {
        if (err){console.error(err);}
        for (let i=0; i<rows.length; ++i){
            competitions.push(new objects.Competition(rows[i].id, rows[i].name, rows[i].port));
        }
        callback();
    });
}

exports.loadPlayers = function (connection, competition_id, players, indForPid, callback){
    connection.query("SELECT players.id, players.name, players.team_id, players.comb, players.geo, players.numb, players.alg FROM players INNER JOIN teams ON players.team_id = teams.id WHERE teams.competition_id = ?", competition_id, (err, rows, fields) => {
        if (err){console.error(err);}
        for (let i=0; i<rows.length; ++i){
            indForPid[rows[i].id] = players.length;
            players.push(new objects.Player(rows[i].id, rows[i].name, rows[i].team_id, rows[i].comb, rows[i].geom, rows[i].numb, rows[i].alg));
        }
        callback();
    });
}
exports.loadTeams = function (connection, competition_id, teams){}
exports.loadBattles = function (connection, competition_id, battles){}