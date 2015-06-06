/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var gameManager = require("./gameManager");
var teamsHandler = require("./teamsHandler");
var userCollection;

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
    message.push({header:"Welcome To Tap Manager","content":" You got 1000000"});
    var obj = {
            //email:user.email,
            id: body.id,
            name:body.name,
            currentLeague:0,
            coinValue: 200,
            money:1000000,
            lastLogin : Date.now(),
            isMessage: true,
            message: message
            }
    userCollection.insert(obj,function(err,data){
        if(err){
            console.log("addNewTeam",err);
            defer.resolve("null");
        }else{
            //console.log("addNewTeam","Ok");

            gameManager.addValueToGameCollection({},{"users" : 1});
            defer.resolve("ok");
        }});
    return defer.promise;
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
            updateUser(id,"isMessage",true).then(function(data){
                defer.resolve(data);
            });
            //console.log("addMessageToUser","ok");
        }});
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

var upgradeItem = function upgradeFans(id,item) {
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
}

var deleteDB = function deleteDB(){
    userCollection.remove({},function(err,data){
    });
}

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