/**
 * Created by User on 5/3/2015.
 */
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var reqHandler = require('./reqHandler');
var app = express();
var fs = require('fs');

var userHandler = require("./userHandler");

var version = "2.0.0.2";
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data

fs.readFile('./public/index.html', function (err, data) {
    if (err) {
        throw err;
    }
    html = data;
});


app.post('/newUser', function (req, res) {
    try {
        reqHandler.newUser(req.body, res);
    }catch (err){
        console.log("app newUser ",err);
        res.status(502).send("error");
    }
});

app.post('/clear', function (req, res) {
    userHandler.clearNotActiveUsers();
});

app.post('/sendMessage', function (req, res) {
    try {
        reqHandler.sendMessage(req.body, res);
    }catch (err){
        console.log("sendMessage",err);
        res.status(502).send("error");
    }
});

/*
app.get('/delete', function (req, res) {
    reqHandler.deleteDB().then(function(data){
        res.send(data);
    });
});
*/

app.post('/collectBucket', function (req, res) {
    try {
        reqHandler.collectBucket(req, res);
    } catch (err) {
        console.log("app collectBucket ", err);
        res.status(502).send("error");
    }
});

app.post('/loginUser', function (req, res) {
    try {
        reqHandler.loginUser(req.body.json, res);
    }catch (err){
        console.log("app error","loginUser");
        res.status(502).send("error");
    }
});

app.post('/newNumTeam', function (req, res) {
    reqHandler.addNewTeam(req,res);
});

app.post('/changeBotTeamName', function (req, res) {
    reqHandler.changeBotTeamName(req.body,res);
});

app.post('/changeTeamName', function (req, res) {
    reqHandler.changeTeamName(req.body,res);
});

app.post('/playerBoostClick', function(req,res){
    try{
        reqHandler.boostPlayer(req,res);
    }catch (err){
        console.log("error","playerBoostClick");
        res.status(502).send("error");
    }
});

app.post('/boostPlayerLevelUp', function(req, res){
    try{
        reqHandler.boostPlayerLevelUp(req,res);
    }catch (err){
        console.log("error",err);
        res.status(502).send("error");
    }
});

app.post('/changePlayerName', function(req,res){
    try {
        reqHandler.changePlayerName(req, res);
    }catch (err) {
        console.log("error","changePlayerName");
        res.status(502).send("error");
    }
});

app.post('/upgradeFans', function(req,res){
    try{
        reqHandler.upgradeItem(req,"fansLevel",res);
    }catch (err){
        console.log("error","upgradeFans");
        res.status(502).send("error");
    }
});

app.post('/upgradeFacilities', function(req,res){
    try{
        reqHandler.upgradeItem(req,"facilitiesLevel",res);
    }catch (err){
        console.log("error","upgradeFacilities");
        res.sstatus(502).send("error");
    }
});

app.post('/upgradeStadium', function(req,res){
    try {
        reqHandler.upgradeItem(req, "stadiumLevel", res);
    }catch (err) {
        console.log("error","upgradeStadium");
        res.status(502).send("error");
    }
});

app.post('/getInfoById', function (req, res) {
    try {
        reqHandler.getInfoById(req.body.id, res).then(function (data) {
            res.send(data);
        });
    }catch (err){
        console.log("error","getInfoById");
        res.status(502).send("error");
    }
});

/*
app.post('/messageWasRead', function (req, res) {
    try {
        reqHandler.messageWasRead(req.body.id, res);
    }catch (err){
        console.log("error","messageWasRead");
        res.status(502).send("error");
    }
});


app.post('/getTeamsInLeague', function (req, res) {
    try {
        reqHandler.getTeamsInLeague(req.body.league, res);
    }catch (err){
        console.log("error","getLeague");
        res.status(502).send("error");
    }
});
*/

app.post('/addInstantTrain',function(req,res){
    try {
        reqHandler.addInstantTrain(req.body, res);
    }catch (err){
        console.log("error","coinClick");
        res.status(502).send("error");
    }
});

app.post('/addMoney' ,function(req, res) {
    reqHandler.addMoneyToUser(req,res);
});

app.get('/getTimeTillNextMatch', function (req, res) {
    reqHandler.getTimeTillNextMatch(res);
});

/*
//------------------------------------------------
app.get('/executeNextFixture', function (req, res) {
    reqHandler.executeNextFixture(req,res);
});
*/
app.get('/getTime', function (req, res) {
    obj = {};
    obj["Time"] = Date.now();
    res.send(obj);
});

app.get('/', function(request, response) {
    //response.send('TapManager server version: '+version);
    response.send(html.toString());
});



app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
//var server = app.listen(4000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});

