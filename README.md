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

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Publish new version to NPM

1. Make sure you've updated the version in `package.json`
2. Run `npm run build`
3. Cut a new release
4. Publish the update to NPM

   `npm login`

   `npm publish`
