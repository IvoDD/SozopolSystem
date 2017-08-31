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
exports.updateBattle = function(connection, battle){
    connection.query("UPDATE battles SET points1 = ?, points2 = ?, challenges = ? WHERE id = ?", [battle.points1, battle.points2, JSON.stringify(battle.challenges), battle.id], function(err){
        if (err) console.error(err);
    });
}
exports.updateTeam = function(connection, team){
    connection.query("UPDATE teams SET points = ?, point_difference = ? WHERE id = ?", [team.points, team.point_difference, team.id], function(err){
        if (err) console.error(err);
    });
}
exports.updatePlayer = function(connection, player){
    connection.query("UPDATE players SET comb = ?, geo = ?, numb = ?, alg = ? WHERE id = ?", [player.comb, player.geo, player.numb, player.alg, player.id], function(err){
        if (err) console.error(err);        
    });
}

function insertable(battle){
    let ans = {};
    ans.day = battle.day;
    ans.team1 = battle.team1;
    ans.team2 = battle.team2;
    ans.points1 = battle.points1;
    ans.points2 = battle.points2;
    ans.judges = JSON.stringify(battle.judges);
    ans.challenges = JSON.stringify(battle.challenges);
    return ans;
}
exports.insertBattle = function(connection, battle, callback){
    let toInsert = insertable(battle);
    connection.query("INSERT INTO battles SET ?", toInsert, (err, result)=>{
        if (err){console.error(err);}
        callback(result.insertId);
    });
}
