/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var squadHandler = require('./squadHandler');

var teamsCollection;


var m_currentFixture = 0;


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

var addNewNumTeam = function addNewNumTeam(num,leagueNum){
    var defer = Promise.defer();
    //console.log(body);
    for (var i = 0 ; i < num ; i++) {
        squadHandler.addNewBotSquad();
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
            "teamName": "team " + i
        };
        //var user = JSON.parse(body);
        teamsCollection.insert(team, function (err, data) {
            if (err) {
                console.log("addNewTeam", err);
                defer.resolve("null");
            } else {
                //console.log("addNewTeam", "Ok");
                defer.resolve("ok");
            }
        });
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

var newTeamUser = function newTeamUser(detailsJson){
    var defer = Promise.defer();
    //var detailsJson = JSON.parse(details);
    var id;
    getTeamByEmail(detailsJson.email,function(err,data){
       if(data){
           console.log("newTeamUser err","teamName Exist");
           defer.resolve("null");
       }
    });
    getBotTeam().then(function(data){
        id = data.team._id;
        var obj = {};
        obj["email"] = detailsJson.email;
        obj["stadiumName"] = detailsJson.stadiumName;
        obj["teamName"] = detailsJson.teamName;
        obj["coachName"] = detailsJson.coachName;
        obj["isBot"] = false;
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

var getTeamByEmail = function getTeamByEmail (email){
    var defer = Promise.defer();
    teamsCollection.findOne({"email":email},function(err,data){
        if(!data){
            console.log("getTeamByEmail err",err);
            defer.resolve({user: "null"});
        }else{
            //console.log("getTeamByEmail","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var getTeamByKey = function getTeamByEmail (key){
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

var getTeamsInLeague = function getTeamsInLeague(){
    var defer = Promise.defer();
    teamsCollection.find({},{teamName:1,gamesHistory:1}).toArray(function(err, results){
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
            defer.resolve({teams : sortedTeams});
        }
    });
    return defer.promise;
}


module.exports.addValueToTeamMulti = addValueToTeamMulti
module.exports.updateTeamMulti = updateTeamMulti;
module.exports.getSortedTeams = getSortedTeams;
module.exports.addValueToTeam = addValueToTeam;
module.exports.updateTeam = updateTeam;
module.exports.getBotTeam = getBotTeam;
module.exports.addNewNumTeam = addNewNumTeam;
module.exports.newTeamUser = newTeamUser;
module.exports.getTeamByEmail = getTeamByEmail;
module.exports.getTeamByKey = getTeamByKey;
module.exports.getTeamsInLeague = getTeamsInLeague;
module.exports.setup = setup;