"use-strict";

function createCoordinate(newRow, newCol) {
  const row = newRow;
  const col = newCol;

  function isOnGrid(currRow, currCol, maxSize) {
    return (
      currRow >= 0 && currRow < maxSize && currCol >= 0 && currCol < maxSize
    );
  }

  return {
    row() {
      return row;
    },

    col() {
      return col;
    },

    // Return all adjacent positions including positions that are diagonally adjacent
    neighbours(maxSize) {
      const neighbours = [];

      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if ((i !== 0 || j !== 0) && isOnGrid(row + i, col + j, maxSize)) {
            neighbours.push(createCoordinate(row + i, col + j));
          }
        }
      }

      return neighbours;
    },
  };
}
