var socket = io();
var players, indForPid;
var teams, indForTid;
var battles, indForBid;

socket.on('init', (competitionName, _players, _indForPid, _teams, _indForTid, _battles, _indForBid)=>{
    setUp(competitionName);
    players = _players;
    indForPid = _indForPid;
    teams = _teams;
    indForTid = _indForTid;
    battles = _battles;
    indForBid = _indForBid;
    sortTeams();
    redoResults();
});

function sortTeams(){
    for (let i=0; i<teams.length; ++i){
        for (let j=teams.length-1; j>i; --j){
            if (cmpTeams(teams[j], teams[j-1])){
                [teams[j], teams[j-1]] = [teams[j-1], teams[j]];
                indForTid[teams[j-1].id] = j-1;
                indForTid[teams[j].id] = j;
            }
        }
    }
}