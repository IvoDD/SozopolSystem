var crypto = require('crypto');
var mysql = require('mysql');

var key = "this is a random key";

class Judge{
    constructor (connection, name, username, password, reg=0, callback){
        this.username = username;
        //this.id = -1;
        if (reg){
            this.name = name;
            this.salt = Judge.genSalt(64);
            this.saltedHash = Judge.calcSaltedHash(password, this.salt);
            connection.query("INSERT INTO judges (name, username, passhash, salt) VALUES (?, ?, ?, ?)", [this.name, this.username, this.saltedHash, this.salt], function(err){
                if (err){callback(false);}
                else{callback(true);}
            });
        }else{
            connection.query("SELECT * FROM judges WHERE username = ?", this.username, function(err, rows, fields){
                if (err || rows.length == 0){callback(false); return;}
                this.id = rows[0].id;
                this.name = name;
                this.salt = rows[0].salt;
                this.saltedHash = Judge.calcSaltedHash(password, this.salt);
                this.isAdmin = rows[0].is_admin;
                callback(this.saltedHash == rows[0].passhash);
            });
        }
    }
    
    static genSalt(n){
        let salt = "";
        for (let i=0; i<n; ++i){
            salt += Math.floor(Math.random()*10);
        }
        return salt;
    }
    
    static calcSaltedHash (password, salt){
        let hash = crypto.createHmac('sha512', key);
        hash.update(password+salt);
        return hash.digest('hex');
    }
}

module.exports = {"Judge": Judge}