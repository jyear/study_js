function genData() {
  const result = [];
  const inputNum = document.querySelector("#renderCount").value;
  const num = inputNum * 1 ? inputNum * 1 * 10000 : 100000;
  for (let i = 0; i < num; i++) {
    result.push({
      name: Math.random(),
      key: i,
    });
  }
  return result;
}
const clearContainer = () => {
  document.querySelector("#container").innerHTML = "";
  document.querySelector("#renderInfo").innerHTML = "";
};

// 对切片出来的数据进行渲染
const sliceRender = (data) => {
  const domFragement = document.createDocumentFragment();
  data.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `${item.key}--${item.name}`;
    domFragement.appendChild(div);
  });

  return domFragement;
};

// 切片渲染
const renderBigData = () => {
  clearContainer();
  const data = genData();
  let renderKey = 0;
  let renderCount = 0;
  let useTime = 0;
  const dataLength = data.length;
  const renderSlickLength = 1000; // 每片的数据长度
  const times = [];
  let startTime = 0;
  function doRender() {
    const end =
      renderKey + renderSlickLength > dataLength
        ? dataLength
        : renderKey + renderSlickLength;

    const currentData = data.slice(renderKey, end);
    const renderer = () => {
      startTime = new Date().getTime();
      renderCount += 1;
      console.log(`RequestAnimationFrame: ${renderCount}-${end}`);
      const fragment = sliceRender(currentData);
      document.querySelector("#container").appendChild(fragment);
      renderKey = end;
      const endT = new Date().getTime();
      useTime = useTime + (endT - startTime);
      times.push(endT - startTime);
      if (end === dataLength) {
        const str = `占用渲染进程时长：${useTime}ms,每次渲染占用时长${times.join(
          "-"
        )}ms, 总共渲染：${data.length}条数据`;
        document.querySelector("#renderInfo").innerHTML = str;
        return;
      }
      doRender();
    };
    window.requestAnimationFrame(renderer);
  }
  doRender();
};

// 直接渲染
const directRender = () => {
  clearContainer();
  const data = genData();
  const start = new Date().getTime();
  console.log(`开始渲染：${start}`);
  const res = [];
  data.forEach((item) => {
    res.push(`<div>${item.key}--${item.name}</div>`);
  });
  document.querySelector("#container").innerHTML = res.join("");
  window.requestIdleCallback(() => {
    const end = new Date().getTime();
    console.log(`结束渲染：${end}`);
    const str = `占用渲染进程时长：${end - start}ms, 总共渲染：${
      data.length
    }条数据`;
    document.querySelector("#renderInfo").innerHTML = str;
  });
};
