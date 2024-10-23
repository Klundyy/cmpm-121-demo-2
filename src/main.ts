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


let linesList: {x: number, y: number}[][] = [];
let redoList: {x: number, y: number}[][] = [];
let currentLine: {x: number, y: number}[] = [];

let isDrawing = false;

canvasElement.addEventListener("mousedown", () => {
    isDrawing = true;
    currentLine = [];
    redoList = [];
    linesList.push(currentLine);   
})

canvasElement.addEventListener("mouseup", () => {
    isDrawing = false;
    canvasElement.dispatchEvent(new Event("drawing-changed"));
})

canvasElement.addEventListener("mousemove", (pos)=> {
    if (isDrawing){
        const position = {x: pos.offsetX, y: pos.offsetY};
        currentLine.push(position);
        canvasElement.dispatchEvent(new Event("drawing-changed"));
    }
})

canvasElement.addEventListener("drawing-changed", () => {
    if (ctx){
        ctx.clearRect(0,0,canvasElement.width, canvasElement.height);
        ctx.beginPath();
        for (const line of linesList) {
            if (line.length > 0) {
                ctx.moveTo(line[0].x, line[0].y);
                for (const position of line) {
                ctx.lineTo(position.x, position.y);
                }
            }
        }
        ctx.stroke();
    }
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.appendChild(undoButton);
undoButton.addEventListener("click", () => {
    if(linesList.length > 0){
        const line = linesList.pop();
        if(line){
            redoList.push(line);
        }
        canvasElement.dispatchEvent(new Event("drawing-changed"));
    }
})

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.appendChild(redoButton);
redoButton.addEventListener("click", () => {
    if(redoList.length > 0){
        const line = redoList.pop();
        if(line){
            linesList.push(line);
        }
        canvasElement.dispatchEvent(new Event("drawing-changed"));
    }
})

clearButton.addEventListener("click", () => {
    ctx?.clearRect(0,0, canvasElement.width, canvasElement.height)
    linesList = [];
    canvasElement.dispatchEvent(new Event("drawing-changed"));
});