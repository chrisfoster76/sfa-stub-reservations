const config = require('./config');
const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require('body-parser');
const fs = require('fs');
const pug = require('pug');

const port = process.env.PORT || config.port;

const app = express();
app.use(bodyParser.json());

app.set('view engine', 'pug');

app.get("/", (req, res) => {
  res.render('splash');
});

app.get("/:providerId/reservations", (req, res) => {

    var viewmodel = {
        providerId: req.params.providerId,
        url: "https://127.0.0.1:44347/"+ req.params.providerId + "/apprentices/reservations/create"
    };

    res.render('start', viewmodel);
});

app.get("/:providerId/account/:accountId/legalentity/:accountLegalEntityId", (req, res) => {

    var viewmodel = {
        providerId : req.params.providerId,
        accountId : req.params.accountId,
        accountLegalEntityId: req.params.accountLegalEntityId,
        reservationUrl: "https://localhost:5001/commitments/" + req.params.providerId + "/cohorts/add-apprenticeship"
    };
    
    res.render('use-reservation', viewmodel);
});



app.listen(port, () => {
    console.log("Server listening on port " + port);
  });


String.Format = function (b) {
  var a = arguments;
  return b.replace(/(\{\{\d\}\}|\{\d\})/g, function (b) {
      if (b.substring(0, 2) == "{{") return b;
      var c = parseInt(b.match(/\d/)[0]);
      return a[c + 1]
  })
};