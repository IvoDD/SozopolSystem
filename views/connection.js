var socket = io();
var players, indForPid;
var teams, indForTid;
var battles, indForBid;
var judges = [];
var judge = 0, admin = 0, currJudgeId = 0;
var day = 0;
var played = [], used = [], battlePrep = [], invalid = [];
var activeBattles = [];

socket.on('init', (competitionName, _players, _indForPid, _teams, _indForTid, _battles, _indForBid, _judges)=>{
    setUp(competitionName);
    players = _players;
    indForPid = _indForPid;
    teams = _teams;
    indForTid = _indForTid;
    battles = _battles;
    indForBid = _indForBid;
    judges = _judges;
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
    invalid = [];
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
    return 0;
}

function markInvalid(ind){
    invalid.push({f: activeBattles[ind].team1, s: activeBattles[ind].team2});
}
function generateBattles(){
    battlePrep = [];
    played = [];
    for (let i=0; i<teams.length; ++i){
        played[i] = [];
        used[i] = 0;
        for (let j=0; j<teams.length; ++j){
            played[i][j] = 0;
        }
    }
    for (let i=0; i<battles.length; ++i){
        played[indForTid[battles[i].team1]][indForTid[battles[i].team2]] = 1;
        played[indForTid[battles[i].team2]][indForTid[battles[i].team1]] = 1;
    }
    for (let i=0; i<invalid.length; ++i){
        played[indForTid[invalid[i].f]][indForTid[invalid[i].s]] = 1;
        played[indForTid[invalid[i].s]][indForTid[invalid[i].f]] = 1;
    }
    if (prepareBattles(0)){
        activeBattles = [];
        for (let i=0; i<battlePrep.length; ++i){
            activeBattles.push(new Battle(-1, day+1, teams[battlePrep[i].f].id, teams[battlePrep[i].s].id, 0, 0, []));
        }
        loadActiveBattles();
    }else{
        alert("not possible with given restrictions");
    }
}
function prepareBattles(ind){
    if (ind >= teams.length){return 1;}
    if (used[ind]){return prepareBattles(ind+1);}
    used[ind] = 1;
    for (let i=ind+1; i<teams.length; ++i){
        if (!used[i] && !played[ind][i]){
            used[i] = 1;
            battlePrep.push({f:ind, s:i});
            if (prepareBattles(ind+1)){return 1;}
            battlePrep.pop();
            used[i] = 0;
        }
    }
    used[ind] = 0;
    return 0;
}

function login(){
    socket.emit('login', getSigninData());
    return false;
}
socket.on('l', (success, isAdmin, _currJudgeId) => {
    judge = success;
    admin = isAdmin;
    currJudgeId = _currJudgeId;
    if (!success){alert("Wrong username or password");}
    else{
        if (admin){
            redoBattles();
        }
        changeTab('b');
    }
});
socket.on('b', (_battles, _indForBid) => {
    battles = _battles;
    indForBid = _indForBid;
    sortBattles();
    redoBattles();
    if (admin && !isDayActive()){
        loadNewDayBattles();
    }
});
socket.on('r', (_players, _indForPid, _teams, _indForTid, _battles, _indForBid) => {
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

function checkAdmin(battleId, judgeId){
    for (let j of battles[indForBid[battleId]].judges){
        if (j.id == judgeId){return 1;}
    }
    return 0;
}
function addJudge(battleId, form){
    let id = form.firstChild.value;
    if (checkAdmin(battleId, id)){
        alert("already judge");
    }
    else{
        socket.emit('ij', battleId, id);
    }
}
function submitBattles(){
    socket.emit('sb', activeBattles);
}
function submitProtocol(){
    var challenges = requestChallenges();
    if (challenges){
        hideProtocol();
        socket.emit('c', protocolId, challenges);
    }else{
        alert("Invalid protocol");
    }
}