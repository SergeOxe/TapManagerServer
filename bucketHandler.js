/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var userHandler = require("./userHandler");
var bucketCollection;
var HOURS = 1;

var setup = function setup(db){
    db.collection("Buckets",function(err, data) {
        if(!err) {
            bucketCollection = data;
        }else{
            console.log(err);
        }
    });
}


var addNewBucket = function addNewBucket (user,res){
    var defer = Promise.defer();
    //console.log(body);
    //var user = JSON.parse(body);
    var bucket = {
        "valueForSecond": (11000)/(HOURS*60*60),
        "maxAmount": 11000,
        "lastFlush": Date.now(),
        "level": 0,
        "email":user.email};

    bucketCollection.findOne({"email":user.email},function(err,data) {
        if (!data) {
            bucketCollection.insert(bucket,function(err,data){
                if (!err) {
                    defer.resolve("ok");

                } else {
                    console.log("addNewBucket", err);
                    defer.resolve("null");
                }});
        }else{
            console.log("addNewBucket", "Bucket exist");
            defer.resolve("ok");
        }
    })
    return defer.promise;
}

var getBucketByEmail = function getBucketByEmail (email){
    var defer = Promise.defer();
    bucketCollection.findOne({"email":email},function(err,data){
        if(err){
            console.log("getBucketByEmail",err);
            defer.resolve("null");
        }else{
            //console.log("getBucketByEmail",'ok');
            defer.resolve(data);
        }});
    return defer.promise;
}

var updateBucket = function updateBucket (email,Key,value,res){
    var defer = Promise.defer();
    //console.log(body);
    var obj = {};
    obj[Key] = value;
    bucketCollection.update({"email":email},{$set: obj},function(err,data){
        if(err){
            console.log("updateBucket",err);
            defer.resolve(err);
        }else{
            //console.log("updateBucket","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

var addLevelToBucket = function updateUser (email,money){
    var defer = Promise.defer();
    bucketCollection.update({"email":email},{$inc: {level: 1}},function(err,data){
        if(err){
            console.log("addLevelToBucket",err);
            defer.resolve("null");
        }else{
            //console.log("addLevelToBucket","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var collectNowBucket = function collectNowBucket(email){
    var defer = Promise.defer();
    var results = [];
    getBucketByEmail(email).then(function(data){
        if(Date.now() - data.lastFlush >= HOURS * 3600000){
            results.push(userHandler.addMoneyToUser(email,data.maxAmount));
            results.push(updateBucket(email,"lastFlush",Date.now()));
            Promise.all(results).then(function(data){
                if(data[0] == "null" || data[1] == "null"){
                    defer.resolve("null");
                }else {
                    defer.resolve("ok");
                }
            })

        }else{
            defer.resolve({delta: Date.now() - data.lastFlush});
        }
    })
    return defer.promise;
}
module.exports.collectNowBucket = collectNowBucket;
module.exports.updateBucket = updateBucket;
module.exports.addNewBucket = addNewBucket;
module.exports.getBucketByEmail = getBucketByEmail;
module.exports.setup = setup;
