class Player{
    constructor(id, name, team_id, comb, geo, numb, alg){
        this.id = id;
        this.name = name;
        this.team_id = team_id;
        this.comb = comb;
        this.geo = geo;
        this.numb = numb;
        this.alg = alg;
    }
};

class Team {
    constructor(id, name, school, player_ids, points, point_difference){
        this.id = id;
        this.name = name;
        this.school = school;
        this.player_ids = player_ids;
        this.points = points;
        this.point_difference = point_difference;
    }
};
function cmpTeams(t1, t2){
    return (t1.points == t2.points && t1.point_difference > t2.point_difference) || t1.points > t2.points;
}

class Competition {
    constructor(id, name, port){
        this.id = id;
        this.name = name;
        this.port = port;
    }
};

class Battle {
    constructor(id, day, team1, team2, points1, points2, judges, challenges){
        this.id = id;
        this.day = day;
        this.team1 = team1;
        this.team2 = team2;
        this.points1 = points1;
        this.points2 = points2;
        this.judges = judges;
        this.challenges = challenges || [];
    }
    
    addChallenge(problem, player1, player2, dir, returned, points1, points2){
        this.challenges.push(new Challenge(problem, player1, player2, dir, returned, points1, points2));
    }
};

class Problem {
    constructor(competition_id, day, num, type){
        this.competition_id = competition_id;
        this.day = day;
        this.num = num;
        this.type = type;
    }
}

class Challenge {
    constructor(problem, player1, player2, dir, returned, points1, points2){
        this.problem = problem;
        this.player1 = player1;
        this.player2 = player2;
        this.dir = dir;
        this.returned = returned;
        this.points1 = points1;
        this.points2 = points2;
    }
};

if (typeof module !== 'undefined'){
    module.exports = {Player: Player, Team: Team, Competition: Competition, Battle: Battle};
}