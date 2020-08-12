/* eslint-disable @typescript-eslint/no-var-requires */
var HtmlWebpackPlugin = require("html-webpack-plugin");
var path = require("path");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: ["core-js/stable", "regenerator-runtime/runtime", "./main"],
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: ["style-loader"],
        oneOf: [
          {
            use: [
              {
                loader: require.resolve("css-loader"),
                options: {
                  modules: {
                    localIdentName: "[name]-[local]-[contenthash]",
                  },
                },
              },
            ],
            include: /\.module\.css$/,
          },
          {
            use: ["css-loader"],
          },
        ],
      },
      {
        test: /\.tsx?/,
        use: ["babel-loader"],
      },
      {
        test: /\.js/,
        include: /node_modules\//,
        exclude: /node_modules\/(@babel|babel|core-js|regenerator-runtime)/,
        use: ["babel-loader"],
      },
      {
        test: /\.mdx?$/,
        use: ["babel-loader", "@coralproject/mdx-book/loader"],
      },
    ],
  },
  devServer: {
    publicPath: "/",
    contentBase: "./public",
    hot: true,
  },
  plugins: [new HtmlWebpackPlugin()],
};
