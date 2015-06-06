/**
 * Created by User on 5/7/2015.
 */
var teamsHandler = require("./teamsHandler");
var squadHandler = require("./squadHandler");
var gameManager = require("./gameManager");
var userHandler = require("./userHandler");
var Promise = require('bluebird');


var m_MinCrowdMultiplier = 0.6;
var m_MaxCrowdMultiplier = 1.5;


var calcResult  = function  calcResult(i_HomeTeam, i_AwayTeam) {
    var defer = Promise.defer();
    var results = [];
    var promises = [];
    var randomCrowdMultiplier = randomIntFromInterval(m_MinCrowdMultiplier, m_MaxCrowdMultiplier)/10;
    var homeTeamOdds;
    var awayTeamOdds;

    try
    {
        var crowdAtMatch = (GetFanBase(i_HomeTeam) * randomCrowdMultiplier); // / 100000 * randomFansMultiplier;
        // crowdAtMatch should be bounded by stadium size}
    }catch (err){
        console.log("GetFanBase err "+ i_HomeTeam , err);
        return;
    }
        if(i_HomeTeam.isBot) {
            results.push(squadHandler.getAllSquadRatingById(-1));
        }else{
            results.push(squadHandler.getAllSquadRatingById(i_HomeTeam.id));
        }
    if(i_AwayTeam.isBot) {
        results.push(squadHandler.getAllSquadRatingById(-1));
    }else{
        results.push(squadHandler.getAllSquadRatingById(i_AwayTeam.id));
    }
    Promise.all(results).then(function(data){
        var sum = (data[0] > data[1]? data[0] + 2*data[1] : 2*data[0] + data[1])
        homeTeamOdds = data[0]/sum;
        awayTeamOdds = data[1]/sum;

        var outcome = randomIntFromInterval(1, 1000) / 1000;
        var homeTeamGoals;
        var awayTeamGoals;
        var eHomeResult;
        var eAwayResult;

        if (outcome < homeTeamOdds) {
            // Home team win
            homeTeamGoals = randomIntFromInterval(1, 5);
            awayTeamGoals = randomIntFromInterval(0, homeTeamGoals - 1);
            eHomeResult = 0;
            eAwayResult = 1;
        } else if (outcome < (homeTeamOdds + awayTeamOdds)) {
            // Away team win
            awayTeamGoals = randomIntFromInterval(1, 5);
            homeTeamGoals = randomIntFromInterval(0, awayTeamGoals - 1);
            eHomeResult = 1;
            eAwayResult = 0;
        }else {
            awayTeamGoals = randomIntFromInterval(1, 5);
            homeTeamGoals = awayTeamGoals;
            eHomeResult = 2;
            eAwayResult = 2;
        }

        /*
        if(!i_HomeTeam.isBot || !i_AwayTeam.isBot){
            console.log(i_HomeTeam.teamName,homeTeamOdds,i_AwayTeam.teamName,awayTeamOdds+homeTeamOdds, outcome);
            console.log(homeTeamGoals,awayTeamGoals);
        }
        */

        var v_isHomeTeam = true;
        var matchInfo =  MatchInfo(i_HomeTeam, i_AwayTeam, homeTeamGoals, awayTeamGoals, crowdAtMatch);
        promises.push(UpdateMatchPlayed(i_HomeTeam,eHomeResult, matchInfo, v_isHomeTeam));
        promises.push(UpdateMatchPlayed(i_AwayTeam,eAwayResult, matchInfo, !v_isHomeTeam));
        Promise.all(promises).then(function(data){
            defer.resolve("ok");
        })
    });
    return defer.promise;
}

function  MatchInfo(i_HomeTeam, i_AwayTeam, i_HomeTeamGoals, i_AwayTeamGoals,  i_CrowdAtMatch){
    var homeTeam = i_HomeTeam.teamName;
    var awayTeam = i_AwayTeam.teamName;
    return {homeTeam : homeTeam,
        awayTeam : awayTeam ,
        homeTeamGoals : i_HomeTeamGoals,
        awayTeamGoals : i_AwayTeamGoals,
        crowdAtMatch : i_CrowdAtMatch,
        homeTeamLogo:i_HomeTeam.logo,
        awayTeamLogo:i_AwayTeam.logo
        };
}

function  UpdateMatchPlayed(team,i_result,  i_matchInfo,  i_isHomeMatch) {
    var defer = Promise.defer();
    var id = {};
    id["_id"] = team._id;
    var updateValue = {};
    var addValue = {};
    if (i_result == 0) {
        addValue["gamesHistory.thisSeason.points"] = 3;
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
        addValue["gamesHistory.allTime.losts"] = 1;
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
        addValue["gamesHistory.thisSeason.points"] = 1;
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
    updateValue["lastGameInfo.homeTeamLogo"] = i_matchInfo.homeTeamLogo;
    updateValue["lastGameInfo.awayTeamLogo"] = i_matchInfo.awayTeamLogo;
    updateValue["lastGameInfo.awayTeamGoals"] = i_matchInfo.awayTeamGoals;
    updateValue["lastGameInfo.homeTeamGoals"] = i_matchInfo.homeTeamGoals;
    updateValue["lastGameInfo.crowdAtMatch"] = i_matchInfo.crowdAtMatch;

    var crowdAtMatch = 0;
    var playersScore = "";
    if (i_isHomeMatch) {
        for (var i = 0 ; i < i_matchInfo.homeTeamGoals; i ++){
            playersScore += randomIntFromInterval(1,14)+" ";
        }
        addValue["gamesHistory.thisSeason.goalsDifference"] = i_matchInfo.homeTeamGoals - i_matchInfo.awayTeamGoals;

        addValue["gamesHistory.thisSeason.goalsFor"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.thisSeason.goalsAgainst"] = i_matchInfo.awayTeamGoals;
        addValue["gamesHistory.allTime.goalsFor"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.allTime.goalsAgainst"] = i_matchInfo.awayTeamGoals;
        addValue["gamesHistory.thisSeason.homeGames"] = 1;
        addValue["gamesHistory.allTime.homeGames"] = 1;
        addValue["gamesHistory.thisSeason.crowd"] = i_matchInfo.crowdAtMatch;
        addValue["gamesHistory.allTime.crowd"] = i_matchInfo.crowdAtMatch;

        crowdAtMatch = i_matchInfo.crowdAtMatch;

    } else {
        for (var i = 0 ; i < i_matchInfo.awayTeamGoals; i ++){
            playersScore += randomIntFromInterval(1,14)+" ";
        }
        addValue["gamesHistory.thisSeason.goalsDifference"] = i_matchInfo.awayTeamGoals - i_matchInfo.homeTeamGoals;

        addValue["gamesHistory.thisSeason.goalsAgainst"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.thisSeason.goalsFor"] = i_matchInfo.awayTeamGoals;
        addValue["gamesHistory.allTime.goalsAgainst"] = i_matchInfo.homeTeamGoals;
        addValue["gamesHistory.allTime.goalsFor"] = i_matchInfo.awayTeamGoals;
    }

    updateValue["lastGameInfo.playersScoreGoal"] = playersScore;

    updateValue["isLastGameIsHomeGame"] = i_isHomeMatch;
    if(!team.isBot) {
        squadHandler.addBoostToAllPlayers(team.id);
        squadHandler.addGaolToMultiPlayer(team.id,playersScore);
        //Expenses
        var ticketPrice = (team.shop.stadiumLevel + 1) * gameManager.getTicketPrice();
        var incomeFromTickets = crowdAtMatch * ticketPrice;
        var incomeFromMerchandise = (GetFanBase(team) * (randomIntFromInterval(0, 8) / 10) *gameManager.getMerchandisePrice());
        var facilitiesCost = (team.shop.facilitiesLevel + 1) * gameManager.getFacilitiesFinanceMultiplier();
        var stadiumCost = i_isHomeMatch? (team.shop.stadiumLevel + 1) * gameManager.getStadiumFinanceMultiplier() : 0;
       squadHandler.getAllSquadSalaryById(team.id).then(function(salary){
           updateValue["finance.incomeFromTickets"] = incomeFromTickets;
           updateValue["finance.incomeFromMerchandise"] = incomeFromMerchandise;
           updateValue["finance.facilitiesCost"] = facilitiesCost;
           updateValue["finance.stadiumCost"] = stadiumCost;
           updateValue["finance.salary"] = salary;
           userHandler.addMoneyToUser(team.id,incomeFromTickets + incomeFromMerchandise - facilitiesCost - stadiumCost - salary);
           teamsHandler.addValueToTeamMulti(id,addValue);
           teamsHandler.updateTeamMulti(id,updateValue);
           checkRecords (id).then(function(data){
               defer.resolve("ok");
           });
       });
    }else{
        teamsHandler.addValueToTeamMulti(id,addValue);
        teamsHandler.updateTeamMulti(id,updateValue);
        checkRecords (id).then(function(data){
            defer.resolve("ok");
        });
    }
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
    var fanBase = (i_Team.shop.fansLevel + 1)*200 + i_Team.additionalFans;
    return fanBase > 0 ? fanBase : 0;
}

/*
function  CalculateIncome(i_Team,crowdAtLastMatch) {
    var fanBase = GetFanBase(i_Team);
    var MerchandisePrice = 100;
    var ticketPrice = 60; //i_Team.GetTicketPrice()
    var incomeFromTickets = crowdAtLastMatch * ticketPrice;
    var incomeFromMerchandise = (fanBase * (randomIntFromInterval(0, 8) / 10) *MerchandisePrice );
    return (incomeFromTickets + incomeFromMerchandise);
}

/*
 * Return as positive number!!
 */
/*
function CalculateOutcome(i_Team) {
    var  facilitiesLevel = i_Team.shop.facilitiesLevel;
    var stadiumLevel = i_Team.shop.stadiumLevel;
    var m_salary = squadHandler.getAllSquadSalaryById(i_Team.id);

    var facilitiesCost = (facilitiesLevel+1) * gameManager.getFacilitiesMultiplier();
    var stadiumCost = (stadiumLevel+1) * gameManager.getStadiumMultiplier();

    return m_facilitiesCost + m_stadiumCost + m_salary;
}

*/

module.exports.calcResult = calcResult;
