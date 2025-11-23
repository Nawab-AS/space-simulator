const canvasSize = { width: 1067, height: 600 };
const objectScale = 100;
let sidebar = { pos: 1, targetPos: 1 };
let celestialObjects = [];
let currentObject = null;
let creatingObject = false;
let G = 0.1; // gravity constant


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
    initializeStars(500);
    initializeSliders();
}

function draw() {
    scale(normalZoom);
    mouse = { X: pos(mouseX), Y: pos(mouseY) };

    background(15);
    drawBGStars(1/20);
    if (simulate) simulateObjects();
    drawObjects();
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
    if (objectType.mouseReleased() && currentObject && currentObject.type == 0) {
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
            stars[i][0] = stars[i][0] + Math.random()*1.5 - 0.75;
            stars[i][1] = stars[i][1] + Math.random()*1.5 - 0.75;
            stars[i][2] = constrain(stars[i][2] + (Math.random() - 0.5)*0.5, 0.05, 3);

            // Wrap around
            stars[i][0] = (stars[i][0] + canvasSize.width) % canvasSize.width;
            stars[i][1] = (stars[i][1] + canvasSize.height) % canvasSize.height;
        }
        square(stars[i][0], stars[i][1], stars[i][2]);
    }
}

let sliders = {};
let timeScale = 1;
function initializeSliders() {
    const format = objectTypes[Object.keys(objectTypes)[0]];
    sliders.mass = new Slider(canvasSize.width - 180, 200, format.mass.min, format.mass.max);
    sliders.radius = new Slider(canvasSize.width - 180, 250, format.radius.min, format.radius.max);
    sliders.time = new Slider(canvasSize.width - 180, 300, 1, 100);
    sliders.time.value = 1;
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

    // Time slider: always visible if there are at least 2 objects and simulation is enabled
    if (celestialObjects.length >= 2 && simulate) {
        textSize(13);
        fill(220);
        text("Time Scale", sidebarPos + 100, 340);
        sliders.time.draw(sidebarPos + 20, 350);
        timeScale = sliders.time.value;
        textSize(11);
        fill(180);
        text(`x${timeScale}`, sidebarPos + 100, 370);
    }


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

        // Simulation toggle button (visible even when no object selected)
        const simButtonY = 135;
        const simButtonHovered = mouse.X > sidebarPos + 10 && mouse.X < sidebarPos + 10 + 180 && mouse.Y > simButtonY && mouse.Y < simButtonY + 30;
        const canToggleSim = celestialObjects.length >= 2;
        if (canToggleSim) fill(simulate ? 200 : 100, 200, 100);
        else fill(120);
        rect(sidebarPos + 10, simButtonY, 180, 30, 7);
        textSize(13);
        fill(0);
        if (!canToggleSim) fill(180);
        if (simButtonHovered && mouseJustReleased && canToggleSim) {
            simulate = !simulate;
            mouseJustReleased = false;
        }
        text(simulate ? "Pause Simulation" : "Start Simulation", sidebarPos + 10, simButtonY, 180, 30);
        if (!canToggleSim) {
            textSize(10);
            fill(200);
            text("Need at least 2 objects", sidebarPos + 100, simButtonY + 45);
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
        const deleteButtonHovered = mouse.X > sidebarPos + 10 && mouse.X < sidebarPos + 10 + 180 && mouse.Y > canvasSize.height - 90 && mouse.Y < canvasSize.height - 90 + 30;
        fill(200, 70, 70);
        rect(sidebarPos + 10, canvasSize.height - 90, 180, 30, 7);
        textSize(13);
        fill(0);
        if (deleteButtonHovered) fill(255);
        text("Delete", sidebarPos + 10, canvasSize.height - 90, 180, 30);
        if (deleteButtonHovered && mouseJustReleased) {
            celestialObjects = celestialObjects.filter(o => o.id !== currentObject);
            currentObject = null;
            if (celestialObjects.length < 2) simulate = false;
            mouseJustReleased = false;
        }

        // Simulation toggle button (also visible when an object is selected)
        const simButtonY2 = canvasSize.height - 140;
        const simButtonHovered2 = mouse.X > sidebarPos + 10 && mouse.X < sidebarPos + 10 + 180 && mouse.Y > simButtonY2 && mouse.Y < simButtonY2 + 30;
        const canToggleSim2 = celestialObjects.length >= 2;
        if (canToggleSim2) fill(simulate ? 200 : 100, 200, 100);
        else fill(120);
        rect(sidebarPos + 10, simButtonY2, 180, 30, 7);
        textSize(13);
        fill(0);
        if (!canToggleSim2) fill(180);
        if (simButtonHovered2 && mouseJustReleased && canToggleSim2) {
            simulate = !simulate;
            mouseJustReleased = false;
        }
        text(simulate ? "Pause Simulation" : "Start Simulation", sidebarPos + 10, simButtonY2, 180, 30);
        if (!canToggleSim2) {
            textSize(10);
            fill(200);
            text("Need at least 2 objects", sidebarPos + 100, simButtonY2 + 45);
        }

        // what is M☉
        textSize(10);
        fill(200);
        text("M☉ = Solar Mass (1.989 x 10^30 kg)", sidebarPos + 100, canvasSize.height - 45);
        text("R☉ = Solar Radius (6.963 x 10^5 km)", sidebarPos + 100, canvasSize.height - 30);
        text("L☉ = Solar Radius (3.828 x 10^26 W)", sidebarPos + 100, canvasSize.height - 15);
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
        position: { x: mouse.X, y: mouse.Y },
        velocity: { x: 0, y: 0 },
        mass: 30,
        radius: 0.5,
        type: 0,
    };
    sliders.mass.value = defaultObj.mass;
    sliders.radius.value = defaultObj.radius;
    objectType.selected = defaultObj.type || 0;
    celestialObjects.push(defaultObj);
    currentObject = objCounter - 1;

    sidebar.targetPos = 1;
}


function drawObjects() {
    push();
    strokeWeight(0);
    for (const obj of celestialObjects) {
        if (obj.selected == 0) { // star
            fill(200, 200, 0);
        } else { // planet
            fill(139, 69, 19);
        }
        circle(obj.position.x, obj.position.y, obj.radius * 2 * objectScale);
    }

    if (currentObject != null) {
        const obj = celestialObjects.find(o => o.id === currentObject);
        if (typeof obj === 'undefined') {
            pop();
            return;
        }
        if (obj.selected == 0) { // star
            fill(200, 200, 0);
            stroke(250, 250, 0);
        } else { // planet
            fill(139, 69, 19);
            stroke(97, 48, 13);
        }
        strokeWeight(2);
        circle(obj.position.x, obj.position.y, obj.radius * 2 * objectScale);
    }
    pop();
}

function previewObject(x, y) {
    fill(200, 50, 0, 150);
    if (mouse.X > 5 && mouse.X < canvasSize.width - 205 && mouse.Y > 5 && mouse.Y < canvasSize.height - 5) fill(200, 200, 0, 150);
    circle(x, y, objectScale);
    
    textSize(17);
    fill(255);
    text("Click anywhere to place a planet/star", canvasSize.width/2, 20);
}

function reselectObject() {
    if (!mouseJustReleased) return;
    for (let obj of celestialObjects) {
        if (dist(mouse.X, mouse.Y, obj.position.x, obj.position.y) <= obj.radius * objectScale) {
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

let simulate = false;

function simulateObjects() {
    const old = celestialObjects.map(o => ({ id: o.id, position: { x: o.position.x, y: o.position.y }, mass: o.mass }));
    const velocities = old.map((_, i) => ({ x: celestialObjects[i].velocity.x, y: celestialObjects[i].velocity.y }));

    // Compute accelerations for each object due to every other object
    for (let i = 0; i < old.length; i++) {
        const A = old[i];
        for (let j = 0; j < old.length; j++) {
            if (i === j) continue;
            const B = old[j];
            const dx = B.position.x - A.position.x;
            const dy = B.position.y - A.position.y;
            let r = Math.sqrt(dx * dx + dy * dy);
            const minR = 1;
            if (r < minR) r = minR;

            const aMag = (G * B.mass) / (r * r);
            velocities[i].x += aMag * (dx / r);
            velocities[i].y += aMag * (dy / r);
        }
    }
    let dt = (typeof deltaTime !== 'undefined' && deltaTime > 0) ? (deltaTime / (1000/30)) : 1;
    dt *= timeScale;
    for (let i = 0; i < celestialObjects.length; i++) {
        celestialObjects[i].position.x += velocities[i].x * dt;
        celestialObjects[i].position.y += velocities[i].y * dt;
        celestialObjects[i].velocity.x = velocities[i].x;
        celestialObjects[i].velocity.y = velocities[i].y;
    }
    
    // Check for collisions and merge objects
    checkAndMergeCollisions();
}

function checkAndMergeCollisions() {
    for (let i = 0; i < celestialObjects.length; i++) {
        for (let j = i + 1; j < celestialObjects.length; j++) {
            const obj1 = celestialObjects[i];
            const obj2 = celestialObjects[j];
            const dx = obj2.position.x - obj1.position.x;
            const dy = obj2.position.y - obj1.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (obj1.radius + obj2.radius) * objectScale;
            
            if (dist < minDist) {
                // Collision detected - merge objects
                mergeObjects(i, j);
                // Restart collision check since array was modified
                checkAndMergeCollisions();
                return;
            }
        }
    }
}

function mergeObjects(index1, index2) {
    const obj1 = celestialObjects[index1];
    const obj2 = celestialObjects[index2];
    
    // Keep the more massive object, merge into it
    let keeper, absorbed;
    if (obj1.mass >= obj2.mass) {
        keeper = obj1;
        absorbed = obj2;
    } else {
        keeper = obj2;
        absorbed = obj1;
        // Swap indices
        const temp = index1;
        index1 = index2;
        index2 = temp;
    }
    
    // Merge properties: combine mass and recalculate radius
    keeper.mass += absorbed.mass;
    // Assume density stays constant, so volume adds up: V = (4/3)πr³
    // r_new = ∛(r1³ + r2³)
    keeper.radius = Math.cbrt(Math.pow(keeper.radius, 3) + Math.pow(absorbed.radius, 3));
    
    // Update velocity to be weighted average
    const totalMass = keeper.mass;
    keeper.velocity.x = (keeper.velocity.x * (keeper.mass - absorbed.mass) + absorbed.velocity.x * absorbed.mass) / totalMass;
    keeper.velocity.y = (keeper.velocity.y * (keeper.mass - absorbed.mass) + absorbed.velocity.y * absorbed.mass) / totalMass;
    
    // Remove the absorbed object
    celestialObjects.splice(index2, 1);
    
    // Update currentObject if needed
    if (currentObject === absorbed.id) {
        currentObject = keeper.id;
    }
    
    // Pause simulation if less than 2 objects remain
    if (celestialObjects.length < 2) {
        simulate = false;
    }
}