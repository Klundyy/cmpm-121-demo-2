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

class markerCommand {
    private points: {x: number, y : number}[] = [];
    constructor(initX : number, initY : number){
        this.points.push({x: initX, y: initY});
    }
    drag(x: number, y: number){
        this.points.push({x, y});
    }
    display(ctx: CanvasRenderingContext2D){
        if(this.points.length > 0){
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (const position of this.points) {
                ctx.lineTo(position.x, position.y);
            }
            ctx.stroke();
        }

    }
}

let linesList: markerCommand[] = [];
let redoList: markerCommand[] = [];
let currentLine: markerCommand | null = null;

let isDrawing = false;

canvasElement.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentLine = new markerCommand(e.offsetX, e.offsetY);
    redoList = [];
    linesList.push(currentLine);   
})

canvasElement.addEventListener("mouseup", () => {
    isDrawing = false;
    currentLine = null;
    canvasElement.dispatchEvent(new Event("drawing-changed"));
})

canvasElement.addEventListener("mousemove", (pos)=> {
    if (!isDrawing || !currentLine) return;
    const position = {x: pos.offsetX, y: pos.offsetY};
    currentLine.drag(position.x, position.y);
    canvasElement.dispatchEvent(new Event("drawing-changed"));
})

canvasElement.addEventListener("drawing-changed", () => {
    if (ctx){
        ctx.clearRect(0,0,canvasElement.width, canvasElement.height);
        for (const line of linesList) {
            line.display(ctx);
        }
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