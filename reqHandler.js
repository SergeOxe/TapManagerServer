var Promise = require('bluebird');
var MongoClient = require('mongodb').MongoClient;
var userHandler = require("./userHandler");
var leagueHandler = require("./leagueHandler");
var squadHandler = require("./squadHandler");
var teamsHandler =  require("./teamsHandler");
var bucketHandler = require("./bucketHandler");
var gameManager = require("./gameManager");
var db;

// Connect to the db
MongoClient.connect("mongodb://Serge:5958164se@ds063889.mongolab.com:63889/tapmanagerdb", function(err, data) {
//MongoClient.connect("mongodb://localhost:27017", function(err, data) {
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
    gameManager.setup(db).then(function(data){
        console.log("gameManager.setup","ok");
    });
    //leagueHandler.setup(db);
});



var loginUser = function loginUser (user,res){
    userHandler.loginUser(user).then(function(data){
        res.send(data);
    });
}

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
    teamsHandler.addNewNumTeam(20,1).then(function(data){
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
    results.push(gameManager.getSetup());
    results.push(gameManager.getTimeTillNextMatch());
    results.push(gameManager.getOpponentByEmail(email));
    Promise.all(results).then(function(data){
        var json = {};
        json["user"] = data[0];
        json["league"] = data[2];
        json["team"] = data[1].team;
        json["bucket"] = {details:data[3],timeNow: Date.now()};
        //json["timeNow"] = Date.now();
        json["squad"] = data[4];
        json["settings"] = data[5].pricesAndMultipliers;
        json["timeTillNextMatch"] = data[6];
        json["nextMatch"] = data[7];
        defer.resolve(json);
        //console.log(json);
    })
    return defer.promise;
}

var getTeamsInLeague = function getTeamsInLeague(){
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
    console.log(gameManager.getTeamByFixtureAndMatch(19,0,false));
}

var executeNextFixture = function executeNextFixture(req,res){
    gameManager.executeNextFixture(res);
}

var addCoinMoney = function addCoinMoney(req,res){
    userHandler.addCoinMoney(req.body.email,req.body.clicks).then(function(data){
        res.send(data);
    });
}

var boostPlayer = function boostPlayer(req,res){
    squadHandler.boostPlayer(req.body.email,req.body.id).then(function(data){
       res.send(data);
    });
}

var upgradeItem = function upgradeItem(req,item,res){
    userHandler.upgradeItem(req.body.email,item).then(function(data){
        res.send(data);
    })
}
var getTimeTillNextMatch = function getTimeTillNextMatch(res){
    res.send({time: gameManager.getTimeTillNextMatch()});

}

var addMoneyToUser = function addMoneyToUser(req,res){
    userHandler.addMoneyToUser(req.body.email,parseInt(req.body.money)).then(function(data){
        res.send(data);
    });
}

var collectBucket = function collectBucket(req,res){
    bucketHandler.collectNowBucket(req.body.email).then(function(data){
        res.send(data);
    });
}

module.exports.collectBucket = collectBucket;
module.exports.addMoneyToUser = addMoneyToUser;
module.exports.getTimeTillNextMatch = getTimeTillNextMatch;
module.exports.upgradeItem = upgradeItem;
module.exports.boostPlayer = boostPlayer;
module.exports.executeNextFixture = executeNextFixture;
module.exports.addCoinMoney =addCoinMoney;
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
module.exports.loginUser = loginUser;