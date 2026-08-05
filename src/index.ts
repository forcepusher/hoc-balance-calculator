import { BalanceCalculator } from "./BalanceCalculator.js";

const applicationViewportDiv = document.createElement('div');
applicationViewportDiv.style = 'width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden;';
document.body.appendChild(applicationViewportDiv);

const videoPlayer = new BalanceCalculator(applicationViewportDiv);
videoPlayer.run();
