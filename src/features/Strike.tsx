import React from "react";
import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

function execCommand(squire: Squire) {
  if (squire.hasFormat("S")) {
    squire.changeFormat(null, { tag: "S" });
  } else {
    squire.changeFormat({ tag: "S" }, null);
  }
  squire.focus();
}

function isActive(squire: Squire) {
  return squire.hasFormat("S");
}

function isDisabled(squire: Squire) {
  // Check if a block node already enforces this styling, if so
  // disable this feature.
  let blockOverwrites: boolean = false;
  squire.forEachBlock((n: Node) => {
    if (
      window
        .getComputedStyle(n as Element)
        .getPropertyValue("text-decoration") === "line-through"
    ) {
      blockOverwrites = true;
      // Terminate loop.
      return true;
    }
    return false;
  });
  return blockOverwrites;
}

const Strike = createToggle(execCommand, {
  isActive,
  isDisabled,
  shortcuts: ctrlKey => ({
    [ctrlKey + "s"]: execCommand
  })
});

Strike.defaultProps = {
  children: <s>S</s>
};

export default Strike;
