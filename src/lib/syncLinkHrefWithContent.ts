const MAILTO_PROTOCOL = "mailto:";

/**
 * Enforces contents of links to match their href.
 * @param element HTMLAnchorElement or HTMLElement potentially container anchor elements
 */
export default function syncLinkHrefWithContent(element: HTMLElement) {
  if (element.tagName === "A") {
    const anchorElement = element as HTMLAnchorElement;
    let url: URL | undefined,
      prefix = "http://";

    try {
      url = new URL(anchorElement.href);
    } catch (err) {
      // An href may contain a url that URL doesn't accept. (e.g. "http://")
    }

    if (url) {
      if (url.protocol === MAILTO_PROTOCOL) {
        prefix = MAILTO_PROTOCOL;
      } else if (anchorElement.textContent?.startsWith(url.protocol)) {
        prefix = "";
      }
    }

    anchorElement.href = prefix + anchorElement.textContent;
    return;
  }
  const anchorElements = element.getElementsByTagName("a");
  for (let i = 0; i < anchorElements.length; i++) {
    syncLinkHrefWithContent(anchorElements[i]);
  }
}
