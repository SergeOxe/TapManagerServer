/**
 * Created by User on 5/8/2015.
 */
var teamsHandler = require("./teamsHandler");
var matchManager = require("./matchManager");
var endOfSeason = require("./endOfSeason");
var Promise = require('bluebird');

var m_currentFixture;
//var sortedTeams = [[],[]];

var m_fixturesLists;
var gameManagerCollection;
var initPriceOfFans;
var initPriceOfFacilities;
var initPriceOfStadium;
var fansMultiplier;
var facilitiesMultiplier;
var stadiumMultiplier;
var multiplierBoost;
var ticketPrice;
var facilitiesFinanceMultiplier;
var stadiumFinanceMultiplier;
var merchandisePrice;

var lastGame;
var timeIntervalInHours;
var numOfLeagues;

var setup = function setup(db){
    var defer = Promise.defer();
    //var leagues = [];

    db.collection("GameManager",function(err, data) {
        if(!err) {
            gameManagerCollection = data;
        }else{
            console.log(err);
        }
    });

    getLeagueSetup().then(function(data){
        m_currentFixture = data.currentFixture;
        m_fixturesLists = data.fixturesLists;
        initPriceOfFans = data.pricesAndMultipliers.initPriceOfFans;
        initPriceOfFacilities = data.pricesAndMultipliers.initPriceOfFacilities;
        initPriceOfStadium = data.pricesAndMultipliers.initPriceOfStadium;
        fansMultiplier = data.pricesAndMultipliers.facilitiesMultiplier;
        facilitiesMultiplier = data.pricesAndMultipliers.facilitiesMultiplier;
        stadiumMultiplier = data.pricesAndMultipliers.stadiumMultiplier;
        multiplierBoost = data.pricesAndMultipliers.multiplierBoost;
        ticketPrice = data.financeMultipliers.ticketPrice;
        facilitiesFinanceMultiplier = data.financeMultipliers.facilitiesMultiplier;
        stadiumFinanceMultiplier = data.financeMultipliers.stadiumMultiplier;
        merchandisePrice = data.financeMultipliers.merchandisePrice;

        lastGame = data.lastGame;
        timeIntervalInHours = data.timeIntervalInHours;
        numOfLeagues = data.numOfLeagues;
        lastGame = Date.now();
        /*
        leagues.push([]);
        for (var  i = 1; i <= numOfLeagues ; i++){
            leagues.push(teamsHandler.getSortedTeams(i));
        };

        Promise.all(leagues).then(function(data){
            sortedTeams = data;
            //console.log(sortedTeams[2]);
        });
        */

        console.log("setup ok");
        executeGames();
        defer.resolve("ok");
    });

    return defer.promise;
};

function getSetup() {
    var defer = Promise.defer();
    gameManagerCollection.findOne({}, function (err, data) {
        if (!err) {
            defer.resolve(data);
        }else{
            console.log("getSetup err", err);
            defer.resolve("null");
        }
    })
    return defer.promise;
}

function executeGames() {
    var deltaTime  = timeIntervalInHours *3600000 - (Date.now() - lastGame);
    if(deltaTime > 0 ){
        console.log("next Game In "+ getTimeTillNextMatch())
        setTimeout(executeGames, deltaTime);
    }else{
        executeNextFixture();
        lastGame = Date.now();
        console.log("next Game In "+ getTimeTillNextMatch());
        updateGamesCollection({},{lastGame:lastGame});
        setTimeout(executeGames, timeIntervalInHours * 3600000);
    }
}

function getLeagueSetup() {
    var defer = Promise.defer();
    gameManagerCollection.findOne({}, function (err, data) {
        if (data == null) {
            console.log("getLeagueSetup err", err);
            var doc = {currentFixture : 0,
                        numOfLeagues: 0,
                        lastGame: Date.now(),
                        users: 0,
                        timeIntervalInHours : 0.0833,
                        fixturesLists : generateFixtures(),
                        pricesAndMultipliers:{
                            multiplierBoost : 1.5,
                            initPriceOfFans:1000,
                            initPriceOfFacilities:4000,
                            initPriceOfStadium: 8000,
                            fansMultiplier: 1.8,
                            facilitiesMultiplier: 2.25,
                            stadiumMultiplier:4
                            },
                        financeMultipliers:{
                            ticketPrice: 7,
                            facilitiesMultiplier: 1000,
                            stadiumMultiplier:2000,
                            merchandisePrice: 5
                        }
                        };
            insertToGameCollection(doc).then(function(data){});
            defer.resolve(doc);
        } else {
            //console.log("getLeagueSetup","ok");
            defer.resolve(data);
        }
    });
    return defer.promise;
}

function insertToGameCollection(doc){
    var defer = Promise.defer();
    gameManagerCollection.insert(doc,function(err,data){
    if(err){
        console.log("insertToGameCollection",err);
        defer.resolve("null");
    }else{
        //console.log("insertToGameCollection","Ok");
        defer.resolve("ok");
    }});
return defer.promise;
}

function addValueToGameCollection (findBy,obj){
    var defer = Promise.defer();
    gameManagerCollection.update(findBy,{$inc: obj},function(err,data){
        if(!data){
            console.log("addValueToGameCollection err",err);
            defer.resolve("null");
        }else{
            //console.log("addValueToGameCollection","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var updateGamesCollection = function updateGamesCollection (findBy,obj){
    var defer = Promise.defer();
    gameManagerCollection.update(findBy,{$set: obj},function(err,data){
        if(!data){
            console.log("updateGamesCollection err",obj);
            defer.resolve(err);
        }else{
            //console.log("updateGames","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var generateFixtures = function generateFixtures(){
    //console.log(data.teams);
    // Reference for this algorithm: http://bluebones.net/2005/05/generating-fixture-lists/
    var m_FixturesList;
    var totalTeams = 20;
    var totalFixtures = totalTeams - 1;
    var matchesPerFixture = totalTeams / 2;
    var tempFixturesList =  [[[]],[[]],[[]]];
    //[totalFixtures,matchesPerFixture,2];
    for (var fixture = 0; fixture < totalFixtures; fixture++) {
        for (var match = 0; match < matchesPerFixture; match++) {
            var homeTeamIndex = (fixture + match) % (totalTeams - 1);
            var awayTeamIndex = (totalTeams - 1 - match + fixture) % (totalTeams - 1);

            // Last team stays in the same place while the others
            // rotate around it.
            if (match == 0) {
                awayTeamIndex = totalTeams - 1;
            }
            if(!tempFixturesList[fixture]){
                tempFixturesList[fixture] = Array(matchesPerFixture);
            }
            if(!tempFixturesList[fixture][match]){
                tempFixturesList[fixture][match] = Array(2);
            }
            tempFixturesList[fixture][match][0] = homeTeamIndex;
            tempFixturesList[fixture][match][1] = awayTeamIndex;
        }
    }
    // Interleave so that home and away games are fairly evenly dispersed.
    m_FixturesList =  [[[]],[[]],[[]]];
    var even = 0;
    var odd = totalTeams / 2;
    for (var i = 0; i < totalFixtures; i++) {
        if (i % 2 == 0) {
            //m_FixturesList.SetValue(tempFixturesList.GetValue(even), i);
            for (var j = 0; j < matchesPerFixture; j++) {
                if(!m_FixturesList[i]){
                    m_FixturesList[i] = Array(matchesPerFixture);
                }
                if(!m_FixturesList[i][j]){
                    m_FixturesList[i][j] = Array(2);
                }
                m_FixturesList[i][j][0] = tempFixturesList[even][j][0];
                m_FixturesList[i][j][1] = tempFixturesList[even][j][1];
            }
            even++;
        } else {
            //m_FixturesList.SetValue(tempFixturesList.GetValue(odd), i);
            for (var j = 0; j < matchesPerFixture; j++) {
                if(!m_FixturesList[i]){
                    m_FixturesList[i] = Array(matchesPerFixture);
                }
                if(!m_FixturesList[i][j]){
                    m_FixturesList[i][j] = Array(2);
                }
                m_FixturesList[i][j][0] = tempFixturesList[odd][j][0];
                m_FixturesList[i][j][1] = tempFixturesList[odd][j][1];
            }
            odd++;
        }
    }

    // Last team can't be away for every game so flip them
    // to home on odd rounds.
    for (var fixture = 0; fixture < totalFixtures; fixture++) {
        if (fixture % 2 == 1) {
            var tempTeam = m_FixturesList[fixture][0][0];
            m_FixturesList[fixture][0][0] = m_FixturesList[fixture][0][1];
            m_FixturesList[fixture][0][1] = tempTeam;
        }
    }
    return m_FixturesList;
}

var getTeamByFixtureAndMatch = function getTeamByFixtureAndMatch(i_Fixture, i_Match, i_IsHomeTeam){
    var fixturesPerRound = 19;
    var matchesPerFixture = getMatchesPerFixture();
    if (i_Fixture  > fixturesPerRound * 2 || i_Match + 1 > matchesPerFixture) {
        return null;
    }

    var isSecondRound = i_Fixture >= fixturesPerRound;
    var teamIndex;
    if (isSecondRound) {
        teamIndex = i_IsHomeTeam ? 1 : 0;
        var index  = m_fixturesLists[i_Fixture % fixturesPerRound][i_Match][teamIndex];
        return index;
    }
    teamIndex = i_IsHomeTeam ? 0 : 1;
    var index  = m_fixturesLists[i_Fixture % fixturesPerRound][i_Match][teamIndex];
        return index;

}

function getMatchesPerFixture(){
    return 10;
}

function getTotalNumOfFixtures(){
    return 19*2;
}

var executeNextFixture = function  executeNextFixture(res){
    var v_IsHomeTeam = true;
    // Validate not end of season
    if (m_currentFixture == getTotalNumOfFixtures()){
        console.log("End Of season");
        //End of season logic should be here
        endOfSeason.endOfSeason();
        return;
    }
    var leagues = [];
    leagues.push([]);
    for (var  i = 1; i <= numOfLeagues ; i++){
        leagues.push(teamsHandler.getSortedTeams(i));
    };
    Promise.all(leagues).then(function (sortedTeams) {
        for (var j = 1; j <= numOfLeagues; j++) {
            var sortedTeamsLeague = sortedTeams[j];
            //console.log(sortedTeamsLeague);
            for (var i = 0; i < getMatchesPerFixture(); i++) {
                var team1 = getTeamByFixtureAndMatch(m_currentFixture, i, v_IsHomeTeam);
                var team2 = getTeamByFixtureAndMatch(m_currentFixture, i, !v_IsHomeTeam);
                var teamObj1 = sortedTeamsLeague[team1];
                var teamObj2 = sortedTeamsLeague[team2];
                matchManager.calcResult(teamObj1, teamObj2);
            }
        }
    });
    var curr = {};
    curr["currentFixture"] = 1;
    addValueToGameCollection({},curr);
    m_currentFixture++;
    lastGame = Date.now();
    console.log("executeNextFixture","ok");
//if (!res) {
    //res.send("ok");
//}
}

function  GetOpponentByTeamAndFixture( indexAndLeague,  i_Fixture){
    var defer = Promise.defer();
    teamsHandler.getSortedTeams(indexAndLeague.league).then(function(sortedLeague){
        //var sortedLeague = sortedTeams[indexAndLeague.league];
        var v_IsHomeTeam = true;
        for (var i = 0; i < getMatchesPerFixture(); i++){
            if (getTeamByFixtureAndMatch(i_Fixture, i, v_IsHomeTeam) == indexAndLeague.index) {
                defer.resolve({opponent :sortedLeague[getTeamByFixtureAndMatch(i_Fixture, i, !v_IsHomeTeam)].teamName,
                        isHomeMatch:true});
            }
            if (getTeamByFixtureAndMatch(i_Fixture, i, !v_IsHomeTeam) == indexAndLeague.index) {
                defer.resolve({opponent : sortedLeague[getTeamByFixtureAndMatch(i_Fixture, i, v_IsHomeTeam)].teamName,
                        isHomeMatch:false});
            }
        }
        //console.log("Could not find team in fixture list!");
        defer.resolve({opponent : "You have not played a game yet",
            isHomeMatch:false});
    });
    return defer.promise;
}

function  GetOpponentByTeam( i_Team) {
    var defer = Promise.defer();
    console.log("GetOpponentByTeam");
    GetOpponentByTeamAndFixture(i_Team,m_currentFixture).then(function(data){
        defer.resolve(data);
    });
    return defer.promise;
}

var getIndexOfTeamById = function getIndexOfTeamById(id){
    var defer = Promise.defer();
    var index;
    teamsHandler.getTeamById(id).then(function(data){
        if (data.team == "null"){
            defer.resolve("getIndexOfTeamById","null");
            return;
        }
        var id = data.team._id;
        //var league = sortedTeams[data.team.league];
        teamsHandler.getSortedTeams(data.team.league).then(function(league){
            for (var i = 0 ; i < league.length ; i++){
                if (String(league[i]._id).valueOf() == String(id).valueOf()){
                    defer.resolve({index : i, league : data.team.league});
                    break;
                }
            }
            defer.resolve("null");
        });
    });
    return defer.promise;
}

var getMultiplierBoost = function getMultiplierBoost(){
    return multiplierBoost;
}

var getInitPriceOfFans = function getInitPriceOfFans(){
    return initPriceOfFans;
}

var getInitPriceOfFacilities = function getInitPriceOfFacilities(){
    return initPriceOfFacilities;
}

var getInitPriceOfStadium = function getInitPriceOfStadium(){
    return multiplierBoost;
}

var getFansMultiplier = function getFansMultiplier(){
    return fansMultiplier;
}

var getFacilitiesMultiplier = function getFacilitiesMultiplier(){
    return facilitiesMultiplier;
}

var getStadiumMultiplier = function getStadiumMultiplier(){
    return stadiumMultiplier;
}

var getNumOfLeagues = function getNumOfLeagues(){
    return numOfLeagues;
}

var addNumOfLeagues = function addNumOfLeagues(){
    numOfLeagues++;
}
var getTimeTillNextMatch = function getTimeTillNextMatch(){
    return  (timeIntervalInHours*3600000) - (Date.now() - lastGame);
}

var getOpponentById = function getOpponentById(id) {
    var defer = Promise.defer();
    getIndexOfTeamById(id).then(function(data){
        GetOpponentByTeamAndFixture(data,m_currentFixture).then(function(data){
            defer.resolve(data);
        });
    });
    return defer.promise;
}

var getNextOpponentById = function getOpponentById(id) {
    var defer = Promise.defer();
    getIndexOfTeamById(id).then(function(data){
        GetOpponentByTeamAndFixture(data,m_currentFixture+1).then(function(data){
            defer.resolve(data);
        });
    });
    return defer.promise;
}

var getTicketPrice = function getTicketPrice(){
    return ticketPrice;
}
var getFacilitiesFinanceMultiplier = function getFacilitiesFinanceMultiplier(){
    return facilitiesFinanceMultiplier;
}
var getStadiumFinanceMultiplier = function getStadiumFinanceMultiplier(){
    return stadiumFinanceMultiplier;
}

var getMerchandisePrice = function getMerchandisePrice(){
    return merchandisePrice;
}


var initFixtures = function initFixtures(){
    m_currentFixture = 0;
}
var deleteDB = function deleteDB(){
    gameManagerCollection.remove({},function(err,data){
    });
}

module.exports.deleteDB = deleteDB;
module.exports.getMerchandisePrice = getMerchandisePrice;
module.exports.getTicketPrice = getTicketPrice;
module.exports.getFacilitiesFinanceMultiplier = getFacilitiesFinanceMultiplier;
module.exports.getStadiumFinanceMultiplier = getStadiumFinanceMultiplier;
module.exports.initFixtures = initFixtures;
module.exports.getOpponentById = getOpponentById;
module.exports.getNextOpponentById = getNextOpponentById;
module.exports.getTimeTillNextMatch = getTimeTillNextMatch;
module.exports.executeNextFixture = executeNextFixture;
module.exports.getTeamByFixtureAndMatch = getTeamByFixtureAndMatch;
module.exports.setup = setup;
module.exports.getSetup = getSetup;
module.exports.getMultiplierBoost = getMultiplierBoost;
module.exports.getInitPriceOfFans = getInitPriceOfFans;
module.exports.getInitPriceOfFacilities = getInitPriceOfFacilities;
module.exports.getInitPriceOfStadium = getInitPriceOfStadium;
module.exports.getFansMultiplier = getFansMultiplier;
module.exports.getFacilitiesMultiplier = getFacilitiesMultiplier;
module.exports.getStadiumMultiplier = getStadiumMultiplier;
module.exports.getNumOfLeagues = getNumOfLeagues;
module.exports.addNumOfLeagues = addNumOfLeagues;
module.exports.addValueToGameCollection = addValueToGameCollection;
module.exports.updateGamesCollection = updateGamesCollection;