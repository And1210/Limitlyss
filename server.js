var express = require('express');
var server = express();

//Database setup
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/limitlyss');

//Serves all of public folder
server.use(express.static('public'));

//Execute server
server.listen(3141, function() {
  console.log('Server listening on port 3141');
});
