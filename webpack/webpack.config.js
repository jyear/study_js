const BeforeCompilePlugin = require("./plugins/beforeComplierPlugin");
const path = require("path");
const config = {
  context: path.resolve(__dirname, "./example"),
  entry: "./index.js",
  output: {
    path: "./build",
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: ".js",
        loader: require("./loaders/demo-loader"),
      },
    ],
  },
  plugins: [new BeforeCompilePlugin()],
};

module.exports = config;
