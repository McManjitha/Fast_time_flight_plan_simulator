//const waypoints = require("./app");


const socket = new WebSocket('ws://localhost:3000');


//------------------ variables --------------------------------------
var gateWays = []; // contain waypoints
var flightInfo = []; // contain information about flights
var firstWaypoint, secondWaypoint, firstLabel, secondLabel;
var flightMarkers = []; // contain all the flight markers


//---------------------------------------------------------------------

socket.onmessage = (event) => {

  const data = JSON.parse(event.data);

  // Extract the array of objects from collection1
  const collection1 = data.collection1;
  const collection2 = data.collection2;

  // Map the objects in the array to a new array of objects with the desired attributes
  gateWays = collection1.map((obj) => {
    return {
      lat: obj.Lat,
      lng: obj.Lng,
      label: obj.Node_name

    };
  });

   // Map the objects in the array to a new array of objects with the desired attributes
   flightInfo = collection2.map((obj) => {
    return {
      callsign: obj.Callsign,
      route: rearrangeArray(obj.path[0]) ,                //array of waypoints
      origin: obj.Origin_Info,
      dest: obj.Destination_Info,
      routing: obj.Routing,
      initLat:null,
      initLng:null,
      nextLat:null,
      nextLng:null,
      lat:null,
      lng : null,
      m:null,
      c:null,
      markerName:null,
      tanvalue:null,
      count:0,
      increment:0.3,
      going : true
    };
  });
1
  console.log(gateWays);
  console.log(flightInfo);

  //gateWays = data[0];
  //const data = ways[0];

  /*for (let i = 0; i < data.length; i++) {
    // create a new object with the required attributes
    let newGateway = {
      label: data.collection1[i].Node_name,
      lat: data.collection1[i].Lat,
      lng: data.collection1[i].Lng
      /*label: data[i].Node_name,
      lat: data[i].Lat,
      lng: data[i].Lng
    };
    // push the new object to the 'gateWays' array
    gateWays.push(newGateway);
  }*/
};
//console.log(gateWays);

let map;
var intervalId1, intervalId2;
var waypointList;

function initMap() {
  // Initialize the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 0,
    maxZoom: 8,
    minZoom: 2
  });


  //Gateway information
  /*var gateWays = [
    {lat : -5.94, lng : 142.51, label : "A"},
    {lat : -6.94, lng : 149.51, label : "D"},
    //{lat : 2.58777, lng : 129.1825, label : "B"},
    //{lat : 2.58777, lng : 165.1825, label : "B"},
    {lat : -10.58777, lng : 135.1825, label : "B"},
    {lat : -15.58777, lng : 143.1825, label : "C"}
  ];*/

  // loop through each JSON object in 'data'


  //var count = 1;

  // initial position of the air plane
  //var initLat = gateWays[0].lat;
  //console.log('initLat = '+initLat);
  //var initLng = gateWays[0].lng;
  //console.log('initLng = '+initLng);



  for(var i = 0; i < flightInfo.length; i++){
    firstLabel = flightInfo[i].route[0];
    secondLabel = flightInfo[i].route[1];
    firstWaypoint = gateWays.find((obj) => obj.label == firstLabel);
    secondWaypoint = gateWays.find((obj) => obj.label == secondLabel);

    flightInfo[i].initLat = firstWaypoint.lat;
    flightInfo[i].initLng = firstWaypoint.lng;
    flightInfo[i].nextLat = secondWaypoint.lat;
    flightInfo[i].nextLng = secondWaypoint.lng;
    //flightInfo[i].increment = 0.3; // temporily - this should be initialized using the speed.

    flightInfo[i].m = calcGradient(flightInfo[i].initLng, flightInfo[i].initLat, flightInfo[i].nextLng, flightInfo[i].nextLat);
    flightInfo[i].c = calcIntercept(flightInfo[i].nextLng, flightInfo[i].nextLat, flightInfo[i].m);

    flightInfo[i].tanvalue = clacPlaneAngle(flightInfo[i].m);
    flightInfo[i].markerName = initalString_2(flightInfo[i].initLat, flightInfo[i].initLng, flightInfo[i].nextLat, flightInfo[i].nextLng);

    if(flightInfo[i].initLng > flightInfo[i].nextLng){
      flightInfo[i].increment = -1*Math.abs(flightInfo[i].increment);
    }else{
      flightInfo[i].increment = 1*Math.abs(flightInfo[i].increment);
    }

    // create the plane marker
    flightMarkers[i] = new google.maps.Marker({
      map: map,
      position: { lat: flightInfo[i].initLat, lng: flightInfo[i].initLng },
      icon : {
        url: flightInfo[i].markerName,
        scaledSize :  new google.maps.Size(30, 30)
      }
    });
  }


  /*var c, lat, lng;
  var m;//-30.1845
  var increment  = 0.3;*/
  
  // create gate way markers
  for(var gws = 0; gws < gateWays.length; gws++){
    createMarker(gateWays[gws]);
  }
/*
  // calculate the gradient and intercept from the initail position to the first gateway
  m = calcGradient(initLng, initLat, gateWays[count].lng, gateWays[count].lat)
  c = calcIntercept(gateWays[count].lng, gateWays[count].lat, m);

  var tanvalue = clacPlaneAngle(m);
  var markerName = initalString(initLat, initLng, gateWays[1]);
  console.log('markerName = '+markerName);

  if(initLng > gateWays[count].lng){
    increment = -1*Math.abs(increment);
  }else{
    increment = Math.abs(increment);
  }
  
  // create the plane marker
  var marker = new google.maps.Marker({
    map: map,
    position: { lat: initLat, lng: initLng },
    icon : {
      url: './images/marker1.png',
      scaledSize :  new google.maps.Size(30, 30)
    }
  });


  //console.log(markerName);
  var icon = {
    url: markerName,
    scaledSize: new google.maps.Size(30, 30)
  };

  marker.setIcon(icon);*/

  //-------------------------------------------------------------------------------------------
    // this repeats at 1000ms intervals and calculate the new location of the plane
    intervalId1 = setInterval(function() {
      // Get the new coordinates for the marker
      for(var j = 0; j < flightInfo.length; j++){
        if(flightInfo[j].going){
          flightInfo[j].lng = flightMarkers[j].getPosition().lng() + flightInfo[j].increment;
          flightInfo[j].lat = flightInfo[j].lng*flightInfo[j].m + flightInfo[j].c;
          flightMarkers[j].setPosition({lat:flightInfo[j].lat, lng:flightInfo[j].lng});
        
        }
       }


      //lng = marker.getPosition().lng() + increment;
      //lat = lng*m + c;
    
    // Update the marker position
    //marker.setPosition({ lat: lat, lng: lng });
    }, 2000);
  
  

//----------------------------------------------------------------------------------------------------
    // this function is used to obtain the new path information after reaching a gateway

  intervalId2 = setInterval(function(){

    if(initLat > gateWays[count].lat){
      if(marker.getPosition().lat() < gateWays[count].lat && count < gateWays.length){
        // Here, the plane reaches a destination gateway. Then it assign coordinates of the 
        // previous journey end gateway to initial gateway coordiates of the next journey
        initLat = gateWays[count].lat;
        initLng = gateWays[count].lng;
        //console.log('up');
        // plane stopping
        
        count++;
        if(count >= gateWays.length){
          marker.setPosition({ lat: gateWays[ gateWays.length-1].lat, lng: gateWays[ gateWays.length-1].lng });
          clearInterval(intervalId1);
          clearInterval(intervalId2);
        }
  
        // calculate the new gradient and intercept of the next journey
        m = calcGradient(initLng, initLat, gateWays[count].lng, gateWays[count].lat);
        c = calcIntercept(gateWays[count].lng, gateWays[count].lat, m);
        //console.log(m);
        tanvalue = clacPlaneAngle(m);
        //console.log(tanvalue);
        if(initLat > gateWays[count].lat){
          tanvalue = tanvalue + 180;
        }

        markerName = makeImageString(tanvalue-40);
  
        icon = {
          url: markerName,
          scaledSize: new google.maps.Size(30, 30)
        };
        marker.setIcon(icon);
        // selecting the right increment whether negative or positive
        if(initLng > gateWays[count].lng){
          increment = -1*Math.abs(increment);
        }else{
          increment = Math.abs(increment);
        }
      }
    }else if(initLat < gateWays[count].lat){
      if(marker.getPosition().lat() > gateWays[count].lat && count < gateWays.length){
        // Here, the plane reaches a destination gateway. Then it assign coordinates of the 
        // previous journey end gateway to initial gateway coordiates of the next journey
        initLat = gateWays[count].lat;
        initLng = gateWays[count].lng;

        // plane stopping
        count++;
        if(count >= gateWays.length){
          marker.setPosition({ lat: gateWays[ gateWays.length-1].lat, lng: gateWays[ gateWays.length-1].lng });
          clearInterval(intervalId1);
          clearInterval(intervalId2);
        }
  
        // calculate the new gradient and intercept of the next journey
        m = calcGradient(initLng, initLat, gateWays[count].lng, gateWays[count].lat,)
        c = calcIntercept(gateWays[count].lng, gateWays[count].lat, m);
  
        tanvalue = clacPlaneAngle(m);
  
        if(initLat > gateWays[count].lat){
          tanvalue = tanvalue + 180;
        }
        markerName = makeImageString(tanvalue-40);
  
        icon = {
          url: markerName,
          scaledSize: new google.maps.Size(30, 30)
        };
        marker.setIcon(icon);
        // selecting the right increment whether negative or positive
        if(initLng > gateWays[count].lng){
          increment = -1*Math.abs(increment);
        }else{
          increment = Math.abs(increment);
        }
      }
    }
  }, 1000) 

}

const testFunction = () =>{

  clearInterval(intervalId1);
  clearInterval(intervalId2);
}

window.initMap = initMap;