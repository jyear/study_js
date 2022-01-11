const NormalModule = require("./normalModule");

class NormalModuleFactory {
  constructor(context, options) {
    this.context = context;
    this.options = options;
    this.ruleSet = options.rules;
  }
  create(result, callback) {
    // 拿到文件后缀
    const fileType = result.request.split(".")[1];
    // 找出匹配的loader
    const rules = this.ruleSet.filter((rule) => rule.test.includes(fileType));
    const loaders = rules.map((rule) => rule.loader);

    // 新建module
    const createdModule = new NormalModule({
      loaders,
      request: result.request,
      context: this.context,
    });
    console.log("000", createdModule);
    callback(createdModule);
  }
}

module.exports = NormalModuleFactory;
