**webpack执行编译入口是compiler**

**每次启动webpack全局只会存在一个Compiler**

**webpack运行是基于tapable(一个事件订阅发布库)，webpack自身很多功能  实现都是基于订阅发布来实现的**



+  1.new Compiler(webpack.config)==>
+  2.加载插件（插件就是订阅webpack编译各个过程的事件，当webpack执行到对应的步骤会发布事件，插件开始执行）
+  3.根据入口创建moduleFactory然后new Compilation(this,moduleFactory)本次编译
+  4.compilation.addEntry(开始编译)==>
+  5.调用_addModuleChain==>
+  6.内部调用传入的moduleFactory.create创建module，并且在回调内返回module(查看normalModule)==>
+  7.调用返回的module自身的build开启本module编译(一个文件就是一个module)==>
+  8.进入build开始调用runLoaders加载loader对文件进行处理（patching,normal类似于捕获和冒泡，loader执行是从右往左）==>
+  9.loader执行完毕进入parse(查看parse.js),找出本module的依赖项，然后执行module.build的callback
+  10.callback内部调用compilation.processModuleDependencies,对当前module.dependencise进行遍历，然后重复步骤5
+  11.所有模块编译完调用compilation.addEntry传入的callback，
+  12.在compilation.addEntry传入的callback内执行在compilation.seal,此时打印this==本次编译的compilation，已经执行完编译阶段
+  13.在seal内执行chunk，根据模板生成文件等操作
