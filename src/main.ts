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
    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2.5,0,2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

class stickerDisplay {
    private x: number;
    private y: number;
    private sticker: string;
    constructor(x: number, y: number, sticker: string){
        this.x = x;
        this.y = y;
        this.sticker = sticker
    }
    updatePos(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.font = "22px Arial";
        ctx.fillText(this.sticker, this.x, this.y);
    }
}
class Sticker{
    private x: number;
    private y: number;
    private sticker: string;
    constructor(x: number, y: number, sticker: string){
        this.x = x;
        this.y = y;
        this.sticker = sticker
    }
    drag(x: number, y: number){
        this.x = x;
        this.y = y;
    }
    display(ctx: CanvasRenderingContext2D){
        ctx.font = "22px Arial";
        ctx.fillText(this.sticker, this.x, this.y);
    }
}

// Line Initialization

const thinWidth = 2;
const thickWidth = 7;
let linesList: (markerCommand|Sticker)[] = [];
let redoList: (markerCommand|Sticker)[] = [];
let currentLine: markerCommand | null = null;
let currentSticker: Sticker | null = null;
let currentWidth = thinWidth;
let currentStickerItem: string | null = null;
let mousePreview: mouseDisplay | stickerDisplay | null = null;

const stickers = ["🧩","🍉","🐲"];
const stickerButtons: HTMLButtonElement[] = []

let isDrawing = false;

function createStickersButton(sticker: string){
    const button = document.createElement("button");
    button.innerHTML = sticker;
    app.appendChild(button);
    button.addEventListener("click", () => {
        isDrawing = false;
        currentStickerItem = sticker;
        button.classList.add("selectedTool");
        thinButton.classList.remove("selectedTool");
        thickButton.classList.remove("selectedTool");
        stickerButtons.forEach((otherButton) => {
            if(otherButton != button){
                otherButton.classList.remove("selectedTool");
            }
        })
        canvasElement.dispatchEvent(new Event("tool-moved"));
    })
    return button;  
}

canvasElement.addEventListener("mousedown", (e) => {
    if(!currentStickerItem){
        isDrawing = true;
        currentLine = new markerCommand(e.offsetX, e.offsetY, currentWidth);
        redoList = [];
        mousePreview = null;
        linesList.push(currentLine);
    } else{
        currentSticker = new Sticker(e.offsetX, e.offsetY, currentStickerItem);
        linesList.push(currentSticker);
        redoList = [];
        mousePreview = null;
    }
})

canvasElement.addEventListener("mouseup", () => {
    isDrawing = false;
    currentLine = null;
    currentSticker = null;
    canvasElement.dispatchEvent(new Event("drawing-changed"));
})

canvasElement.addEventListener("mousemove", (pos)=> {
    const position = {x: pos.offsetX, y: pos.offsetY};
    if (!isDrawing && ctx){
        if(currentStickerItem){
            if(!mousePreview){
                mousePreview = new stickerDisplay(position.x, position.y, currentStickerItem);
            } else{
                mousePreview.updatePos(position.x,position.y);
            }
        } else{
            if(!mousePreview){
                mousePreview = new mouseDisplay(position.x, position.y, currentWidth);
            } else{
                mousePreview.updatePos(position.x,position.y);
            }
        }
        canvasElement.dispatchEvent(new Event("tool-moved"));
    } else if (isDrawing && currentLine){
        currentLine.drag(position.x, position.y);
        canvasElement.dispatchEvent(new Event("drawing-changed"));
    } else if (currentSticker){
        currentSticker.drag(position.x, position.y);
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
    currentWidth = thinWidth;
    currentStickerItem = null;
    isDrawing = false;
    thinButton.classList.add("selectedTool");
    thickButton.classList.remove("selectedTool");
    stickerButtons.forEach((button) => {
        button.classList.remove("selectedTool")
    });
    canvasElement.dispatchEvent(new Event("tool-moved"));
})

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
app.appendChild(thickButton);
thickButton.addEventListener("click", () => {
    currentWidth = thickWidth;
    currentStickerItem = null;
    isDrawing = false;
    thickButton.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");
    stickerButtons.forEach((button) => {
        button.classList.remove("selectedTool")
    });
    canvasElement.dispatchEvent(new Event("tool-moved"));
})

stickers.forEach((sticker) => {
    const button = createStickersButton(sticker);
    stickerButtons.push(button);
    app.appendChild(button);
})

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Custom Sticker";
app.appendChild(customStickerButton);
customStickerButton.addEventListener("click", () => {
    isDrawing = false;
    const customSticker = prompt("Custom Sticker", "🙂");
    if(customSticker){
        stickers.push(customSticker);
        currentStickerItem = customSticker
        const button = createStickersButton(customSticker);
        stickerButtons.push(button);
        app.appendChild(button);
    }

    canvasElement.dispatchEvent(new Event("tool-moved"));
})

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
app.appendChild(exportButton);
exportButton.addEventListener("click", () => {
    const canvasExport = document.createElement("canvas");
    
    canvasExport.width = 1024;
    canvasExport.height = 1024;

    const ctxExport = canvasExport.getContext("2d");
    if(ctxExport){
        ctxExport.scale(4,4);
        ctxExport.fillStyle = "white";
        ctxExport.fillRect(0,0,canvasExport.width,canvasExport.height);
        for (const line of linesList) {
            line.display(ctxExport);
        }
        const anchor = document.createElement("a");
        anchor.href = canvasExport.toDataURL("image/png");
        anchor.download = "sketchpad.png";
        anchor.click();
    }
})