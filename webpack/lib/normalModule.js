const path = require("path");
const fs = require("fs");
const parser = require("./parser");

let id = 0;

class NormalModule {
  constructor({ loaders, request, context }) {
    console.log(222, request, context);
    this.loaders = loaders;
    this.request = request; // 相对路径
    this.context = context;
    this.id = id++;
    this.dependencies = [];
    this.source = null; // 当前模块所在文件夹路径
    console.log(context, request);
    this.resourcePath = path.resolve(context, request); // 绝对路径
  }

  build(callback) {
    this.runLoaders(() => {
      // 生成ast，找出依赖
      parser.call(this);
      callback();
    });
  }

  runLoaders(callback) {
    const loaderContext = {
      loaderIndex: 0,
    };
    const processOptions = {
      resourceText: null,
      readResource: fs.readFileSync,
    };

    this.iteratePitchingLoaders(processOptions, loaderContext, callback);
  }

  iteratePitchingLoaders(options, loaderContext, callback) {
    // 执行完所有的pitch方法后，需执行loader方法
    if (loaderContext.loaderIndex >= this.loaders.length) {
      loaderContext.loaderIndex--;
      return this.processResource(options, loaderContext, callback);
    }
    // 拿到当前loader的pitch方法
    const fn = this.loaders[loaderContext.loaderIndex].pitch;
    loaderContext.loaderIndex++;

    // 如果不存在，执行下一个
    if (!fn) {
      return this.iteratePitchingLoaders(options, loaderContext, callback);
    }

    const pitchResult = fn();

    if (!pitchResult) {
      return this.iteratePitchingLoaders(options, loaderContext, callback);
    } else {
      this.iterateNormalLoaders(options, loaderContext, pitchResult, callback);
    }
  }

  // 加载源文件的内容，执行loader
  processResource(options, loaderContext, callback) {
    const source = options.readResource(this.resourcePath, "utf-8");
    options.resourceText = source;
    this.iterateNormalLoaders(options, loaderContext, undefined, callback);
  }

  iterateNormalLoaders(options, loaderContext, pitchResult, callback) {
    // loader执行完得到，回到 compilation去遍历依赖
    if (loaderContext.loaderIndex < 0) {
      this.source = options.resourceText;
      return callback();
    }
    const fn = this.loaders[loaderContext.loaderIndex--];
    options.resourceText = fn.call(loaderContext, options.resourceText);
    return this.iterateNormalLoaders(
      options,
      loaderContext,
      pitchResult,
      callback
    );
  }
}

module.exports = NormalModule;
