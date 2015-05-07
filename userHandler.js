/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
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


var addNewUser = function addNewUser (body,res){
    var defer = Promise.defer();
    //console.log(body);
    var user = JSON.parse(body);
    userCollection.findOne({"email":user.email},function(err,data) {
        if (!data) {
            userCollection.insert(user,function(err,data){
                if (!err) {
                    updateUser(user.email, "money", 100000, res).then(function (data) {
                        console.log("addNewUser", "Ok");
                        defer.resolve("ok");
                    });

                } else {
                    console.log("addNewUser", err);
                    defer.resolve("null");
                }});
        }else{
            console.log("addNewUser", "User exist");
            defer.resolve("ok");
        }
    })
    return defer.promise;
}

var getUserByEmail = function getUserByEmail (email){
    var defer = Promise.defer();
    var query = {"email" : email}
    userCollection.findOne(query,function(err,data){
        if(err){
            console.log("getUserByEmail error",err);
            defer.resolve({user: "null"});
        }else{
            console.log("getUserByEmail","ok");
            defer.resolve({user:data});
        }});
    return defer.promise;
}

var updateUser = function updateUser (email,Key,value,res){
    var defer = Promise.defer();
    //console.log(body);
    var obj = {};
    obj[Key] = value;
    userCollection.update({"email":email},{$set: obj},function(err,data){
        if(err){
            console.log("updateUser",err);
            defer.resolve(err);
        }else{
            console.log("updateUser","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

var addMoneyToUser = function updateUser (email,money){
    var defer = Promise.defer();
    userCollection.update({"email":email},{$inc: {Money: money}},function(err,data){
        if(err){
            console.log("addMoneyToUser",err);
            defer.resolve("null");
        }else{
            console.log("addMoneyToUser","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}



module.exports.updateUser = updateUser;
module.exports.addNewUser = addNewUser;
module.exports.getUserByEmail = getUserByEmail;
module.exports.setup = setup;