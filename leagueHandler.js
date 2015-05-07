/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var leagueCollection;

var setup = function setup(db){
    db.collection("League",function(err, data) {
        if(!err) {
            leagueCollection = data;
        }else{
            console.log(err);
        }
    });
}

module.exports.setup = setup;