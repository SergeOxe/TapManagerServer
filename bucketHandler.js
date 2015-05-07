/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var bucketCollection;

var setup = function setup(db){
    db.collection("Buckets",function(err, data) {
        if(!err) {
            bucketCollection = data;
        }else{
            console.log(err);
        }
    });
}


var addNewBucket = function addNewBucket (body,res){
    var defer = Promise.defer();
    //console.log(body);
    var user = JSON.parse(body);
    var bucket = {
        "valueForSecond": 0,
        "maxAmount": 0,
        "lastFlush": 0,
        "dateNow": 0,
        "level": 0,
        "email":user.email};

    bucketCollection.findOne({"email":user.email},function(err,data) {
        if (!data) {
            bucketCollection.insert(bucket,function(err,data){
                if (!err) {
                    updateBucket(user.email, "dateNow",Date.now(), res).then(function (data) {
                        console.log("addNewBucket", "Ok");
                        defer.resolve("ok");
                    });

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
            console.log("getBucketByEmail",'ok');
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
            console.log("updateBucket","ok");
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
            console.log("addLevelToBucket","ok");
            defer.resolve("ok");
        }});
    return defer.promise;
}



module.exports.updateBucket = updateBucket;
module.exports.addNewBucket = addNewBucket;
module.exports.getBucketByEmail = getBucketByEmail;
module.exports.setup = setup;
