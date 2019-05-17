const config = require('./config');
const express = require("express");
const http = require("http");
const https = require("https");
const bodyParser = require('body-parser');
const fs = require('fs');
const pug = require('pug');
const path = require('path');
const uuidv1 = require('uuid/v1');

const port = process.env.PORT || config.port;

const app = express();
app.use(express.static('public'));

app.use(bodyParser.json());

app.set('view engine', 'pug');

app.get("/", (req, res) => {
    res.render('splash');
});


app.get("/:providerId/:employerId/select", (req, res) => {
    
    let providerId = req.params.providerId;
    let employerId = req.params.employerId;
    let cohortRef = req.query.cohortReference || req.query.CohortReference;
    
    console.log(String.Format("Reservation selection for Provider: {0}, Employer: {1}", providerId, employerId));

    //simulate levy-payer auto create and redirect
    if(employerId == "YZWX27" || employerId == "7N3MEY")
    {
        console.log("Simulating greenlight for levy payer - auto redirecting to add apprentice");
        
        var redirectUrl = String.Format("{0}/{1}/unapproved/{2}/add-apprentice?reservationId={3}&employerAccountLegalEntityPublicHashedId={4}",
            config.providerCommitmentsBaseUrl,
            providerId,
            cohortRef,
            uuidv1(),
            employerId
        );
        
        res.redirect(redirectUrl);
        return;
    }
    
    //non-levy payer must select a reservation
    let viewmodel = {
        providerId : providerId,
        cohortRef: cohortRef,
        reservations : [
            {
                reservationTitle: "Geospatial Survey Technician (244) June 2019",
                reservationSubtitle: "",
                accountLegalEntityId: employerId,
                reservationDescription: "",
                reservationUrl: String.Format("{0}/{1}/unapproved/{2}/add-apprentice?reservationId={3}&employerAccountLegalEntityPublicHashedId={4}&courseCode={5}&startMonthYear={6}",
                    config.providerCommitmentsBaseUrl,
                    providerId,
                    cohortRef,
                    uuidv1(),
                    employerId,
                    "244",
                    "062019"
                )
            }
        ]
    };
    
    res.render('select-reservation', viewmodel);
});
    

app.get("/:providerId/reservations", (req, res) => {

    let providerId = req.params.providerId;

    console.log("Reservation selection for Provider " + providerId);

    let viewmodel = {
        providerId : providerId,
        reservations : [
            {
                reservationTitle: "MegaCorp Pharmaceuticals (levy)",
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
    
    //Non-levy payer - baked in failures for Funeral Director Course and Jan 19 Start Dates
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
    
    //default to ok for happy testing
    sendFile(res, '/api/okResponse.json');
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

sendFile = function(res, filename) {
  const fullFileName = "responses/" + filename;
    res.header("Content-Type",'application/json');
    res.sendFile(path.join(__dirname, fullFileName));

};