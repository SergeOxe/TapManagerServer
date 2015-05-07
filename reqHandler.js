var Promise = require('bluebird');
var MongoClient = require('mongodb').MongoClient;
var userHandler = require("./userHandler");
var leagueHandler = require("./leagueHandler");
var squadHandler = require("./squadHandler");
var teamsHandler =  require("./teamsHandler");
var bucketHandler = require("./bucketHandler");
var db;

// Connect to the db
//MongoClient.connect("mongodb://Serge:5958164se@ds063889.mongolab.com:63889/tapmanagerdb", function(err, data) {
MongoClient.connect("mongodb://localhost:27017", function(err, data) {
    if (!err) {
        console.log("We are connected");
    } else {
        console.log(err);
    }
    db = data;
    squadHandler.setup(db);
    userHandler.setup(db);
    teamsHandler.setup(db);
    bucketHandler.setup(db);
    //leagueHandler.setup(db);
});

var addNewUser = function addNewUser (user,res){
    userHandler.addNewUser(user).then(function(data){
        res.send(data);
    });
}

var addNewBucket = function addNewBucket(req,res){
    bucketHandler.addNewBucket(req.body.email);
}


var getUserByEmail = function getUserByEmail (user,res){
    //console.log(user);
    userHandler.getUserByEmail(user,res).then(function(data){
        console.log(data.user);
        res.send(data.user);
    });
}

var updateUser = function updateUser(email,Key,value,res){
    userHandler.updateUser(email,Key,value).then(function(data){
        res.send(data);
    });
}

var addNewTeam = function addNewTeam (team,res){
    teamsHandler.addNewTeam(team).then(function(data){
        res.send(data);
    });
}

var getBotTeam = function getBotTeam(req,res){
    teamsHandler.getBotTeam().then(function(data){
        res.send(data);
    })
}
var getBotSquad = function getBotSquad(req,res){
    squadHandler.getBotSquad().then(function(data){
        res.send(data);
    })
}

 var newTeamUser = function newTeamUser(details,res){
     var results = [];
     results.push(teamsHandler.newTeamUser(details));
     results.push(bucketHandler.addNewBucket(details));
     results.push(squadHandler.newSquadForUser(details));
     Promise.all(results).then(function(data){
         res.send("ok");
     })
 }


var getInfoByEmail = function getInfoByEmail(email){
    var defer = Promise.defer();
    var results = [];
    results.push(userHandler.getUserByEmail(email));
    results.push(teamsHandler.getTeamByEmail(email));
    results.push(teamsHandler.getTeamsInLeague());
    results.push(bucketHandler.getBucketByEmail(email));
    results.push(squadHandler.getSquadByEmail(email));
    Promise.all(results).then(function(data){
        var json = {};
        json["user"] = data[0];
        json["league"] = data[2];
        json["team"] = data[1].team;
        json["bucket"] = data[3];
        json["squad"] = data[4];
        defer.resolve(json);
        //console.log(json);
    })
    return defer.promise;
}

var getTeamsInLeague = function getTeamsInLeague(){
    var str = "";
    teamsHandler.getTeamsInLeague().then(function(data){
        data.forEach(function(team){

        })
    });
}

var addNewBotSquad = function addNewBotSquad(req,res){
    squadHandler.addNewBotSquad().then(function(data){
        res.send(data);
    });
}

var addValueToTeam = function addValueToTeam(req,res){
    var json = JSON.parse(req);
    console.log(json);
    teamsHandler.addValueToTeam(json.email,json.key,json.value).then(function(data){
        res.send(data);
    })
}

var generateFixtures = function generateFixtures(req,res){
    teamsHandler.generateFixtures().then(function(data){
        res.send(data.fixutres);
    });
}

var getTeamByFixtureAndMatch = function getTeamByFixtureAndMatch(req,res){
    console.log(teamsHandler.getTeamByFixtureAndMatch(19,0,false));
}

module.exports.getTeamByFixtureAndMatch = getTeamByFixtureAndMatch;
module.exports.generateFixtures = generateFixtures;
module.exports.addValueToTeam = addValueToTeam;
module.exports.addNewBotSquad = addNewBotSquad;
module.exports.getInfoByEmail = getInfoByEmail;
module.exports.addNewUser = addNewUser;
module.exports.getUserByEmail = getUserByEmail;
module.exports.updateUser = updateUser;
module.exports.addNewTeam = addNewTeam;
module.exports.getBotTeam = getBotTeam;
module.exports.getBotSquad = getBotSquad;
module.exports.newTeamUser = newTeamUser;
module.exports.getTeamsInLeague = getTeamsInLeague;
module.exports.addNewBucket = addNewBucket;