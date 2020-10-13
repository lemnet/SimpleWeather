import document from 'document';
import { preferences } from 'user-settings';

// Add a zero in front of a number if it's less than 10
const zeroPad = number => {
  let padded = number;
  if (padded < 10) {
    padded = `0${padded}`;
  }
  return padded;
};

export function getTime(date) {
  const hours = date.getHours();
  const ret;
  if (preferences.clockDisplay === '12h') {
    // 12h format
    ret = zeroPad(hours % 12 || 12);
  } else {
    // 24h format
    ret = zeroPad(hours);
  }
  ret += ":"
  ret += zeroPad(date.getMinutes());
  return ret;
};