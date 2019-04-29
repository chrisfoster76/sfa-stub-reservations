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

    let providerId = 10005077;
    
    let viewmodel = {
        providerId : providerId,
        reservations : [
            {
                reservationTitle: "MegaCorp (levy)",
                reservationSubtitle: "No pre-selection of values; validation always succeeds",
                accountLegalEntityId: 'YZWX27',
                reservationDescription: "[ec6b806b-0491-44af-bc4f-68366779b931]",
                reservationUrl: "https://localhost:5001/" + providerId + "/unapproved/add-apprentice?reservationId=ec6b806b-0491-44af-bc4f-68366779b931"
                    + "&employerAccountLegalEntityPublicHashedId=" + 'YZWX27'
            },
            {
                reservationTitle: "Rapid Logistics (non levy)",
                reservationSubtitle: "Reservation with for Geospatial Survey Technician (244) June 2019",
                accountLegalEntityId: '7EKPG7',
                reservationDescription: "[faac2df3-110f-4c94-8d53-96c4e1a64b00]",
                reservationUrl: "https://localhost:5001/" + providerId + "/unapproved/add-apprentice?reservationId=faac2df3-110f-4c94-8d53-96c4e1a64b00"
                    + "&employerAccountLegalEntityPublicHashedId=" + '7EKPG7'
                    + "&courseCode=244"
                    + "&startMonthYear=062019"
            }
        ]
    };

    res.render('use-reservation', viewmodel);
});



app.get('/api/*',(req, res) => {
    sendFile(res, req.url, req.method);
});


app.put('/api/accounts/:accountId/reservations/:reservationId*',(req, res) => {
    
    let course = req.body.CourseCode || req.body.courseCode;
    let startDate = req.body.StartDate || req.body.startDate;
    
    //Levy payer gets a green light
    if(req.params.accountId === "8194")
    {
        console.log("Reservation validation request from levy payer - will green light");
        sendFile(res, '/api/okResponse.json');
    }
    
    //Non-levy payer
   /* if(req.params.accountId === "30060")
    {
        console.log("Reservation validation request from non-levy payer");*/

        if(course === "411")
        {
            sendFile(res, '/api/courseErrorResponse.json');
            return;
        }
        
        if(startDate === "2019-01-01T00:00:00")
        {
            sendFile(res, '/api/startDateErrorResponse.json');
            return;
        }
   /* }
    
    //Specific reservations for tester, based on the reservation id
    if(req.params.reservationId === "51923bfc-c363-4903-8311-032b14ae82bd")
    {
        console.log("Reservation validation request for specific reservation id");

        if(course === "411")
        {
            sendFile(res, '/api/courseErrorResponse.json');
            return;
        }

        if(startDate === "2019-01-01T00:00:00")
        {
            sendFile(res, '/api/startDateErrorResponse.json');
            return;
        }
    }*/
    
    //default to ok for happy testing
    sendFile(res, '/api/okResponse.json');
});


// return _client.PutAsJson<ValidationReservationMessage, ValidationResult>($"api/accounts/{request.AccountId}/reservations/{request.ReservationId}", request, cancellationToken);


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

sendFile = function(res, filename) {
  const fullFileName = "responses/" + filename;
    res.header("Content-Type",'application/json');
    res.sendFile(path.join(__dirname, fullFileName));

};