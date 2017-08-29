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
function battleTR(ind){
    let tr = document.createElement('tr');
    let td = [document.createElement('td'), document.createElement('td'), document.createElement('td'), document.createElement('td')];
    td[0].appendChild(document.createTextNode(teams[indForTid[battles[ind].team1]].name));
    td[1].appendChild(document.createTextNode(battles[ind].points1));
    td[2].appendChild(document.createTextNode(battles[ind].points2));
    td[3].appendChild(document.createTextNode(teams[indForTid[battles[ind].team2]].name));
    for (let i=0; i<td.length; ++i){tr.appendChild(td[i]);}
    return tr;
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
        let elem = document.createElement('h2');
        elem.appendChild(document.createTextNode("Ден "+i));
        battlesDom.appendChild(elem);
        let table = document.createElement('table');
        battlesDom.appendChild(table);
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
        
        while(j>=0 && battles[j].day == i){--j;}
        for (let k=j+1; k<battles.length && battles[k].day == i; ++k){
            body.appendChild(battleTR(k));
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