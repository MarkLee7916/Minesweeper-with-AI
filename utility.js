"use-strict";

// Generates a random number whose value lies between lower and upper
function randomIntBetween(lower, upper) {
  return Math.floor(Math.random() * (upper - lower)) + lower;
}

function sumCoordinateArrayOnPredicate(array, predicate) {
  return array.reduce((acc, coord) => acc + (predicate(coord) ? 1 : 0), 0);
}

function delay() {
  const delayTimeInMilliseconds = 100;

  return new Promise((resolve) => {
    setTimeout(resolve, delayTimeInMilliseconds);
  });
}

function possibleCoordinates(size) {
  const possibleCoords = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      possibleCoords.push(createCoordinate(row, col));
    }
  }

  return possibleCoords;
}
