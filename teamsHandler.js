/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var squadHandler = require('./squadHandler');
var gameManager = require('./gameManager');
//var reqHandler = require('./reqHandler');
var teamsCollection;




var setup = function setup(db){
    db.collection("Teams",function(err, data) {
        if(!err) {
            teamsCollection = data;
        }else{
            teamsCollection.log(err);
        }
    });
}

/*
var addNewTeam = function addNewTeam (body){
    var defer = Promise.defer();
    //console.log(body);
    var team = {
        "isBot":true,
        "league": 1,
        "gamesHistory": {
            "thisSeason": {
                "wins": 0,
                    "losts": 0,
                    "draws": 0,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "homeGames": 0,
                    "crowd": 0
            },
            "allTime": {
                "wins": 0,
                    "losts": 0,
                    "draws": 0,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "homeGames": 0,
                    "crowd": 0
            }
        },
        "teamName": "team " + Math.round(Math.random(7)*100 %10)
    };
    //var user = JSON.parse(body);
    teamsCollection.insert(team,function(err,data){
        if(err){
            console.log("addNewTeam",err);
            defer.resolve("null");
        }else{
            console.log("addNewTeam","Ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}
*/
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
var addNewNumTeam = function addNewNumTeam(num){
    var defer = Promise.defer();
    //console.log(body);
    var leagueNum = gameManager.getNumOfLeagues() + 1;
    var obj = {};
    obj["numOfLeagues"] = 1;
    gameManager.addValueToGameCollection({},obj);
    gameManager.addNumOfLeagues();
    for (var i = 0 ; i < num ; i++) {
        squadHandler.addNewBotSquad(((leagueNum - 1)*20 + i));
        var team = {
            "shop" : {
                "fansLevel": 0,
                "facilitiesLevel": 0,
                "stadiumLevel": 0
            },
            "additionalFans": 1,
            "lastGameInfo": {
                "homeTeam": "",
                "awayTeam": "",
                "homeTeamGoals": 0,
                "awayTeamGoals": 0,
                "crowdAtMatch": 0
            },
            "lastResult": 0,
            "isLastGameIsHomeGame": false,
            "statistics": {
                "longestWinStreak": 0,
                "longestLoseStreak": 0,
                "longestWinlessStreak": 0,
                "longestUndefeatedStreak": 0,

                "biggestWinRecord": 0,
                "biggestLoseRecord": 0,

                "currentWinStreak": 0,
                "currentLoseStreak": 0,
                "currentWinlessStreak": 0,
                "currentUndefeatedStreak": 0
            },

            "isBot": true,
            "league": leagueNum,
            "gamesHistory": {
                "thisSeason": {
                    "wins": 0,
                    "losts": 0,
                    "draws": 0,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "homeGames": 0,
                    "crowd": 0,
                    "goalsDifference" : 0
                },
                "allTime": {
                    "wins": 0,
                    "losts": 0,
                    "draws": 0,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "homeGames": 0,
                    "crowd": 0
                }
            },
            "isDefaultName" : true,
            "logo": randomIntFromInterval(0,29),
            "teamName": "team " + ((leagueNum - 1)*20 + i),
            "id": ((leagueNum - 1)*20 + i)
        };
        //var user = JSON.parse(body);
        teamsCollection.insert(team, function (err, data) {
            if (err) {
                console.log("addNewTeam", err);
                defer.resolve("null");
            } else {
                //console.log("addNewTeam", data);
                defer.resolve("ok");
            }
        });
        //reqHandler.gameManagerSetup();
    }
    return defer.promise;
}

var getBotTeam = function getBotTeam (){
    var defer = Promise.defer();
    teamsCollection.findOne({isBot:true},function(err,data){
        if(!data){
            console.log("getBotTeam err",err);
            defer.resolve({team: "null"});
        }else{
            //console.log("getBotTeam","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var changeBotTeamName = function changeBotTeamName (name){
    var defer = Promise.defer();
    teamsCollection.findOne({isBot:true,'isDefaultName':true},{_id:1},function(err,data){
        if(!data){
            console.log("getBotTeam err",err);
            defer.resolve({team: "null"});
        }else{
            var obj = {};
            obj["teamName"] = name;
            obj["isDefaultName"] = false;
            updateTeamMulti({_id:data._id},obj).then(function(data){
                defer.resolve("ok");
            });
            //console.log("getBotTeam","ok");

        }});
    return defer.promise;
}

var updateTeam = function updateTeam (findBy,Key,value){
    var defer = Promise.defer();
    //console.log(body);
    var obj = {};
    obj[Key] = value;
    teamsCollection.update(findBy,{$set: obj},function(err,data){
        if(!data){
            console.log("updateTeam err",Key);
            defer.resolve(err);
        }else{
            //console.log("updateTeam","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var updateTeamMulti = function updateTeamMulti (findBy,obj){
    if ( Object.keys(obj).length === 0){
        return;
    }
    var defer = Promise.defer();
    teamsCollection.update(findBy,{$set: obj},function(err,data){
        if(!data){
            console.log("updateTeam err",obj);
            defer.resolve(err);
        }else{
            //console.log("updateTeam","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

/*
var addBoostToAllPlayers = function addBoostToAllPlayers(id){
    var defer = Promise.defer();
    var results = [];
    results.push(squadHandler.getSquadByEmail(id));
    results.push(getTeamById(id));
    Promise.all(results).then(function(data){
        var facilities = data[1].shop.facilitiesLevel;
        for(var i = 0 ; i < 11 ; i++) {
            squadHandler.boostPlayer()
        }

    });


    return defer.promise;
}
*/
var newTeamUser = function newTeamUser(detailsJson){
    var defer = Promise.defer();
    //var detailsJson = JSON.parse(details);
    var id;
    getTeamById(detailsJson.id,function(err,data){
       if(data){
           console.log("newTeamUser err","teamName Exist");
           defer.resolve("null");
       }
    });

    getBotTeam().then(function(data){
        id = data.team._id;
        var obj = {};
        obj["id"] = detailsJson.id;
        obj["stadiumName"] = detailsJson.stadiumName;
        obj["teamName"] = detailsJson.teamName;
        obj["coachName"] = detailsJson.name;
        obj["isBot"] = false;
        obj["lastGameInfo.homeTeam"] ="---";
        obj["lastGameInfo.awayTeam"] ="---";
        teamsCollection.update({"_id":id},{$set: obj},function(err,data){
            if(!data){
                console.log("newTeamUser err",err);
                defer.resolve(err);
            }else{
                //console.log("newTeamUser","ok");
                defer.resolve(data);
            }});

    });
    return defer.promise;
}

var getTeamById = function getTeamById (id){
    var defer = Promise.defer();
    teamsCollection.findOne({id:id},function(err,data){
        if(!data){
            console.log("getTeamById err",err);
            defer.resolve({user: "null"});
        }else{
            //console.log("getTeamById","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var getTeamByKey = function getTeamById (key){
    var defer = Promise.defer();
    teamsCollection.findOne(key,function(err,data){
        if(err){
            console.log("getTeamByKey err",err);
            defer.resolve({team: "null"});
        }else{
            //console.log("getTeamByKey","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var getTeamsInLeague = function getTeamsInLeague(league){
    var defer = Promise.defer();
    teamsCollection.find({league: league},{teamName:1,"gamesHistory.thisSeason":1}).toArray(function(err, results){
        defer.resolve(results);
    });
    return defer.promise;
}

var addValueToTeam = function addValueToTeam (findBy,key,value){
    var defer = Promise.defer();
    var obj = {};
    obj[key] = parseInt(value);
    teamsCollection.update(findBy,{$inc: obj},function(err,data){
        if(!data){
            console.log("addValueToTeam err",err);
            defer.resolve("null");
        }else{
            //console.log("addValueToTeam","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var addValueToTeamMulti = function addValueToTeamMulti (findBy,obj){
    var defer = Promise.defer();
    teamsCollection.update(findBy,{$inc: obj},function(err,data){
        if(!data){
            console.log("addValueToTeam err",err);
            defer.resolve("null");
        }else{
            //console.log("addValueToTeamMulti","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var getSortedTeams = function getSortedTeams (leagueNum){
    var defer = Promise.defer();
    teamsCollection.find({league: leagueNum}).sort({_id:1}).toArray(function(err,sortedTeams) {
        if (!sortedTeams) {
            console.log("getSortedTeams err",err)
            defer.resolve("null");
        }else{
            //console.log("getSortedTeams","ok")
            defer.resolve(sortedTeams);
        }
    });
    return defer.promise;
}

var getSortedTeamsByPoints = function getSortedTeamsByPoints (leagueNum){
    //Need to handle goal difference.
    var defer = Promise.defer();
    teamsCollection.find({league: leagueNum}).sort({"gamesHistory.thisSeason.points": -1}, {"gamesHistory.thisSeason.goalsDifference" : -1}).toArray(function(err,sortedTeams) {
        if (!sortedTeams) {
            console.log("getSortedTeamsByPoints err",err)
            defer.resolve("null");
        }else{
            //console.log("getSortedTeamsByPoints","ok")
            defer.resolve(sortedTeams);
        }
    });
    return defer.promise;
}
var deleteDB = function deleteDB(){
    teamsCollection.remove({},function(err,data){
    });
}

module.exports.deleteDB = deleteDB;
module.exports.getSortedTeamsByPoints = getSortedTeamsByPoints;
module.exports.addValueToTeamMulti = addValueToTeamMulti;
module.exports.updateTeamMulti = updateTeamMulti;
module.exports.getSortedTeams = getSortedTeams;
module.exports.addValueToTeam = addValueToTeam;
module.exports.updateTeam = updateTeam;
module.exports.getBotTeam = getBotTeam;
module.exports.addNewNumTeam = addNewNumTeam;
module.exports.newTeamUser = newTeamUser;
module.exports.getTeamById = getTeamById;
module.exports.getTeamByKey = getTeamByKey;
module.exports.getTeamsInLeague = getTeamsInLeague;
module.exports.changeBotTeamName = changeBotTeamName;
module.exports.setup = setup;