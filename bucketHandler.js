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
        "id":user.id};

    bucketCollection.findOne({id:user.id},function(err,data) {
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

var getBucketById = function getBucketById (id){
    var defer = Promise.defer();
    bucketCollection.findOne({id:id},function(err,data){
        if(err){
            console.log("getBucketById",err);
            defer.resolve("null");
        }else{
            //console.log("getBucketById",'ok');
            defer.resolve(data);
        }});
    return defer.promise;
}

var updateBucket = function updateBucket (id,Key,value,res){
    var defer = Promise.defer();
    //console.log(body);
    var obj = {};
    obj[Key] = value;
    bucketCollection.update({id:id},{$set: obj},function(err,data){
        if(err){
            console.log("updateBucket",err);
            defer.resolve(err);
        }else{
            //console.log("updateBucket","ok");
            defer.resolve(data);
        }});
    return defer.promise;
}

var addLevelToBucket = function updateUser (id,money){
    var defer = Promise.defer();
    bucketCollection.update({id:id},{$inc: {level: 1}},function(err,data){
        if(err){
            console.log("addLevelToBucket",err);
            defer.resolve("null");
        }else{
            //console.log("addLevelToBucket","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}

var collectNowBucket = function collectNowBucket(id){
    var defer = Promise.defer();
    var results = [];
    getBucketById(id).then(function(data){
        if(Date.now() - data.lastFlush >= HOURS * 3600000){
            results.push(userHandler.addMoneyToUser(id,data.maxAmount));
            results.push(updateBucket(id,"lastFlush",Date.now()));
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
var deleteDB = function deleteDB(){
    bucketCollection.remove({},function(err,data){
    });
}

module.exports.deleteDB = deleteDB;
module.exports.collectNowBucket = collectNowBucket;
module.exports.updateBucket = updateBucket;
module.exports.addNewBucket = addNewBucket;
module.exports.getBucketById = getBucketById;
module.exports.setup = setup;
