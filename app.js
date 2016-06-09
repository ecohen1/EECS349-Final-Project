var express = require('express'),
app = express(),
fs = require('fs'),
port = 8080,
weka = require('./node_modules/node-weka/lib/weka-lib.js'),
trainDataFile = 'train.arff',
testDataFile = 'test.arff';

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

app.get('/', function(req,res){
  res.json({'testing':true});
  // res.sendFile('./index.html');
});

app.post('/', function(req,res){
  // var jsonString = req.query.json;
  // var testData = JSON.parse(jsonString);

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

  var prediction = weka.classify(trainDataFile, testDataFile, options, function (result) {
    console.log(result); //{ predicted: 'yes', prediction: '1' }
    res.json({'prediction':result})
  });

});

app.listen(port);
console.log('listening on ' + port);
