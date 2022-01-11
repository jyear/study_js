const Compilier = require("./lib/compiler");
const config = require("./webpack.config");

const compiler = new Compilier(config);

if (config.plugins?.length > 0) {
  for (const plugin of config.plugins) {
    plugin.apply(compiler);
  }
}

compiler.run();
