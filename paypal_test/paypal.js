var express = require('express');
var paypal = require('paypal-rest-sdk');
var path = require('path');

var price = '5.00';

var server = express();

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Ae8eEISD5eh1DaNMVbsXo7H8GW-vbrekRfUXPdCS_pt2TdL_8HJx-O3UUGJIXHJCvs8WPc8TvL35FxrM',
  'client_secret': 'EPoPzlq1YirvKWnnbxZtBSfnwbVTkwHJNUi-gIqrX07ysvyaeYDVEg8W1OscX6PHX9TA6PU-Ew_m0iwm'
});

server.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

server.post('/pay', function(req, res) {
  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:1111/success",
      "cancel_url": "http://localhost:1111/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Limitlyss",
          "sku": "001",
          "price": price,
          "currency": "CAD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "CAD",
        "total": price
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
        "total": price
      }
    }]
  };

  paypal.payment.execute(paymentId, execute, function(e, payment) {
    if (e) {
      console.log(e);
    } else {
      console.log(payment.transactions[0].amount.total);
      res.send('Success');
    }
  });
});

server.get('/cancel', function(req, res) {
  res.send(':(');
})

server.listen(1111, function() {
  console.log('Server running on port 1111');
});
