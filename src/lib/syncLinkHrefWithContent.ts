const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
const PROTOCOL_REGEXP = /^([a-zA-Z]+:\/\/)/;

/**
 * Enforces contents of links to match their href.
 * @param element HTMLAnchorElement or HTMLElement potentially container anchor elements
 */
export default function syncLinkHrefWithContent(element: HTMLElement): void {
  if (element.tagName === "A") {
    const anchorElement = element as HTMLAnchorElement;
    try {
      const content = anchorElement.textContent || "";
      const isEmail = EMAIL_REGEXP.test(content);
      if (isEmail) {
        anchorElement.href = `mailto:${content}`;
        return;
      }

      let urlContent = content;
      if (!PROTOCOL_REGEXP.test(urlContent)) {
        urlContent = "http://" + content;
      }

      const url = new URL(urlContent);
      anchorElement.href = url.toString();
    } catch (e) {
      // url was invalid.
      anchorElement.href = "javascript:;";
    }
    return;
  }
  const anchorElements = element.getElementsByTagName("a");
  for (let i = 0; i < anchorElements.length; i++) {
    syncLinkHrefWithContent(anchorElements[i]);
  }
}
