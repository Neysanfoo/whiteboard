let drawColour = "black";
let drawWidth = 5;
let whiteboardColour = "white";

window.addEventListener("resize", resizeCanvas, false);
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 100;
  context.lineJoin = "round";
  context.lineCap = "round";
  if (index > -1) {
    context.putImageData(undoStack[index], 0, 0);
  }
}

// Select Pen Colour
function changeColour(element) {
  drawColour = element.style.background;
}

function clearCanvas() {
  context.fillStyle = whiteboardColour;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  index = -1;
}

let undoStack = [];
let redoStack = [];
let index = -1;

function undoLast() {
  if (index <= 0) {
    redoStack.push(undoStack.pop());
    clearCanvas();
  } else {
    index -= 1;
    redoStack.push(undoStack.pop());
    context.putImageData(undoStack[index], 0, 0);
  }
  console.log("undo stack:", undoStack);
  console.log("redo stack: ", redoStack);
}

// Keybindings for undo and redo
Mousetrap.bind(["ctrl+z", "command+z"], function () {
  undoLast();
});
Mousetrap.bind(["ctrl+shift+z", "command+shift+z"], function () {
  redoLast();
});

function redoLast() {
  if (redoStack.length != 0) {
    undoStack.push(redoStack.pop());
    index += 1;
    console.log(redoStack);
    context.putImageData(undoStack[index], 0, 0);
  }
}

const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

canvas.height = window.innerHeight - 100;
canvas.width = window.innerWidth;
context.fillStyle = whiteboardColour;
context.fillRect(0, 0, canvas.width, canvas.height);

let isDown = false;
let points = [];
let beginPoint = null;

context.lineJoin = "round";
context.lineCap = "round";

canvas.addEventListener("mousedown", down, false);
canvas.addEventListener("mousemove", move, false);
canvas.addEventListener("mouseup", up, false);
canvas.addEventListener("mouseout", up, false);

function down(evt) {
  isDown = true;
  const { x, y } = getPos(evt);
  points.push({ x, y });
  beginPoint = { x, y };
  drawLine(beginPoint, beginPoint, beginPoint);
}

function move(evt) {
  if (!isDown) return;

  const { x, y } = getPos(evt);
  points.push({ x, y });

  if (points.length > 3) {
    const lastTwoPoints = points.slice(-2);
    const controlPoint = lastTwoPoints[0];
    const endPoint = {
      x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
      y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
    };
    drawLine(beginPoint, controlPoint, endPoint);
    beginPoint = endPoint;
  }
}

function up(evt) {
  if (!isDown) return;
  const { x, y } = getPos(evt);
  points.push({ x, y });

  if (points.length > 3) {
    const lastTwoPoints = points.slice(-2);
    const controlPoint = lastTwoPoints[0];
    const endPoint = lastTwoPoints[1];
    drawLine(beginPoint, controlPoint, endPoint);
  }
  beginPoint = null;
  isDown = false;
  points = [];

  undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
  index += 1;
  redoStack = [];
  console.log("undoStack: ", undoStack);
  console.log("redoStack: ", redoStack);
}

function getPos(evt) {
  return {
    x: evt.clientX,
    y: evt.clientY,
  };
}

function drawLine(beginPoint, controlPoint, endPoint) {
  context.beginPath();
  context.lineWidth = drawWidth;
  context.strokeStyle = drawColour;
  context.moveTo(beginPoint.x, beginPoint.y);
  context.quadraticCurveTo(
    controlPoint.x,
    controlPoint.y,
    endPoint.x,
    endPoint.y
  );
  context.stroke();
  context.closePath();
}
