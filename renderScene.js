import { player } from './createPlayer.js';
import { scene, engine, canvas, createScene } from './scene.js';

var cameraPosition = 0;
// render.js
export var camera = null; // or some default camera initialization

var isEditModeEnabled = false; // Flag to track if edit mode is enabled
var cameraTargetDistance = 10; // Adjust the target distance as needed
export var cameraZoomSpeed = 0.1; // Adjust the zoom speed as needed
const fpsDisplay = document.getElementById('fps-display');
const fpsSlider = document.getElementById('fps-slider');
var previousHorizontalOffset;

export function setCamera(newCamera) {
    camera = newCamera;
}


export function render() {}

    window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    // Assuming your canvas has the id 'renderCanvas'
    const canvas = document.getElementById('renderCanvas');
    if (canvas) {
        // This will set the size of the canvas to match the size of the browser window.
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        // If you have a specific aspect ratio you want to maintain (e.g., 16:9), you could add logic here
        // to calculate the appropriate width and height while maintaining that aspect ratio.
        
        // If you're using a 3D engine like Babylon.js or Three.js, you may also need to update the camera aspect ratio
        // and call the engine's resize function to ensure everything scales correctly.
        if (engine && typeof engine.resize === 'function') {
            engine.resize();
        }
    }
}

// Call resizeCanvas to initialize the correct size at startup
resizeCanvas();






