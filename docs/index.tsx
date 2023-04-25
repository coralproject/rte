import React, { FunctionComponent, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  CoralRTE,
  Bold,
  Italic,
  Blockquote,
  Strike,
  OrderedList,
  UnorderedList,
  Spoiler,
} from "../src";

import "./index.css";

interface DemoComponentProps {
  toolbarPosition?: "top" | "bottom";
}

const DemoComponent: FunctionComponent<DemoComponentProps> = ({
  toolbarPosition,
}) => {
  const [value, setValue] = useState("");
  return (
    <CoralRTE
      toolbarPosition={toolbarPosition}
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

const renderDemo = () => {
  const div = document.getElementById("demo");
  if (!div) {
    throw new Error("unable to find demo div");
  }

  const root = createRoot(div);
  root.render(<DemoComponent />);
};

const renderToolbarAtBottomDemo = () => {
  const div = document.getElementById("demo-toolbar-bottom");
  if (!div) {
    throw new Error("unable to find demo-toolbar-bottom div");
  }

  const root = createRoot(div);
  root.render(<DemoComponent toolbarPosition="bottom" />);
};

window.addEventListener("DOMContentLoaded", () => {
  renderDemo();
  renderToolbarAtBottomDemo();
});
