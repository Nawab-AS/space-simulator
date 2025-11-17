class Slider {
    constructor(x, y, min, max, value) {
        this.x = x;
        this.y = y;
        this.min = min;
        this.max = max;
        this.value = value;

        // consts
        this.width = 160;
        this.height = 8;
        this.dragging = false;
        this.knobRadius = 6;
        this.decimalPlaces = Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(value));

        this.selectedColor = color(50, 100, 200);
        this.bgColor = color(200);
        this.knobColor = color(150);
    }

    draw(x=null, y=null) {
        if (x !== null) this.x = x;
        if (y !== null) this.y = y;
        if (this.dragging) {
            this.value = constrain(mouse.X, this.x, this.x + this.width);
            this.value = map(this.value, this.x, this.x + this.width, this.min, this.max);
            this.value = Math.round(this.value * (10**this.decimalPlaces)) / (10**this.decimalPlaces); // round to 2 decimal places
        }
        const knobX = map(this.value, this.min, this.max, this.x, this.x + this.width);

        // background
        fill(this.bgColor);
        rect(this.x, this.y, this.width, this.height, 100);

        // selected
        fill(this.selectedColor);
        rect(this.x, this.y, knobX - this.x, this.height, 100);

        // knob
        fill(this.knobColor);
        circle(knobX, this.y + this.height / 2, this.knobRadius*2 + (this.dragging ? 2 : 0));
    }

    mousePressed() {
        if (dist(mouse.X, mouse.Y, map(this.value, this.min, this.max, this.x, this.x + this.width), this.y + this.height / 2) < this.knobRadius) {
            this.dragging = true;
        }
    }

    mouseReleased() {
        if (this.dragging){
            this.dragging = false;
            return true;
        }
        return false;
    }
}

function decimalPlaces(num) {
    const numStr = num.toString();
    if (numStr.includes('.')) {
        return numStr.split('.')[1].length;
    }
    return 0;
}