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


//Provider Reservations endpoint - simulates start of Provider Reservations journey
app.get("/:providerId/reservations", (req, res) => {

    let providerId = req.params.providerId;

    console.log("Reservation selection for Provider " + providerId);

    let viewmodel = {
        providerId : providerId,
        reservations : [
            {
                reservationTitle: "MegaCorp Pharmaceuticals (levy)",
                reservationSubtitle: "No pre-selection of values; validation always succeeds",
                accountLegalEntityId: 'XJGZ72',
                reservationUrl: String.Format("{0}/{1}/unapproved/add-apprentice?reservationId={2}&employerAccountLegalEntityPublicHashedId={3}",
                    config.providerCommitmentsBaseUrl,
                    providerId,
                    uuidv1(),
                    'XJGZ72')
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


//Provider Reservation selection page, used in "Add Another Apprentice" journey
//If transfer sender id is included, the endpoint assumes that the sender is a levy payer so the user gets an "auto" reservation
app.get("/:providerId/reservations/:employerId/select", (req, res) => {

    let providerId = req.params.providerId;
    let employerId = req.params.employerId;

    let cohortRef = req.getFromQueryString("cohortReference");
    let transferSenderId = req.getFromQueryString("transferSenderId");

    console.log(String.Format("Reservation selection for Provider: {0}, Employer: {1}", providerId, employerId));
    if(transferSenderId !== undefined)
    {
        console.log(String.Format("Transfer Sender {0} indicated", transferSenderId));
    }

    //simulate levy-payer auto create and redirect
    if(config.hashedlevyaccountlegalentities.includes(employerId) || (transferSenderId !== undefined))
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


/* new endpoints to go here */
app.get('/api/accounts/:accountId/status',(req, res) => {

    let accountId = req.params.accountId;
    
    if(config.levyaccounts.includes(accountId))
    {
        sendFile(res, '/api/status-auto.json');
        return;
    }

    sendFile(res, '/api/status-manual.json');

});

app.post('/api/accounts/:accountId/bulk-create', (req, res) => {

    let accountId = req.params.accountId;
    let requestedCount = req.getFromBody("count");
    
    if(config.levyaccounts.includes(accountId))
    {
        let result = {
            reservations: []
        };
        
        for(let i=0; i<requestedCount;i++)
        {
            result.reservations[i] = uuidv1()
        }
        
        res.status(200).send(result);
        return;
    }

    res.status(500).send('Non-Levy accounts cannot bulk create reservations');
    
});


//Reservations API validation endpoint
app.get('/api/accounts/:accountId/reservations/:reservationId*',(req, res) => {
    
    let accountId = req.params.accountId;
    let course = req.getFromQueryString("courseCode");
    let startDate = new Date(req.getFromQueryString("startDate"));

    console.log(String.Format("Validation request for Account {0}, Course: {1}, StartDate: {2}", accountId, course, startDate));

    //Levy payer gets a green light
    if(config.levyaccounts.includes(accountId))
    {
        console.log("Reservation validation request from levy payer - simulates auto-create-reservation");
        sendFile(res, '/api/okResponse.json');
        return;
    }
    
    //Non-levy payer - baked in failures for Funeral Director Course and Jan 19 Start Dates
    if(course === "411")
    {
        console.log("Course 411 - simulates course error");
        sendFile(res, '/api/courseErrorResponse.json');
        return;
    }
    
    if(dates.compare(startDate, new Date("2019-01-01")) === 0)
    {
        console.log("01 Jan 2019 - simulates start date error");
        sendFile(res, '/api/startDateErrorResponse.json');
        return;
    }
    
    //default to ok for happy testing
    sendFile(res, '/api/okResponse.json');
});



/* employer routes */


//Provider Reservations endpoint - simulates start of Employer Reservations journey
app.get("/accounts/:accountId/reservations", (req, res) => {

    let accountId = req.params.accountId;
    
    console.log("Reservation selection for Employer Account: " + accountId);
    
    let reservations = config.employerReservations.filter(function(item){ return item.accountId === accountId });
    
    let viewmodel = {
        reservations: []
    };
    
    reservations.forEach(reservation => {
    
        viewmodel.reservations.push({
           reservationTitle: reservation.title,
           reservationSubtitle: reservation.subtitle,
           accountLegalEntityId: reservation.accountLegalEntityId,
           reservationUrl:  String.Format("{0}/{1}/unapproved/add?reservationId={2}&employerAccountLegalEntityPublicHashedId={3}&courseCode={4}&startMonthYear={5}",
               config.employerCommitmentsBaseUrl,
               accountId,
               uuidv1(),
               reservation.accountLegalEntityId,
               reservation.courseCode,
               reservation.startMonthYear
               )
        });
        
    });
    
    res.render('employer-use-reservation', viewmodel);
});


//Provider Reservation selection page, used in "Add Another Apprentice" journey
//If transfer sender id is included, the endpoint assumes that the sender is a levy payer so the user gets an "auto" reservation

//Provider Select Reservation endpoint
app.get("/accounts/:accountId/reservations", (req, res) => {


});


/* serve up api requests */
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


express.request.getFromQueryString = function(parameterName) {
    for (var key in this.query)
    {
        if(key.toLowerCase() === parameterName.toLowerCase())
        {
            return this.query[key]; 
        }
    }
};

express.request.getFromBody = function(propertyName) {
    for (var key in this.body)
    {
        if(key.toLowerCase() === propertyName.toLowerCase())
        {
            return this.body[key];
        }
    }
};

// Source: http://stackoverflow.com/questions/497790
let dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0],d[1],d[2]) :
                    d.constructor === Number ? new Date(d) :
                        d.constructor === String ? new Date(d) :
                            typeof d === "object" ? new Date(d.year,d.month,d.date) :
                                NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
                (a>b)-(a<b) :
                NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
                start <= d && d <= end :
                NaN
        );
    }
}


