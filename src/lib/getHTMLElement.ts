/**
 * Traverse ancestors until we find an HTMLElement.
 */
export default function getHTMLElement(node: Node): HTMLElement {
  if (node.nodeType === 1) {
    return node as HTMLElement;
  }
  return getHTMLElement(node.parentNode!);
}
