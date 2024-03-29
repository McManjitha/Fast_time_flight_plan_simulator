const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const WebSocket = require('ws');


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
}).catch((error) => {
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
  }, { collection: 'WayPoints' });

  const WayPoint = mongoose.model('WayPoint', WayPointSchema);

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
  1:{
    type: [String]
  },
  Routing : {
    type : String
  }
}, {collection : 'Plane_data'});

const Planes = new mongoose.model('Plane_data', PlaneShcema);

 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})


// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  Planes.find()
  .then((planes) => {

    planes.forEach((doc) => {
      planeList.push(doc);
    })
    ws.send(JSON.stringify(planeList));

  }).catch((error) => {
    console.log('Error retrieving documents from collection Plane_data', error);
  });

  console.log(planeList);

  /*WayPoint.find()
  .then((waypoints) => {

    waypoints.forEach((doc) => {
      waypointList.push(doc);
    })
    //console.log(waypointList);
    //ws.send(JSON.stringify(waypointList));
  }).catch((error) => {
    console.log('Error retrieving documents from collection Waypoints', error);
  });*/
  
});


