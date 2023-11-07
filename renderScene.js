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


export function render() {
  
    // // Set up the FPS slider event listener once, outside of the render loop
    // fpsSlider.addEventListener('input', function() {
    //   fps = parseInt(this.value);
    //   fpsDisplay.textContent = fps + " FPS";
    // });
    
    
      
     camera.position.x = player.position.x + cameraPosition;
    
      var enableHorizontalOffset = true;  // Set this to true to enable horizontal offset
    // Camera behavior options
    var cameraLag = 0;  // Modify this value to adjust the camera lag (0 = no lag)
    var cameraLead = 0;  // Modify this value to adjust the camera lead (0 = no lead)
    var cameraShift = 0;  // Modify this value to adjust the camera shift (0 = no shift)
    
    var angleAdjustmentFactor = 1;  // Increase or decrease this value to adjust the amount of extra camera movement
    
    var smoothingFactor = 0.05;  // Adjust this value to change the amount of smoothing (0 = no smoothing, 1 = instant smoothing)
    
    var previousCameraPosition = camera.position.clone();  // Keep track of the camera's previous position
    
    // Store the previous camera position and target for smoothing
    var previousCameraPosition = camera.position.clone();
    var previousCameraTarget = camera.getFrontPosition(1);
    // Initialize the previous lag and lead
    var previousCameraLag = 0;
    var previousCameraLead = 0;
    // Define the minimum and maximum zoom distances
    var minZoomDistance = 5;  // Modify this value to set the minimum zoom distance
    var maxZoomDistance = 10;  // Modify this value to set the maximum zoom distance
    
    // Define a speed factor. This determines how much the ball's speed affects the zoom.
    var speedFactor = 0.1;  // Modify this value to adjust the speed factor
    
    // Store the previous zoom distance for smoothing
    var previousZoomDistance = camera.position.z;
         // Get the ball's speed and direction
        var velocity = player.physicsImpostor.getLinearVelocity();
        var speed = velocity.length();
    
        // Define a threshold speed. If the ball's speed is below this threshold, the camera doesn't move.
        var thresholdSpeed = 2;  // Modify this value to adjust the threshold speed
    
    // If the ball's speed is below the threshold, set the direction and speed to zero
    // Compute the horizontal speed
    var horizontalSpeed = Math.abs(velocity.x);
    
    // If the ball's horizontal speed is below the threshold, set the direction and speed to zero
    var direction, angleOffset;
    if (horizontalSpeed < thresholdSpeed) {
        direction = new BABYLON.Vector3(0, 0, 0);
        speed = 0;
        angleOffset = 0;
    } else {
        direction = velocity.normalize();
        angleOffset = direction.x + (direction.x * angleAdjustmentFactor);  // direction.x is in the range [-1, 1]
    }
    
    
        // Define the minimum and maximum angles
        var minAngle = -Math.PI / 4;  // Modify this value to set the minimum camera angle
        var maxAngle = Math.PI / 4;   // Modify this value to set the maximum camera angle
    
        // Scale the angle offset to be within the min and max angles
        angleOffset = angleOffset * (maxAngle - minAngle) + minAngle;
    
    
    // Define the smoothing factor
    var smoothingFactor = 0.03;  // Adjust this value to change the amount of smoothing (0 = no smoothing, 1 = instant smoothing)
    
    // Calculate the new camera target and position
    var target = new BABYLON.Vector3(player.position.x, player.position.y, player.position.z);
    
    // Apply the camera lag or lead to the target position
    if (speed >= thresholdSpeed) {  // Only apply lag or lead when the ball is moving
        target.x += direction.x * (cameraLag - cameraLead);
    }
    
    var horizontalOffset = 0;  // Start with no offset
    if (speed >= thresholdSpeed) {  // Only apply offset when the ball is moving
        horizontalOffset = speed * 2;  // Adjust this to control how much the camera is shifted left or right
        if (direction.x > 0) {
            horizontalOffset = -horizontalOffset;  // Reverse the offset if the ball is moving right
        }
    }
    
    // Update the previous horizontal offset for the next frame
    previousHorizontalOffset = smoothedHorizontalOffset;
    // Smoothly interpolate the horizontal offset if it's enabled
    var smoothedHorizontalOffset = enableHorizontalOffset ? BABYLON.Scalar.Lerp(previousHorizontalOffset, horizontalOffset, smoothingFactor) : 0;
    
    // Smoothly interpolate the camera lag and lead
    var smoothedCameraLag = BABYLON.Scalar.Lerp(previousCameraLag, cameraLag, smoothingFactor);
    var smoothedCameraLead = BABYLON.Scalar.Lerp(previousCameraLead, cameraLead, smoothingFactor);
    
    // Calculate the final camera position with the smoothed offset
    var position = new BABYLON.Vector3(
        player.position.x - cameraTargetDistance * Math.cos(angleOffset) + smoothedCameraLag * direction.x - smoothedCameraLead * direction.x,
        player.position.y + cameraTargetDistance * Math.abs(Math.sin(angleOffset)),
        player.position.z
    );
    
    // Update the previous lag and lead for the next frame
    previousCameraLag = smoothedCameraLag;
    previousCameraLead = smoothedCameraLead;
    
    
    
        // Ensure the camera doesn't go below the ground
        if (position.y < 0) {
            position.y = 0;
        }
    
        // Calculate the zoom distance based on the ball's speed
        var speed = player.physicsImpostor.getLinearVelocity().length();
        var zoomDistance = minZoomDistance + (maxZoomDistance - minZoomDistance) * speed * speedFactor;
    
        // Smoothly interpolate the zoom distance
        var smoothedZoomDistance = BABYLON.Scalar.Lerp(previousZoomDistance, zoomDistance, smoothingFactor);
    
        // Set the camera's z-position based on the smoothed zoom distance
        position.z = -smoothedZoomDistance -20;
    
    // Smoothly interpolate the camera's target and position
    var smoothedTarget = BABYLON.Vector3.Lerp(previousCameraTarget, target, smoothingFactor);
    var smoothedPosition = BABYLON.Vector3.Lerp(previousCameraPosition, position, smoothingFactor);
    
    // Apply the horizontal offset and camera shift to the smoothed camera position
    smoothedPosition.x += enableHorizontalOffset ? (horizontalOffset + cameraShift) : cameraShift;
    
    
    // Smoothly interpolate from the current camera position to the target position
    camera.position.x = BABYLON.Scalar.Lerp(camera.position.x, smoothedPosition.x, smoothingFactor);
    camera.position.y = BABYLON.Scalar.Lerp(camera.position.y, smoothedPosition.y -0.05, smoothingFactor);
    camera.position.z = BABYLON.Scalar.Lerp(camera.position.z, smoothedPosition.z, smoothingFactor);
    
        // Set the camera's target
    camera.setTarget(smoothedTarget);
    
        // Store the current camera target, position, and zoom distance for the next frame
        previousCameraTarget = smoothedTarget;
        previousCameraPosition = smoothedPosition;
        previousZoomDistance = smoothedZoomDistance;
        // Render the scene
        scene.activeCamera = camera;

        scene.render();
    }

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
