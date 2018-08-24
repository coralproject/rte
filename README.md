# Introduction

CoralRTE is a lightweight and extensible Rich Text Editor based on React.

## Installation

```bash
npm install @coralproject/rte --save-dev
```

## Usage

```js
import { CoralRTE, Bold, Italic, Blockquote } from "@coralproject/rte";

<CoralRTE
  features={[
    <Bold key="bold" />,
    <Italic key="italic" />,
    <Blockquote key="blockquote" />,
  ]}
/>
```
