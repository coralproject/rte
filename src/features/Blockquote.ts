import createToggle from "../factories/createToggle";
import { API } from "../lib/api";
import {
  findIntersecting,
  getSelectedNodesExpanded,
  indentNodes,
  insertNewLineAfterNode,
  insertNodes,
  outdentBlock,
  selectEndOfNode,
} from "../lib/dom";

function execCommand(this: API) {
  const bq = findIntersecting("BLOCKQUOTE", this.container);
  if (bq) {
    outdentBlock(bq, true);
  } else {
    // Expanded selection means we always select whole lines.
    const selectedNodes = getSelectedNodesExpanded();
    if (selectedNodes.length) {
      indentNodes(selectedNodes, "blockquote", true);
    } else {
      const node = document.createElement("blockquote");
      node.appendChild(document.createElement("br"));
      insertNodes(node);
      selectEndOfNode(node);
    }
  }
  this.broadcastChange();
}

function isActive(this: API) {
  return this.focused && !!findIntersecting("BLOCKQUOTE", this.container);
}

function onEnter(this: API, node: Node) {
  if ((node as Element).tagName !== "BLOCKQUOTE") {
    return false;
  }
  insertNewLineAfterNode(node, true);
  return true;
}

const Blockquote = createToggle(execCommand, { onEnter, isActive });

Blockquote.defaultProps = {
  children: "Blockquote",
};

export default Blockquote;
