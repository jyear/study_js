const path = require("path");
const { Tapable, SyncHook } = require("tapable");

class Compilation {
  constructor(compiler, moduleFactory) {
    this.hooks = {
      succeedEntry: new SyncHook(["entry", "name", "module"]),
    };
    this.compiler = compiler;
    this.moduleFactory = moduleFactory;
    this.modules = [];
    this.assets = [];
  }

  addEntry(context, entry, name, callback) {
    // 存储entry
    this._addModuleChain(context, entry, (module) => {
      this.hooks.succeedEntry.call(entry, name, module);
      callback();
    });
  }

  _addModuleChain(context, request, callback) {
    this.moduleFactory.create({ context, request }, (module) => {
      this.modules.push(module);
      module.build(() => {
        this.processModuleDependencies(module, () => {
          callback(module);
        });
      });
    });
  }

  processModuleDependencies(module, callback) {
    if (module.dependencies.length > 0) {
      module.dependencies.forEach((dependency) => {
        const context = path.resolve(module.context, dependency);

        this._addModuleChain(path.dirname(context), dependency, callback);
      });
    } else {
      callback();
    }
  }

  seal(callback) {
    // 源码中，此处会进行一些优化操作，这里略过
    console.log(this);
    this.buildChunkGraph();
    this.createChunkAssets();
    callback();
  }

  buildChunkGraph() {}

  /**
   * 填充模版，生成 chunk
   */
  createChunkAssets() {}
}

module.exports = Compilation;
