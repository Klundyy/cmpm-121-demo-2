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
canvasElement.style.cursor = "none";
app.appendChild(canvasElement);

const ctx = canvasElement.getContext("2d");

class markerCommand {
    private points: {x: number, y : number}[] = [];
    private lineWidth: number;
    constructor(initX : number, initY : number, lineWidth: number){
        this.points.push({x: initX, y: initY});
        this.lineWidth = lineWidth;
    }
    drag(x: number, y: number){
        this.points.push({x, y});
    }
    display(ctx: CanvasRenderingContext2D){
        if(this.points.length > 0){
            ctx.beginPath();
            ctx.lineWidth = this.lineWidth;
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (const position of this.points) {
                ctx.lineTo(position.x, position.y);
            }
            ctx.stroke();
        }

    }
}

class mouseDisplay {
    private x: number;
    private y: number;
    private width: number;
    constructor(x: number, y: number, width: number){
        this.x = x;
        this.y = y;
        this.width = width
    }
    updatePos(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    updateSize(width: number){
        this.width = width;
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2,0,2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

// Line Initialization

let linesList: markerCommand[] = [];
let redoList: markerCommand[] = [];
let currentLine: markerCommand | null = null;
let currentWidth = 2;
let mousePreview: mouseDisplay | null = null;

let isDrawing = false;

canvasElement.addEventListener("mousedown", (e) => {
    isDrawing = true;
    currentLine = new markerCommand(e.offsetX, e.offsetY, currentWidth);
    redoList = [];
    mousePreview = null;
    linesList.push(currentLine);   
})

canvasElement.addEventListener("mouseup", () => {
    isDrawing = false;
    currentLine = null;
    canvasElement.dispatchEvent(new Event("drawing-changed"));
})

canvasElement.addEventListener("mousemove", (pos)=> {
    const position = {x: pos.offsetX, y: pos.offsetY};
    if (!isDrawing && ctx){
        if(!mousePreview){
            mousePreview = new mouseDisplay(position.x, position.y, currentWidth);
        } else{
            mousePreview.updatePos(position.x,position.y);
            mousePreview.updateSize(currentWidth);
        }
        canvasElement.dispatchEvent(new Event("tool-moved"));
    } else if (isDrawing && currentLine){
        currentLine.drag(position.x, position.y);
        canvasElement.dispatchEvent(new Event("drawing-changed"));
    }
})

canvasElement.addEventListener("drawing-changed", () => {
    if (ctx){
        ctx.clearRect(0,0,canvasElement.width, canvasElement.height);
        for (const line of linesList) {
            line.display(ctx);
        }
    }
});

canvasElement.addEventListener("tool-moved", () => {
    if(ctx && mousePreview){
        ctx.clearRect(0,0,canvasElement.width, canvasElement.height);
        for (const line of linesList) {
            line.display(ctx);
        }
        mousePreview.draw(ctx);
    }
});

// Buttons

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.appendChild(clearButton);
clearButton.addEventListener("click", () => {
    isDrawing = false;
    ctx?.clearRect(0,0, canvasElement.width, canvasElement.height)
    linesList = [];
    canvasElement.dispatchEvent(new Event("drawing-changed"));
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.appendChild(undoButton);
undoButton.addEventListener("click", () => {
    isDrawing = false;
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
    isDrawing = false;
    if(redoList.length > 0){
        const line = redoList.pop();
        if(line){
            linesList.push(line);
        }
        canvasElement.dispatchEvent(new Event("drawing-changed"));
    }
})

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
thinButton.classList.add("selectedTool");
app.appendChild(thinButton);
thinButton.addEventListener("click", () => {
    currentWidth = 2;
    isDrawing = false;
    thinButton.classList.add("selectedTool");
    thickButton.classList.remove("selectedTool");
})

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
app.appendChild(thickButton);
thickButton.addEventListener("click", () => {
    currentWidth = 5;
    isDrawing = false;
    thickButton.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");
})