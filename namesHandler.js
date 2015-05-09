/**
 * Created by User on 5/9/2015.
 */
/**
 * Created by User on 5/5/2015.
 */
var Promise = require('bluebird');
var gameManager = require("./gameManager");
var teamsHandler = require("./teamsHandler");
var namesCollection;

var setup = function setup(db){
    db.collection("Names",function(err, data) {
        if(!err) {
            userCollection = data;
        }else{
            console.log(err);
        }
    });
}


function insertDoc(doc) {
    var defer = Promise.defer();
    namesCollection.insert(doc,function(err,data){
        if (err){
            console.log("insertDoc err", data);
            defer.resolve("null");
        } else{
            defer.resolve("ok");
        }
    });
    return defer.promise;
}


