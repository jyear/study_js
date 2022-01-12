const { Tapable, SyncHook, AsyncSeriesHook } = require("tapable");
const path = require("path");
const fs = require("fs");
const NormalModuleFactory = require("./normalModuleFactory");
const Compilation = require("./compilation");

class Compilier {
  constructor(config) {
    this.options = config;
    this.hooks = {
      beforeCompile: new AsyncSeriesHook(),
      afterCompile: new SyncHook(["bundle"]),
      afterEmit: new SyncHook(),
    };
  }

  // 创建模块工厂函数
  createNormalModuleFactory() {
    const moduleFactory = new NormalModuleFactory(
      this.options.context,
      this.options.module || {}
    );

    return moduleFactory;
  }

  // 启动打包
  run() {
    // 触发beforeCompile钩子
    this.hooks.beforeCompile.callAsync((err) => {
      console.log("beforeCompile钩子触发");
      if (!err) {
        // 执行打包
        this.compile();
      }
    });
  }

  // 打包方法 每启动一次webpack只会有一个compiler实例
  // 但是有多个compilation实例 ，每次热更新就是一个compilation实例
  compile() {
    // 开始执行打包
    console.log("开始执行打包");
    // 创建模块工厂函数

    const moduleFactory = this.createNormalModuleFactory();
    const compilation = new Compilation(this, moduleFactory);
    const { context, entry, fileName: name } = this.options;
    compilation.addEntry(context, entry, name, () => {
      compilation.seal(() => {
        console.log(111);
      });
    });
  }
}

module.exports = Compilier;
