
// calculate the gradient of the straight line path
function calcGradient(x1, y1, x2, y2){
  var gradient = (y2 - y1)/(x2 - x1);
  return gradient;
}

// claculate the intercept of the straight line path
function calcIntercept(x, y, m){
  var intercept = y - m*x;
  return intercept;
}

/*function createMarker(Lat, Lng, Label){
  var marker = new google.maps.Marker({
    map:map,
    icon:{
      url : "./images/map-marker-round-eps-icon-vector-10894350-removebg-preview.png",
      scaledSize: new google.maps.Size(10, 10)
    },
    position : {lat : Lat, lng : Lng},
    label : Label
  })
}*/

// marker creating function
function createMarker(coordinates){
  var marker = new google.maps.Marker({
    map:map,
    icon:{
      url : "./images/waypoint2.png",
      scaledSize: new google.maps.Size(15, 15)
    },
    position : {lat : coordinates.lat, lng : coordinates.lng},
    label : coordinates.label
  })
}

// calculate the angle of the plane marker according to the path in degrees
function clacPlaneAngle(tanVal){
  let tanInverse = Math.atan(tanVal) * (180/ Math.PI);
  if(tanInverse < 0){
    tanInverse = tanInverse + 180;
  }
  return tanInverse;
}

/*generate a string according to the gradient of the plane path so that the appropriate rotated
  marker can be used*/
function makeImageString(angle){

  // get the integer of the division
  var ans = Math.floor(angle / 10);
  var remainder = angle % 10;

  if(remainder >= 5){
    ans = ans + 1;
  }

  // convert the integer to a string
  var fileName = './images/planes/' + (ans*10).toString() + '.png'
  return fileName;
}

// this function is not used. 'initialString_2()' is used instead of this.
function initalString(initLat, initLng, gateWay){
  var grad = calcGradient(initLng, initLat, gateWay.lng, gateWay.lat);
  tanvalue = clacPlaneAngle(grad);
  if(initLat > gateWay.lat){
    tanvalue = tanvalue + 180;
  }
  markerName = makeImageString(tanvalue-40);
  return markerName;

}

// this is the working function
function initalString_2(initLat, initLng, nextLat, nextLng){
  var grad = calcGradient(initLng, initLat, nextLng, nextLat);
  tanvalue = clacPlaneAngle(grad);
  if(initLat > nextLat){
    tanvalue = tanvalue + 180;
  }
  markerName = makeImageString(tanvalue-40);
  return markerName;

}

function rearrangeArray(inputString){
  // remove initial '[' and final ']' characters
  inputString = inputString.slice(1, -1);
  // split the input string by commas
  const elements = inputString.split(",");
  // create a new array of strings
  const outputArray = elements.map((element) => {
    // remove any leading or trailing whitespace
    element = element.trim();
    // return the element as a string
    return String(element);
  });
  // return the output array
  return outputArray;
}
  
