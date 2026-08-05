// src/BalanceCalculator.ts
var BalanceCalculator = class {
  constructor(parentElement) {
  }
  run() {
  }
};

// src/index.ts
var applicationViewportDiv = document.createElement("div");
applicationViewportDiv.style = "width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden;";
document.body.appendChild(applicationViewportDiv);
var videoPlayer = new BalanceCalculator(applicationViewportDiv);
videoPlayer.run();
