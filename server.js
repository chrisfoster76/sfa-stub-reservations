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


//Splash page
app.get("/", (req, res) => {
    res.render('splash');
});


//Reservation selection page, used in "Add Another Apprentice" journey
//If transfer sender id is included, the endpoint assumes that the sender is a levy payer so the user gets an "auto" reservation
app.get("/:providerId/reservations/:employerId/select", (req, res) => {
    
    let providerId = req.params.providerId;
    let employerId = req.params.employerId;
    
    let cohortRef = req.get("cohortReference");
    let transferSenderId = req.get("transferSenderId");
   
    console.log(String.Format("Reservation selection for Provider: {0}, Employer: {1}", providerId, employerId));
    if(transferSenderId !== undefined)
    {
        console.log(String.Format("Transfer Sender {0} indicated", transferSenderId));
    }

    //simulate levy-payer auto create and redirect
    if(employerId === "XEGE5X" || employerId === "XJGZ72" || transferSenderId !== undefined)
    {
        console.log("Simulating greenlight for levy payer - auto redirecting to add apprentice");
        
        let redirectUrl = String.Format("{0}/{1}/unapproved/{2}apprentices/add?reservationId={3}&employerAccountLegalEntityPublicHashedId={4}{5}",
            config.providerCommitmentsBaseUrl,
            providerId,
            cohortRef === undefined ? "" : cohortRef + "/",
            uuidv1(),
            employerId,
            transferSenderId === undefined ? "" : "&transferSenderId=" + transferSenderId
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
                reservationUrl: String.Format("{0}/{1}/unapproved/{2}apprentices/add?reservationId={3}&employerAccountLegalEntityPublicHashedId={4}&courseCode={5}&startMonthYear={6}",
                    config.providerCommitmentsBaseUrl,
                    providerId,
                    cohortRef === undefined ? "" : cohortRef + "/",
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
    

//Reservations endpoint - simulates start of Reservations journey
app.get("/:providerId/reservations", (req, res) => {

    let providerId = req.params.providerId;

    console.log("Reservation selection for Provider " + providerId);

    let viewmodel = {
        providerId : providerId,
        reservations : [
            {
                reservationTitle: "MegaCorp Pharmaceuticals (levy)",
                reservationSubtitle: "No pre-selection of values; validation always succeeds",
                accountLegalEntityId: 'XEGE5X',
                reservationUrl: String.Format("{0}/{1}/unapproved/add-apprentice?reservationId={2}&employerAccountLegalEntityPublicHashedId={3}",
                    config.providerCommitmentsBaseUrl,
                    providerId,
                    uuidv1(),
                    'XEGE5X')
            },
            {
                reservationTitle: "Rapid Logistics (non levy)",
                reservationSubtitle: "Reservation with for Geospatial Survey Technician (244) June 2019",
                accountLegalEntityId: 'X9JE72',
                reservationUrl: String.Format("{0}/{1}/unapproved/add-apprentice?reservationId={2}&employerAccountLegalEntityPublicHashedId={3}&courseCode={4}&startMonthYear={5}",
                    config.providerCommitmentsBaseUrl,
                    providerId,
                    uuidv1(),
                    'X9JE72',
                    "244",
                    "062019")
            }
        ]
    };

    res.render('use-reservation', viewmodel);
});



//Reservations API validation endpoint
app.get('/api/accounts/:accountId/reservations/:reservationId*',(req, res) => {
    
    let accountId = req.params.accountId;
    let course = req.get("courseCode");
    let startDate = req.get("startDate");
    
    //Levy payer gets a green light
    if(accountId === "8194")
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


//Reservations API validation endpoint - OLD Version. Should be removed!
app.put('/api/accounts/:accountId/reservations/:reservationId*',(req, res) => {

    let course = req.body.coursecode || req.body.courseCode;
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


/* not sure why this is here */
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

sendFile = function(res, filename) {
  const fullFileName = "responses/" + filename;
    res.header("Content-Type",'application/json');
    res.sendFile(path.join(__dirname, fullFileName));

};


express.request.get = function(parameterName) {

    for (var key in this.query)
    {
        if(key.toLowerCase() === parameterName.toLowerCase())
        {
            return this.query[key]; 
        }
    }
    
};