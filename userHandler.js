/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var gameManager = require("./gameManager");
var teamsHandler = require("./teamsHandler");
var reqHandler = require("./reqHandler");
var userCollection;

var monthInMilliSeconds = 2628000000;
//var monthInMilliSeconds = 1000;


var setup = function setup(db){
    db.collection("Users",function(err, data) {
        if(!err) {
            userCollection = data;
        }else{
            console.log(err);
        }
    });
}

var loginUser = function loginUser (body,res){
    var defer = Promise.defer();
    var user = JSON.parse(body);


    userCollection.findOne({id:user.id},function(err,data) {
        if (!data) {
            //addNewUser(body).then(function (data) {
                //console.log("loginUser addUser", "ok");
            //});
            console.log("loginUser err", err);
            defer.resolve("null");
        } else {
            updateUser(user.id,"lastLogin",Date.now());
            console.log("loginUser", "User exist");
            defer.resolve("ok");
        }
    });
    //}});
    return defer.promise;
}

var addNewUser = function addNewUser (body){
    var defer = Promise.defer();
    var message = [];
    var withFB = false;
    message.push({header:"Welcome To Tap Manager","content":"The plan is simple, win the Championship!"});

    if (!isNaN(body.id)){
        withFB = true;
    }
    var obj = {
            //email:user.email,
            id: body.id,
            connectWithFB:withFB,
            name:body.name,
            currentLeague:0,
            coinValue: 0,
            money:500000,
            lastLogin : Date.now(),
            message: message
            }
    userCollection.insert(obj,function(err,data){
        if(err){
            console.log("addNewUser",err);
            defer.resolve("null");
        }else{
            //console.log("addNewTeam","Ok");

            gameManager.addValueToGameCollection({},{"users" : 1});
            defer.resolve("ok");
        }});
    return defer.promise;
}

var deleteUser = function deleteUser(id){
    console.log("Deleting user: " + id);
    userCollection.remove({id:id},function(err,data){
        if(!data){
            console.log("deleteUser err",err);
        }else{
            gameManager.addValueToGameCollection({},{"users" : -1});
        }});
}

var getUserById = function getUserById (id){
    var defer = Promise.defer();
    var query = {id : id}
    userCollection.findOne(query,function(err,data){
        if(err){
            console.log("getUserById error",err);
            defer.resolve("null");
        }else{
            //console.log("getUserById","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}


var updateUser = function updateUser (id,Key,value){
    var defer = Promise.defer();
    //console.log(body);
    var obj = {};
    obj[Key] = value;
    userCollection.update({id:id},{$set: obj},function(err,data){
        if(err){
            console.log("updateUser",err);
            defer.resolve(err);
        }else{
            //console.log("updateUser","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

var addMoneyToUser = function addMoneyToUser (id,money){
    var defer = Promise.defer();
    if(isNaN(money)){
        console.log("addMoneyToUser",money);
        defer.resolve("null");
        return;
    }
    userCollection.update({id:id},{$inc: {money: money}},function(err,data){
        if(err){
            console.log("addMoneyToUser",err);
            defer.resolve("null");
        }else{
            //console.log("addMoneyToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var addValueToUser = function addValueToUser (id,obj){
    var defer = Promise.defer();
    if(isNaN(money)){
        console.log("addValueToUser",obj);
        defer.resolve("null");
        return;
    }
    userCollection.update({id:id},{$inc: obj},function(err,data){
        if(err){
            console.log("addValueToUser",err);
            defer.resolve("null");
        }else{
            //console.log("addValueToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var addMessageToUser = function addMessageToUser (id,messageArray){
    var defer = Promise.defer();
    if(messageArray.length == 0){
        console.log("addMessageToUser",obj);
        defer.resolve("null");
        return;
    }
    userCollection.update({id:id},{ $push: { message: messageArray}},function(err,data){
        if(err){
            console.log("addMessageToUser",messageArray);
            console.log("addMessageToUser",err);
            defer.resolve("null");
        }else{
            defer.resolve("ok");
        }});
        //console.log("addMessageToUser","ok");
    return defer.promise;
}

var addValueToUser = function addValueToUser (id,value){
    var defer = Promise.defer();
    var obj ={};
    //obj[key] = value;
    userCollection.update({id:id},{$inc:value},function(err,data){
        if(err){
            console.log("addMoneyToUser",err);
            defer.resolve("null");
        }else{
            //console.log("addMoneyToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var updateMultiValueToUser = function updateMultiValueToUser (id,obj){
    var defer = Promise.defer();
    userCollection.update({id:id},{$set: obj},function(err,data){
        if(err){
            console.log("addMoneyToUser",err);
            defer.resolve("null");
        }else{
            //console.log("addMoneyToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var upgradeItem = function upgradeItem(id,item) {
    var defer = Promise.defer();
    var results = [];
    results.push(teamsHandler.getTeamById(id));
    results.push(getUserById(id));
    Promise.all(results).then(function (data) {
        var money = data[1].money;
        var userLevel;
        var initPrice = 0;
        var multiplier;
        var obj = {};
        if (item == "fansLevel") {
            initPrice = gameManager.getInitPriceOfFans();
            userLevel = data[0].team.shop.fansLevel;
            multiplier = gameManager.getFansMultiplier();
            obj["shop.fansLevel"] = 1;
        } else if (item == "facilitiesLevel") {
            initPrice = gameManager.getInitPriceOfFacilities();
            userLevel = data[0].team.shop.facilitiesLevel;
            multiplier = gameManager.getFacilitiesMultiplier();
            obj["shop.facilitiesLevel"] = 1;
        } else {
            initPrice = gameManager.getInitPriceOfStadium();
            userLevel = data[0].team.shop.stadiumLevel;
            multiplier = gameManager.getStadiumMultiplier();
            obj["shop.stadiumLevel"] = 1;
        }
        if (money >=  initPrice*Math.pow(multiplier,userLevel)) {
            var promises = [];
            var price = -initPrice*Math.pow(multiplier,userLevel);
            promises.push(addMoneyToUser(id, price));
            promises.push(teamsHandler.addValueToTeamMulti({id:id}, obj));
            Promise.all(promises).then(function (data) {
                defer.resolve("ok");
            });
        } else {
            defer.resolve("null");
        }
    })
    return defer.promise;
}


//No Coin
var addCoinMoney = function addCoinMoney(id,clicks){
    var defer = Promise.defer();
    getUserById(id).then(function(data){
        var money = clicks * data.coinValue;
        if(!isNaN(money)){
            addMoneyToUser(id,money).then(function(data){
                defer.resolve("ok");
            })
        }else{
            defer.resolve("null");
        }

    });
    return defer.promise;
};

var clearNotActiveUsers = function clearNotActiveUsers(){
    console.log("Enter clearNotActiveUsers");
    var date = Date.now();
    userCollection.find({connectWithFB : false},{id:1,"lastLogin":1}).toArray(function(err, results){
        if(!err){
            results.forEach(function(user){
                if((date - user.lastLogin) > monthInMilliSeconds){
                    reqHandler.deleteUser(user.id)
                }
            });
        }
    });
};

var sendMessage = function sendMessage (i_header,i_content){
    var message = {};
    message["header"] = i_header;
    message["content"] = i_content;
    userCollection.find({},{id:1}).toArray(function(err, results){
        if(!err) {
            results.forEach(function (user) {
                addMessageToUser(user.id, message);
            });
        }
    });
}

var deleteDB = function deleteDB(){
    userCollection.remove({},function(err,data){
    });
};

module.exports.deleteDB = deleteDB;
module.exports.addMoneyToUser = addMoneyToUser;
module.exports.upgradeItem = upgradeItem;
module.exports.addCoinMoney = addCoinMoney;
module.exports.addNewUser = addNewUser;
module.exports.addValueToUser = addValueToUser;
module.exports.addMoneyToUser = addMoneyToUser;
module.exports.updateUser = updateUser;
module.exports.loginUser = loginUser;
module.exports.getUserById = getUserById;
module.exports.setup = setup;
module.exports.addMessageToUser = addMessageToUser;
module.exports.updateMultiValueToUser = updateMultiValueToUser;

module.exports.deleteUser = deleteUser;
module.exports.clearNotActiveUsers = clearNotActiveUsers;

module.exports.sendMessage = sendMessage;