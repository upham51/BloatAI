import React from "react";

const CounterLoader = () => {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <div className="counter-grid">
        <div id="div1"></div>
        <div id="div2"></div>
        <div id="div3"></div>
        <div id="div4"></div>
        <div id="div5"></div>
        <div id="div6"></div>
        <div id="div7"></div>
        <div id="div8"></div>
        <div id="div9"></div>
        <div id="div10"></div>
        <div id="div11"></div>
        <div id="div12"></div>
        <div id="div13"></div>
        <div id="div14"></div>
        <div id="div15"></div>
      </div>
      <p className="mt-6 text-sm font-medium text-foreground/80 animate-pulse">Analyzing your meal...</p>
    </div>
  );
};

export default CounterLoader;
