export function getUtcTimestamp() {
  const currentTime = new Date().toISOString();
  return currentTime;
}

export function convertJwtTimeToSeconds(expiry) {
  let seconds = 0;

  if (expiry.endsWith("s")) {
    seconds = parseInt(expiry.replace("s", ""));
  } else if (expiry.endsWith("m")) {
    seconds = parseInt(expiry.replace("m", "")) * 60;
  } else if (expiry.endsWith("h")) {
    seconds = parseInt(expiry.replace("h", "")) * 60 * 60;
  } else if (expiry.endsWith("d")) {
    seconds = parseInt(expiry.replace("d", "")) * 24 * 60 * 60;
  } else if (expiry.endsWith("w")) {
    seconds = parseInt(expiry.replace("w", "")) * 7 * 24 * 60 * 60;
  } else {
    throw new Error("Invalid expiry time: " + expiry);
  }

  if (seconds < 0 || isNaN(seconds)) {
    throw new Error("Got invalid seconds: " + seconds);
  }

  return seconds;
}

export function secondsAgo(createdAt) {
  // Parse the createdAt string into a Date object
  const createdAtDate = new Date(createdAt);

  // Get the current time as a Date object
  const currentTime = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = currentTime - createdAtDate;

  // Convert milliseconds to seconds
  const secondsAgo = Math.floor(timeDifference / 1000);

  return secondsAgo;
}
