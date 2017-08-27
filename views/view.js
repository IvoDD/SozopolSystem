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

function redoResults(){
    let results = document.getElementById("results");
    while (results.firstChild){
        results.removeChild(results.firstChild);
    }
    for (let i=0; i<teams.length; ++i){
        results.appendChild(teamTR(i));
    }
}