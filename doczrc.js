// doczrc.js
import { css } from "docz-plugin-css";

export default {
  title: "CoralRTE",
  plugins: [
    css({
      preprocessor: "postcss",
      cssmodules: true,
      loaderOpts: {
        plugins: [],
      },
    }),
  ],
};
