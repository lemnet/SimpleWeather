import clock from "clock";
import document from "document";
import { units } from "user-settings";
import * as util from "../common/utils";
import { gettext } from "i18n";
import { getDate } from "./date";
import { getTimeHM } from './time';
import { getTimeMS } from './time';
import { today } from 'user-activity'
import { HeartRateSensor } from 'heart-rate';
import { display } from "display";
import { vibration } from 'haptics';
import { geolocation } from "geolocation";
import { battery } from 'power';
import { me as device } from "device";
import * as messaging from "messaging";
import * as fs from "fs";


// Update the clock every minute
clock.granularity = "minutes";


//variables
const main = document.getElementById('main');
const nightBackground = document.getElementById('nightBackground');
const dateText = document.getElementById("dateText");
const actIcon = document.getElementById('actIcon');
const actText = document.getElementById("actText");
const timeText = document.getElementById('timeText');
const condIcon = document.getElementById('condIcon');
const locIcon = document.getElementById('locIcon');
locIcon.style.display = "none";
const locText = document.getElementById('locText');
const lochText = document.getElementById('lochText');
const btIcon = document.getElementById('btIcon');
btIcon.style.display = "none";
const battIcon = document.getElementById('battIcon');
const battStatus = document.getElementById('battStatus');
const stayOnStatus = document.getElementById('stayOnStatus');
stayOnStatus.style.display = "none";
const tempText = document.getElementById('tempText');
tempText.text = "--"
let currentAct = 0;
let lastfetch = 0;
let secDisplay = 0;
let stayOn = 0;
let stayOnMin = 0;
let btckeck = 0;


// load weather
if (fs.existsSync("/private/data/weather.txt")) {
  let json_weather  = fs.readFileSync("weather.txt", "json");
  processWeatherData(json_weather);
}


// load settings
if (fs.existsSync("/private/data/color.txt")) {
  let settings  = fs.readFileSync("color.txt", "json");
  dateText.style.fill = settings.color;
  timeText.style.fill = settings.color;
  actIcon.style.fill = settings.color;
  actText.style.fill = settings.color;
  locIcon.style.fill = settings.color;
  locText.style.fill = settings.color;
  lochText.style.fill = settings.color;
  battIcon.style.fill = settings.color;
  stayOnStatus.style.fill = settings.color;
  tempText.style.fill = settings.color;
}
if (fs.existsSync("/private/data/bt.txt")) {
  if (fs.readFileSync("bt.txt", "json") == "true")
    btckeck = setInterval(checkBT, 30000);
}

// HeartRateSensor
const hrm = new HeartRateSensor({ frequency: 1 });

hrm.addEventListener("reading", () => {
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    if (currentAct == 1)
      display.on ? hrm.start() : hrm.stop();
  });
  if (hrm.heartRate == null || hrm.heartRate == 0) 
    actText.text = "--";
  else
    actText.text = hrm.heartRate;
});


// location
function locationSuccess(position) {
  if (units.temperature == "C")
    fetchWeather(position.coords.latitude,position.coords.longitude,"metric",fs.readFileSync("/mnt/assets/resources/openweather_api.key", "ascii"));
  else
    fetchWeather(position.coords.latitude,position.coords.longitude,"imperial",fs.readFileSync("/mnt/assets/resources/openweather_api.key", "ascii"));
//  console.log("Latitude: " + position.coords.latitude,"Longitude: " + position.coords.longitude);
}
function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
  lastfetch = 0;
}


// weather
function fetchWeather(latitude,longitude,units,api_key) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: "weather",
      latitude : latitude,
      longitude : longitude,
      units : units,
      api_key : api_key
    });
  }
  else
    lastfetch = 0;
}

function processWeatherData(data) {
  condIcon.href = "icons/weather/" + data.icon + ".png";
  if ((data.icon).substring(2) == "d")
    nightBackground.style.display = "none";
  else
    nightBackground.style.display = "inline";
  tempText.text = Math.round(data.temperature) + "°" + units.temperature;
  locIcon.style.display = "inline";
  locText.text = data.location;
  lochText.text = timeText.text;
  let json_data = {
    "icon": data.icon,
    "temperature": data.temperature,
    "location": data.location,
  }
  fs.writeFileSync("weather.txt", json_data, "json");
//  console.log(`The icon is: ${data.icon}`);
//  console.log(`The temperature is: ${data.temperature}`);
//  console.log(`The location is: ${data.location}`);
}


// message received
messaging.peerSocket.addEventListener("message", (evt) => {
  btIcon.style.display = "none";
  if (evt && evt.data && evt.data.key === "color") {
    vibration.start('bump');
    let json_data = {"color": evt.data.value}
    fs.writeFileSync("color.txt", json_data, "json");
    dateText.style.fill = evt.data.value;
    timeText.style.fill = evt.data.value;
    actIcon.style.fill = evt.data.value;
    actText.style.fill = evt.data.value;
    locIcon.style.fill = evt.data.value;
    locText.style.fill = evt.data.value;
    lochText.style.fill = evt.data.value;
    battIcon.style.fill = evt.data.value;
    stayOnStatus.style.fill = evt.data.value;
    tempText.style.fill = evt.data.value;
  }
  else if (evt && evt.data && evt.data.key === "checkbt") {
    vibration.start('bump');
    if (evt.data.value == true) {
      fs.writeFileSync("bt.txt", ("true"), "json");
      btckeck = setInterval(checkBT, 30000);
    }
    else {
      fs.writeFileSync("bt.txt", ("false"), "json");
      clearInterval(btckeck);
    }
  }
  else if (evt && evt.data && evt.data.key === "weather") {
    processWeatherData(evt.data);
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
  lastfetch = 0;
});


// every minute or second if screen is on
clock.ontick = (evt) => {
  const currentDate = evt.date;
  dateText.text = getDate(currentDate);
  if (currentAct == 0) //steps
    actText.text = today.adjusted.steps || 0;
  else if (currentAct == 2) //calo
    actText.text = today.adjusted.calories || 0;
  else if (currentAct == 3) //elevation
    actText.text = today.adjusted.elevationGain || 0;
  if (secDisplay == 0)
    timeText.text = getTimeHM(currentDate);
  else
    timeText.text = getTimeMS(currentDate);
  //try to get location and weather
  setTimeout(function(){
    if ((currentDate.getTime() - lastfetch) > 1800000) { //every 30 min
      lastfetch = currentDate.getTime();
      geolocation.getCurrentPosition(locationSuccess, locationError, {timeout: 60 * 1000});
    }
  }, 5000);
  //battery status
  const { chargeLevel } = battery;
  battStatus.height = (Math.round((27*chargeLevel)/100));
  battStatus.y = device.screen.height-38+27-(Math.round((27*chargeLevel)/100));
  if (chargeLevel > 50)
    battStatus.style.fill = "green";
  else if (chargeLevel > 20)
    battStatus.style.fill = "orange";
  else
    battStatus.style.fill = "red";

};


//onclick
main.onclick = (evt) => {
  vibration.start('bump');
  if ((evt.screenX) > 150 && (evt.screenY) < 65) {
    if (secDisplay == 0) {
      clock.granularity = "seconds";
      secDisplay = 1;
    }
    else {
      secDisplay = 0;
      setTimeout(function(){
        clock.granularity = "minutes";
      }, 1500);
    }
  }
  else if ((evt.screenY) > 250 && (evt.screenX) > 115 && (evt.screenX) < 185) {
    if (stayOn == 0) {
      stayOn = setInterval(pokepoke, 250);
      stayOnMin = setInterval(vibrate, 60000);
      stayOnStatus.style.display = "inline";
    }
    else {
      clearInterval(stayOn);
      clearInterval(stayOnMin);
      stayOn = 0;
      stayOnStatus.style.display = "none";
    }
  }
  else {
    if (currentAct == 0) { //steps
      hrm.start(); 
      actIcon.href="icons/heart.png"
      actText.text = hrm.heartRate || "--";
      currentAct = 1;
    }
    else if (currentAct == 1) { //HR
      hrm.stop();
      actIcon.href="icons/flame.png"
      actText.text = today.adjusted.calories || 0;
      currentAct = 2;
    }
    else if (currentAct == 2) { // calo
      actIcon.href="icons/stairs.png"
      actText.text = today.adjusted.elevationGain || 0;
      currentAct = 3;
    }
    else if (currentAct == 3) { // elevation
      actIcon.href="icons/step.png"
      actText.text = today.adjusted.steps || 0;
      currentAct = 0;
    }
  }
}

//vibrate on BT disconnect
function checkBT() {
  if (btIcon.style.display == "none" && messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
    vibration.start('nudge-max');
    btIcon.style.display = "inline";
    display.poke();
  }
  else if (btIcon.style.display == "inline" && messaging.peerSocket.readyState === messaging.peerSocket.OPEN) 
    btIcon.style.display = "none";
}

//vibrate
function vibrate() {
  vibration.start('bump');
}

//poke
function pokepoke() {
    display.poke();
}

display.addEventListener("change", () => {
  if (!display.on) {
    secDisplay = 0;
    clock.granularity = "minutes";
  }    
});