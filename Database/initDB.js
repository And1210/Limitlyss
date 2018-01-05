var sha = require('sha.js');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/limitlyss');
var coins = db.get('coins');

var maxCoins = 3349359;
var count = 0;

console.log("Beginning generation...");

generate();

function generate() {
  coins.insert(generateCoin(generateAddress())).then(function() {
    count++;
    if (count % 1000000 === 0) {
      console.log("Generating...");
    }
    if (count < maxCoins) {
      generate();
    }
  });
}

function generateCoin(address) {
  var out = {
    "address": address,
    "amount": 0,
    "owner": "null"
  };
  return out;
}

function generateAddress() {
  var out = "";
  for (var i = 0; i < 4; i++) {
    out += Math.floor(Math.random() * 16777215).toString(16);
  }
  out = out.substring(0, count % 24) + numToHex(Math.floor(count / 16)) + out.substring(count % 24 + 1, out.length);
  out = sha('sha256').update(out + count.toString()).digest('hex')
  return out;
}

function numToHex(num) {
  var out;
  if (num < 10) {
    out = '0'.charCodeAt(0) + num;
  } else {
    out = 'a'.charCodeAt(0) + (num - 10);
  }
  return String.fromCharCode(out);
}
