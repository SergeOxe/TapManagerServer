/**
 * Created by User on 5/3/2015.
 */
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var reqHandler = require('./reqHandler');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data



app.post('/collectBucket', function (req, res) {
    try {
        reqHandler.collectBucket(req, res);
    }catch (err){
        console.log("collectBucket",err);
        res.send("error");
    }
});


app.post('/newUser', function (req, res) {
    try {
        reqHandler.addNewUser(req.body.json, res);
    }catch (err){
        console.log("error","newUser");
        res.send("error");
    }
});

app.post('/loginUser', function (req, res) {
    try {
        reqHandler.loginUser(req.body.json, res);
    }catch (err){
        console.log("error","loginUser");
        res.send("error");
    }
});

app.post('/newNumTeam', function (req, res) {
    reqHandler.addNewTeam(req,res);
});

app.post('/playerBoostClick', function(req,res){
    try{
        reqHandler.boostPlayer(req,res);
    }catch (err){
        console.log("error","playerBoostClick");
        res.send("error");
    }
});

app.post('/upgradeFans', function(req,res){
    try{
        reqHandler.upgradeItem(req,"fansLevel",res);
    }catch (err){
        console.log("error","upgradeFans");
        res.send("error");
    }
});
app.post('/upgradeFacilities', function(req,res){
    try{
        reqHandler.upgradeItem(req,"facilitiesLevel",res);
    }catch (err){
        console.log("error","upgradeFacilities");
        res.send("error");
    }
});

app.post('/upgradeStadium', function(req,res){
    try {
        reqHandler.upgradeItem(req, "stadiumLevel", res);
    }catch (err) {
        console.log("error","upgradeStadium");
        res.send("error");
    }
});

app.post('/getInfoByEmail', function (req, res) {
    reqHandler.getInfoByEmail(req.body.email, res).then(function (data) {
        res.send(data);
    });
});
app.post('/coinClick',function(req,res){
   reqHandler.addCoinMoney(req,res);
});


app.post('/addMoney' ,function(req, res) {
    reqHandler.addMoneyToUser(req,res);
});

//------------------------------
app.post('/getUser', function (req, res) {
    reqHandler.getUserByEmail(req.body.email,res);
});
//------------------------------------
app.post('/newTeamUser', function (req, res) {
    reqHandler.newTeamUser(req.body,res);
});
//-----------------------------------
app.get('/addNewBotSquad', function (req, res) {
    reqHandler.addNewBotSquad(req,res);
});
//----------------------------------------------
app.get('/getBot', function (req, res) {
    reqHandler.getBotTeam(req,res);
});

app.get('/getTimeTillNextMatch', function (req, res) {
    reqHandler.getTimeTillNextMatch(res);
});

app.get('/executeNextFixture', function (req, res) {
    reqHandler.executeNextFixture(req,res);
});

app.get('/getTime', function (req, res) {
    obj = {};
    obj["Time"] = Date.now();
    res.send(obj);
});



//-------------------------------------------------
app.get('/getBotSquad', function (req, res) {
    reqHandler.getBotSquad(req,res);
});
//---------------------------------------------------
app.get('/getTeamByFixtureAndMatch', function (req, res) {
    reqHandler.getTeamByFixtureAndMatch(req,res);
});

//-----------------------------------------------------
app.post('/addBucket', function (req, res) {
    reqHandler.addNewBucket(req,res);
});
//-------------------------------------------------
app.post('/addValueToTeam', function (req, res) {
    reqHandler.addValueToTeam(req.body.json,res);
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});