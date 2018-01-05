var express = require('express');
var bodyParser = require('body-parser');
var paypal = require('paypal-rest-sdk');

var server = express();

const coinValue = 0.078125;

//Database setup
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/limitlyss');
var coins = db.get('coins');
var value = db.get('value');

//Paypal
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Ae8eEISD5eh1DaNMVbsXo7H8GW-vbrekRfUXPdCS_pt2TdL_8HJx-O3UUGJIXHJCvs8WPc8TvL35FxrM',
  'client_secret': 'EPoPzlq1YirvKWnnbxZtBSfnwbVTkwHJNUi-gIqrX07ysvyaeYDVEg8W1OscX6PHX9TA6PU-Ew_m0iwm'
});

//Serves all of public folder
server.use(express.static('public'));

//Setup to parse incoming data from client
server.use(bodyParser.urlencoded({
  extended: false
}));

//Payment
var amount;

server.post('/pay', function(req, res) {
  amount = req.body.amount.trim();
  var email = req.body.email.trim();

  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3141/success",
      "cancel_url": "http://localhost:3141/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Limitlyss",
          "sku": "001",
          "price": amount,
          "currency": "CAD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "CAD",
        "total": amount
      },
      "description": "Limitlyss to purchase."
    }]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (var i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel == 'approval_url') {
          res.redirect(payment.links[i].href);
          break;
        }
      }
    }
  });
});

server.get('/success', function(req, res) {
  var payerId = req.query.PayerID;
  var paymentId = req.query.paymentId;

  var execute = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "CAD",
        "total": amount
      }
    }]
  };

  paypal.payment.execute(paymentId, execute, function(e, payment) {
    if (e) {
      console.log(e);
    } else {
      addToDB(payment.payer.payer_info.email, payment.transactions[0].amount
        .total);
      res.send('Success');
    }
  });
});

server.get('/cancel', function(req, res) {
  res.send(':(');
});


//Execute server
server.listen(3141, function() {
  console.log('Server listening on port 3141');
});

//Database modification
function addToDB(email, amount) {
  // console.log(email);
  // console.log(amount);
  var coin = amount / coinValue;

  console.log('Beginning Input');

  coins.count({
    "owner": email
  }).then(function(value) {
    if (value == 0) {
      console.log('updating');
      coins.update({
        "owner": "null"
      }, {
        $set: {
          "owner": email,
          "amount": coin
        }
      }).then(function(data) {
        coins.find({
          "owner": email
        }, function(e, data) {
          console.log(data);
        });
      });
    } else {
      coins.find({
        "owner": email
      }, function(e, data) {
        console.log(data);
      });
    }
  });

}
