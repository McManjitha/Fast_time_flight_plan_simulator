//const waypoints = require("./app");


const socket = new WebSocket('ws://localhost:3000');


//------------------ variables --------------------------------------
var gateWays = []; // contain waypoints
var allFlights = [];
var flightInfo = []; // contain information about flights
var firstWaypoint, secondWaypoint, firstLabel, secondLabel;
var flightMarkers = []; // contain all the flight markers
var currentFLight; // used in second setInterval
const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }; // format of the time obtained by the local computer
var radius = 5000; // minimum separation between two planes
var compArr = []; // array that temporily stores the flight data for collision detection
var table; //collision-table
var cell1, cell2, cell3; // cells of the collision table
var allFlights_1 = [];
var collidedPoints = [];

//---------------------------------------------------------------------

socket.onmessage = (event) => {

  const data = JSON.parse(event.data);

  // Extract the array of objects from collection1
  const collection1 = data.collection1;
  const collection2 = data.collection2;

  //console.log("collection 2 = ");
  //console.log(collection2);

  // Map the objects in the array to a new array of objects with the desired attributes
  gateWays = collection1.map((obj) => {
    return {
      lat: obj.Lat,
      lng: obj.Lng,
      label: obj.Node_name,
      waypointMarker: null // stores the waypoint marker

    };
  }); 


   // Map the objects in the array to a new array of objects with the desired attributes
   allFlights = collection2.map((obj) => {
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
        count:1,
        increment:0.05,
        going : true,
        departure_time : obj.Departure_Time,
        marker : null
      };
  });
  
};

let map;
var intervalId1, intervalId2, intervalId3;
var waypointList;

  
function initMap() {
  // Initialize the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 1.99702, lng: 106.66321 },
    zoom: 0,
    maxZoom: 15,
    minZoom: 5
  });
  
  setTimeout(function() {
//---------------------------Iniatial assigning-------------------------------
    for(var i = 0; i < allFlights.length; i++){
      if(allFlights[i].going){

        // Finding the waypoints of the first journey
        firstLabel = allFlights[i].route[0];
        secondLabel = allFlights[i].route[1];

        // finding the origin of the airplane
        firstWaypoint = gateWays.find((obj) => obj.label == firstLabel);
        secondWaypoint = gateWays.find((obj) => obj.label == secondLabel);

        // assigning initial and next coordinates 
        allFlights[i].initLat = firstWaypoint.lat;
        allFlights[i].initLng = firstWaypoint.lng;
        allFlights[i].nextLat = secondWaypoint.lat;
        allFlights[i].nextLng = secondWaypoint.lng;
        //flightInfo[i].increment = 0.3; // temporily - this should be initialized using the speed.

        //calculating initial gradient and intercept
        allFlights[i].m = calcGradient(allFlights[i].initLng, allFlights[i].initLat, allFlights[i].nextLng, allFlights[i].nextLat);
        allFlights[i].c = calcIntercept(allFlights[i].nextLng, allFlights[i].nextLat, allFlights[i].m);

        allFlights[i].tanvalue = clacPlaneAngle(allFlights[i].m);
        allFlights[i].markerName = initalString_2(allFlights[i].initLat, allFlights[i].initLng, allFlights[i].nextLat, allFlights[i].nextLng);

        // calculating the initail increment
        if(allFlights[i].initLng > allFlights[i].nextLng){
          allFlights[i].increment = -1*Math.abs(allFlights[i].increment);
        }else{
          allFlights[i].increment = 1*Math.abs(allFlights[i].increment);
        }

          // creates the marker of the planes
        const newMarker = new google.maps.Marker({
          map: map,
          position: { lat: allFlights[i].initLat, lng: allFlights[i].initLng },
          icon : {
            url: allFlights[i].markerName,
            scaledSize :  new google.maps.Size(20, 20)
          },
          /*label:{                           
            text : allFlights[i].callsign,      
            labelVisible : false                
          },*/
          setTitle : allFlights[i].callsign
        });
        allFlights[i].marker = newMarker;

        allFlights[i].marker.addListener("click", function(){
          console.log(this.setTitle);
        })
      }
      
    }
  }, 3000);
  //console.log("allFlights = ");
  //console.log(allFlights);

  //console.log("allflights length = "+allFlights.length);
  //--------------------------------------------------------------------------------
  // pushing flights to the flightinfo array for the simulation - flightinfo contains the flights that fly
  intervalId2 = setInterval(function() {
    //console.log('flightInfo = '+flightInfo);
    for(let m = 0; m < allFlights.length; m++){
      if(compareTime(allFlights[m].departure_time, allFlights[m].callsign)){   
        flightInfo.push(allFlights[m]);
        allFlights.splice(m, 1);
        m--;
      }
    }
    console.log("flightInfo = ");
    console.log(flightInfo);
  }, 7000);

  // create gate way markers
  setTimeout(function() {
    for(var gws = 0; gws < gateWays.length; gws++){
      console.log("Creating waypoints");
      gateWays[gws].waypointMarker = createMarker(gateWays[gws]);
      gateWays[gws].waypointMarker.addListener("click", function(){
        console.log(this.setTitle);
      })
    }
  }, 3000)

  // this event listner listns to the changes of the zooming and adjust the size of the waypoints accordingly
  google.maps.event.addListener(map, 'zoom_changed', function() {
    var zoomLevel = map.getZoom();
    if(zoomLevel == 5){
      for(var gws = 0; gws < gateWays.length; gws++){
        gateWays[gws].waypointMarker.setIcon({
          url: "./images/waypoint2.png",
          scaledSize: new google.maps.Size(1, 1)
        });
      }
    }else if(zoomLevel == 7){
      for(var gws = 0; gws < gateWays.length; gws++){
        gateWays[gws].waypointMarker.setIcon({
          url: "./images/waypoint2.png",
          scaledSize: new google.maps.Size(10, 10)
        });
      }
    }else if(zoomLevel == 9){
      for(var gws = 0; gws < gateWays.length; gws++){
        gateWays[gws].waypointMarker.setIcon({
          url: "./images/waypoint2.png",
          scaledSize: new google.maps.Size(15, 15)
        });
      }
    }
  });

  //-------------------------------------------------------------------------------------------
    setTimeout(function() {
       // this repeats at 1000ms intervals and calculate the new location of the plane
      intervalId1 = setInterval(function() {
        // Get the new coordinates for the marker
        if(flightInfo.length > 0){
          for(var k = 0; k < flightInfo.length; k++){
            if(flightInfo[k].going){
              flightInfo[k].lng = flightInfo[k].marker.getPosition().lng() + flightInfo[k].increment;
              flightInfo[k].lat = flightInfo[k].lng*flightInfo[k].m + flightInfo[k].c;
              flightInfo[k].marker.setPosition({lat:flightInfo[k].lat, lng:flightInfo[k].lng});
            } 
            if(flightInfo[k].going){
              // Going down the map
              if(flightInfo[k].initLat > flightInfo[k].nextLat){
                if( flightInfo[k].marker.getPosition().lat() < flightInfo[k].nextLat && flightInfo[k].count < flightInfo[k].route.length){
    
                  flightInfo[k].count = flightInfo[k].count + 1;
    
                  if(flightInfo[k].count >= flightInfo[k].route.length){
                    //marker.setPosition({ lat: gateWays[ gateWays.length-1].lat, lng: gateWays[ gateWays.length-1].lng });
                    //console.log('stop lat = '+flightInfo[k].nextLat);
                    //console.log('stop lng = '+flightInfo[k].nextLng);
    
                    flightInfo[k].marker.setPosition({lat : flightInfo[k].nextLat, lng : flightInfo[k].nextLng});
                    flightInfo[k].going = false;
                    flightInfo.splice(k, 1);
    
                    continue;
                  }
                  // Here, the plane reaches a destination gateway. Then it assign coordinates of the 
                  // previous journey end gateway to initial gateway coordiates of the next journey
                  flightInfo[k].initLat =  flightInfo[k].nextLat;
                  flightInfo[k].initLng = flightInfo[k].nextLng;
                  //console.log('initlat = '+flightInfo[k].initLat);
                  //console.log('initlng = '+flightInfo[k].initLng);
                  // plane stopping
                  //console.log('label name = '+flightInfo[k].route[flightInfo[k].count]);

                  var temp1 = gateWays.find((obj) => obj.label == flightInfo[k].route[flightInfo[k].count]);
                  //console.log('temp1 = '+temp1.label);
                  flightInfo[k].nextLat = temp1.lat;
                  flightInfo[k].nextLng = temp1.lng;
                  //console.log('nextlat = '+flightInfo[k].nextLat);
                  //console.log('nextlng = '+flightInfo[k].nextLng);
            
                  // calculate the new gradient and intercept of the next journey
                  flightInfo[k].m = calcGradient(flightInfo[k].initLng, flightInfo[k].initLat,flightInfo[k].nextLng, flightInfo[k].nextLat)
                  flightInfo[k].c = calcIntercept(flightInfo[k].nextLng, flightInfo[k].nextLat, flightInfo[k].m);
                  //m = calcGradient(flightInfo[k].initLng, flightInfo[k].initLat, gateWays[flightInfo[k].count].lng, gateWays[flightInfo[k].count].lat);
                  //c = calcIntercept(gateWays[count].lng, gateWays[count].lat, m);
                  //console.log('m = '+flightInfo[k].m);
                  flightInfo[k].tanvalue = clacPlaneAngle(flightInfo[k].m);
                  //console.log('tanvalue = '+flightInfo[k].tanvalue);

                  
                  if(flightInfo[k].initLat > flightInfo[k].nextLat){
                    flightInfo[k].tanvalue = flightInfo[k].tanvalue + 180;
                  }
          
                  flightInfo[k].markerName = makeImageString(flightInfo[k].tanvalue-40);
                  //console.log('marker name = '+flightInfo[k].markerName);
            
                  icon = {
                    url: flightInfo[k].markerName,
                    scaledSize: new google.maps.Size(20, 20)
                  };
                  
                  flightInfo[k].marker.setIcon(icon);
                  //marker.setIcon(icon);
                  // selecting the right increment whether negative or positive
                  if(flightInfo[k].initLng > flightInfo[k].nextLng){
                    flightInfo[k].increment = -1*Math.abs(flightInfo[k].increment);
                  }else{
                    flightInfo[k].increment = Math.abs(flightInfo[k].increment);
                  }
                }

                //going up the map
              }else if(flightInfo[k].initLat <   flightInfo[k].nextLat){
                if( flightInfo[k].marker.getPosition().lat() > flightInfo[k].nextLat && flightInfo[k].count < flightInfo[k].route.length){
                  // Here, the plane reaches a destination gateway. Then it assign coordinates of the 
                  // previous journey end gateway to initial gateway coordiates of the next journey
                  flightInfo[k].count = flightInfo[k].count + 1;
                  //console.log('count = '+flightInfo[k].count);
                  //console.log('Limit-count = '+(flightInfo[k].route.length));
    
                  if(flightInfo[k].count >= flightInfo[k].route.length){
                    //marker.setPosition({ lat: gateWays[ gateWays.length-1].lat, lng: gateWays[ gateWays.length-1].lng });
                    flightInfo[k].marker.setPosition({lat : flightInfo[k].nextLat, lng : flightInfo[k].nextLng});
                    flightInfo[k].going = false;
                    flightInfo.splice(k, 1);
                    //console.log('The End');
                    continue;
                  }
                  flightInfo[k].initLat =  flightInfo[k].nextLat;
                  flightInfo[k].initLng = flightInfo[k].nextLng;
                  //console.log('initlat = '+flightInfo[k].initLat);
                  //console.log('initlng = '+flightInfo[k].initLng);
          
                  // plane stopping
                  
                  var temp2 = gateWays.find((obj) => obj.label == flightInfo[k].route[flightInfo[k].count]);
                  //console.log('temp2 = '+temp2.label);
    
                  flightInfo[k].nextLat = temp2.lat;
                  flightInfo[k].nextLng = temp2.lng;
                  //console.log('nextlat = '+flightInfo[k].nextLat);
                  //console.log('nextlng = '+flightInfo[k].nextLng);
            
                  // calculate the new gradient and intercept of the next journey
                  flightInfo[k].m = calcGradient(flightInfo[k].initLng, flightInfo[k].initLat,flightInfo[k].nextLng, flightInfo[k].nextLat)
                  flightInfo[k].c = calcIntercept(flightInfo[k].nextLng, flightInfo[k].nextLat, flightInfo[k].m);
            
                  flightInfo[k].tanvalue = clacPlaneAngle(flightInfo[k].m);
                  //console.log('tanvalue = '+flightInfo[k].tanvalue);
                  
                  if(flightInfo[k].initLat >  flightInfo[k].nextLat){
                    flightInfo[k].tanvalue = flightInfo[k].tanvalue + 180;
                  }
          
                  flightInfo[k].markerName = makeImageString(flightInfo[k].tanvalue-40);
                  //console.log('marker name = '+flightInfo[k].markerName);
            
                  icon = {
                    url: flightInfo[k].markerName,
                    scaledSize: new google.maps.Size(20, 20)
                  };
      
                  flightInfo[k].marker.setIcon(icon);
                  // selecting the right increment whether negative or positive
                  if(flightInfo[k].initLng > flightInfo[k].nextLng){
                    flightInfo[k].increment = -1*Math.abs(flightInfo[k].increment);
                  }else{
                    flightInfo[k].increment = Math.abs(flightInfo[k].increment);
                  }
                }
              }
              // end of flight navigation
            }
          }
           
          // copying flight info to another array
          compArr = flightInfo.slice();

          // collision handling______________________________________________________________________________
          for(let p = 0; p < compArr.length; p++){
            for(let pInner = 0; pInner < compArr.length; pInner++){
              if(p == pInner){
                continue;
              }
              let distance = google.maps.geometry.spherical.computeDistanceBetween(compArr[p].marker.position, compArr[pInner].marker.position);
              if (distance < radius) {
                
                //collidedFlights.push(compArr[pInner]);
                collidedPoints.push(createCircle(compArr[p].lat, compArr[p].lng));

                const localDate = new Date();
                const localHours = localDate.getHours();
                const localMinutes = localDate.getMinutes();
                const localSeconds = localDate.getSeconds();
                // markers are colliding
                //console.log(compArr[p].callsign+' colllides with '+compArr[pInner].callsign);
                table = document.getElementById('collision-table');
                // Create a new row for the table
                var newRow = table.insertRow();
                cell1 = newRow.insertCell(0);
                cell2 = newRow.insertCell(1);
                cell3 = newRow.insertCell(2);
                cell4 = newRow.insertCell(3);
                cell5 = newRow.insertCell(4);
                // Populate the cells with the data for the new record
                cell1.innerHTML = compArr[p].callsign;
                cell2.innerHTML = compArr[pInner].callsign;
                cell3.innerHTML = localHours+":"+localMinutes+":"+localSeconds;
                cell4.innerHTML = compArr[p].lat;
                cell5.innerHTML = compArr[p].lng;
                compArr.splice(pInner, 1);
                pInner--;
              } 
            }
          }
          // collision handling ended ______________________________________________________________________________
        }
      }, 1000);
  }, 2000);

  intervalId3 = setInterval(function() {
    if(collidedPoints.length){
      for(let point = 0; point < collidedPoints.length; point++){
        var status = collidedPoints[point].visibility;
        status = !status;
        collidedPoints[point].setVisible(status);
        collidedPoints[point].count++;
        /*if(collidedPoints[point].count > 20){
          collidedPoints[point].setVisible(false);
          collidedPoints.splice(point, 1);
        }*/
      }
    }
  }, 500);

}

//window.initMap = initMap;

