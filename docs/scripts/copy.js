/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");

const distFolder = "./docs/dist";

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder);
}

fs.copyFileSync("./docs/index.html", "./docs/dist/index.html");
