function parseString(inputString) {
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

const inputString = "[WSSS, VTK ,VJR,GUPTA,VKL,WMKK]";
const outputArray = parseString(inputString);
console.log(outputArray); // Output: ["WSSS", "VTK", "VJR", "GUPTA", "VKL", "WMKK"]
console.log(outputArray[0]);
