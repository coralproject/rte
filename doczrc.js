// doczrc.js

export default {
  title: "CoralRTE",
  host: process.env.HOST || "0.0.0.0",
  port: parseInt(process.env.DOCZ_PORT, 10) || 3030,
  files: "**/*.mdx"
};
