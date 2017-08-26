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
        if (callback) callback();
    });
}
exports.loadTeams = function (connection, competition_id, players, teams, indForTid, callback){
    connection.query("SELECT * FROM teams WHERE competition_id = ?", competition_id, (err, rows, fields) => {
        if (err){console.error(err);}
        for (let i=0; i<rows.length; ++i){
            indForTid[rows[i].id] = teams.length;
            teams.push(new objects.Team(rows[i].id, rows[i].name, [], rows[i].points, rows[i].point_difference));
        }
        for (let i=0; i<players.length; ++i){
            teams[indForTid[players[i].team_id]].player_ids.push(players[i].id);
        }
        if (callback) callback();
    });
}
exports.loadBattles = function (connection, competition_id, battles, indForBid, callback){
    connection.query("SELECT battles.id, battles.day, battles.team1, battles.team2, battles.points1, battles.points2, battles.judges FROM battles INNER JOIN teams ON battles.team1 = teams.id WHERE teams.competition_id = ?", competition_id, (err, rows, fields) => {
        if (err){console.error(err);}
        for (let i=0; i<rows.length; ++i){
            indForBid[rows[i].id] = battles.length;
            battles.push(new objects.Battle(rows[i].id, rows[i].day, rows[i].team1, rows[i].team2, rows[i].points1, rows[i].points2, JSON.parse(rows[i].judges)));
        }
        if (callback) callback();
    });
}