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

app.post('/newUser', function (req, res) {
    console.log(req.body);
    reqHandler.addNewUser(req.body.json,res);

});

app.post('/newNumTeam', function (req, res) {
    reqHandler.addNewTeam(req,res);

});

app.post('/getUser', function (req, res) {
    reqHandler.getUserByEmail(req.body.email,res);
});

app.post('/newTeamUser', function (req, res) {
    reqHandler.newTeamUser(req.body.json,res);
});

app.get('/addNewBotSquad', function (req, res) {
    reqHandler.addNewBotSquad(req,res);
});

app.get('/getBot', function (req, res) {
    reqHandler.getBotTeam(req,res);
});

app.get('/getBotSquad', function (req, res) {
    reqHandler.getBotSquad(req,res);
});

app.get('/getTeamByFixtureAndMatch', function (req, res) {
    reqHandler.getTeamByFixtureAndMatch(req,res);
});

app.get('/executeNextFixture', function (req, res) {
    reqHandler.executeNextFixture(req,res);
});

app.post('/getInfoByEmail', function (req, res) {
    reqHandler.getInfoByEmail(req.body.email,res).then(function(data){
        res.send(data);
    });
});

app.post('/addBucket', function (req, res) {
    reqHandler.addNewBucket(req,res);
});

app.post('/addValueToTeam', function (req, res) {
    reqHandler.addValueToTeam(req.body.json,res);
});


var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);

});