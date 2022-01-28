const path = require("path");
const HtmlWebPackPackPlugin = require("html-webpack-plugin");

const config = {
  mode: "development",
  entry: {
    app: "./src/main.jsx",
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    static: "./dist",
    host: "0.0.0.0",
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin,X-Requested-With,Content-Type,Accept",
      "Access-Control-Allow-Methods": "GET,POST",
    },
    port: 8080,
  },
  output: {
    path: path.join(process.cwd(), "./dist"),
    filename: "js/[name].js",
    library: "xiaoka-back",
    libraryTarget: "umd",
    chunkFilename: "js/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: "/node_modules",
        use: [
          {
            loader: "swc-loader",
            options: {
              inlineSourcesContent: true,
              env: {
                targets: {
                  chrome: "79",
                },
                mode: "entry",
              },
              jsc: {
                loose: true,
                parser: {
                  syntax: "ecmascript",
                  jsx: true,
                  decorators: false,
                  dynamicImport: false,
                },
                transform: {
                  react: {
                    pragma: "React.createElement",
                    pragmaFrag: "React.Fragment",
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPackPlugin({
      template: path.join(process.cwd(), "./public/index.html"),
      filename: "index.html", // 让入口文件晚于remoteEntry加载
      inject: "body",
      chunksSortMode: "manual",
    }),
  ],
  devtool: "eval-cheap-module-source-map",
};
module.exports = config;
