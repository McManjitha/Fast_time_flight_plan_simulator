const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { log, error } = require('console');
const fs = require('fs');
const ObjectsToCsv = require('objects-to-csv');
const { Transform } = require('json2csv');
const json2csv = require('json2csv').parse;
let count = 0;

const app = express();

var waypointList = [];
var planeList = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false,
}));

app.use(express.static(__dirname + '/public'));

const server = app.listen(3000, () => {
    console.log('Server started');
});


mongoose.connect('mongodb://127.0.0.1:27017/FlightSimulator',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log('Connected to MongoDB');
  
})
.catch((error) => {
  console.log('Error connecting to MongoDB', error);
});

const WayPointSchema = new mongoose.Schema({
    Node_name: {
      type: String,
      required: true,
    },
    Lat: {
      type: Number,
      default: 0,
    },
    Lng:{
      type: Number,
      default: 0
    }
  }, { collection: 'WayPoints_100' });

  const WayPoint = mongoose.model('WayPoints_100', WayPointSchema);

const PlaneShcema = new mongoose.Schema({
  Callsign : {
    type : String,
    required : true,
  },
  Origin_Info:{
    type: String
  },
  Destination_Info : {
    type: String
  },
  path:{
    type: [String]
  },
  Routing : {
    type : String
  },
  Departure_Time : {
    type : String
  },
  Aircraft_Type : {
    type : String
  },
  Altitude : {
    type : [String]
  },
  landed_time : {
    type : String
  }
});

const altitudeSchema = new mongoose.Schema({
  TakeOff_levels : {
    type : String
  },
  Cruise_Levels : {
    type : String
  },
  Decent_levels : {
    type : String
  }
});

const landedFlightsSchema = new mongoose.Schema({
  callSign : {
    type : String
  },
  departure_time : {
    type : String
  },
  landed_time : {
    type : String
  },
  lat : {
    type : Number
  },
  lng : {
    type : Number
  }
});
const collection4 = mongoose.model('landed_flights', landedFlightsSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

// Handling the request for waypoints
app.get('/wayPoints', (req, res) => {
  const collection1 = mongoose.model('WayPoints_100', WayPointSchema);
  Promise.all([collection1.find().exec()])
  .then((doc1) => {
    const data = {collection1: doc1[0]};
    // sending the waypoints data
    res.send(data);
  }).catch((err) => {
    console.error(err);
  });
});

app.get('/altitudes', (req, res) => {
  const collection3 = mongoose.model('altitudes', altitudeSchema);
  Promise.all([collection3.find().exec()])
  .then((doc3) => {
    const data = doc3[0][0];
    res.send(data);
  }).catch((err) => {
    console.error(err);
  });
});

// handling the request for the flight data
app.get('/data', (req, res) => {
  // Process the request and fetch data from the database
  //console.log("Plane fetch request received"+count);
  count++;
  const timeData = req.query.time;
  console.log("time collection "+timeData);
  const collection2 = mongoose.model(timeData, PlaneShcema);
  Promise.all([collection2.find().exec()])
  .then((doc2) =>{
    //console.log("doc2 = ");
    //console.log(doc2);
    const data = {collection2: doc2[0]};
    res.send(JSON.stringify(data));
  }).catch((err) => {
    console.error(err);
  });
});

app.post('/destination', (req, res) => {
  //let { callSign, startTime, endTime, lat, lng } = req.body;

  let landedFlight = new collection4({
    'callSign' : req.query.callSign,
    'departure_time' : req.query.startTimee,
    'landed_time' : req.query.endTime,
    'lat' : req.query.lat,
    'lng' : req.query.lng
  }); 
  // Save the landed flight document to the collection
  landedFlight
    .save()
    .then(() => {
      res.status(200).send('Landed flight'+req.query.callSign+' created successfully');
    })
    .catch((err) => {
      console.error('Error saving landed flight:', err);
      res.status(500).send('Error saving landed flight');
    });
})

// Route to handle the GET request
app.get('/download-landed-flights', async (req, res) => {
  console.log("request received");
  try {
    // Fetch the documents from the "landed_flights" collection
    const landedFlights = await collection4.find({});

    // Convert the retrieved documents to a CSV string
    const csv = json2csv(landedFlights, { fields: ['callSign', 'departure_time', 'landed_time', 'lat', 'lng'] });

    // Set the response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=landed_flights.csv');
    res.set('Content-Type', 'text/csv');

    // Send the CSV file as the response
    res.send(csv);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send('Internal Server Error');
  }
});

/*app.get('/wayPoints', (req, res) =>{
  const Collection1 = mongoose.model('WayPoints_100', WayPointSchema);

})*/

// Create WebSocket server
/*const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  Promise.all([
    Collection1.find().exec(),
    Collection2.find().exec(),
  ]).then(([docs1, docs2]) => {
    const data = { collection1: docs1, collection2: docs2 };
    ws.send(JSON.stringify(data));
  }).catch((err) => {
    console.error(err);
  });
});*/


