const MAILTO_PROTOCOL = "mailto:";

/**
 * Enforces contents of links to match their href.
 * @param element HTMLAnchorElement or HTMLElement potentially container anchor elements
 */
export default function syncLinkHrefWithContent(element: HTMLElement) {
  if (element.tagName === "A") {
    const anchorElement = element as HTMLAnchorElement;
    const url = new URL(anchorElement.href);
    const prefix = url.protocol === MAILTO_PROTOCOL ? MAILTO_PROTOCOL : "";
    anchorElement.href = prefix + anchorElement.textContent;
    return;
  }
  const anchorElements = element.getElementsByTagName("a");
  for (let i = 0; i < anchorElements.length; i++) {
    syncLinkHrefWithContent(anchorElements[i]);
  }
}
