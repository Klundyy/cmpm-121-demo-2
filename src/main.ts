import "./style.css";

const APP_NAME = "Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const titleHeader = document.createElement("h1");
titleHeader.textContent = APP_NAME;
app.appendChild(titleHeader);

const canvasElement = document.createElement("canvas");
canvasElement.width = 256;
canvasElement.height = 256;
canvasElement.id = "canvas";
app.appendChild(canvasElement);

const ctx = canvasElement.getContext("2d");

let isDrawing = false;

canvasElement.addEventListener("mousedown", () => {
    isDrawing = true;
})

canvasElement.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx?.beginPath();
})

canvasElement.addEventListener("mousemove", (pos)=> {
    if (isDrawing){
        ctx?.lineTo(pos.offsetX, pos.offsetY);
        ctx?.stroke();
        ctx?.beginPath();
        ctx?.moveTo(pos.offsetX,pos.offsetY);
    }
})

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.appendChild(clearButton);

clearButton.addEventListener("click", () => {
    ctx?.clearRect(0,0, canvasElement.width, canvasElement.height)
});