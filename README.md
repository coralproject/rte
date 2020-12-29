# Coral RTE [![CircleCI](https://circleci.com/gh/coralproject/rte.svg?style=svg)](https://circleci.com/gh/coralproject/rte)

Coral RTE is a lightweight and extensible Rich Text Editor based on React and [Squire](https://github.com/neilj/Squire).

[Demo](https://coralproject-rte.netlify.app/)

## Installation

```bash
npm install @coralproject/rte --save-dev
```

## Usage

```js
import { CoralRTE, Bold, Italic, Blockquote } from "@coralproject/rte";
import createDOMPurify from "dompurify";

// See https://github.com/cure53/DOMPurify
const DOMPurify = createDOMPurify(window);

const sanitizeToDOMFragment = (html) => {
  if (!html) {
    return document.createDocumentFragment();
  }
  return DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
};

<CoralRTE
  inputID="rte-field"
  className="coral-rte"
  contentClassName="coral-rte-content"
  placeholderClassName="coral-rte-placeholder"
  toolbarClassName="coral-rte-toolbar"
  onChange={(html) => setValue(html)}
  value={value}
  disabled={disabled}
  placeholder={"Enter some content"}
  features={[<Bold />, <Italic />, <Blockquote />]}
  toolbarPosition="bottom"
  sanitizeToDOMFragment={sanitizeToDOMFragment}
/>;
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Releasing

When you're ready to release a new vesrion of `@coralproject/rte`,
you can do the following:

1. Run `npm version --no-git-tag-version (major|minor|patch)` to update the
   version number in package files.
2. Push the changes to a new branch, and submit a PR against `main`.
3. Once the changes have been approved, and all the code you want to deploy for
   the version is in `main`, create a release with the version number: `v0.4.0`
   (Note that the `v` prefix is required)

CircleCI will run your tests and release the new version for you.
