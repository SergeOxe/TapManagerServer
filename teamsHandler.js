/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
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

var getBotTeam = function getBotTeam (){
    var defer = Promise.defer();
    teamsCollection.findOne({isBot:true},function(err,data){
        if(!data){
            console.log("getBotTeam err",err);
            defer.resolve({team: "null"});
        }else{
            console.log(data);
            console.log("getBotTeam","ok");
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
            console.log("updateTeam err",err);
            defer.resolve(err);
        }else{
            console.log("updateTeam","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}

var newTeamUser = function newTeamUser(details){

    var defer = Promise.defer();
    var detailsJson = JSON.parse(details);

    var promises = [];
    var id;
    getBotTeam().then(function(data){
        console.log(data);
        id = data.team._id;
        var obj = {};
        obj["email"] = detailsJson.email;
        obj["stadiumName"] = detailsJson.stadiumName;
        obj["teamName"] = detailsJson.teamName;
        obj["coachName"] =detailsJson.coachName;
        obj["isBot"] = false;
        teamsCollection.update({"_id":id},{$set: obj},function(err,data){
            if(!data){
                console.log("newTeamUser err",err);
                defer.resolve(err);
            }else{
                console.log("newTeamUser","ok");
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
            console.log("getTeamByEmail","ok");
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
            console.log("addValueToTeam","ok");
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
            console.log("getSortedTeams","ok")
            defer.resolve({teams : sortedTeams});
        }
    });
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

var getTeamByFixtureAndMatch = function  getTeamByFixtureAndMatch(i_Fixture, i_Match, i_IsHomeTeam){
    var m_FixturesList = generateFixtures();
    var fixturesPerRound = 19;
    var matchesPerFixture = 10;
    if (i_Fixture + 1 > fixturesPerRound*2 || i_Match + 1 > matchesPerFixture) {
        return null;
    }

    var isSecondRound = i_Fixture >= fixturesPerRound;
    var teamIndex;
    if (isSecondRound)
    {
        teamIndex = i_IsHomeTeam ? 1 : 0;
        return m_FixturesList[i_Fixture % fixturesPerRound][i_Match][teamIndex];
    }
    teamIndex = i_IsHomeTeam ? 0 : 1;
    return m_FixturesList[i_Fixture % fixturesPerRound] [i_Match][teamIndex];
}

function  GetOpponentByTeam( i_Team) {
    console.log("GetOpponentByTeam");
    return GetOpponentByTeamAndFixture(i_Team,m_currentFixture);
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
    return null;
}

function getMatchesPerFixture(){
    return 10;
}

function getTotalNumOfFixtures(){
    return 19*2;
}

function  ExecuteNextFixture(){
    console.log("ExecuteNextFixture");
     var v_IsHomeTeam = true;
    // Validate not end of season
    if (m_CurrentFixture == getTotalNumOfFixtures()){
        //End of season logic should be here
        return;
    }
    for (var i = 0; i < getMatchesPerFixture(); i++){
       CalcResult(getTeamByFixtureAndMatch(m_CurrentFixture, i, v_IsHomeTeam),
            getTeamByFixtureAndMatch(m_CurrentFixture, i, !v_IsHomeTeam));
    }
    m_CurrentFixture++;
}




module.exports.getTeamByFixtureAndMatch = getTeamByFixtureAndMatch;
module.exports.getSortedTeams = getSortedTeams;
module.exports.addValueToTeam = addValueToTeam;
module.exports.updateTeam = updateTeam;
module.exports.getBotTeam = getBotTeam;
module.exports.addNewTeam = addNewTeam;
module.exports.newTeamUser = newTeamUser;
module.exports.getTeamByEmail = getTeamByEmail;
module.exports.getTeamsInLeague = getTeamsInLeague;
module.exports.setup = setup;
module.exports.generateFixtures = generateFixtures;