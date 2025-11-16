const canvas = { width: 900, height: 600 };

let normalZoom;
function windowResized() {    
    if (windowWidth < windowHeight) {
        normalZoom = windowWidth / canvas.width;
    } else {
        // height is smaller
        normalZoom = windowHeight / canvas.height;
        if (normalZoom * canvas.width > windowWidth) {
            normalZoom = windowWidth / canvas.width;
        }
    }

    normalZoom *= 0.95;
    resizeCanvas(canvas.width * normalZoom, canvas.height * normalZoom);
}
const pos = (val) => 1 / normalZoom * val; // normalized position




function setup() {
    createCanvas(1, 1);
    windowResized();
}

function draw() {
    scale(normalZoom);
    background(0);
    rect(pos(mouseX), pos(mouseY), 50, 50);
}