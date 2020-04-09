import { KeyboardEvent } from "react";
import bowser from "bowser";

import createToggle from "../factories/createToggle";
import { API } from "../lib/api";
import { findAncestor, findIntersecting } from "../lib/dom";

const boldTags = ["B", "STRONG"];

function execCommand(this: API) {
  const result = document.execCommand("bold");
  if (bowser.msie) {
    this.broadcastChange();
  }
  return result;
}

function isActive(this: API) {
  return this.focused && document.queryCommandState("bold");
}
function isDisabled(this: API) {
  if (!this.focused) {
    return false;
  }
  // Disable whenever the bold styling came from a different
  // tag than those we control.
  return !!findIntersecting(
    (n: Node) =>
      n.nodeName !== "#text" &&
      window.getComputedStyle(n as Element).getPropertyValue("font-weight") ===
        "bold" &&
      !boldTags.includes((n as Element).tagName) &&
      !findAncestor(
        n,
        (node: Node) => boldTags.includes((node as Element).tagName),
        this.container
      ),
    this.container
  );
}

function onShortcut(this: API, e: KeyboardEvent) {
  if (e.key === "b") {
    if (!isDisabled.apply(this)) {
      execCommand.apply(this);
    }
    return true;
  }
  return false;
}

const Bold = createToggle(execCommand, { isActive, isDisabled, onShortcut });

Bold.defaultProps = {
  children: "Bold"
};

export default Bold;
