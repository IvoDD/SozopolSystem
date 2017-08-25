CREATE DATABASE sozopol;
USE sozopol;

CREATE TABLE competitions (id int NOT NULL AUTO_INCREMENT, name varchar(255), port int, PRIMARY KEY(id), UNIQUE KEY(name), UNIQUE KEY(port));

CREATE TABLE teams (id int NOT NULL AUTO_INCREMENT, name varchar(255), competition_id int NOT NULL, points int, points_difference int, PRIMARY KEY(id), UNIQUE KEY(name), FOREIGN KEY(competition_id) REFERENCES competitions(id));

CREATE TABLE players (id int NOT NULL AUTO_INCREMENT, name varchar(255), team_id int NOT NULL, comb int, geo int, numb int, alg int, PRIMARY KEY(id), UNIQUE KEY(name), FOREIGN KEY(team_id) REFERENCES teams(id));

CREATE TABLE battles (id int NOT NULL AUTO_INCREMENT, day int, team1 int NOT NULL, team2 int NOT NULL, points1 int, points2 int, judges varchar(255), PRIMARY KEY(id), FOREIGN KEY(team1) REFERENCES teams(id), FOREIGN KEY(team2) REFERENCES teams(id));

CREATE TABLE judges (id int NOT NULL AUTO_INCREMENT, name varchar(255), username varchar(255), passhash varchar(255), salt varchar(255), PRIMARY KEY(id), UNIQUE KEY(name), UNIQUE KEY(username));