const path = require("path");

const rootDir = path.resolve(__dirname, "../");
const srcDir = path.resolve(rootDir, "./src");
const appTsconfig = path.resolve(rootDir, "./tsconfig.json");

exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
  getConfig
}) => {
  // Get webpack config.
  const config = getConfig();

  // Add .tx .tsx to modules
  config.resolve.extensions.push(".ts", ".tsx");
  actions.replaceWebpackConfig(config);

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          include: srcDir,
          test: /\.tsx?$/,
          use: [
            {
              loader: require.resolve("ts-loader"),
              options: {
                configFile: appTsconfig,
                compilerOptions: {
                  target: "es2015",
                  module: "commonjs",
                  jsx: "react",
                  noEmit: false
                },
                transpileOnly: true,
                // Overwrites the behavior of `include` and `exclude` to only
                // include files that are actually being imported and which
                // are necessary to compile the bundle.
                onlyCompileBundledFiles: true
              }
            }
          ]
        }
      ]
    }
  });
};
