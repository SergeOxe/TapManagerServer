/**
 * Created by User on 5/17/2015.
 */
var Promise = require('bluebird');
var teamsHandler = require("./teamsHandler");
var leagueHandler = require("./leagueHandler");
var gameManager = require("./gameManager");








function  initSeasonStatistics(team,league) {
    var defer = Promise.defer();
    var id = {};
    id["_id"] = team._id;
    var updateValue = {};
    updateValue["league"] = league;
    updateValue["gamesHistory.thisSeason.wins"] = 0;
    updateValue["gamesHistory.thisSeason.losts"] = 0;
    updateValue["gamesHistory.thisSeason.draws"] = 0;
    updateValue["gamesHistory.thisSeason.goalsFor"] = 0;
    updateValue["gamesHistory.thisSeason.GoalsAgainst"] = 0;
    updateValue["gamesHistory.thisSeason.homeGames"] = 0;

    teamsHandler.updateTeamMulti(id,updateValue).then(function (data){
        defer.resolve("ok");
    });

    return defer.promise;
}


var createNewLeagues = function createNewLeagues(){
    var defer = Promise.defer();
    var results = [];
    if (leagueHandker.getNumOfLeagues() == 20){
        for (var i = 1; i <= 20 ; i++) {
            leagueHandler.getSortedTeamsByPoints(i).then(function (teams){
                for (var j = 0 ; j < 20 ; j++){
                    results.push(initSeasonStatistics(teams[j],j+1));
                }
            });
        }
    }
    var obj = {};
    obj["currentFixture"] = 1;
    results.push(gameManager.updateGamesCollection({},obj));
    Promise.all(results).then(function (data){
        defer.resolve("ok");
    })

    return defer.promise;
}


module.exports.createNewLeagues = createNewLeagues;