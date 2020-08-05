"use-strict";

const size = 25;
const startingFlagCount = size * 3;

const view = createView(size, startingFlagCount, notifyFromView);
const grid = createGrid(size, startingFlagCount, notifyFromGrid);
const ai = createAI(size, notifyFromAI);

function notifyFromView(message, arg) {
  switch (message) {
    case view.messages().FLAG:
      dealWithFlag(arg);
      break;
    case view.messages().REVEAL:
      revealTileInGrid(arg);
      break;
    case view.messages().RESET:
      resetGame();
      break;
    case view.messages().AI_MOVE:
      runWithoutInterruptions(() => ai.move(grid));
      break;
    default:
      throw "View has notified controller with unsupported type";
  }
}

function notifyFromGrid(message, ...args) {
  switch (message) {
    case grid.messages().REVEAL_FRONTIER:
      revealFrontierInView(args[0], args[1]);
      break;
    case grid.messages().REVEAL_DISCOVERED:
      revealDiscoveredInView(args[0]);
      break;
    case grid.messages().REVEAL_BOMB:
      revealBombInView(args[0]);
      break;
    case grid.messages().REVEAL_CROSS:
      revealCrossInView(args[0]);
      break;
    case grid.messages().GAME_OVER:
      gameOver();
      break;
    case grid.messages().UPDATE_FLAG_COUNT:
      view.updateFlagCount(args[0]);
      break;
    default:
      throw "Model has notified controller with unsupported type";
  }
}

function notifyFromAI(message, arg) {
  switch (message) {
    case ai.messages().FLAG:
      dealWithFlag(arg);
      break;
    case ai.messages().REVEAL:
      revealTileInGrid(arg);
      break;
    default:
      throw "AI has notified controller with unsupported type";
  }
}

function gameOver() {
  ai.stopRunning();
  grid.revealBombLocations();
  view.disableUI();
  view.enableResetButton();
}

function resetGame() {
  grid.resetToDefault();
  view.resetToDefault();
}

function revealDiscoveredInView(coord) {
  view.setDiscoveredAt(coord);
}

function revealBombInView(coord) {
  view.setBombAt(coord);
}

function revealCrossInView(coord) {
  view.setCrossAt(coord);
}

function revealFrontierInView(coord, val) {
  view.setFrontierAt(coord, val);
}

function dealWithFlag(coord) {
  if (grid.canDealWithFlagAt(coord)) {
    grid.dealWithFlagAt(coord);
    view.dealWithFlagAt(coord);
  }
}

function revealTileInGrid(coord) {
  grid.activateTile(coord);
}

async function runWithoutInterruptions(func) {
  view.disableUI();
  await func();
}
