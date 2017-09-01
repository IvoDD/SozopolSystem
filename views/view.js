var isFormOpen = 0, lastText = "-", protocolId;

function setUp(competitionName){
    document.getElementById("competition_name").innerHTML = competitionName;
}

var tabData = {"r": "block_results",
               "b": "block_battles",
               "j": "block_judge"};
var lastTab = "r";
function clearTab(tabName){
    if (tabName==""){return;}
    document.getElementById(tabName).className="";
    document.getElementById(tabData[tabName]).style.display="none";
}
function changeTab(tabName){
    clearTab(lastTab);
    lastTab = tabName;
    document.getElementById(tabName).className="active";
    document.getElementById(tabData[tabName]).style.display="block";
}


function removeChildren(element){
    while (element.firstChild){
        element.removeChild(element.firstChild);
    }
}

function addJudgeForm(battleId){
    let form = document.createElement('form');
    let select = document.createElement('select');
    for (let j of judges){
        let option = document.createElement('option');
        option.value = j.id;
        option.appendChild(document.createTextNode(j.name));
        select.appendChild(option);
    }
    form.appendChild(select);
    let submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = "Add judge";
    form.appendChild(submit);
    form.onsubmit = () => {addJudge(battleId, form)};
    return form;
}

function teamTR(ind){
    let tr = document.createElement("tr");
    let td = [document.createElement("td"), document.createElement("td"), document.createElement("td")];
    td[0].appendChild(document.createTextNode(teams[ind].name));
    td[1].appendChild(document.createTextNode(teams[ind].points));
    td[2].appendChild(document.createTextNode(teams[ind].point_difference));
    for (let i=0; i<td.length; ++i){tr.appendChild(td[i]);}
    return tr;
}
function battleTR(battle, bonus = 0){
    let tr = document.createElement('tr');
    let td = [document.createElement('td'), document.createElement('td'), document.createElement('td'), document.createElement('td')];
    td[0].appendChild(document.createTextNode(teams[indForTid[battle.team1]].name));
    td[1].appendChild(document.createTextNode(battle.points1));
    td[2].appendChild(document.createTextNode(battle.points2));
    td[3].appendChild(document.createTextNode(teams[indForTid[battle.team2]].name));
    if (battle.points1==0 && battle.points2==0){
        td[1].firstChild.nodeValue = "-";
        td[2].firstChild.nodeValue = "-";
        if (bonus){
            td.push(document.createElement('td'));
            td[4].appendChild(addJudgeForm(battle.id));
        }
    }
    for (let i=0; i<td.length; ++i){
        tr.appendChild(td[i]);
        if (i<4) td[i].addEventListener('click', ()=>{showProtocol(battle.id);});
    }
    return tr;
}
function challengeTR(battle, challenge){
    let tr = document.createElement('tr');
    let td = [document.createElement('td'), document.createElement('td'), document.createElement('td'), document.createElement('td'), document.createElement('td')];
    if (challenge){
        td[0].appendChild(document.createTextNode(players[indForPid[challenge.player1]].name));
        td[1].appendChild(document.createTextNode(challenge.points1));
        td[2].appendChild(document.createTextNode(challenge.problem));
        td[3].appendChild(document.createTextNode(challenge.points2));
        td[4].appendChild(document.createTextNode(players[indForPid[challenge.player2]].name));
    }else{
        for (let i=0; i<td.length; ++i){
            td[i].appendChild(document.createTextNode('-'));
        }
    }
    td[0].style.textAlign = "left";
    td[1].style.textAlign = "left";
    td[2].style.textAlign = "center";
    td[3].style.textAlign = "right";
    td[4].style.textAlign = "right";
    for (let i=0; i<td.length; ++i){
        tr.appendChild(td[i]);
    }
    td[0].addEventListener('click', (evt) => {
        if (judge && (admin || checkAdmin(battle.id, currJudgeId))){return;}
        if (isFormOpen){return;}
        let select = document.createElement('select');
        let ct = teams[indForTid[battle.team1]];
        for (let id of ct.player_ids){
            let option = document.createElement('option');
            option.value = players[indForPid[id]].name;
            option.appendChild(document.createTextNode(option.value));
            select.appendChild(option);
        }
        openCurrentForm(evt.target, select);
    });
    td[1].addEventListener('click', (evt) => {
        if (judge && (admin || checkAdmin(battle.id, currJudgeId))){return;}
        if (isFormOpen){return;}
        let input = document.createElement('input');
        input.type = "number";
        input.min = 0; input.max = 12;
        input.value = evt.target.innerHTML;
        openCurrentForm(evt.target, input);
    });
    td[2].addEventListener('click', (evt) => {
        if (judge && (admin || checkAdmin(battle.id, currJudgeId))){return;}
        if (isFormOpen){return;}
        let input = document.createElement('input');
        input.type = "number";
        input.min = 1; input.max = 8;
        input.value = evt.target.innerHTML;
        openCurrentForm(evt.target, input);
    });
    td[3].addEventListener('click', (evt) => {
        if (judge && (admin || checkAdmin(battle.id, currJudgeId))){return;}
        if (isFormOpen){return;}
        let input = document.createElement('input');
        input.type = "number";
        input.min = 0; input.max = 12;
        input.value = evt.target.innerHTML;
        openCurrentForm(evt.target, input);
    });
    td[4].addEventListener('click', (evt) => {
        if (judge && (admin || checkAdmin(battle.id, currJudgeId))){return;}
        if (isFormOpen){return;}
        let select = document.createElement('select');
        let ct = teams[indForTid[battle.team2]];
        for (let id of ct.player_ids){
            let option = document.createElement('option');
            option.value = players[indForPid[id]].name;
            option.appendChild(document.createTextNode(option.value));
            select.appendChild(option);
        }
        openCurrentForm(evt.target, select);
    });
    return tr;
}
function createDayTable(day){
    let ret = {};
    let elem = document.createElement('h2');
    elem.appendChild(document.createTextNode("Ден " + day));
    ret.heading = elem;
    let table = document.createElement('table');
    ret.table = table;
    table.setAttribute("class", "table table-bordered");
    table.style.textAlign = "center";
    table.style.maxWidth = "800px";
    //table.style.margin = "auto";
    let head = document.createElement('thead');
    let row = document.createElement('tr');
    elem = document.createElement('td');
    elem.appendChild(document.createTextNode("Отбор"));
    row.appendChild(elem);
    elem = document.createElement('td');
    elem.appendChild(document.createTextNode("Резултат"));
    elem.colSpan = 2;
    row.appendChild(elem);
    elem = document.createElement('td');
    elem.appendChild(document.createTextNode("Отбор"));
    row.appendChild(elem);
    head.appendChild(row);
    table.appendChild(head);
    let body = document.createElement('tbody');
    table.appendChild(body);
    ret.body = body;
    return ret;
}

function redoResults(){
    let results = document.getElementById("results");
    removeChildren(results);
    for (let i=0; i<teams.length; ++i){
        results.appendChild(teamTR(i));
    }
}

function redoBattles(){
    let battlesDom = document.getElementById("block_battles");
    removeChildren(battlesDom);
    let j = battles.length-1;
    for (let i = day; i>0; --i){
        let ret = createDayTable(i);
        battlesDom.appendChild(ret.heading);
        battlesDom.appendChild(ret.table);
        let body = ret.body;
        
        while(j>=0 && battles[j].day == i){--j;}
        for (let k=j+1; k<battles.length && battles[k].day == i; ++k){
            body.appendChild(battleTR(battles[k], admin));
        }
    }
    if (admin && !isDayActive()){
        loadNewDayBattles();
    }
}

function getSigninData(){
    let ans = {};
    ans.username = document.getElementById('inputUsername').value;
    document.getElementById('inputUsername').value = "";
    ans.password = document.getElementById('inputPassword').value;
    document.getElementById('inputPassword').value = "";
    return ans;
}

function loadNewDayBattles(){
    let battlesDom = document.getElementById("block_battles");
    let top = battlesDom.firstChild;
    let ret = createDayTable(day+1);
    ret.table.style.maxWidth = "";
    let body = ret.body;
    body.id = "active_battles";
    let controlPanel = document.createElement('div');
    battlesDom.insertBefore(ret.heading, top);
    battlesDom.insertBefore(ret.table, top);
    battlesDom.insertBefore(controlPanel, top);
    let button = document.createElement("button");
    button.appendChild(document.createTextNode("Generate"));
    button.addEventListener("click", () => {invalid = []; generateBattles();});
    controlPanel.appendChild(button);
    button = document.createElement("button");
    button.appendChild(document.createTextNode("Submit"));
    button.addEventListener("click", submitBattles);
    controlPanel.appendChild(button);
}

function loadActiveBattles(){
    let body = document.getElementById("active_battles");
    removeChildren(body);
    for (let i=0; i<activeBattles.length; ++i){
        body.appendChild(battleTR(activeBattles[i]));
    }
    for (let i=0; i<body.children.length; ++i){
        let button = document.createElement('button');
        button.appendChild(document.createTextNode("Mark as invalid"));
        button.addEventListener('click', ()=>{markInvalid(i);generateBattles();});
        let td = document.createElement('td');
        td.appendChild(button);
        body.children[i].appendChild(td);
    }
}

function showProtocol(id){
    protocolId = id;
    document.getElementById("protocol").style.display = "flex";
    let tbody = document.getElementById("protocol_tbody");
    removeChildren(tbody);
    let cb = battles[indForBid[id]];
    document.getElementById("team1").innerHTML = teams[indForTid[cb.team1]].name;
    document.getElementById("team2").innerHTML = teams[indForTid[cb.team2]].name;
    let challenges = cb.challenges;
    for (let i=0; i<8; ++i){
        tbody.appendChild(challengeTR(cb, challenges[i]));
    }
}
function hideProtocol(){
    document.getElementById("protocol").style.display = "none";
    if (isFormOpen){
        closeCurrentForm();
    }
}
function openCurrentForm(place, input){
    lastText = place.innerHTML;
    isFormOpen = 1;
    input.id = 'data';
    let curr = place;
    removeChildren(curr);
    let form = document.createElement('form');
    form.style.display = "inline-block";
    form.onsubmit = () => {return submitCurrentForm();};
    form.id = "current_form";
    form.appendChild(input);
    let submit1 = document.createElement('input');
    submit1.type = "submit";
    submit1.value = "V";
    let button = document.createElement('button');
    button.appendChild(document.createTextNode("X"));
    button.addEventListener('click', (evt) => {closeCurrentForm(); evt.stopPropagation(); return;});
    button.style.display = "inline-block";
    form.appendChild(submit1);
    curr.appendChild(form);
    curr.appendChild(button);
    input.focus();
}
function submitCurrentForm(){
    isFormOpen = 0;
    let form = document.getElementById("current_form");
    let text = document.getElementById("data").value;
    let parrent = form.parentElement;
    removeChildren(parrent);
    if (text == ""){text = "-";}
    parrent.appendChild(document.createTextNode(text));
    delete form;
    return false;
}
function closeCurrentForm(){
    isFormOpen = 0;
    let form = document.getElementById("current_form");
    let parrent = form.parentElement;
    removeChildren(parrent);
    parrent.appendChild(document.createTextNode(lastText));
    delete form;
    return;
}

function requestChallenges(){
    if (isFormOpen){return undefined;}
    var ans = [];
    var body = document.getElementById("protocol_tbody");
    let b = battles[indForBid[protocolId]];
    for (let row of body.children){
        let unfilled = 0;
        for (let c of row.children){
            if (c.innerHTML == '-'){++unfilled;}
        }
        if (unfilled == 5){break;}
        if (unfilled > 0){return undefined;}
        let problem = Number(row.children[2].innerHTML);
        let player1, player2;
        for (let id of teams[indForTid[b.team1]].player_ids){
            if (players[indForPid[id]].name == row.children[0].innerHTML){
                player1 = id; break;
            }
        }
        for (let id of teams[indForTid[b.team2]].player_ids){
            if (players[indForPid[id]].name == row.children[4].innerHTML){
                player2 = id; break;
            }
        }
        let points1 = Number(row.children[1].innerHTML);
        let points2 = Number(row.children[3].innerHTML);
        ans.push(new Challenge(problem, player1, player2, 0, 0, points1, points2));
    }
    return ans;
}

window.addEventListener('keydown', (evt) => {
    if (evt.keyCode == 27){
        if (isFormOpen){closeCurrentForm();}
        else{hideProtocol();}
    }
});
document.getElementById("protocol").addEventListener('click', hideProtocol);
document.getElementById("protocol_table").addEventListener('click', (evt)=>{evt.stopPropagation();});