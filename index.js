const canvasSize = { width: 1067, height: 600 };
const objectScale = 100;
let sidebar = { pos: 1, targetPos: 1 };
let celestialObjects = [];
let currentObject = null;
let creatingObject = false;

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
    textAlign(CENTER, CENTER);
    frameRate(60);
    objectType = new Select(Object.keys(objectTypes), onTypeChange, canvasSize.width - 200, 200);
    initializeStars(300);
    initializeSliders();
}

function draw() {
    scale(normalZoom);
    mouse = { X: pos(mouseX), Y: pos(mouseY) };

    background(15);
    drawBGStars(1/10);
    drawObjects();
    // rect(mouse.X-5, mouse.Y-5, 10, 10);
    if (creatingObject){
        previewObject(mouse.X, mouse.Y);
    }
    drawSidebar();
    reselectObject();
}

function mousePressed() {
    // sliders
    Object.entries(sliders).forEach(([_, slider]) => {slider.mousePressed()});
}

let mouseJustReleased = false;
function mouseReleased() {
    if (mouseJustReleased) return;
    mouseJustReleased = true;

    if (creatingObject && mouse.X > 5 && mouse.X < canvasSize.width - 205 && mouse.Y > 5 && mouse.Y < canvasSize.height - 5) {
        createObject();
        creatingObject = false;
        mouseJustReleased = false;
        return;
    }

    // sliders
    Object.entries(sliders).forEach(([_, slider]) => {
        if (slider.mouseReleased()) {
            mouseJustReleased = false;
            return;
        }
    });

    // object type select
    if (objectType.mouseReleased()) {
        mouseJustReleased = false;
        return;
    }

    
    setTimeout(() => {
        mouseJustReleased = false;
    }, 1000/getFrameRate() * 1.2);
}

let stars;
function initializeStars(numStars) {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push([
            Math.random() * canvasSize.width,
            Math.random() * canvasSize.height,
            Math.random() * 3
        ]);
    }
}
    
function drawBGStars(update=1/20) {
    fill(255);
    for (let i = 0; i < stars.length; i++) {
        if (Math.random() < update) {
            stars[i][0] = stars[i][0] + Math.random() - 0.5;
            stars[i][1] = stars[i][1] + Math.random() - 0.5;
            stars[i][2] = constrain(stars[i][2] + (Math.random() - 0.5)*0.5, 0.05, 3);

            // Wrap around
            stars[i][0] = (stars[i][0] + canvasSize.width) % canvasSize.width;
            stars[i][1] = (stars[i][1] + canvasSize.height) % canvasSize.height;
        }
        square(stars[i][0], stars[i][1], stars[i][2]);
    }
}

let sliders = {};
function initializeSliders() {
    const format = objectTypes[Object.keys(objectTypes)[0]];
    sliders.mass = new Slider(canvasSize.width - 180, 200, format.mass.min, format.mass.max);
    sliders.radius = new Slider(canvasSize.width - 180, 250, format.radius.min, format.radius.max);
}

function drawSidebar() {
    if (sidebar.pos !== sidebar.targetPos){
        sidebar.pos = lerp(sidebar.pos, sidebar.targetPos, 0.25);
        if (Math.abs(sidebar.pos - sidebar.targetPos) < 0.01) sidebar.pos = sidebar.targetPos;
        if (sidebar.pos == 0) currentObject = null;
    }

    // Open Sidebar Button
    const openButtonHovered = mouse.X > canvasSize.width - 50 && mouse.X < canvasSize.width - 50 + 60 && mouse.Y > 15 && mouse.Y < 15 + 30;
    fill(255);
    if (openButtonHovered) fill(128);
    rect(canvasSize.width - 50, 15, 60, 30, 10);
    fill(0);
    textSize(30);
    text("≡", canvasSize.width - 50, 12.5, 30, 30);
    if (openButtonHovered && mouseJustReleased) {
        sidebar.targetPos = 1;
    }


    // Sidebar background
    const sidebarPos = canvasSize.width - lerp(0, 200, sidebar.pos);
    fill(50);
    rect(sidebarPos, 0, 200, canvasSize.height);
    fill(255);
    textSize(15);
    text("Properties", sidebarPos + 100, 27.5);


    // Sidebar for when no celestial objects exist or none is selected
    if (celestialObjects.length === 0 || currentObject == null) {
        textSize(12);
        if (celestialObjects.length === 0) { text("No celestial objects created", sidebarPos + 10, 60, 180) }
        else if (currentObject == null) {  text("Select a celestial object to view details", sidebarPos + 10, 70, 180) }

        // create button
        const createButtonHovered = mouse.X > sidebarPos + 10 && mouse.X < sidebarPos + 10 + 180 && mouse.Y > 95 && mouse.Y < 95 + 30;
        fill(100, 200, 100);
        rect(sidebarPos + 10, 95, 180, 30, 7);
        textSize(13);
        fill(0);
        if (createButtonHovered) fill(255);
        text("Create a celestial object", sidebarPos + 10, 95, 180, 30);

        if (createButtonHovered && mouseJustReleased) {
            creatingObject = true;
            mouseJustReleased = false;
            sidebar.targetPos = 0;
        }


    } else { // object selected
        const obj = celestialObjects.find(o => o.id === currentObject);
        textSize(12);

        // sliders
        sliders.mass.draw(sidebarPos + 20, 130);
        obj.mass = sliders.mass.value;

        sliders.radius.draw(sidebarPos + 20, 175);
        obj.radius = sliders.radius.value;

        fill(200);
        text(`Mass: ${obj.mass} M☉`, sidebarPos + 100, 155);
        text(`Radius: ${obj.radius} R☉`, sidebarPos + 100, 200);
        
        text("Type", sidebarPos + 100, 80);
        objectType.draw(sidebarPos + 30, 90);
        obj.selected = objectType.selected;

        // delete button
        const deleteButtonHovered = mouse.X > sidebarPos + 10 && mouse.X < sidebarPos + 10 + 180 && mouse.Y > canvasSize.height - 75 && mouse.Y < canvasSize.height - 75 + 30;
        fill(200, 70, 70);
        rect(sidebarPos + 10, canvasSize.height - 75, 180, 30, 7);
        textSize(13);
        fill(0);
        if (deleteButtonHovered) fill(255);
        text("Delete", sidebarPos + 10, canvasSize.height - 75, 180, 30);
        if (deleteButtonHovered && mouseJustReleased) {
            celestialObjects = celestialObjects.filter(o => o.id !== currentObject);
            currentObject = null;
            mouseJustReleased = false;
        }

        // what is M☉
        textSize(10);
        fill(200);
        text("M☉ = Solar Mass (1.989 x 10^30 kg)", sidebarPos + 100, canvasSize.height - 30);
        text("R☉ = Solar Radius (6.963 x 10^5 km)", sidebarPos + 100, canvasSize.height - 15);
    }

    // Close button
    const buttonHovered = mouse.X > sidebarPos + 15 && mouse.X < sidebarPos + 15 + 25 && mouse.Y > 15 && mouse.Y < 15 + 25;
    fill(170, 20, 20);
    rect(sidebarPos + 15, 15, 25, 25, 5);
    fill(255);
    if (buttonHovered) fill(0);
    text("X", sidebarPos + 15, 15, 25, 25);
    if (buttonHovered && mouseJustReleased) {
        sidebar.targetPos = 0;
    }

    if (mouse.X > sidebarPos && sidebar.targetPos == 1) mouseJustReleased = false;
}

let objCounter = 0;
function createObject() {
    const defaultObj = {
        id: objCounter++,
        name: "Celestial Object #" + objCounter,
        position: { x: mouse.X, y: mouse.Y },
        mass: 30,
        radius: 10,
        type: 0,
    };
    sliders.mass.value = defaultObj.mass;
    sliders.radius.value = defaultObj.radius;
    objectType.selection = defaultObj.selection;
    celestialObjects.push(defaultObj);
    currentObject = objCounter - 1;

    sidebar.targetPos = 1;
}


function drawObjects() {
    push();
    fill(200, 200, 0);
    stroke(250, 200, 0);
    for (let obj of celestialObjects) {
        if (obj.id === currentObject) {
            strokeWeight(2);
        } else {
            strokeWeight(0);
        }
        circle(obj.position.x, obj.position.y, obj.radius * 2 * objectScale);
    }
    pop();
}

function previewObject(x, y) {
    fill(200, 50, 0, 150);
    if (mouse.X > 5 && mouse.X < canvasSize.width - 205 && mouse.Y > 5 && mouse.Y < canvasSize.height - 5) fill(200, 200, 0, 150);
    circle(x, y, 20);
    
    textSize(17);
    fill(255);
    text("Click anywhere to place a planet/star", canvasSize.width/2, 20);
}

function reselectObject() {
    if (!mouseJustReleased) return;
    for (let obj of celestialObjects) {
        if (dist(mouse.X, mouse.Y, obj.position.x, obj.position.y) <= obj.radius) {
            sliders.mass.value = obj.mass;
            sliders.radius.value = obj.radius;
            objectType.selected = obj.selected;
            currentObject = obj.id;
            sidebar.targetPos = 1;
            return;
        }
    }
    currentObject = null;
}

function onTypeChange(option) {
    const format = objectTypes[option];

    sliders.radius.min = format.radius.min;
    sliders.radius.max = format.radius.max;
    sliders.radius.decimalPlaces = Math.max(decimalPlaces(format.radius.min), decimalPlaces(format.radius.max));

    sliders.mass.min = format.mass.min;
    sliders.mass.max = format.mass.max;
    sliders.mass.decimalPlaces = Math.max(decimalPlaces(format.mass.min), decimalPlaces(format.mass.max));
}