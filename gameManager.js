/**
 * Created by User on 5/8/2015.
 */
var teamsHandler = require("./teamsHandler");
var matchManager = require("./matchManager");
var Promise = require('bluebird');

var m_currentFixture;
var sortedTeams;
var m_fixturesLists;
var gameManagerCollection;

var setup = function setup(db){
    teamsHandler.getSortedTeams(1).then(function (data) {
        sortedTeams = data.teams;
    });
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
    });
};

function getLeagueSetup() {
    var defer = Promise.defer();
    gameManagerCollection.findOne({}, function (err, data) {
        if (data == null) {
            console.log("getLeagueSetup err", err);
            var doc = {currentFixture : 1,
                        numOfLeagues: 1,
                        fixturesLists : generateFixtures()
                        };
            insertToGameCollection(doc,function(err,data){
                if (err){
                    console.log("getLeagueSetup err", err);
                    defer.resolve("null");
                } else{
                  defer.resolve(data);
                }
            });
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

function updateGamesCollection (findBy,obj){
    if ( Object.keys(obj).length === 0){
        return;
    }
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
    //var m_FixturesList = generateFixtures();
    var fixturesPerRound = 19;
    var matchesPerFixture = 10;
    if (i_Fixture + 1 > fixturesPerRound * 2 || i_Match + 1 > matchesPerFixture) {
        return null;
    }

    var isSecondRound = i_Fixture >= fixturesPerRound;
    var teamIndex;
    if (isSecondRound) {
        teamIndex = i_IsHomeTeam ? 1 : 0;
        var index  = m_fixturesLists[i_Fixture % fixturesPerRound][i_Match][teamIndex];
        return sortedTeams[index];
    }
    teamIndex = i_IsHomeTeam ? 0 : 1;
    var index  = m_fixturesLists[i_Fixture % fixturesPerRound][i_Match][teamIndex];
        return sortedTeams[index];

}

function getMatchesPerFixture(){
    return 10;
}

function getTotalNumOfFixtures(){
    return 19*2;
}

var executeNextFixture = function  executeNextFixture(){
    var v_IsHomeTeam = true;
    // Validate not end of season
    if (m_currentFixture == getTotalNumOfFixtures()){
        //End of season logic should be here
        return;
    }
    for (var i = 0; i < getMatchesPerFixture(); i++){
        var team1 = getTeamByFixtureAndMatch(m_currentFixture, i, v_IsHomeTeam);
        var team2 = getTeamByFixtureAndMatch(m_currentFixture, i, !v_IsHomeTeam);
        matchManager.calcResult(team1,team2);
    }
    var curr = {};
    curr["currentFixture"] = 1;
    addValueToGameCollection({},curr);
    m_currentFixture++;
}

function  GetOpponentByTeamAndFixture( i_Team,  i_Fixture){
    console.log("GetOpponentByTeamAndFixture");
    var v_IsHomeTeam = true;
    for (var i = 0; i < getMatchesPerFixture(); i++){
        if (getTeamByFixtureAndMatch(i_Fixture, i, v_IsHomeTeam) == i_Team) {
            return getTeamByFixtureAndMatch(i_Fixture, i, !v_IsHomeTeam);
        }
        if (getTeamByFixtureAndMatch(i_Fixture, i, !v_IsHomeTeam) == i_Team) {
            return getTeamByFixtureAndMatch(i_Fixture, i, v_IsHomeTeam);
        }
    }
    console.log("Could not find team in fixture list!");
}

function  GetOpponentByTeam( i_Team) {
    console.log("GetOpponentByTeam");
    return GetOpponentByTeamAndFixture(i_Team,m_currentFixture);
}

module.exports.executeNextFixture = executeNextFixture;
module.exports.getTeamByFixtureAndMatch = getTeamByFixtureAndMatch;
module.exports.setup = setup;