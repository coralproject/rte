import { PrismTheme } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/nightOwl";
import React from "react";
import ReactDOM from "react-dom";

import MDXBook from "@coralproject/mdx-book";

const div = document.createElement("div");
document.body.appendChild(div);

ReactDOM.render(
  <MDXBook
    documents={require.context(__dirname, true, /^.*\.mdx$/)}
    playgroundTheme={theme as PrismTheme}
  />,
  div
);
