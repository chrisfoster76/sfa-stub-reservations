const config = require('./config');
const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require('body-parser');
const fs = require('fs');
const pug = require('pug');
const path = require('path');

const port = process.env.PORT || config.port;

const app = express();
app.use(express.static('public'));

app.use(bodyParser.json());

app.set('view engine', 'pug');

app.get("/", (req, res) => {
    res.render('splash');
});

app.get("/:providerId/reservations", (req, res) => {

    var viewmodel = {
        providerId:  req.params.providerId,
        url: "https://127.0.0.1:44347/"+ req.params.providerId + "/apprentices/reservations/create"
    };

    res.render('start', viewmodel);
});

app.get("/:providerId/account/:accountId/legalentity/:accountLegalEntityId", (req, res) => {

    var viewmodel = {
        providerId : req.params.providerId,
        accountId : req.params.accountId,
        accountLegalEntityId: req.params.accountLegalEntityId,
        reservations : [
            {
                reservationName: "Levy-style Reservation",
                reservationDescription: "Levy example (no course or start date selected) [ec6b806b-0491-44af-bc4f-68366779b931]",
                reservationUrl: "https://localhost:5001/" + req.params.providerId + "/unapproved/add-apprentice?reservationId=ec6b806b-0491-44af-bc4f-68366779b931"
                    + "&employerAccountPublicHashedId=" + req.params.accountId
                    + "&employerAccountLegalEntityPublicHashedId=" + req.params.accountLegalEntityId
                
            },
            {
                reservationName: "Reservation with for Geospatial Survey Technician (244)",
                reservationDescription: "Start date: June 2019 [faac2df3-110f-4c94-8d53-96c4e1a64b00]",
                reservationUrl: "https://localhost:5001/" + req.params.providerId + "/unapproved/add-apprentice?reservationId=faac2df3-110f-4c94-8d53-96c4e1a64b00"
                    + "&employerAccountPublicHashedId=" + req.params.accountId
                    + "&employerAccountLegalEntityPublicHashedId=" + req.params.accountLegalEntityId
                    + "&courseCode=244"
                    + "&startDate=062019"

            }
        ]
        
    };
    
    res.render('use-reservation', viewmodel);
});


app.get('/api/*',(req, res) => {
    sendFile(res, req.url, req.method);
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


sendFile = function(res, url, method) {

    const filename = ("responses" + url.replace(/\/$/, '') + '_' + method + '.json').toLowerCase();

    console.log("Processing request for " + path.join(__dirname, filename));

    if(!fs.existsSync(filename))
    {
        res.status(404).send('No such file: ' + filename);
        return;
    }

    res.header("Content-Type",'application/json');
    res.sendFile(path.join(__dirname, filename));
};