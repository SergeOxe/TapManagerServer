/**
 * Created by User on 5/17/2015.
 */
var Promise = require('bluebird');
var userHandler = require("./userHandler");
var teamsHandler = require("./teamsHandler");
var leagueHandler = require("./leagueHandler");
var gameManager = require("./gameManager");
var reqHandler = require("./reqHandler");




var endOfSeason = function endOfSeason(){
    var defer = Promise.defer();
    var fixture = {};
    var season = {};
    fixture["currentFixture"] = 0;
    season["currentSeason"] = 1;
    var results = [];
    var leagues = [];
    results.push(gameManager.updateGamesCollection({},fixture));
    results.push(gameManager.addValueToGameCollection({},season));
    var numOfLeagues = gameManager.getNumOfLeagues();

    for(var k = 1 ; k <= numOfLeagues ; k++){
        leagues.push(leagueHandler.getSortedTeamsByPoints(k));
    }

    Promise.all(leagues).then(function(leaguesTeams){
        for(var j = 0 ; j < numOfLeagues ; j++){
            var teams = leaguesTeams[j];
            var upMessage = {"header": "League", "content":"Congratulations you made to the next league!"};
            var downMessage = {"header":"League" , "content":"Better luck next time!"};
            results.push(giveBonusToTeams(teams, j));
            for (var i = 0 ; i< 20 ; i++){
                results.push(initSeasonStatistics(teams[i]));
            }
            if (j != numOfLeagues - 1){
                var obj = {};
                obj["league"] = 1;
                if(!teams[0].isBot){
                    userHandler.addMessageToUser(teams[0].id, upMessage);
                    userHandler.addValueToUser(teams[0].id,{currentLeague:1});
                }
                if(!teams[1].isBot){
                    userHandler.addMessageToUser(teams[1].id, upMessage);
                    userHandler.addValueToUser(teams[1].id,{currentLeague:1});
                }

                results.push(teamsHandler.addValueToTeamMulti({_id:teams[0]._id},obj));
                results.push(teamsHandler.addValueToTeamMulti({_id:teams[1]._id},obj));
                console.log("Teams make it to next league " +  teams[0].teamName +"   " + teams[1].teamName);
            }
            if (j != 0){
                var obj = {};
                obj["league"] = -1;

                if(!teams[19].isBot){
                    userHandler.getUserById(teams[19].id).then(function(user) {
                        if (user.currentLeague > 0) {
                            userHandler.addMessageToUser(teams[19].id, downMessage);
                            userHandler.addValueToUser(teams[19].id, {currentLeague: -1});
                        }
                    })
                }
                if(!teams[18].isBot){
                    userHandler.getUserById(teams[18].id).then(function(user) {
                        if (user.currentLeague > 0) {
                            userHandler.addMessageToUser(teams[19].id, downMessage);
                            userHandler.addValueToUser(teams[18].id, {currentLeague: -1});
                        }
                    })
                }

                results.push(teamsHandler.addValueToTeamMulti({_id:teams[19]._id},obj));
                results.push(teamsHandler.addValueToTeamMulti({_id:teams[18]._id},obj));
                console.log("Teams which goes to lower league " +  teams[19].teamName +"   " + teams[18].teamName);
            }

        }
    });
    Promise.all(results).then(function(data){
        gameManager.initFixtures();
        reqHandler.gameManagerSetup();
        defer.resolve("ok");
    });
    return defer.promise;
}

function giveBonusToTeams(sortedTeamsLeague, leagueNum){
    var defer = Promise.defer();
    var results = [];
    var message ={"header":"Bonus","content": "You got bonus of "};
    for (var i = 0 ; i < 20 ; i++){
        if(sortedTeamsLeague[i].id != -1) {
            message[0].content += ((20 - i) * 100000 * leagueNum) + " coins";
            results.push(userHandler.addMoneyToUser(sortedTeamsLeague[i].id, (20 - i) * 100000 * leagueNum));
            results.push(userHandler.addMessageToUser(sortedTeamsLeague[i].id,message));
        }
    }
    Promise.all(results).then(function(data){
       defer.resolve("ok");
    });
    return defer.promise;
}

function  initSeasonStatistics(team) {
    var defer = Promise.defer();
    var id = {};
    id["_id"] = team._id;
    var updateValue = {};
    updateValue["gamesHistory.thisSeason.wins"] = 0;
    updateValue["gamesHistory.thisSeason.losts"] = 0;
    updateValue["gamesHistory.thisSeason.draws"] = 0;
    updateValue["gamesHistory.thisSeason.goalsFor"] = 0;
    updateValue["gamesHistory.thisSeason.goalsAgainst"] = 0;
    updateValue["gamesHistory.thisSeason.homeGames"] = 0;
    updateValue["gamesHistory.thisSeason.crowd"] = 0;
    updateValue["gamesHistory.thisSeason.points"] = 0;

    teamsHandler.updateTeamMulti(id,updateValue).then(function (data){
        defer.resolve("ok");
    });

    return defer.promise;
}

/*
var createNewLeagues = function createNewLeagues(){
    var defer = Promise.defer();
    var results = [];
    if (leagueHandker.getNumOfLeagues() == 20){
        for (var i = 1; i <= 20 ; i++) {
            leagueHandler.getSortedTeamsByPoints(i).then(function (teams){
                for (var j = 0 ; j < 20 ; j++){
                    results.push(initSeasonStatistics(teams[j]));
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

*/
module.exports.endOfSeason = endOfSeason;