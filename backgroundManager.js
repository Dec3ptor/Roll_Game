import { Background } from './background.js';

// Define a class to manage the backgrounds
export class BackgroundManager {
    constructor(scene) {
        this.scene = scene;
        this.backgrounds = [];
    }

    addBackground(zPosition, width, height) {
        var index = this.backgrounds.length;
        var background = new Background(this.scene, zPosition, index, width, height);
        this.backgrounds.push(background);
    }
}