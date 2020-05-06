import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

function execCommand(squire: Squire) {
  if (squire.hasFormat("OL")) {
    squire.removeList();
  } else {
    squire.makeOrderedList();
  }
}

function isActive(squire: Squire) {
  return squire.hasFormat("OL");
}

const OrderedList = createToggle(execCommand, { isActive });

OrderedList.defaultProps = {
  children: "Ordered List"
};

export default OrderedList;
