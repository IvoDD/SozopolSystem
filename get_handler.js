var exports = module.exports = {};

const bodyParser = require("body-parser");

exports.handle = function(express, app){
    
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    
    app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
    app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
    app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
}