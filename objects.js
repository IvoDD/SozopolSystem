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
    constructor(id, name, player_ids, points, point_difference){
        this.id = id;
        this.name = name;
        this.player_ids = player_ids;
        this.points = points;
        this.point_difference = point_difference;
    }
};

class Competition {
    constructor(id, name, port){
        this.id = id;
        this.name = name;
        this.port = port;
    }
};

class Battle {};
class Protocol {};
class Judge {};

module.exports = {Player: Player, Team: Team, Competition: Competition, Battle: Battle, Judge: Judge};