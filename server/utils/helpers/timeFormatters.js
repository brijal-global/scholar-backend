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
