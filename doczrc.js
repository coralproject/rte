// doczrc.js
import { css } from "docz-plugin-css";

export default {
  title: "CoralRTE",
  typescript: true,
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
