import { ConfigTablesApp } from "./ConfigTablesApp.js";

const applicationViewportDiv = document.createElement('div');
applicationViewportDiv.style = 'width: 100vw; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px 0; box-sizing: border-box; position: relative;';
document.body.appendChild(applicationViewportDiv);

new ConfigTablesApp(applicationViewportDiv);
