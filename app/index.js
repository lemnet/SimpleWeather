import clock from "clock";
import document from "document";
import { units } from "user-settings";
import * as util from "../common/utils";
import { gettext } from "i18n";
import { getDate } from "./date";
import { getTime } from './time';
import { today } from 'user-activity'
import { HeartRateSensor } from 'heart-rate';
import { display } from "display";
import { vibration } from 'haptics';
import { geolocation } from "geolocation";
import { battery } from 'power';
import { me as device } from "device";
import * as messaging from "messaging";
import { readFileSync } from "fs";


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
const battStatus = document.getElementById('battStatus');
const tempText = document.getElementById('tempText');
tempText.text = "--"
let currentAct = 0;
let latitude = 0;
let longitude = 0;
let lastfetch = 0;


// HeartRateSensor
const hrm = new HeartRateSensor({ frequency: 1 });

hrm.addEventListener("reading", () => {
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    if (currentAct == 1)
      display.on ? hrm.start() : hrm.stop();
  });
    actText.text = hrm.heartRate;
});


// location
function locationSuccess(position) {
  var api_key = readFileSync("/mnt/assets/resources/openweather_api.key", "ascii");
  if (units.temperature == "C")
    fetchWeather(position.coords.latitude,position.coords.longitude,"metric",api_key);
  else
    fetchWeather(position.coords.latitude,position.coords.longitude,"imperial",api_key);
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
//  console.log(`The icon is: ${data.icon}`);
//  console.log(`The temperature is: ${data.temperature}`);
//  console.log(`The location is: ${data.location}`);
}

messaging.peerSocket.addEventListener("open", (evt) => {
  fetchWeather();
});

messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data) {
    processWeatherData(evt.data);
  }
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
  lastfetch = 0;
});


// every minute
clock.ontick = (evt) => {
  const currentDate = evt.date;
  dateText.text = getDate(currentDate);
  if (currentAct == 0) //steps
    actText.text = today.adjusted.steps || 0;
  else if (currentAct == 2) //calo
    actText.text = today.adjusted.calories || 0;
  else if (currentAct == 3) //elevation
    actText.text = today.adjusted.elevationGain || 0;
  timeText.text = getTime(currentDate);
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
main.onclick = () => {
  vibration.start('bump');
  if (currentAct == 0) { //steps
    hrm.start(); 
    actIcon.href="icons/heart.png"
    actText.text = hrm.heartRate;
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