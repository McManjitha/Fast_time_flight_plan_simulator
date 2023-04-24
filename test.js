function compareTime(inputTime) {
  // Split the input time string into hours, minutes, and seconds
  const [inputHours, inputMinutes, inputSeconds] = inputTime.split(':').map(Number);

  // Get the current local machine time as hours, minutes, and seconds
  const localDate = new Date();
  const localHours = localDate.getHours();
  const localMinutes = localDate.getMinutes();
  const localSeconds = localDate.getSeconds();
  console.log('loacalTIme = '+localHours+':'+localMinutes+':'+localSeconds+', inputTime = '+inputTime);

  // Compare inputTime to local time
  if (inputHours > localHours ||
    (inputHours === localHours && inputMinutes > localMinutes) ||
    (inputHours === localHours && inputMinutes === localMinutes && inputSeconds > localSeconds)) {
    return false; //inputTime is greater than current local time
  } else {
    return true; //inputTime is less than or equal to current local time
  }
}

console.log(compareTime('09:00:00'));
