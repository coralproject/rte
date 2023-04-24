import React, { FunctionComponent, useState } from "react";
import ReactDOM from "react-dom";

import {
  CoralRTE,
  Bold,
  Italic,
  Blockquote,
  Strike,
  OrderedList,
  UnorderedList,
  Spoiler,
} from "../../src";

const DemoComponent: FunctionComponent = () => {
  const [value, setValue] = useState("");
  return (
    <CoralRTE
      value={value}
      onChange={(html) => setValue(html)}
      placeholder="Type something"
      features={[
        <Bold key="bold" />,
        <Italic key="italic" />,
        <Blockquote key="blockquote" />,
        <Strike key="strike" />,
        <OrderedList key="orderedList" />,
        <UnorderedList key="unorderedList" />,
        <Spoiler key="spoiler" />,
      ]}
    />
  );
};

window.addEventListener("DOMContentLoaded", () => {
  const div = document.getElementById("demo");
  ReactDOM.render(<DemoComponent />, div);
});
