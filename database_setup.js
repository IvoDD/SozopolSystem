var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var xlsx = require('xlsx');
var mysql = require('mysql');
const Emmiter = require('events');

class MyEmmiter extends Emmiter {}

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jjkofajj'
});

const dbName = "sozopol";

class Competiton{
    constructor(name, port, sheet){
        this.name = name;
        this.port = port;
        this.sheet = sheet;
    }
};

var competitions = [new Competiton('5-6 клас', 3005, 'grade56'),
                   new Competiton('7-8 клас', 3006, 'grade78'),
                   new Competiton('9-12 клас', 3007, 'grade912')];

var teams = xlsx.readFile('teams.xlsx');

connection.connect();

connection.changeUser({database: dbName});
connection.query("SELECT * FROM competitions", [], function(err, rows, fields){
    if(rows.length == 0)
    {
        let team_id = 0;
        for (let i=0; i<competitions.length; ++i){
            console.log("INSERT INTO competitions (name, port) VALUES", competitions[i].name, competitions[i].port);
            connection.query("INSERT INTO competitions (name, port) VALUES (?, ?)", [competitions[i].name, competitions[i].port], function(){
                let curr = teams.Sheets[competitions[i].sheet];
                if (curr != undefined){
                    for (let j=1; curr["A"+j] != undefined && curr["B"+j]!=undefined; ++j){                    
                        connection.query("INSERT INTO teams (name, school, competition_id) VALUES (?, ?, ?)", [curr['A'+j].v, curr['B'+j].v, curr['C'+j].v]);
                        ++team_id;
                        for (let k = 68; curr[String.fromCharCode(k) + j] != undefined; ++k){
                            connection.query("INSERT INTO players (name, team_id) VALUES (?, ?)", [curr[String.fromCharCode(k) + j].v, team_id]);
                        }
                    }
                }
            });
        }
        startServer();
    } else {
        console.log("database existing, starting server for admin input");
        startServer();
    }
});



function startServer(){
    var gets = require('./get_handler.js');
    gets.handle(express, app);
    
    app.get('/',function(req, res){
        res.sendFile(__dirname + '/views/admins.html');
    });
    
    app.get('/*',function(req, res){
        res.sendFile(__dirname + '/views' + req.url);
    });
    
    app.post('/register', function(req, res){
        let current;
        current = new Judge(connection, req.body.name, req.body.username, req.body.password, 1, function(success){
            if (success){res.send("Success");}
            else{res.send("Username taken");}
        });
    });
    
    var Judge = require('./Admin.js').Judge;
    
    http.listen(4000, function(){
        console.log("admin signup started on: 127.0.0.1:4000"); 
    });
}
