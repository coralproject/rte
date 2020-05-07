import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

function execCommand(squire: Squire) {
  if (squire.hasFormat("I")) {
    squire.removeItalic();
  } else {
    squire.italic();
  }
}

function isActive(squire: Squire) {
  return squire.hasFormat("I");
}
function isDisabled(squire: Squire) {
  // Check if a block node already enforces this styling, if so
  // disable this feature.
  let blockOverwrites: boolean = false;
  squire.forEachBlock((n: Node) => {
    if (
      window.getComputedStyle(n as Element).getPropertyValue("font-style") ===
      "italic"
    ) {
      blockOverwrites = true;
      // Terminate loop.
      return true;
    }
    return false;
  });
  return blockOverwrites;
}

const Italic = createToggle(execCommand, {
  isActive,
  isDisabled,
  shortcuts: ctrlKey => ({
    [ctrlKey + "i"]: execCommand
  })
});

Italic.defaultProps = {
  children: "Italic"
};

export default Italic;
