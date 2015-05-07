/**
 * Created by User on 5/7/2015.
 */
var teamsHandler = require("./teamsHandler");


var m_MinCrowdMultiplier = 0.8;
var m_MaxCrowdMultiplier = 1.5;


function  CalcResult( i_HomeTeam, i_AwayTeam,teams) {
    console.log("CalcResult");
    var randomCrowdMultiplier = randomIntFromInterval(m_MinCrowdMultiplier, m_MaxCrowdMultiplier)/10;
    //float homeTeamOdds = i_HomeTeam.GetWinOdds();
    //float awayTeamOdds = i_AwayTeam.GetWinOdds();
    var crowdAtMatch =  (GetFanBase(i_HomeTeam) * randomCrowdMultiplier); // / 100000 * randomFansMultiplier;
    // crowdAtMatch should be bounded by stadium size

    var  outcome = randomIntFromInterval(1, 10) / 10;
    //Debug.Log("oucome=" + outcome);


    var homeTeamGoals;
    var awayTeamGoals;
    var eHomeResult;
    var eAwayResult;
    if (outcome < 0.3) {
        // Home team win
        homeTeamGoals = randomIntFromInterval(1, 5) / 10;
        awayTeamGoals = randomIntFromInterval(0, homeTeamGoals) / 10;
        eHomeResult = "Won";
        eAwayResult = "Lost";
    } else if (outcome < 0.6) {
        // Tie
        homeTeamGoals = randomIntFromInterval(1, 5) / 10;
        awayTeamGoals = homeTeamGoals;
        eHomeResult = "Draw";
        eAwayResult = "Draw";
    } else {
        // Away team win
        awayTeamGoals = randomIntFromInterval(1, 5) / 10;
        homeTeamGoals = randomIntFromInterval(0, awayTeamGoals) / 10;
        eHomeResult = "Lost";
        eAwayResult = "Won";
    }
    var v_isHomeTeam = true;
    var matchInfo =  MatchInfo(i_HomeTeam._id, i_AwayTeam._id, homeTeamGoals, awayTeamGoals, crowdAtMatch);
    UpdateMatchPlayed(i_HomeTeam,eHomeResult, matchInfo, v_isHomeTeam);
    UpdateMatchPlayed(i_AwayTeam,eAwayResult, matchInfo, !v_isHomeTeam);
}



function  MatchInfo(i_HomeTeam, i_AwayTeam, i_HomeTeamGoals, i_AwayTeamGoals,  i_CrowdAtMatch){
   return {m_HomeTeam : i_HomeTeam,
        m_AwayTeam : i_AwayTeam,
        m_HomeTeamGoals : i_HomeTeamGoals,
        m_AwayTeamGoals : i_AwayTeamGoals,
        m_CrowdAtMatch : i_CrowdAtMatch
        };
}


function  UpdateMatchPlayed(team,i_result,  i_matchInfo,  i_isHomeMatch) {
    var id = {};
    id[_id] = team.id;
    if (i_result == "Won") {

        teamsHandler.updateTeam(id,i_matchInfo);
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.wins",1);
        teamsHandler.addValueToTeam(id,"gamesHistory.allTime.wins",1);

        teamsHandler.addValueToTeam(id,"additionalFans",25);

        teamsHandler.updateTeam(id,"lastResult","Won");

        teamsHandler.addValueToTeam(id,"statistics.currentWinStreak",1);
        teamsHandler.updateTeam(id,"statistics.currentLoseStreak",0);
        teamsHandler.updateTeam(id,"statistics.currentWinlessStreak",0);
        teamsHandler.addValueToTeam(id,"statistics.currentUndefeatedStreak",1);

    }else if (i_result == "Lost") {
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.losts",1);
        teamsHandler.addValueToTeam(id,"gamesHistory.allTime.lost",1);

        teamsHandler.addValueToTeam(id,"additionalFans",-10);


        teamsHandler.updateTeam(id,"lastResult","Lost");

        teamsHandler.updateTeam(id,"statistics.currentWinStreak",0);
        teamsHandler.addValueToTeam(id,"statistics.currentLoseStreak",1);
        teamsHandler.updateTeam(id,"statistics.currentUndefeatedStreak",0);
        teamsHandler.addValueToTeam(id,"statistics.currentWinlessStreak",1);

    }else {
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.draws",1);
        teamsHandler.addValueToTeam(id,"gamesHistory.allTime.draws",1);
        teamsHandler.addValueToTeam(id,"additionalFans",3);

        teamsHandler.updateTeam(id,"lastResult","Draw");

        teamsHandler.updateTeam(id,"statistics.currentWinStreak",0);
        teamsHandler.updateTeam(id,"statistics.currentLoseStreak",0);
        teamsHandler.addValueToTeam(id,"statistics.currentUndefeatedStreak",1);
        teamsHandler.addValueToTeam(id,"statistics.currentWinlessStreak",1);
    }


    if (i_isHomeMatch) {

        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.goalsFor",i_matchInfo.m_HomeTeamGoals);
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.goalsAgainst",i_matchInfo.i_AwayTeamGoals);
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.homeGames",1);
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.crowd",i_matchInfo.m_CrowdAtMatch);

    } else {
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.goalsAgainst",i_matchInfo.m_HomeTeamGoals);
        teamsHandler.addValueToTeam(id,"gamesHistory.thisSeason.goalsFor",i_matchInfo.i_AwayTeamGoals);
    }

    teamsHandler.updateTeam(id,isLastGameIsHomeGame,i_isHomeMatch);
    checkRecords ();
}



function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function GetFanBase(i_Team){
    var fanBase = (i_Team.shop.fansLevel + 1)*1000 + i_Team.additionalFans;
    return fanBase > 0 ? fanBase : 0;
}