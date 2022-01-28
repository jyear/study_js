# React 启动流程

**react-dom阶段**

1.createSyntheticEvent生成事件函数
2.registerSimpleEvents 注册基本的事件
  <pre>var simpleEventPluginEvents = ['abort', 'auxClick', 'cancel', 'canPlay', 'canPlayThrough', 'click', 'close', 'contextMenu', 'copy', 'cut', 'drag', 'dragEnd', 'dragEnter', 'dragExit', 'dragLeave', 'dragOver', 'dragStart', 'drop', 'durationChange', 'emptied', 'encrypted', 'ended', 'error', 'gotPointerCapture', 'input', 'invalid', 'keyDown', 'keyPress', 'keyUp', 'load', 'loadedData', 'loadedMetadata', 'loadStart', 'lostPointerCapture', 'mouseDown', 'mouseMove', 'mouseOut', 'mouseOver', 'mouseUp', 'paste', 'pause', 'play', 'playing', 'pointerCancel', 'pointerDown', 'pointerMove', 'pointerOut', 'pointerOver', 'pointerUp', 'progress', 'rateChange', 'reset', 'resize', 'seeked', 'seeking', 'stalled', 'submit', 'suspend', 'timeUpdate', 'touchCancel', 'touchEnd', 'touchStart', 'volumeChange', 'scroll', 'toggle', 'touchMove', 'waiting', 'wheel'];</pre>
  遍历调用注册事件函数 registerSimpleEvent,
  <pre> for (var i = 0; i < simpleEventPluginEvents.length; i++) {
    var eventName = simpleEventPluginEvents[i];
    var domEventName = eventName.toLowerCase();
    var capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName, 'on' + capitalizedEvent);
  }</pre>
  然后注册其余事件包括focus等相关
  <pre>
    registerSimpleEvent(ANIMATION_END, 'onAnimationEnd');
    registerSimpleEvent(ANIMATION_ITERATION, 'onAnimationIteration');
    registerSimpleEvent(ANIMATION_START, 'onAnimationStart');
    registerSimpleEvent('dblclick', 'onDoubleClick');
    registerSimpleEvent('focusin', 'onFocus');
    registerSimpleEvent('focusout', 'onBlur');
    registerSimpleEvent(TRANSITION_END, 'onTransitionEnd');
  </pre>
  继续调用registerTwoPhaseEvent方法，注册捕获和冒泡两个阶段的事件
  <pre>
  function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + 'Capture', dependencies);
  }
  </pre>
  继续调用registerDirectEvent，生成allNativeEvents,以上都是react-dom进入自动开始执行的事件相关

3.调用ReactDOM.createRoot
  <pre>
    const container = document.getElementById("root");
    const root = ReactDOM.createRoot(container);
    root.render(<App />)
  </pre>
  <pre>
    // react-dom.development.js 28875行
    function createRoot(container, options) {
        // 去掉判断
        warnIfReactDOMContainerInDEV(container);
        var isStrictMode = false;
        var concurrentUpdatesByDefaultOverride = false;
        var identifierPrefix = '';
        // 去掉判断
        var root = createContainer(container, ConcurrentRoot, false, null, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix);
        markContainerAsRoot(root.current, container);
        var rootContainerElement = container.nodeType === COMMENT_NODE ? container.parentNode : container;
        listenToAllSupportedEvents(rootContainerElement);
        return new ReactDOMRoot(root);
    }
  </pre>
  进入createContainer,18之后默认的ConcurrentRoot=1(11730行)，调用createFiberRoot，创建FiberRoot
  内部调用createHostRootFiber，
  <pre>
    // 28282行
    function createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix) {
        var root = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix);

        var uninitializedFiber = createHostRootFiber(tag, isStrictMode);
        root.current = uninitializedFiber;
        uninitializedFiber.stateNode = root;
        {
            var _initialState = {
                element: null
            };
            uninitializedFiber.memoizedState = _initialState;
        }

        initializeUpdateQueue(uninitializedFiber);
        return root;
    }
  </pre>
  FiberRootNode.current=RootFiber
  RootFiber.stateNode=FiberRootNode
  接下来我们查看下FiberRootNode的构造函数
  <pre>
    var FunctionComponent = 0;
    var ClassComponent = 1;
    var IndeterminateComponent = 2; // Before we know whether it is function or class
    var HostRoot = 3; // Root of a host tree. Could be nested inside another node.
    var HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
    var HostComponent = 5;
    var HostText = 6;
    var Fragment = 7;
    var Mode = 8;
    var ContextConsumer = 9;
    var ContextProvider = 10;
    var ForwardRef = 11;
    var Profiler = 12;
    var SuspenseComponent = 13;
    var MemoComponent = 14;
    var SimpleMemoComponent = 15;
    var LazyComponent = 16;
    var IncompleteClassComponent = 17;
    var DehydratedFragment = 18;
    var SuspenseListComponent = 19;
    var ScopeComponent = 21;
    var OffscreenComponent = 22;
    var LegacyHiddenComponent = 23;
    var CacheComponent = 24;
    function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix) {
        this.tag = tag;  // tag=1
        this.containerInfo = containerInfo;  //渲染到什么节点
        this.pendingChildren = null; 
        this.current = null;
        this.pingCache = null;
        this.finishedWork = null;
        this.timeoutHandle = noTimeout;
        this.context = null;
        this.pendingContext = null;
        this.isDehydrated = hydrate;
        this.callbackNode = null;
        this.callbackPriority = NoLane;
        this.eventTimes = createLaneMap(NoLanes);
        this.expirationTimes = createLaneMap(NoTimestamp);
        this.pendingLanes = NoLanes;
        this.suspendedLanes = NoLanes;
        this.pingedLanes = NoLanes;
        this.expiredLanes = NoLanes;
        this.mutableReadLanes = NoLanes;
        this.finishedLanes = NoLanes;
        this.entangledLanes = NoLanes;
        this.entanglements = createLaneMap(NoLanes);
        this.identifierPrefix = identifierPrefix;

        {
            this.mutableSourceEagerHydrationData = null;
        }

        {
            this.effectDuration = 0;
            this.passiveEffectDuration = 0;
        }

        {
            this.memoizedUpdaters = new Set();
            var pendingUpdatersLaneMap = this.pendingUpdatersLaneMap = [];

            for (var i = 0; i < TotalLanes; i++) {
            pendingUpdatersLaneMap.push(new Set());
            }
        }

        {
            switch (tag) {
            case ConcurrentRoot:
                this._debugRootType = hydrate ? 'hydrateRoot()' : 'createRoot()';
                break;

            case LegacyRoot:
                this._debugRootType = hydrate ? 'hydrate()' : 'render()';
                break;
            }
        }
    }
  </pre>
  <pre>
    function createHostRootFiber(tag, isStrictMode, concurrentUpdatesByDefaultOverride) {
        var mode;
        if (tag === ConcurrentRoot) {
            mode = ConcurrentMode;
            if (isStrictMode === true) {
                mode |= StrictLegacyMode;

                {
                    mode |= StrictEffectsMode;
                }
            }
        } else {
            mode = NoMode;
        }
        // 删掉tool相关代码
        return createFiber(HostRoot, null, null, mode);
    }
    var createFiber = function (tag, pendingProps, key, mode) {
        return new FiberNode(tag, pendingProps, key, mode);
    };
  </pre>
  <pre>
    function FiberNode(tag, pendingProps, key, mode) {
        // Instance
        this.tag = tag; //标记不同的组件类型，最根本的交HostRoot,那么tag = 3
        this.key = key; // reactElement里面的key 
        this.elementType = null; // ReactElement.type,调用createElement的第一个参数(div,span等首字母小写的表示HostComponent,Button等首字母大写的表示React组件)
        this.type = null;
        this.stateNode = null; // Fiber

        this.return = null; // 指向当前fibernode的父级
        this.child = null;  // 指向当前fiberNode的第一个child
        this.sibling = null; // 指向当前fiberNode的下一个兄弟节点
        this.index = 0;
        this.ref = null; // ref相关属性
        this.pendingProps = pendingProps;  //即将更新的props
        this.memoizedProps = null; // 已经更新过的props
        this.updateQueue = null; //更新队列，改fiber对应的update都会放在这儿
        this.memoizedState = null; // 上一次渲染的state
        this.dependencies = null; // 
        this.mode = mode; // Effects 

        this.flags = NoFlags; 
        this.subtreeFlags = NoFlags;
        this.deletions = null;
        this.lanes = NoLanes;
        this.childLanes = NoLanes;
        this.alternate = null;

        {

            this.actualDuration = Number.NaN;
            this.actualStartTime = Number.NaN;
            this.selfBaseDuration = Number.NaN;
            this.treeBaseDuration = Number.NaN; // It's okay to replace the initial doubles with smis after initialization.
            this.actualDuration = 0;
            this.actualStartTime = -1;
            this.selfBaseDuration = 0;
            this.treeBaseDuration = 0;
        }

        {
            // This isn't directly used but is handy for debugging internals:
            this._debugSource = null;
            this._debugOwner = null;
            this._debugNeedsRemount = false;
            this._debugHookTypes = null;

            if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
                Object.preventExtensions(this);
            }
        }
    } 
  </pre>
  接下来调用 listenToAllSupportedEvents(内部处理各种事件绑定相关，源码8922行) ,然后返回 new ReactDOMRoot(root)  <br />
  ReactDOMRoot主要是原型链上的render和unmount，root=new ReactDOMRoot(root)<br />
  我们会在外部调用root.render(<App />),<br />
  render内调用updateContainer(children, root, null, null);<br />
  children=<App /> root=fiberRootNode <br />
  enqueueUpdate(current$1, update),current$1=RootFiber<br />
  把performConcurrentWorkOnRoot方法放入scheduler的任务队列中
  <pre>
    function createUpdate(eventTime, lane) {
        var update = {
            eventTime: eventTime,
            lane: lane,
            tag: UpdateState,
            payload: null,
            callback: null,
            next: null
        };
        return update;
    }
  </pre>

**scheduler.development.js**
scheduler是react的任务调度，时间切片等都依赖此js<br />
workLoop是核心函数，他不关心react  react-dom相关，只关心任务队列，以及任务优先级等东西
<pre>
function workLoop(hasTimeRemaining, initialTime) {
  var currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);

  // while循环 enableSchedulerDebugging是个变量 默认未false
  // 循环到currentTask为null或者enableSchedulerDebugging=true为止
  // taskQueue是使用优先级小顶堆算法排序的数组，peek取出的永远是优先级最高的任务
  // 
  while (currentTask !== null && !(enableSchedulerDebugging )) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      break;
    }
    var callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      var continuationCallback = callback(didUserCallbackTimeout);
      currentTime = exports.unstable_now();
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  } 
  if (currentTask !== null) {
    return true;
  } else {
    var firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}
</pre>
  
 


