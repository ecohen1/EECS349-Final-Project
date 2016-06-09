var express = require('express'),
app = express(),
fs = require('fs'),
port = process.env.PORT || 8080,
trainDataFile = 'train.arff',
testDataFile = 'test.arff';

var sys = require('sys');
var exec = require('child_process').exec;

var child;
var async = require('async');
var _ = require('underscore');

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

var classify = function (fileIdTraining, fileIdTest, options, cb) {
    var prediction = -1;

    child = exec('java -cp ./weka.jar ' + options.classifier +
        ' -t ' + fileIdTraining +
        ' -T ' + fileIdTest +
        ' -o -no-cv -v',
      function (error, stdout, stderr) {

        if(error){
          console.log(error);
          return;
        }
        console.log('stdout '+stdout)

        var predicted = _.clean(stdout.split('\n')[17]).split(' ').indexOf('1')
        //
        // result.predicted = splitted[2].split(':')[1];
        // result.prediction = splitted[splitted.length - 1];
        cb(predicted);
      }
    );
};

// weka = require('./NODEMODULES/node-weka/lib/weka-lib.js')(sys, exec, async, _);

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// app.use('/static', express.static(__dirname));

app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req,res){
  res.sendFile(__dirname + '/style.css');
});

app.get('/graph.jpg', function(req,res){
  res.sendFile(__dirname + '/graph.JPG');
});

app.post('/', function(req,res){

  var data = fs.readFileSync('train.arff', 'utf-8');

  var headerLines = data.split('\n').slice(0,10);
  var testText = '';
  for (var i=0;i<10;i++){
    testText += headerLines[i] + '\n'
  }
  testText += req.query.testData;
  console.log(testText)

  fs.writeFileSync('test.arff', testText, 'utf-8');

  //See Weka Documentation
  var options = {
    'classifier': 'weka.classifiers.bayes.NaiveBayes',
    'params': ''
  };

  var prediction = classify(trainDataFile, testDataFile, options, function (result) {
    console.log(result); //{ predicted: 'yes', prediction: '1' }
    res.json({'prediction':result})
  });

});

app.listen(port);
console.log('listening on ' + port);
