function createAI(size, notify) {
  const messages = Object.freeze({
    FLAG: Symbol("flag"),
    REVEAL: Symbol("reveal"),
  });

  const mutableState = {
    running: false,
  };

  function undiscoveredNeighbours(startCoord) {
    const isUndiscoveredNeighbour = (coord) => !grid.isDiscoveredAt(coord);
    const neighbours = startCoord.neighbours(size);

    return neighbours.filter(isUndiscoveredNeighbour);
  }

  function flaggedNeighbourCount(startCoord) {
    const neighbours = startCoord.neighbours(size);

    return sumCoordinateArrayOnPredicate(neighbours, grid.hasFlagAt);
  }

  async function flagPosition(grid, coord) {
    if (!grid.isDiscoveredAt(coord) && !grid.hasFlagAt(coord)) {
      await delay();
      notify(messages.FLAG, coord);
    }
  }

  async function flagPositionSet(grid, coords) {
    for (let i = 0; i < coords.length; i++) {
      await flagPosition(grid, coords[i]);
    }
  }

  async function revealPosition(grid, coord) {
    if (!grid.isDiscoveredAt(coord) && !grid.hasFlagAt(coord)) {
      await delay();
      notify(messages.REVEAL, coord);
    }
  }

  async function revealPositionSet(grid, coords) {
    for (let i = 0; i < coords.length; i++) {
      await revealPosition(grid, coords[i]);
    }
  }

  async function evaluateTile(grid, coord) {
    const frontierVal = grid.frontierValAt(coord);
    const undiscoveredNeighbourSet = undiscoveredNeighbours(coord);
    const undiscoveredNeighbourCount = undiscoveredNeighbourSet.length;

    if (
      grid.isFrontierAt(coord) &&
      frontierVal - flaggedNeighbourCount(coord) === 0
    ) {
      await revealPositionSet(grid, undiscoveredNeighbourSet);
    } else if (
      grid.isFrontierAt(coord) &&
      frontierVal - undiscoveredNeighbourCount === 0
    ) {
      await flagPositionSet(grid, undiscoveredNeighbourSet);
    }
  }

  function isIslandTile(grid, coord) {
    return (
      undiscoveredNeighbours(coord).length === coord.neighbours(size).length
    );
  }

  async function defaultMove(grid) {
    const coords = possibleCoordinates(size);

    for (let i = 0; i < coords.length; i++) {
      if (
        !grid.isDiscoveredAt(coords[i]) &&
        !grid.hasFlagAt(coords[i]) &&
        isIslandTile(grid, coords[i])
      ) {
        await revealPosition(grid, coords[i]);
        return;
      }
    }

    await defaultMoveWithoutIslandConstraint(coords);
  }

  async function defaultMoveWithoutIslandConstraint(coords) {
    for (let i = 0; i < coords.length; i++) {
      if (!grid.isDiscoveredAt(coords[i]) && !grid.hasFlagAt(coords[i])) {
        await revealPosition(grid, coords[i]);
        break;
      }
    }
  }

  function getFrontiers() {
    const frontiers = [];

    possibleCoordinates(size).forEach((coord) => {
      if (
        grid.isFrontierAt(coord) &&
        undiscoveredNeighbours(coord).length > 0
      ) {
        frontiers.push(coord);
      }
    });

    return frontiers;
  }

  async function handleDefaultMove(grid, frontiers) {
    if (JSON.stringify(frontiers) === JSON.stringify(getFrontiers())) {
      await defaultMove(grid);
    }
  }

  return {
    messages() {
      return messages;
    },

    async move(grid) {
      mutableState.running = true;

      while (mutableState.running) {
        let frontiers = getFrontiers();

        for (let i = 0; i < frontiers.length; i++) {
          await evaluateTile(grid, frontiers[i]);
        }

        await handleDefaultMove(grid, frontiers);
      }
    },

    stopRunning() {
      mutableState.running = false;
    },
  };
}
