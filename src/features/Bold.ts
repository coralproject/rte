import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

function execCommand(squire: Squire) {
  if (squire.hasFormat("B")) {
    squire.removeBold();
  } else {
    squire.bold();
  }
}

function isActive(squire: Squire) {
  return squire.hasFormat("B");
}

const Bold = createToggle(execCommand, {
  isActive,
  shortcuts: ctrlKey => ({
    [ctrlKey + "b"]: execCommand
  })
});

Bold.defaultProps = {
  children: "Bold"
};

export default Bold;
