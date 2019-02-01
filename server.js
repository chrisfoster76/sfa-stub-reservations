var config = require('./config');
var express = require("express");
var http = require("http");
var https = require("https");
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.json());

app.set('view engine', 'pug');

app.get("/", (req, res) => {
  res.render('splash');
});


app.get("/inform", (req, res) => {
    res.render('inform');
});


app.get("/use-reservation", (req, res) => {
    res.render('use-reservation');
});


/*
app.get("/:senderId", (req, res) => {
      
  //console.log(config);

  var transferSenderAccountId = req.params.senderId;

  if(transferSenderAccountId === null){
    console.log("Sender id not specified in route");
    return;
  } 

  console.log("Received request for sender id: " + transferSenderAccountId);

  var port = https;

  var options = {
    hostname: config.api_hostname,
    port: config.api_port,
    path: String.Format("/api/employer/{0}/transfers", transferSenderAccountId),
    method: "GET",
    rejectUnauthorized: false,
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + config.api_bearer_token
    },
  };

  var req = port.request(options, function(result)
  {
      var buffer = "";
      result.on('data', function (chunk) { buffer += chunk; });

       result.on('end', function() {

          //console.log(buffer);
          var transferList = JSON.parse(buffer);
          
          var viewmodel = {
            transferSenderAccountId: transferSenderAccountId,
            requests: transferList
          };
          
          res.render('requestitem', viewmodel);

      });
  });

  req.on('error', function(err) {
      res.send(err.message);
      console.log(err.message);
  });

  req.end();

  });
*/

app.listen(config.port, () => {
    console.log("Server listening on port " + config.port);
  });


String.Format = function (b) {
  var a = arguments;
  return b.replace(/(\{\{\d\}\}|\{\d\})/g, function (b) {
      if (b.substring(0, 2) == "{{") return b;
      var c = parseInt(b.match(/\d/)[0]);
      return a[c + 1]
  })
};