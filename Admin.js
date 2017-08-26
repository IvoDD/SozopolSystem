var crypto = require('crypto');
var mysql = require('mysql');

var key = "this is a random key";

class Admin{
    constructor (connection, name, username, password, reg=0, callback){
        this.name = name;
        this.username = username;
        //this.id = -1;
        if (reg){
            this.salt = Admin.genSalt(64);
            this.saltedHash = Admin.calcSaltedHash(password, this.salt);
            connection.query("INSERT INTO judges (name, username, passhash, salt) VALUES (?, ?, ?, ?)", [this.name, this.username, this.saltedHash, this.salt], function(err){
                if (err){callback(false);}
                else{callback(true);}
            });
        }else{
            connection.query("SELECT * FROM admins WHERE username = ?", this.username, function(err, rows, fields){
                if (err || rows.length == 0){callback(false); return;}
                this.id = rows[0].id;
                this.salt = rows[0].salt;
                this.saltedHash = Admin.calcSaltedHash(password, this.salt);
                callback(this.saltedHash == rows[0].salted_hash, this.id);
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
        hash.update(password+hash);
        return hash.digest('hex');
    }
}

module.exports = {"Admin": Admin}