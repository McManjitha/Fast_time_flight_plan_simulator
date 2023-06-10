const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { log, error } = require('console');


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
  }
});
//{collection : '13-14'}

//const Planes = new mongoose.model('13-14', PlaneShcema);

//const Collection1 = mongoose.model('WayPoints_100', WayPointSchema);
//const Collection2 = mongoose.model('13-14', PlaneShcema);


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

// handling the request for the flight data
app.get('/data', (req, res) => {
  // Process the request and fetch data from the database
  const timeData = req.query.time;
  const collection2 = mongoose.model(timeData, PlaneShcema);
  Promise.all([collection2.find().exec()])
  .then((doc2) =>{
    const data = {collection2: doc2[0]};
    res.send(JSON.stringify(data));
  }).catch((err) => {
    console.error(err);
  });
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


