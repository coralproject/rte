import express from "express";
import nunjucks from "nunjucks";

const DEV_PORT = 7000;

const run = async () => {
  const app = express();

  nunjucks.configure("docs/server/views", { autoescape: true });

  app.use("/static", express.static("docs/client/"));

  app.get("/", (req, res) => {
    res.send(nunjucks.render("index.html"));
  });

  app.listen(DEV_PORT, () => {
    console.log(`dev server is listening on ${DEV_PORT}`);
  });
};

void run();
