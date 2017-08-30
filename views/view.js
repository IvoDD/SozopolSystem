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


function teamTR(ind){
    let tr = document.createElement("tr");
    let td = [document.createElement("td"), document.createElement("td"), document.createElement("td")];
    td[0].appendChild(document.createTextNode(teams[ind].name));
    td[1].appendChild(document.createTextNode(teams[ind].points));
    td[2].appendChild(document.createTextNode(teams[ind].point_difference));
    for (let i=0; i<td.length; ++i){tr.appendChild(td[i]);}
    return tr;
}
function battleTR(battle){
    let tr = document.createElement('tr');
    let td = [document.createElement('td'), document.createElement('td'), document.createElement('td'), document.createElement('td')];
    td[0].appendChild(document.createTextNode(teams[indForTid[battle.team1]].name));
    td[1].appendChild(document.createTextNode(battle.points1));
    td[2].appendChild(document.createTextNode(battle.points2));
    if (battle.points1==0 && battle.points2==0){
        td[1].firstChild.nodeValue = "-";
        td[2].firstChild.nodeValue = "-";
    }
    td[3].appendChild(document.createTextNode(teams[indForTid[battle.team2]].name));
    for (let i=0; i<td.length; ++i){
        tr.appendChild(td[i]);
        td[i].addEventListener('click', ()=>{showProtocol(battle.id);});
    }
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
    while (results.firstChild){
        results.removeChild(results.firstChild);
    }
    for (let i=0; i<teams.length; ++i){
        results.appendChild(teamTR(i));
    }
}

function redoBattles(){
    let battlesDom = document.getElementById("block_battles");
    while(battlesDom.firstChild){
        battlesDom.removeChild(battlesDom.firstChild);
    }
    let j = battles.length-1;
    for (let i = day; i>0; --i){
        let ret = createDayTable(i);
        battlesDom.appendChild(ret.heading);
        battlesDom.appendChild(ret.table);
        let body = ret.body;
        
        while(j>=0 && battles[j].day == i){--j;}
        for (let k=j+1; k<battles.length && battles[k].day == i; ++k){
            body.appendChild(battleTR(battles[k]));
        }
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
    button.addEventListener("click", generateBattles);
    controlPanel.appendChild(button);
    button = document.createElement("button");
    button.appendChild(document.createTextNode("Submit"));
    button.addEventListener("click", submitBattles);
    controlPanel.appendChild(button);
}

function loadActiveBattles(){
    let body = document.getElementById("active_battles");
    while (body.firstChild){
        body.removeChild(body.firstChild);
    }
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

function showProtocol(id){}