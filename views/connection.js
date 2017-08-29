var socket = io();
var players, indForPid;
var teams, indForTid;
var battles, indForBid;
var judge = 0, admin = 0;
var day = 0;

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
    sortBattles();
    redoBattles();
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
function sortBattles(){
    for (let i=0; i<battles.length; ++i){
        for (let j=battles.length-1; j>i; --j){
            if (battles[j].day < battles[j-1].day){
                [battles[j], battles[j-1]] = [battles[j-1], battles[j]];
                indForBid[battles[j-1].id] = j-1;
                indForBid[battles[j].id] = j;
            }
        }
    }
    if (battles.length != 0){day = battles[battles.length-1].day;}
}
function isDayActive(){
    for (let i=battles.length-1; i>=0; --i){
        if (battles[i].day != day){return 0;}
        if (battles[i].points1 == 0 && battles[i].points2 == 0){return 1;}
    }
}

function login(){
    socket.emit('login', getSigninData());
    return false;
}
socket.on('l', (success, isAdmin) => {
    judge = success;
    admin = isAdmin;
    console.log(success);
    if (!success){alert("Wrong username or password");}
    else{}
});