import { KeyboardEvent } from "react";

import createToggle from "../factories/createToggle";
import { API } from "../lib/api";
import { findAncestor, findIntersecting } from "../lib/dom";

const boldTags = ["B", "STRONG"];

function execCommand() {
  return document.execCommand("bold");
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
    (n: HTMLElement) =>
      n.nodeName !== "#text" &&
      window.getComputedStyle(n).getPropertyValue("font-weight") === "bold" &&
      !boldTags.includes(n.tagName) &&
      !findAncestor(
        n,
        (node: HTMLElement) => boldTags.includes(node.tagName),
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
  children: "Bold",
};

export default Bold;
