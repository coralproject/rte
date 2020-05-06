import Squire from "squire-rte";

import createToggle from "../factories/createToggle";

interface Props {
  spoilerClassName?: string;
}

function execCommand(squire: Squire, props: Props) {
  const attributes = { class: props.spoilerClassName! };
  if (squire.hasFormat("SPAN", attributes)) {
    squire.changeFormat(null, { tag: "SPAN", attributes });
  } else {
    squire.changeFormat({ tag: "SPAN", attributes }, null);
  }
  squire.focus();
}

function isActive(squire: Squire, props: Props) {
  const attributes = { class: props.spoilerClassName! };
  return squire.hasFormat("SPAN", attributes);
}

const Spoiler = createToggle<Props>(execCommand, {
  isActive
});

Spoiler.defaultProps = {
  children: "Spoiler",
  spoilerClassName: "coral-rte-spoiler"
};

export default Spoiler;
