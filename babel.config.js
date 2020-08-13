module.exports = {
  plugins: ["transform-class-properties"],
  presets: [
    "@babel/typescript",
    "@babel/react",
    ["@babel/env", { modules: false }],
  ],
};
