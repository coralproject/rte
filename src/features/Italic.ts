import { KeyboardEvent } from "react";

import createToggle from "../factories/createToggle";
import { API } from "../lib/api";
import { findAncestor, findIntersecting } from "../lib/dom";

const italicTags = ["I", "EM"];

function execCommand() {
  return document.execCommand("italic");
}
function isActive(this: API) {
  return this.focused && document.queryCommandState("italic");
}
function isDisabled(this: API) {
  if (!this.focused) {
    return false;
  }
  // Disable whenever the italic styling came from a different
  // tag than those we control.
  return !!findIntersecting(
    (n: Node) =>
      n.nodeName !== "#text" &&
      window.getComputedStyle(n as Element).getPropertyValue("font-style") ===
        "italic" &&
      !italicTags.includes((n as Element).tagName) &&
      !findAncestor(
        n,
        (node: Node) => italicTags.includes((node as Element).tagName),
        this.container
      ),
    this.container
  );
}
function onShortcut(this: API, e: KeyboardEvent) {
  if (e.key === "i") {
    if (!isDisabled.apply(this)) {
      execCommand.apply(this);
    }
    return true;
  }
  return false;
}

const Italic = createToggle(execCommand, { isActive, isDisabled, onShortcut });

Italic.defaultProps = {
  children: "Italic",
};

export default Italic;
