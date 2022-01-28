import React from "react";

function App() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    console.log("123");
  }, []);

  function buttonClick() {
    debugger;
    setCount(count + 1);
  }

  return (
    <div>
      <h1>Hello World {count}</h1>
      <button onClick={buttonClick}>点击</button>
    </div>
  );
}

export default App;
