const canvasSize = { width: 900, height: 600 };
let sidebar = { pos: 1, targetPos: 1 };

let normalZoom;
let mouse = { X: 0, Y: 0 };
function windowResized() {    
    if (windowWidth < windowHeight) {
        normalZoom = windowWidth / canvasSize.width;
    } else {
        // height is smaller
        normalZoom = windowHeight / canvasSize.height;
        if (normalZoom * canvasSize.width > windowWidth) {
            normalZoom = windowWidth / canvasSize.width;
        }
    }

    normalZoom *= 0.95;
    resizeCanvas(canvasSize.width * normalZoom, canvasSize.height * normalZoom);
}
const pos = (val) => 1 / normalZoom * val; // normalized position




function setup() {
    createCanvas(1, 1);
    windowResized();
    textAlign(CENTER);
    frameRate(60);
}

function draw() {
    scale(normalZoom);
    mouse = { X: pos(mouseX), Y: pos(mouseY) };

    background(0);
    rect(mouse.X, mouse.Y, 50, 50);
    drawSidebar();
}

let mouseJustReleased = false;
function mouseReleased() {
    if (mouseJustReleased) return;
    mouseJustReleased = true;

    
    setTimeout(() => {
        mouseJustReleased = false;
    }, 1000/getFrameRate() * 0.9); // Reset after 0.9 frames
}
// function mousePressed() {
//     console.log(mouse.X, mouse.Y);
// }


function drawSidebar() {
    if (sidebar.pos !== sidebar.targetPos){
        sidebar.pos = lerp(sidebar.pos, sidebar.targetPos, 0.2);
        if (Math.abs(sidebar.pos - sidebar.targetPos) < 0.05) sidebar.pos = sidebar.targetPos;
    }

    // Open Sidebar Button
    const openButtonHovered = mouse.X > canvasSize.width - 50 && mouse.X < canvasSize.width - 50 + 60 && mouse.Y > 15 && mouse.Y < 15 + 30;
    fill(255);
    if (openButtonHovered) fill(128);
    rect(canvasSize.width - 50, 15, 60, 30, 10);
    fill(0);
    textSize(25);
    text("≡", canvasSize.width - 32.5, 37.5);
    if (openButtonHovered && mouseJustReleased) {
        sidebar.targetPos = 1;
    }


    // Sidebar background
    const sidebarPos = canvasSize.width - lerp(0, 200, sidebar.pos);
    fill(50);
    rect(sidebarPos, 0, 200, canvasSize.height);
    fill(255);
    textSize(15);
    text("Sidebar", sidebarPos + 100, 30);


    // Close button
    const buttonHovered = mouse.X > sidebarPos + 15 && mouse.X < sidebarPos + 15 + 25 && mouse.Y > 15 && mouse.Y < 15 + 25;
    fill(170, 20, 20);
    rect(sidebarPos + 15, 15, 25, 25);
    fill(255);
    if (buttonHovered) fill(0);
    text("X", sidebarPos + 15 + 25/2, 20 + 25/2);
    if (buttonHovered && mouseJustReleased) {
        sidebar.targetPos = 0;
    }
}