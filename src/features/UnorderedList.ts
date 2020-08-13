import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

function execCommand(squire: Squire) {
  if (squire.hasFormat("UL")) {
    squire.removeList();
  } else {
    squire.makeUnorderedList();
  }
}

function isActive(squire: Squire) {
  return squire.hasFormat("UL");
}

const UnorderedList = createToggle(execCommand, { isActive });

UnorderedList.defaultProps = {
  children: "Unordered List",
};

export default UnorderedList;
