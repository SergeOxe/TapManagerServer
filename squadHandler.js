/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var userHandler = require("./userHandler");
var gameManager = require("./gameManager");
var squadCollection;

var MIN_SALARY = 100,MAX_SALARY = 1000;
var MIN_AGE = 18,MAX_AGE =36;
var MIN_PLAYER_LEVEL = 1,MAX_PLAYER_LEVEL = 5;
var MIN_PLAYER_PRICE = 4000,MAX_PLAYER_PRICE = 10000;
var MIN_PRICE_TO_BOOST = 200,MAX_PRICE_TO_BOOST = 1000;
var MIN_BOOST = 20,MAX_BOOST = 40;
var MIN_IMAGE = 0,MAX_IMAGE = 6;

var firstNames = ["Hilton",
    "Stan",
    "Tal",
    "Elliot",
    "Floyd",
    "Cornell",
    "Amos",
    "Britt",
    "Serge",
    "Hector",
    "Eran",
    "Darron",
    "Joan",
    "Moli",
    "Vincenzo",
    "Didi",
    "Allan",
    "Herschel",
    "Vito",
    "Doron",
    "Rogelio",
    "Solomon",
    "Martin",
    "Almog",
    "Leland",
    "Hubert",
    "Dewey",
    "Bryan",
    "Collin",
    "Gilad",
    "Jhon",
    "Berry",
    "Lukas",
    "Tobias",
    "Maximilian",
    "Luca",
    "David",
    "Jakob",
    "Felix",
    "Elias",
    "Jonas",
    "Paul",
    "Alexander",
    "Raphael",
    "Sebastian",
    "Julian",
    "Simon",
    "Leon",
    "Fabian",
    "Florian",
    "Moritz",
    "Philipp",
    "Matthias",
    "Nico",
    "Noah",
    "Michael",
    "Samuel",
    "Benjamin",
    "Daniel",
    "Niklas",
    "Dominik",
    "Johannes",
    "Lorenz",
    "Marcel",
    "Leo",
    "Gabriel",
    "Valentin",
    "Matteo",
    "Jan",
    "Stefan",
    "Konstantin",
    "Manuel",
    "Luis",
    "Emil",
    "Marco",
    "Thomas",
    "Ben",
    "Clemens",
    "Fabio",
    "Kilian",
    "Andreas",
    "Christoph",
    "Tim",
    "Max",
    "Jonathan",
    "Martin",
    "Adrian",
    "Oliver",
    "Timo",
    "Laurenz",
    "Christian",
    "Anton"];
var lastNames = ["Mahmood",
    "Boehmer",
    "Sharlow",
    "Vallarta",
    "Sharp",
    "Fennessey",
    "Norvel",
    "Southwood",
    "Fried",
    "Graham",
    "Zdenek",
    "Mendicino",
    "Stoneman",
    "Brainard",
    "Sheely",
    "Kashi",
    "Moroz",
    "Peres",
    "Feiler",
    "Bianchi",
    "Youngman",
    "Guercio",
    "Kish",
    "Riggio",
    "Kos",
    "Lisk",
    "Cronk",
    "Hannan",
    "Schunk",
    "Demarcus",
    "Devine","Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Rodriguez",
    "Wilson",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Hernandez",
    "Moore",
    "Martin",
    "Jackson",
    "Thompson",
    "White",
    "Lopez",
    "Lee",
    "Gonzalez",
    "Harris",
    "Clark",
    "Lewis",
    "Robinson",
    "Walker",
    "Perez",
    "Hall",
    "Young",
    "Allen",
    "Sanchez",
    "Wright",
    "King",
    "Scott",
    "Green"]


var setup = function setup(db){
    db.collection("Squad",function(err, data) {
        if(!err) {
            squadCollection = data;
        }else{
            console.log(err);
        }
    });
}

var getBotSquad = function getBotSquad (){
    var defer = Promise.defer();
    squadCollection.findOne({isBot:true},function(err,data){
        if(!data){
            console.log("getBotSquad err",err);
            defer.resolve({squad: "null"});
        }else{
            //console.log("getBotSquad","ok");
            defer.resolve({squad:data});
        }});
    return defer.promise;
}

var newSquadForUser = function newSquadForUser (detailsJson,res){
    var defer = Promise.defer();
    //var detailsJson = JSON.parse(details);
    var id;
    getBotSquad().then(function(data){
        if(!data){
            console.log("newSquadForUser getBotSquad err",err);
            defer.resolve(err);
            return;
        }
        id = data.squad._id;
        var obj = {};
        obj["id"] = detailsJson.id;
        obj["isBot"] = false;
        squadCollection.update({"_id":id},{$set: obj},function(err,data){
            if(!data){
                console.log("newSquadForUser err",err);
                defer.resolve(err);
            }else{
                //console.log("newSquadForUser","ok");
                defer.resolve(data);
            }});

    });
    return defer.promise;

}

var addNewBotSquad =  function addNewBotSquad(id){
    var defer = Promise.defer();
    var year =new Date().getFullYear();
    var players = [];
    var obj = { "id" : id, "isBot" : true};
    for (var i = 0; i < 15 ; i++){
       var player = {
            "id" : i,
            "position": 0,
            "firstName": "",
            "lastName": "",
            "salary": 0,
            "isInjured": false,
            "age": 0,
            "gamesPlayed": 0,
            "goalsScored": 0,
            "level": 0,
            "price": 0,
            "priceToBoost": 1000,
            "currentBoost" : 0,
            "nextBoost" : 100,
            "boost": 34,
            "isPlaying": true,
            "yearJoinedTheClub": 0,
            "playerImage": 0
        }

        if (i == 0 || i == 11) {
            player.position = 0;
        }else if(i < 5 || i == 12){
            player.position = 1;
        }else if (i < 9 || i ==13 ){
            player.position = 2;
        }else if (i < 11 || i == 14){
            player.position = 3;
        }
        player.firstName = getRandomFirstName();
        player.lastName = getRandomLastName();
        player.salary = randomIntFromInterval(MIN_SALARY,MAX_SALARY);
        player.isInjured = false;
        player.age = randomIntFromInterval(MIN_AGE,MAX_AGE);
        player.level = randomIntFromInterval(MIN_PLAYER_LEVEL,MAX_PLAYER_LEVEL);
        player.price = randomIntFromInterval(MIN_PLAYER_PRICE,MAX_PLAYER_PRICE);
        player.priceToBoost = randomIntFromInterval(MIN_PRICE_TO_BOOST,MAX_PRICE_TO_BOOST);
        player.boost  = randomIntFromInterval(MIN_BOOST,MAX_BOOST);
        if(i > 10){
            player.isPlaying = false;
        }
        player.yearJoinedTheClub = year;
        player.playerImage = randomIntFromInterval(MIN_IMAGE,MAX_IMAGE);
        players.push(player);
    }
    obj["players"] = players;
    squadCollection.insert(obj,function(err,data){
        if(err){
            console.log("addNewBotSquad err",err);
            defer.resolve("null");
        }else{
            //console.log("addNewBotSquad","ok");
            defer.resolve("ok");
        }
    })
    return defer.promise;
}

var getSquadById = function getSquadById (id){
    var defer = Promise.defer();
    squadCollection.findOne({"id":id},function(err,data){
        if(err){
            console.log("getSquadById err",err);
            defer.resolve("null");
        }else{
            //console.log("getSquadById","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

function getRandomFirstName(){
    var name = firstNames[randomIntFromInterval(0,firstNames.length)];
    while(name == null){
        name = firstNames[randomIntFromInterval(0,firstNames.length)];
    }
    return name;
}

function getRandomLastName(){
    var name = lastNames[randomIntFromInterval(0,lastNames.length)];
    while(name == null){
        name = lastNames[randomIntFromInterval(0,lastNames.length)];
    }
    return name;
}

function boostPlayer(id,indexPlayer){
    var defer = Promise.defer();
    var results = [];
    results.push(getSquadById(id));
    results.push(userHandler.getUserById(id));
    Promise.all(results).then(function(data){
        var money = data[1].money;
        var player = data[0].players[indexPlayer];
        var nextBoost = player.nextBoost;
        var obj = {};
        var promises = [];
        var find = {};
        find["id"] = id;
        if (money >= player.priceToBoost){
            if(player.boost + player.currentBoost >= player.nextBoost){
                obj["players."+indexPlayer +".currentBoost"] =  (player.boost + player.currentBoost)%player.nextBoost;
                obj["players."+indexPlayer +".nextBoost"] = player.nextBoost * 2;
                obj["players."+indexPlayer +".priceToBoost"] = player.priceToBoost * gameManager.getMultiplierBoost();
                //obj["players."+indexPlayer +".boost"] = player.boost;
                obj["players."+indexPlayer +".level"] = player.level + 1;
                obj["players."+indexPlayer +".salary"] = player.salary *1.1;
                obj["players."+indexPlayer +".price"] = player.price *1.25;
                var message = {"header":"Level up","content":player.firstName + " "+player.lastName+" is level "+ (player.level + 1) + " now" };
                userHandler.addMessageToUser(id,message);
            }else{
                obj["players."+indexPlayer +".currentBoost"] =  player.boost + player.currentBoost;
            }
            promises.push(userHandler.addMoneyToUser(id,-player.priceToBoost));
            promises.push(updateSquad(find,obj));
            Promise.all(promises).then(function(data){
                if (data == "null"){
                    defer.resolve("null");
                }else{
                    defer.resolve("ok");
                }
            })
        }else{
            defer.resolve("null");
        }
    });
    return defer.promise;
}



function addGaolToMultiPlayer(id,indexPlayers){
    if (indexPlayers.length == 0){
        return;
    }
    var defer = Promise.defer();
    var obj = {};
    var find = {};
    find["id"] = id;
    indexPlayers.split(" ").forEach(function (index) {
        if (index.length != 0) {
            if (obj["players." + index + ".goalsScored"] != null) {
                obj["players." + index + ".goalsScored"]++;
            } else {
                obj["players." + index + ".goalsScored"] = 1;
                }
            }

        });
        addMultiValueToSquad(find, obj).then(function (data) {
            defer.resolve("ok")
        });
    return defer.promise;
}

var addBoostToAllPlayers = function addBoostToAllPlayers(id) {
    var defer = Promise.defer();
    var find = {};
    find["id"] = id;
    var obj = {};
    getSquadById(id).then(function (data) {
        //console.log(data);
        for (var i = 0; i < data.players.length; i++) {
            var player = data.players[i];
            var nextBoost = player.nextBoost;
            if (player.boost + player.currentBoost >= player.nextBoost) {
                obj["players." + i + ".currentBoost"] = (player.boost + player.currentBoost) % player.nextBoost;
                obj["players." + i + ".nextBoost"] = player.nextBoost * 2;
                obj["players." + i + ".priceToBoost"] = player.priceToBoost * gameManager.getMultiplierBoost();
                obj["players." + i + ".level"] = player.level + 1;
            } else {
                obj["players." + i + ".currentBoost"] = player.boost + player.currentBoost;
            }
        }
        updateSquad(find,obj).then(function (res) {
            defer.resolve("ok");
        });
    });
    return defer.promise;
}

var getAllSquadSalaryById = function getAllSquadSalaryById(id) {
    var defer = Promise.defer();
    var find = {};
    var salary = 0;
    find["id"] = id;
    getSquadById(id).then(function (data) {
        if (data == null){
            defer.resolve("null");
            return;
        }
        data.players.forEach(function (player) {
            if(!isNaN(player.salary)) {
                salary += player.salary;
            }
        });
        defer.resolve(salary);
    });
    return defer.promise;
}

var getAllSquadRatingById = function getAllSquadRatingById(id) {
    var defer = Promise.defer();
    var find = {};
    var level = 0;
    find["id"] = id;
    getSquadById(id).then(function (data) {
        if (data == null){
            defer.resolve(randomIntFromInterval(10,50));
            return;
        }

        data.players.forEach(function (player) {

            if(!isNaN(player.level)) {
                level += player.level;
            }
        });
        defer.resolve(level);
    });
    return defer.promise;
}

var addValueToSquad = function addValueToSquad (id,key,value){
    var defer = Promise.defer();
    var obj ={};
    obj[key] = value;
    squadCollection.update({"id":id},{$inc:obj},function(err,data){
        if(err){
            console.log("addValueToSquad",err);
            defer.resolve("null");
        }else{
            //console.log("addValueToSquad","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var addMultiValueToSquad = function addMultiValueToSquad (findBy,obj){
    var defer = Promise.defer();
    squadCollection.update(findBy,{$inc:obj},function(err,data){
        if(err){
            console.log("addValueToSquad",err);
            defer.resolve("null");
        }else{
            //console.log("addValueToSquad",data);
            defer.resolve("ok");
        }});
    return defer.promise;
}

var updateSquad = function updateSquad (findBy,obj){
    if ( Object.keys(obj).length === 0){
        return;
    }
    var defer = Promise.defer();
    squadCollection.update(findBy,{$set: obj},function(err,data){
        if(!data){
            console.log("updateSquad err",obj);
            defer.resolve(err);
        }else{
            //console.log("updateSquad","ok");
            defer.resolve({team:data});
        }});
    return defer.promise;
}
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var deleteDB = function deleteDB(){
    squadCollection.remove({},function(err,data){

    });
}

module.exports.addGaolToMultiPlayer = addGaolToMultiPlayer;
module.exports.deleteDB = deleteDB;
module.exports.getAllSquadRatingById = getAllSquadRatingById;
module.exports.getAllSquadSalaryById = getAllSquadSalaryById;
module.exports.addBoostToAllPlayers = addBoostToAllPlayers;
module.exports.boostPlayer = boostPlayer;
module.exports.setup = setup;
module.exports.newSquadForUser = newSquadForUser;
module.exports.addNewBotSquad = addNewBotSquad;
module.exports.getBotSquad = getBotSquad;
module.exports.getSquadById = getSquadById;
