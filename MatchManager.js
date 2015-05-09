/**
 * Created by User on 5/7/2015.
 */
var teamsHandler = require("./teamsHandler");
var Promise = require('bluebird');


var m_MinCrowdMultiplier = 0.8;
var m_MaxCrowdMultiplier = 1.5;


var calcResult  = function  calcResult(i_HomeTeam, i_AwayTeam) {
    var defer = Promise.defer();
    var randomCrowdMultiplier = randomIntFromInterval(m_MinCrowdMultiplier, m_MaxCrowdMultiplier)/10;
    //float homeTeamOdds = i_HomeTeam.GetWinOdds();
    //float awayTeamOdds = i_AwayTeam.GetWinOdds();
    var crowdAtMatch =  (GetFanBase(i_HomeTeam) * randomCrowdMultiplier); // / 100000 * randomFansMultiplier;
    // crowdAtMatch should be bounded by stadium size

    var  outcome = randomIntFromInterval(1, 10) / 10;
    var homeTeamGoals;
    var awayTeamGoals;
    var eHomeResult;
    var eAwayResult;
    if (outcome < 0.3) {
        // Home team win
        homeTeamGoals = randomIntFromInterval(1, 5);
        awayTeamGoals = randomIntFromInterval(0, homeTeamGoals);
        eHomeResult = 0;
        eAwayResult = 1;
    } else if (outcome < 0.6) {
        // Tie
        homeTeamGoals = randomIntFromInterval(1, 5);
        awayTeamGoals = homeTeamGoals;
        eHomeResult = 2;
        eAwayResult = 2;
    } else {
        // Away team win
        awayTeamGoals = randomIntFromInterval(1, 5);
        homeTeamGoals = randomIntFromInterval(0, awayTeamGoals);
        eHomeResult = 1;
        eAwayResult = 0;
    }
    var v_isHomeTeam = true;
    var matchInfo =  MatchInfo(i_HomeTeam, i_AwayTeam, homeTeamGoals, awayTeamGoals, crowdAtMatch);
    UpdateMatchPlayed(i_HomeTeam,eHomeResult, matchInfo, v_isHomeTeam);
    UpdateMatchPlayed(i_AwayTeam,eAwayResult, matchInfo, !v_isHomeTeam);
    //return defer.resolve();
}

function  MatchInfo(i_HomeTeam, i_AwayTeam, i_HomeTeamGoals, i_AwayTeamGoals,  i_CrowdAtMatch){
    var homeTeam = i_HomeTeam.teamName;
    var awayTeam = i_AwayTeam.teamName;
    return {homeTeam : homeTeam,
        awayTeam : awayTeam ,
        homeTeamGoals : i_HomeTeamGoals,
        awayTeamGoals : i_AwayTeamGoals,
        crowdAtMatch : i_CrowdAtMatch
        };
}

function  UpdateMatchPlayed(team,i_result,  i_matchInfo,  i_isHomeMatch) {
    var defer = Promise.defer();
    var id = {};
    id["_id"] = team._id;
    var updateValue = {};
    var addValue = {};
    if (i_result == 0) {
        addValue["gamesHistory.thisSeason.wins"] = 1;
        addValue["gamesHistory.allTime.wins"] = 1;
        addValue["statistics.currentWinStreak"] = 1;
        addValue["statistics.currentUndefeatedStreak"] =1 ;
        addValue["additionalFans"] = 25;


        updateValue["lastResult"]= 0;
        updateValue["statistics.currentLoseStreak"] = 0;
        updateValue["statistics.currentWinlessStreak"] = 0;

    }else if (i_result == 1) {
        addValue["gamesHistory.thisSeason.losts"] = 1;
        addValue["gamesHistory.allTime.lost"] = 1;
        addValue["statistics.currentLoseStreak"] = 1;
        addValue["statistics.currentWinlessStreak"] = 1;
        if (team.gamesHistory.thisSeason.crowd - 10 > 0) {
            addValue["additionalFans"] = -10;
        }else {
            updateValue["gamesHistory.thisSeason.crowd"] = 0;
        }

        updateValue["lastResult"]= 1;
        updateValue["statistics.currentWinStreak"] = 0;
        updateValue["statistics.currentUndefeatedStreak"] = 0;

    }else {
        addValue["gamesHistory.thisSeason.draws"] = 1;
        addValue["gamesHistory.allTime.draws"] = 1;
        addValue["statistics.currentUndefeatedStreak"] = 1;
        addValue["statistics.currentWinlessStreak"] = 1;
        addValue["additionalFans"] = 13;

        updateValue["lastResult"]= 2;
        updateValue["statistics.currentWinStreak"] = 0;
        updateValue["statistics.currentLoseStreak"] = 0;

    }

    updateValue["lastGameInfo.homeTeam"] = i_matchInfo.homeTeam;
    updateValue["lastGameInfo.awayTeam"] = i_matchInfo.awayTeam;
    updateValue["lastGameInfo.awayTeamGoals"] = i_matchInfo.awayTeamGoals;
    updateValue["lastGameInfo.homeTeamGoals"] = i_matchInfo.homeTeamGoals;
    updateValue["lastGameInfo.crowdAtMatch"] = i_matchInfo.crowdAtMatch;

    if (i_isHomeMatch) {
        addValue["gamesHistory.thisSeason.goalsFor"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.thisSeason.goalsAgainst"] = i_matchInfo.awayTeamGoals;
        addValue["gamesHistory.allTime.goalsFor"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.allTime.goalsAgainst"] = i_matchInfo.awayTeamGoals;
        addValue["gamesHistory.thisSeason.homeGames"] = 1;
        addValue["gamesHistory.thisSeason.crowd"] = i_matchInfo.crowdAtMatch;

    } else {
        addValue["gamesHistory.thisSeason.goalsAgainst"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.thisSeason.goalsFor"] = i_matchInfo.awayTeamGoals;
        addValue["gamesHistory.allTime.goalsAgainst"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.allTime.goalsFor"] = i_matchInfo.awayTeamGoals;
    }

    updateValue["isLastGameIsHomeGame"] = i_isHomeMatch;

    teamsHandler.addValueToTeamMulti(id,addValue);
    teamsHandler.updateTeamMulti(id,updateValue);
    checkRecords (id).then(function(data){
        defer.resolve("ok");
    });
    return defer.promise;
}

function checkRecords(id){
    var defer = Promise.defer();
    teamsHandler.getTeamByKey(id).then(function (data){
       if(data.team == "null"){
           console.log("checkRecords err", "null");
       }else {
           var team = data.team;
           var updateValue = {};
           if (team.statistics.currentLoseStreak > team.statistics.longestLoseStreak) {
               updateValue["statistics.longestLoseStreak"] = team.statistics.currentLoseStreak;
           }

           if (team.statistics.currentUndefeatedStreak > team.statistics.longestUndefeatedStreak) {
               updateValue["statistics.longestUndefeatedStreak"] = team.statistics.currentUndefeatedStreak;
           }

           if (team.statistics.currentWinlessStreak > team.statistics.longestWinlessStreak) {
               updateValue["statistics.longestWinlessStreak"] = team.statistics.currentWinlessStreak;
           }

           if (team.statistics.currentWinStreak > team.statistics.longestWinStreak) {
               updateValue["statistics.longestWinStreak"] = team.statistics.currentWinStreak;
           }

           teamsHandler.updateTeamMulti(id, updateValue);

       }
        defer.resolve("ok");
    });
    return defer.promise;
}

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function GetFanBase(i_Team){
    var fanBase = (i_Team.shop.fansLevel + 1)*1000 + i_Team.additionalFans;
    return fanBase > 0 ? fanBase : 0;
}

module.exports.calcResult = calcResult;
