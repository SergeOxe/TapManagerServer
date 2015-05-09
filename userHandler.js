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
    //console.log(body);
    var user = JSON.parse(body);
    userCollection.findOne({"email":user.email},function(err,data) {
        if (!data) {
            addNewUser(body).then(function (data) {
                //console.log("loginUser addUser", "ok");
            });
            console.log("loginUser err", err);
            defer.resolve("null");
        } else {
            console.log("loginUser", "User exist");
            defer.resolve("ok");
        }
    });
    //}});
    return defer.promise;
}

var addNewUser = function addNewUser (body){
    var defer = Promise.defer();
    var user = JSON.parse(body);
    //console.log(body);
    var obj = {
            email:user.email,
            fbId: user.id,
            name:user.name,
            coinValue: 20000,
            money:1000000
    };
    userCollection.insert(obj,function(err,data){
        if(err){
            console.log("addNewTeam",err);
            defer.resolve("null");
        }else{
            //console.log("addNewTeam","Ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var getUserByEmail = function getUserByEmail (email){
    var defer = Promise.defer();
    var query = {"email" : email}
    userCollection.findOne(query,function(err,data){
        if(err){
            console.log("getUserByEmail error",err);
            defer.resolve("null");
        }else{
            //console.log("getUserByEmail","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

var updateUser = function updateUser (email,Key,value){
    var defer = Promise.defer();
    //console.log(body);
    var obj = {};
    obj[Key] = value;
    userCollection.update({"email":email},{$set: obj},function(err,data){
        if(err){
            console.log("updateUser",err);
            defer.resolve(err);
        }else{
            //console.log("updateUser","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

var addMoneyToUser = function addMoneyToUser (email,money){
    var defer = Promise.defer();
    userCollection.update({"email":email},{$inc: {money: money}},function(err,data){
        if(err){
            console.log("addMoneyToUser",err);
            defer.resolve("null");
        }else{
            //console.log("addMoneyToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var addValueToUser = function addValueToUser (email,value){
    var defer = Promise.defer();
    var obj ={};
    //obj[key] = value;
    userCollection.update({"email":email},{$inc:value},function(err,data){
        if(err){
            console.log("addMoneyToUser",err);
            defer.resolve("null");
        }else{
            //console.log("addMoneyToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var upgradeItem = function upgradeFans(email,item) {
    var defer = Promise.defer();
    var results = [];
    results.push(teamsHandler.getTeamByEmail(email));
    results.push(getUserByEmail(email));
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
            promises.push(addMoneyToUser(email, price));
            promises.push(teamsHandler.addValueToTeamMulti({email:email}, obj));
            Promise.all(promises).then(function (data) {
                defer.resolve("ok");
            });
        } else {
            defer.resolve("null");
        }
    })
    return defer.promise;
}

var addCoinMoney = function addCoinMoney(email,clicks){
    var defer = Promise.defer();
    getUserByEmail(email).then(function(data){
        var money = clicks * data.coinValue;
        addMoneyToUser(email,money).then(function(data){
            defer.resolve("ok");
        })
    });
    return defer.promise;
}

module.exports.addMoneyToUser = addMoneyToUser;
module.exports.upgradeItem = upgradeItem;
module.exports.addCoinMoney = addCoinMoney;
module.exports.addNewUser = addNewUser;
module.exports.addMoneyToUser = addMoneyToUser;
module.exports.updateUser = updateUser;
module.exports.loginUser = loginUser;
module.exports.getUserByEmail = getUserByEmail;
module.exports.setup = setup;