import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

function execCommand(squire: Squire) {
  if (squire.hasFormat("BLOCKQUOTE")) {
    squire.decreaseQuoteLevel();
  } else {
    squire.increaseQuoteLevel();
  }
}

function isActive(squire: Squire) {
  return squire.hasFormat("BLOCKQUOTE");
}

const Blockquote = createToggle(execCommand, { isActive });

Blockquote.defaultProps = {
  children: "Blockquote",
};

export default Blockquote;
