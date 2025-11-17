class Select {
    constructor(options, defaultOption=0, x, y) {
        if (!Array.isArray(options) || options.length === 0) {
            throw new Error("Options must be a non-empty array");
        }
        this.options = options;
        this.selected = defaultOption;
        this.x = x;
        this.y = y;
        this.open = false;

        // consts
        this.width = 140;
        this.height = 20;
        this.normalColor = color(200);
        this.optionColors = [[color(50, 100, 150), color(230)], [color(210), color(0)]];
    }

    draw(x=null, y=null) {
        if (x !== null) this.x = x;
        if (y !== null) this.y = y;
        textSize(12);

        // Draw background
        fill(240);
        rect(this.x, this.y, this.width, this.height, 5);
        fill(0);
        text(this.options[this.selected], this.x, this.y, this.width, this.height);
        strokeWeight(2);
        if (this.open) {
            line(this.x + this.width - 15, this.y + this.height - 7, this.x + this.width - 10, this.y + 7);
            line(this.x + this.width - 5, this.y + this.height - 7, this.x + this.width - 10, this.y + 7);
        } else {
            line(this.x + this.width - 15, this.y + 7, this.x + this.width - 10, this.y + this.height - 7);
            line(this.x + this.width - 5, this.y + 7, this.x + this.width - 10, this.y + this.height - 7);
        }
        strokeWeight(1);

        if (!this.open) return;
        if (mouse.X < this.x || mouse.X > this.x + this.width || mouse.Y < this.y || mouse.Y > this.y + this.options.length * this.height) {
            this.open = false;
            return;
        }

        // Draw options
        const remainingOptions = this.options.filter((_, index) => index !== this.selected);
        for (let i = 0; i < remainingOptions.length; i++) {
            const optionY = this.y + this.height * (i + 1);
            fill(this.optionColors[i % this.optionColors.length][0]);
            rect(this.x, optionY, this.width, this.height, 3);
            fill(this.optionColors[i % this.optionColors.length][1]);
            text(remainingOptions[i], this.x, optionY, this.width, this.height);
        }
    }

    mouseReleased() {
        if (this.open){
            this.open = false;
            if (mouse.X > this.x && mouse.X < this.x + this.width && mouse.Y > this.y && mouse.Y < this.y + this.height) return true;

            this.selected = Math.floor((mouse.Y - this.y - this.height) / this.height);
            return true;
        } else {
            if (mouse.X > this.x && mouse.X < this.x + this.width && mouse.Y > this.y && mouse.Y < this.y + this.height) {
                this.open = true;
                return true;
            }
        }
    }
}