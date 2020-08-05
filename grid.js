"use-strict";

function createGrid(size, startingFlagCount, notify) {
  const grid = [];

  const messages = Object.freeze({
    REVEAL_FRONTIER: Symbol("revealFrontier"),
    REVEAL_DISCOVERED: Symbol("revealDiscovered"),
    REVEAL_BOMB: Symbol("revealBomb"),
    REVEAL_CROSS: Symbol("revealCross"),
    GAME_OVER: Symbol("gameOver"),
    UPDATE_FLAG_COUNT: Symbol("updateFlagCount"),
  });

  (function constructor() {
    initialiseGrid();
  })();

  function initialiseGrid() {
    for (let row = 0; row < size; row++) {
      grid.push([]);
      for (let col = 0; col < size; col++) {
        grid[row].push(createTile());
      }
    }

    initialiseBombs();
  }

  function clearGrid() {
    grid.length = 0;
  }

  function initialiseBombs() {
    let bombsToPlace = startingFlagCount;

    possibleCoordinates(size)
      .reverse()
      .forEach((coord) => {
        if (bombsToPlace > 0) {
          tileAt(coord).addBomb();
          bombsToPlace--;
        }
      });

    shuffleGrid();
  }

  function shuffleGrid() {
    const rotations = 10;

    for (let iter = 0; iter < rotations; iter++) {
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          swapWithRandomElement(row, col);
        }
      }
    }
  }

  function swapWithRandomElement(row, col) {
    let randRow = randomIntBetween(0, size);
    let randCol = randomIntBetween(0, size);

    let temp = grid[row][col];
    grid[row][col] = grid[randRow][randCol];
    grid[randRow][randCol] = temp;
  }

  function numberOfNeighboursWithBomb(startCoord) {
    const hasBomb = (coord) => tileAt(coord).hasBomb();
    const neighbours = startCoord.neighbours(size);

    return sumCoordinateArrayOnPredicate(neighbours, hasBomb);
  }

  function revealNeighbouringTiles(startCoord) {
    const neighboursWithBomb = numberOfNeighboursWithBomb(startCoord);

    if (!tileAt(startCoord).isDiscovered()) {
      tileAt(startCoord).setDiscovered();
      notify(messages.REVEAL_DISCOVERED, startCoord);
      dealWithReplacedFlag(startCoord);

      if (neighboursWithBomb === 0) {
        startCoord
          .neighbours(size)
          .forEach((coord) => revealNeighbouringTiles(coord));
      } else {
        tileAt(startCoord).setFrontierVal(neighboursWithBomb);
        notify(messages.REVEAL_FRONTIER, startCoord, neighboursWithBomb);
      }
    }
  }

  // If flag was replaced by a discovered tile, update tile
  function dealWithReplacedFlag(coord) {
    if (tileAt(coord).hasFlag()) {
      tileAt(coord).removeFlag();
      notify(messages.UPDATE_FLAG_COUNT, flagCount());
    }
  }

  function tileAt({ row, col }) {
    return grid[row()][col()];
  }

  function canPlaceFlagAt(coord) {
    return flagCount() > 0 && !tileAt(coord).isDiscovered();
  }

  function flagCount() {
    return (
      startingFlagCount -
      grid.flat().reduce((acc, tile) => acc + (tile.hasFlag() ? 1 : 0), 0)
    );
  }

  function revealFinalState(coord) {
    if (tileAt(coord).hasFlag() && !tileAt(coord).hasBomb()) {
      notify(messages.REVEAL_CROSS, coord);
    } else if (!tileAt(coord).hasFlag() && tileAt(coord).hasBomb()) {
      notify(messages.REVEAL_BOMB, coord);
    }
  }

  function isWinCondition() {
    const coords = possibleCoordinates(size);

    for (let i = 0; i < coords.length; i++) {
      if (!tileAt(coords[i]).isDiscovered() && !tileAt(coords[i]).hasFlag()) {
        return false;
      }
    }

    return true;
  }

  function handlePotentialWinCondition() {
    if (isWinCondition()) {
      notify(messages.GAME_OVER);
    }
  }

  return {
    hasFlagAt(coord) {
      return tileAt(coord).hasFlag();
    },

    // Return true if flag click is valid
    canDealWithFlagAt(coord) {
      return canPlaceFlagAt(coord) || this.hasFlagAt(coord);
    },

    // If has a flag remove it, else add a flag
    dealWithFlagAt(coord) {
      if (!this.hasFlagAt(coord)) {
        tileAt(coord).addFlag();
      } else {
        tileAt(coord).removeFlag();
      }

      notify(messages.UPDATE_FLAG_COUNT, flagCount());
      handlePotentialWinCondition();
    },

    messages() {
      return messages;
    },

    frontierValAt(coord) {
      return tileAt(coord).frontierVal();
    },

    isFrontierAt(coord) {
      return tileAt(coord).frontierVal() != -1;
    },

    isDiscoveredAt(coord) {
      return tileAt(coord).isDiscovered();
    },

    activateTile(coord) {
      if (!this.hasFlagAt(coord)) {
        if (tileAt(coord).hasBomb()) {
          console.log("hit bomb");
          notify(messages.GAME_OVER);
        } else {
          revealNeighbouringTiles(coord);
        }

        handlePotentialWinCondition();
      }
    },

    revealBombLocations() {
      possibleCoordinates(size).forEach((coord) => {
        revealFinalState(coord);
      });
    },

    resetToDefault() {
      clearGrid();
      initialiseGrid();
    },
  };
}

