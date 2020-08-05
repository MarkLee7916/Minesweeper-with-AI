"use-strict";

function createView(size, startingFlagCount, notify) {
  const DEFAULT_TILE_COLOR = "#DCDCDC";
  const DISCOVERED_TILE_COLOR = "#A9A9A9";
  const SIZE_IN_PIXELS = 600;

  const messages = Object.freeze({
    FLAG: Symbol("flag"),
    REVEAL: Symbol("reveal"),
    RESET: Symbol("reset"),
    AI_MOVE: Symbol("AIMove"),
  });

  const frontierValueToColor = new Map([
    [1, "#0074D9"],
    [2, "#FF4136"],
    [3, "#FFDC00"],
    [4, "#F012BE"],
    [5, "#7FDBFF"],
    [6, "#FF851B"],
    [7, "pink"],
    [8, "cyan"],
  ]);

  (function constructor() {
    initialiseView();
  })();

  function initialiseView() {
    createEmptyGridInDOM();
    addAllEventListeners();
    setFlagCount(startingFlagCount);
  }

  function setFlagCount(count) {
    document.querySelector("#flag-count").innerHTML = `🚩 ${count}`;
  }

  function createEmptyGridInDOM() {
    const gridDOM = document.querySelector("#grid");

    gridDOM.style.height = `${SIZE_IN_PIXELS}px`;
    gridDOM.style.width = `${SIZE_IN_PIXELS}px`;

    for (let row = 0; row < size; row++) {
      let rowDOM = createEmptyRowInDOM();
      gridDOM.append(rowDOM);
    }
  }

  function addAllEventListeners() {
    addClickListenerForResetGame();
    addClickListenerForAIMove();
    addClickListenersForTiles();
  }

  function addClickListenerForResetGame() {
    document.querySelector("#reset").addEventListener("click", notifyReset);
  }

  function addClickListenerForAIMove() {
    document.querySelector("#ai-move").addEventListener("click", notifyAIMove);
  }

  function addClickListenersForTiles() {
    possibleCoordinates(size).forEach((coord) => {
      getTileInDOM(coord).addEventListener("click", notifyReveal);
      getTileInDOM(coord).addEventListener("contextmenu", notifyFlag);
    });
  }

  function notifyReveal(clickable) {
    const tile = clickable.target;

    notify(messages.REVEAL, getTileCoordinate(tile));
  }

  function notifyFlag(clickable) {
    const rightMouseButton = 2;
    const tile = clickable.target;

    if (clickable.button === rightMouseButton) {
      clickable.preventDefault();
      notify(messages.FLAG, getTileCoordinate(tile));
    }
  }

  function notifyAIMove() {
    notify(messages.AI_MOVE);
  }

  function notifyReset() {
    notify(messages.RESET);
  }

  function removeAllEventListeners() {
    document.querySelector("#reset").removeEventListener("click", notifyReset);
    document
      .querySelector("#ai-move")
      .removeEventListener("click", notifyAIMove);

    removeClickListenersForTiles();
  }

  function removeClickListenersForTiles() {
    possibleCoordinates(size).forEach((coord) => {
      getTileInDOM(coord).removeEventListener("click", notifyReveal);
      getTileInDOM(coord).removeEventListener("contextmenu", notifyFlag);
    });
  }

  function createEmptyRowInDOM() {
    const rowDOM = document.createElement("tr");
    rowDOM.className = "row";

    for (let col = 0; col < size; col++) {
      let newTile = createEmptyTileInDOM();
      rowDOM.append(newTile);
    }

    return rowDOM;
  }

  function getTileCoordinate(tile) {
    const row = tile.parentNode.rowIndex;
    const col = tile.cellIndex;

    return createCoordinate(row, col);
  }

  function createEmptyTileInDOM() {
    const tileDOM = document.createElement("td");
    const TILE_SIZE_IN_PIXELS = SIZE_IN_PIXELS / size;

    tileDOM.style.height = `${TILE_SIZE_IN_PIXELS}px`;
    tileDOM.style.width = `${TILE_SIZE_IN_PIXELS}px`;
    tileDOM.style.backgroundColor = DEFAULT_TILE_COLOR;
    tileDOM.style.fontSize = `${2500 / size}%`;
    tileDOM.className = "tile";

    return tileDOM;
  }

  function getTileInDOM(coord) {
    const gridDOM = document.querySelector("#grid");
    const rowDOM = gridDOM.rows[coord.row()];
    const tileDOM = rowDOM.cells[coord.col()];

    return tileDOM;
  }

  return {
    messages() {
      return messages;
    },

    disableUI() {
      removeAllEventListeners();
    },

    enableUI() {
      addAllEventListeners();
    },

    enableResetButton() {
      addClickListenerForResetGame();
    },

    setBombAt(coord) {
      getTileInDOM(coord).innerHTML = "💣";
    },

    setCrossAt(coord) {
      getTileInDOM(coord).innerHTML = "❌";
    },

    removeSymbolAt(coord) {
      getTileInDOM(coord).innerHTML = "";
    },

    setDiscoveredAt(coord) {
      this.removeSymbolAt(coord);

      getTileInDOM(coord).style.backgroundColor = DISCOVERED_TILE_COLOR;
    },

    setFrontierAt(coord, value) {
      this.setDiscoveredAt(coord);

      getTileInDOM(coord).style.color = frontierValueToColor.get(value);
      getTileInDOM(coord).innerHTML = value;
    },

    dealWithFlagAt(coord) {
      if (getTileInDOM(coord).innerHTML === "🚩") {
        this.removeSymbolAt(coord);
      } else {
        getTileInDOM(coord).innerHTML = "🚩";
      }
    },

    updateFlagCount(count) {
      setFlagCount(count);
    },

    resetToDefault() {
      document.querySelector("#grid").innerHTML = "";

      initialiseView();
    },
  };
}
