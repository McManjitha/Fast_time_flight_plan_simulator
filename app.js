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
const csvParser = require('csv-parser');
const multer = require('multer')
const cookieParser = require('cookie-parser');
const {User, Users, PlaneModel, AltitudeModel,WaypointCollection, LandedFlightModel } = require("./models");

let count = 0;

const app = express();
app.use(cookieParser());
var waypointList = [];
var planeList = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false,
}));

mongoose.connect('mongodb://127.0.0.1:27017/LoginSignUp',
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

app.use(express.static(__dirname + '/public'));

const collectionNames = ['5-6', '6-7']; // Define the collection names

const server = app.listen(3000, () => {
    console.log('Server started');
});

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsFolder = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder);
    }
    cb(null, uploadsFolder); // Define the destination folder where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Define the filename of the uploaded file
  }
});
// Set up multer upload
const upload = multer({ storage });

/*
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
*/

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/index.html");
  res.sendFile(filePath);
});



app.get("/signup", (req, res) => {
  const filePath = path.join(__dirname,"/signup.html");
  res.sendFile(filePath);
});

app.post("/signup", async (req, res) => {

  try {
    // Create a new database for the user using their email as the database name
    const data = {
      name: req.body.name,
      password: req.body.password,
    };
    const existingUser = await Users.findOne({ name: req.body.name });
    if (existingUser) {
      const filePath = path.join(__dirname,"/public/nameExists.html");
      res.sendFile(filePath);
    } else {
      await Users.insertMany([data]);
      const userDbName = req.body.name;
      const connectionUser = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${userDbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      connectionUser.model('User', User.schema);
      const filePath = path.join(__dirname, "/public/login.html");
      res.sendFile(filePath);
    }
    

    // Use the new database connection for future user-specific operations
    //connection.model('User', User.schema);

    //res.status(200).json({ message: 'User registered successfully' });
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/home", (req, res) =>{
  const username = req.query.username;
  const filePath = path.join(__dirname, "/public/home.html");
  res.sendFile(filePath);
});


app.post("/login", async (req, res) => {
  console.log("login");
  const connection = mongoose.createConnection(`mongodb://127.0.0.1:27017/LoginSignUp`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  try {
    console.log('name = '+req.query.username);
    const check = await Users.findOne({ name: req.query.username });
    console.log(check);
    if (check && check.password === req.query.password) {

      res.json({ success: true, message: 'Login successful' });
      
    } else {
      const filePath = path.join(__dirname,"/public/loginwrong.html");
      res.sendFile(filePath);
    }
  } catch (error) {
    const filePath = path.join(__dirname,"/public/loginwrong.html");
    res.sendFile(filePath);
  }
});

// Handle POST request
app.post('/upload', upload.array('file', 4), async (req, res) => {
  const files = req.files;
  const username = req.query.username;
  
  //console.log('name = '+req.query.name);
  const connectionUser = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${req.query.username}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });

  // fs.createReadStream(files[1].path)
  // .pipe(csvParser())
  // .on('data', (data) => {
  //   // Create a new document for the corresponding collection
  //   const collection = connectionUser.model('WaypointCollection' , WaypointCollection.schema);
  //   const document = new collection(data);
  //   document.save();
  // })
  // .on('end', () => {
  //   console.log(`Data from ${files[1].filename} saved to WayPoints_100`);
  //   // Remove the temporary CSV file
  //   fs.unlinkSync(files[1].path);
  // });

  fs.createReadStream(files[1].path)
  .pipe(csvParser({ separator: ';' })) 
  .on('data', (data) => {
    // Create a new document for the corresponding collection
    console.log(data);
    const collection = connectionUser.model('AltitudeCollection' , AltitudeModel.schema);
    const document = new collection(data);
    document.save();
  })
  .on('end', () => {
    console.log(`Data from ${files[1].filename} saved to AltitudeCollection`);
    // Remove the temporary CSV file
    fs.unlinkSync(files[1].path);
  });

  const collectionNames = ['5-6', '6-7']; // Define the collection names
  const collections = {};
  collectionNames.forEach((name) => {
    //const collectionSchema = new mongoose.Schema(PlaneModel.schema, { collection: name });
    collections[name] = connectionUser.model(name, PlaneModel.schema);
  });

  
  fs.createReadStream(files[0].path)
  .pipe(csvParser({ separator: ';' }))
  .on('data', async (row) => {
    //console.log(row);
    const departureTime = row.Departure_Time; // Extract Departure_Time value
    const hour = parseInt(departureTime.split('.')[0]); // Extract hour from Departure_Time

    const collectionName = `${hour}-${hour + 1}`; // Determine the appropriate collection name
    const CollectionModel = collections[collectionName]; // Get the corresponding collection model

    // Create a new document and save it to the respective collection
    const document = new CollectionModel({
      Callsign : row.Callsign,
      Origin_Info : row.Origin_Info,
      Destination_Info : row.Destination_Info,
      path : row.path,
      Routing : row.Routing,
      Departure_Time : row.Departure_Time,
      Aircraft_Type : row.Aircraft_Type,
      Altitude : row.Altitude,
      landed_time : row.landed_time
    });
    //console.log(document);
    await document.save()
      .then(() => {
        //console.log(`Document saved to ${collectionName}`);
      })
      .catch((error) => {
        console.error(`Error saving document to ${collectionName}:`, error);
      });
  })
  .on('end', () => {
    console.log('Data processing complete');
  });
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, message: `${username}` });
  //res.redirect('/googlemap');
});

app.get('/themap', (req, res) => {
  const username = req.query.username;
  res.sendFile(path.join(__dirname,"/public/themap.html"));
});


// Handling the request for waypoints
app.get('/wayPoints', async (req, res) => {
  const connectionUser = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${req.query.username}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  const collection1 = connectionUser.model('WayPoints_100', WaypointCollection.schema);
  const username = req.query
  Promise.all([collection1.find().exec()])
  .then((doc1) => {
    const data = {collection1: doc1[0]};
    // sending the waypoints data
    res.send(data);
  }).catch((err) => {
    console.error(err);
  });
});

app.get('/altitudes', async (req, res) => {
  const connectionUser = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${req.query.username}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  const collectionA = connectionUser.model('AltitudeCollection', AltitudeModel.schema);
  Promise.all([collectionA.find().exec()])
  .then((doc3) => {
    const data = doc3[0][0];
    console.log('altitudes');
    console.log(doc3);
    res.send(data);
  }).catch((err) => {
    console.error(err);
  });
});

// handling the request for the flight data
app.get('/data', async (req, res) => {
  // Process the request and fetch data from the database
  //console.log("Plane fetch request received"+count);
  console.log("Inside data");
  console.log("username = "+req.query.username);
  const connectionUser = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${req.query.username}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  const collectionP = connectionUser.model(req.query.time, PlaneModel.schema);
  count++;
  //const timeData = req.query.time;
  console.log("time collection "+req.query.time);
  //const collection2 = mongoose.model(timeData, PlaneShcema);
  Promise.all([collectionP.find().exec()])
  .then((doc2) =>{
    const data = {collection2: doc2[0]};
    res.send(JSON.stringify(data));
  }).catch((err) => {
    console.error(err);
  });
});

app.post('/destination', (req, res) => {
  //let { callSign, startTime, endTime, lat, lng } = req.body;
  const connectionUser =  mongoose.createConnection(`mongodb://127.0.0.1:27017/${req.query.username}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  const collectionD = connectionUser.model('landed_flights', LandedFlightModel.schema);
  let landedFlight = new collectionD({
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
    const landedFlights = await LandedFlights.find({});

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



