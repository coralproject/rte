# Coral RTE [![CircleCI](https://circleci.com/gh/coralproject/rte.svg?style=svg)](https://circleci.com/gh/coralproject/rte)

Coral RTE is a lightweight and extensible Rich Text Editor based on React.

## Installation

```bash
npm install @coralproject/rte --save-dev
```

## Usage

```js
import { CoralRTE, Bold, Italic, Blockquote } from "@coralproject/rte";

const sanitizeToDOMFragment = html => {
  if (!html) {
    return document.createDocumentFragment();
  }
  return purify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
};

<CoralRTE
  inputID="rte-field"
  className="coral-rte"
  contentClassName="coral-rte-content"
  placeholderClassName="coral-rte-placeholder"
  toolbarClassName="coral-rte-toolbar"
  onChange={html => setValue(html)}
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
