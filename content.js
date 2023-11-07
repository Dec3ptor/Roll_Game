import { setupInputHandlers, handleInput } from './input.js';
// import { updateCamera, cameraPosition } from './rendering.js';
import { scene, engine, canvas, createScene } from './scene.js';
import { grounds, createTestGrounds } from './dynamicLevel.js';
import { importScene, exportScene } from './importExportScene.js';
import { player, createPlayer } from './createPlayer.js';
import { render, camera, setCamera, cameraZoomSpeed } from './renderScene.js';


// Define the jump variables
var gravityForce = 15;



let spacePressed = false;
// Global variable to keep track of the time the space key is pressed
var spaceKeyDownTime = null;

// Global variables to control jumping
var jumpFromSurfaceOnly = true; // Set to true if the ball needs to be on a surface to jump
var currentSurface = null; // The surface that the ball is currently touching




// Add this function to check if the ball is on a surface
function checkIfOnGround() {
  var origin = player.getAbsolutePosition(); // the starting point of the ray
  var direction = new BABYLON.Vector3(0, -1, 0); // the direction of the ray
  var length = 2; // the length of the ray
  var ray = new BABYLON.Ray(origin, direction, length);

  // Check if the ray intersects any meshes
  var hit = scene.pickWithRay(ray, function(mesh){
    return grounds.includes(mesh); // only count hits with the ground meshes
  });

  if (hit.hit) {
    // Calculate the angle between the hit surface's normal and the up vector
    var angle = BABYLON.Vector3.Dot(hit.getNormal(true), new BABYLON.Vector3(0,1,0));
    // If the angle is close to 1, the surface is horizontal and the ball is on the ground
    // You can adjust the threshold as needed, 0.5 is just an example
    isOnGround = angle > 0.7;
  } else {
    isOnGround = false;
  }
}

// document.getElementById("cameraPosition1").addEventListener("click", function () {
//     cameraPosition = -5;
// });

// document.getElementById("cameraPosition2").addEventListener("click", function () {
//     cameraPosition = -10;
// });



canvas.addEventListener("wheel", function (event) {
  camera.position.z -= event.deltaY * cameraZoomSpeed;
    // Prevent the camera from going too close or too far
  var minDistance = 1;
  var maxDistance = 100;
  if (camera.position.z < -maxDistance) {
    camera.position.z = -maxDistance;
  } else if (camera.position.z > -minDistance) {
    camera.position.z = -minDistance;
  }
});



document.getElementById('exportButton').addEventListener('click', function() {
    exportScene(scene);
});

document.getElementById('importButton').addEventListener('change', function(event) {
    importScene(scene, event.target.files[0]);
});



  // Variables to track key states
  var isKeyAPressed = false;
  var isKeyDPressed = false;
  // Add a new variable to track the "s" key state
  var isKeySPressed = false;

// Initialize these variables outside of your updateGame function
let lastFrameTime = performance.now();
// Ensure this code runs before updateGame is called
var fpsLabel = document.createElement("div");
fpsLabel.id = 'fpsLabel'; // Assign an ID to the element
// ... set other properties ...
document.body.appendChild(fpsLabel);

var objectsLabel = document.createElement("div");
objectsLabel.id = 'objectsLabel'; // Assign an ID to the element
// ... set other properties ...
document.body.appendChild(objectsLabel);
var isJumpButtonDown = false; // Set the initial state of the jump button
var isJumping = false; // Set the initial state of jumping
let isJumpButtonReleased = true; // This needs to be tracked between frames

// Call this function once during your game's initialization to set up the collision event handlers
function setupCollisionHandlers(grounds, player) {
    let lastSurface = null;
    grounds.forEach((ground) => {
        player.physicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main, collided) {
            if (collided.object.name !== lastSurface) {
                console.log("Player is touching surface:", collided.object.name);
                lastSurface = collided.object.name;
                // Set isOnGround to true if needed
            }
        });
    });
}

// The updateGame function, called every frame
function updateGame() {
    let currentTime = performance.now();
    let deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;

    // Define the player's speed and movement force
    var playerMovementForce = 20;
    var playerDampingForce = isKeySPressed && isOnGround ? 5 : 0.7;

    // Update FPS
    var fpsLabel = document.getElementById('fpsLabel'); // Make sure 'fpsLabel' is the correct ID
    if (fpsLabel) {
        fpsLabel.textContent = "FPS: " + engine.getFps().toFixed();
    } else {
        // Element does not exist, create it or handle the error
        console.error('fpsLabel element not found');
    }

    // Update loaded objects
    var objectsLabel = document.getElementById('objectsLabel'); // Make sure 'objectsLabel' is the correct ID
    if (objectsLabel) {
        objectsLabel.textContent = "Objects: " + scene.meshes.length;
    } else {
        // Element does not exist, create it or handle the error
        console.error('objectsLabel element not found');
    }

    // Apply damping force to gradually reduce the speed
    player.physicsImpostor.applyForce(player.physicsImpostor.getLinearVelocity().scale(-playerDampingForce), player.getAbsolutePosition());

    // Update player's position based on physics impostor
    player.position = player.physicsImpostor.getObjectCenter();

    // Reset player if below a certain height
    if (player.position.y < -30) {
        player.position = new BABYLON.Vector3(0, 20, 0);
        player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
    }

    // Handle jumping logic
    if (isJumpButtonDown && isJumpButtonReleased && player.physicsImpostor) {
        let jumpVelocity = calculateJumpVelocity();
        let currentVelocity = player.physicsImpostor.getLinearVelocity();
        currentVelocity.y += jumpVelocity;
        player.physicsImpostor.setLinearVelocity(currentVelocity);
        isJumpButtonReleased = false; // Prevent multiple jumps without releasing the button
    }

    // Check if the player is on the ground
    checkIfOnGround(); // Implement this function to update isOnGround as needed

    // Other game update logic...
    // Your existing logic from scene.registerBeforeRender goes here...
    if (isJumping && player.physicsImpostor) {
      let timeSinceJumpStart = (currentTime - jumpStartTime) / 1000; // Time in seconds
      if (isJumpButtonDown && timeSinceJumpStart > jumpDecayTime) {
        // Reduce the y component of the velocity to simulate the jump force decay
        let currentVelocity = player.physicsImpostor.getLinearVelocity();
        currentVelocity.y = Math.max(0, currentVelocity.y - jumpDecay * deltaTime);
        player.physicsImpostor.setLinearVelocity(currentVelocity);
      } else {
        isJumping = false;
      }
    }
    
      if (isKeySPressed && player.physicsImpostor) {
      // Implement the "stop / squish" action here
                if (isOnGround)
          {
            playerDampingForce = 5;  
          }
  }
}
// Define the calculateJumpVelocity function outside of updateGame
function calculateJumpVelocity() {
  if (!isJumpButtonDown) {
      return 0;
  }
  let timeHeldDown = (performance.now() - jumpButtonPressTime) / 1000; // Time in seconds
  let jumpForce;
  if (timeHeldDown < jumpDurationMax) {
      jumpForce = jumpForceInitial * Math.sqrt(1 - (timeHeldDown / jumpDurationMax));
  } else {
      jumpForce = 0;
  }
  return jumpForce;
}

// Call setupCollisionHandlers once during your game's initialization
setupCollisionHandlers(grounds, player); // Make sure 'grounds' and 'player' are defined

function updatePhysics(deltaTime) {
  // Assuming 'player' is your player object with a physics impostor
  // Apply gravity
  const gravity = new BABYLON.Vector3(0, -9.81 * deltaTime, 0);
  player.physicsImpostor.applyForce(gravity, player.getAbsolutePosition());

  // Apply movement forces
  if (isMoving) {
      const movementForce = new BABYLON.Vector3(playerMovementForce * deltaTime, 0, 0);
      player.physicsImpostor.applyForce(movementForce, player.getAbsolutePosition());
  }

  // Apply damping to simulate friction
  const damping = new BABYLON.Vector3(-player.physicsImpostor.getLinearVelocity().x * playerDampingForce * deltaTime, 0, 0);
  player.physicsImpostor.applyForce(damping, player.getAbsolutePosition());
}


window.addEventListener("resize", function () {
    engine.resize();
});

var fixedTimeStep = 1 / 60; // 60 physics updates per second
var maxSubSteps = 10; // Maximum number of physics sub-steps per frame to avoid spiral of death
var lastFrameTimeMs = 0; // The last frame's timestamp
var accumulator = 0; // Time accumulator for the fixed update

function gameLoop(timestamp) {
  if (!lastFrameTimeMs) {
    lastFrameTimeMs = timestamp;
  }

  var delta = (timestamp - lastFrameTimeMs) / 1000;
  lastFrameTimeMs = timestamp;
  accumulator += delta;

  handleInput(); // Check for user input and handle it

  var numSubSteps = 0;
  while (accumulator >= fixedTimeStep) {
    if (numSubSteps < maxSubSteps) {
      updateGame(fixedTimeStep); // Update the game state with a fixed time step
      accumulator -= fixedTimeStep;
      numSubSteps++;
    } else {
      // Too many updates, we need to adjust
      accumulator = 0; // This can lead to lost time, but avoids the spiral of death
      break;
    }
  }

  render(); // Draw the current state to the screen

  // Request the next frame
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);



// Your initialization code here...
// Create the scene, the camera, set up the physics engine, etc.




createScene();


if (!scene) {
  console.error('Scene is not initialized');
  // Handle the error, maybe initialize the scene here
} else {
  // Create the camera since the scene is not null
  setCamera(new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene));
  camera.maxZ = 5000; // Adjust the value as needed
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);
  
  var cameraTargetDistance = 10; // Adjust the target distance as needed

  var gravityVector = new BABYLON.Vector3(0, -15, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  scene.enablePhysics(gravityVector, physicsPlugin);

  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
}


// Restrict movement to the x and z axes
// Register an event with the scene that is triggered every frame
scene.registerBeforeRender(function () {
    if (player.physicsImpostor) {
        var velocity = player.physicsImpostor.getLinearVelocity();

        // Remove any velocity on the y-axis
        if (velocity) {
            velocity.z = 0;
             player.physicsImpostor.setLinearVelocity(velocity);
        }
    }
});

setupInputHandlers();
createScene();
// Start the game loop
gameLoop();

