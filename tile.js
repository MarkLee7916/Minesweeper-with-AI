"use-strict";

function createTile() {
  let hasFlag = false;
  let hasBomb = false;
  let isDiscovered = false;
  let frontierVal = -1;

  return {
    addFlag() {
      hasFlag = true;
    },

    removeFlag() {
      hasFlag = false;
    },

    hasFlag() {
      return hasFlag;
    },

    setFrontierVal(val) {
      frontierVal = val;
    },

    frontierVal() {
      return frontierVal;
    },

    isDiscovered() {
      return isDiscovered;
    },

    setDiscovered() {
      isDiscovered = true;
    },

    addBomb() {
      hasBomb = true;
    },

    hasBomb() {
      return hasBomb;
    },
  };
}
