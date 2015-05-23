/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var teamsHandler = require("./teamsHandler");
var teamsCollection;


var setup = function setup(db){
    db.collection("Teams",function(err, data) {
        if(!err) {
            teamsCollection = data;
        }else{
            console.log(err);
        }
    });
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
    var defer = Promise.defer();
    var sortQuery = {};
    sortQuery["gamesHistory.thisSeason.points"] = -1;
    teamsCollection.find({league: leagueNum}).sort(sortQuery).toArray(function(err,sortedTeams) {
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

var addLeagueWithTeams = function addLeagueWithTeams(){
    var num = 20;
    var defer = Promise.defer();
    //console.log(body);
    var leagueNum = gameManager.getNumOfLeagues() + 1;
    var obj = {};
    obj["numOfLeagues"] = 1;
    gameManager.addValueToGameCollection({},obj);
    gameManager.addNumOfLeagues();
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
                    "points":0,
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
            "teamName": "team " + (leagueNum*20 + i)
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

var getNumOfLeagues = function getNumOfLeagues(){
    return gameManager.getNumOfLeagues();
}


module.exports.setup = setup;
module.exports.getNumOfLeagues = getNumOfLeagues;
module.exports.addLeagueWithTeams = addLeagueWithTeams;
module.exports.getSortedTeams = getSortedTeams;
module.exports.getSortedTeamsByPoints = getSortedTeamsByPoints;