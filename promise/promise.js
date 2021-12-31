// 手写promise
(function () {
  const PENDING = "pending";
  const RESOLVED = "resolved";
  const REJECTED = "rejected";

  var MyPromise = function (fnCallback) {
    var _this = this;
    _this.status = PENDING;
    _this.value = undefined;
    _this.reason = undefined;
    _this.successCallbacks = [];
    _this.errorCallbacks = [];

    const resolve = function (value) {
      if (_this.status === PENDING) {
        _this.status = RESOLVED;
        _this.value = value;
        _this.successCallbacks.forEach((fn) => {
          fn && fn(value);
        });
      }
    };
    const reject = function (reason) {
      if (_this.status === PENDING) {
        _this.status = REJECTED;
        _this.reason = reason;
        _this.errorCallbacks.forEach((fn) => {
          fn && fn(reason);
        });
      }
    };
    try {
      fnCallback(resolve, reject);
    } catch (err) {
      reject(err);
    }
  };
  MyPromise.resolve = function (value) {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  };
  MyPromise.reject = function (error) {
    return new MyPromise((_, reject) => {
      reject(error);
    });
  };
  MyPromise.all = function (list) {
    return new MyPromise((resolve, reject) => {
      let promiseNum = list.length;
      let resolveCount = 0;
      let resolveValus = new Array(promiseNum);

      for (let i = 0; i < promiseNum; i++) {
        const res =
          list[i] instanceof MyPromise ? list[i] : MyPromise.resolve(list[i]);
        res.then(
          (value) => {
            resolveCount += 1;
            resolveValus[i] = value;
            if (resolveCount === promiseNum) {
              resolve(resolveValus);
            }
          },
          (err) => {
            reject(err);
          }
        );
      }
    });
  };
  MyPromise.race = function (list) {
    return new MyPromise((resolve, reject) => {
      let promiseNum = list.length;
      for (let i = 0; i < promiseNum; i++) {
        const res =
          list[i] instanceof MyPromise ? list[i] : MyPromise.resolve(list[i]);
        res
          .then(function (value) {
            resolve(value);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  };

  MyPromise.prototype = {
    constructor: MyPromise, // 构造函数
    then: function (onResolved, onRejected) {
      var _this = this;
      const resultPromise = new MyPromise((resolve, reject) => {
        function handle(callback, type) {
          try {
            let result = null;

            if (type === RESOLVED) {
              // 当前then没有第一个函数的时候，直接resolve
              if (!onResolved) {
                resolve(_this.value);
              }
              result = callback(_this.value);
            } else {
              // 当前then没有第二个函数的时候，直接reject
              if (!onRejected) {
                reject(_this.reason);
              }
              result = callback(_this.reason);
            }
            if (result instanceof MyPromise) {
              result.then(
                (res) => {
                  resolve(res);
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(e);
          }
        }
        if (_this.status === RESOLVED) {
          handle(onResolved, RESOLVED);
        }
        if (_this.status === REJECTED) {
          handle(onRejected, REJECTED);
        }
        if (_this.status === PENDING) {
          _this.successCallbacks.push(() => {
            handle(onResolved, RESOLVED);
          });
          _this.errorCallbacks.push(() => {
            handle(onRejected, REJECTED);
          });
        }
      });
      return resultPromise;
    },
    catch: function (onRejected) {
      return this.then(null, onRejected);
    },
  };
  window.MyPromise = MyPromise;
})();
