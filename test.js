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