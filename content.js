// import { setupInputHandlers, handleInput } from './input.js';
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
var isKeyAPressed;
var isKeyDPressed;
// Add a new variable to track the "s" key state
var isKeySPressed;
var playerMovementForce = 20;
var playerDampingForce = 0.7;

function setupInputHandlers() {
    var playerSpeed = 0;
    var keyADown = false;
    var keyDDown;

    // Define the player's speed and movement force
    var playerSpeed = 0;

    // Remove the 'var' keyword to use the global variables instead of declaring new ones
    isKeyAPressed = false;
    isKeyDPressed = false;
    isKeySPressed = false;

    let lastFrameTime = performance.now();

    // Initialize a variable to keep track of the previous velocity
    let previousVelocity = null;
    var velocityThreshold = 1;

    // Jumping variables
    let jumpForceInitial = 1; // The initial force applied when the jump starts
    let jumpDurationMax = 0.2; // The maximum time the jump button can be held down for
    let isJumpButtonDown = false; // Whether the jump button is currently pressed

    let isOnGround = false;
    let isJumping = false;
    let jumpStartTime;
    // Add a new variable to track if the jump button has been released since the last jump
    let isJumpButtonReleased = true;

    // Debug: Log the initial state of key tracking variables
    console.log(`Initial key states: A: ${isKeyAPressed}, D: ${isKeyDPressed}, S: ${isKeySPressed}`);

    // Handle keyboard events
    scene.onKeyboardObservable.add((kbInfo) => {
        // Debug: Log the type of keyboard event and the key involved
        //console.log(`Keyboard Event: ${kbInfo.type}, Key: ${kbInfo.event.key}`);

        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                // Debug: Log the state change on key down
                console.log(`Key Down: ${kbInfo.event.key}`);
                
                if (kbInfo.event.key == "a" || kbInfo.event.key == "A" && isKeySPressed == false) {
                    isKeyAPressed = true;
                    console.log("a pressed"); // Log to console when "s" key is pressed
                    console.log("a: ", isKeyAPressed); // Log to console when "s" key is pressed
                    console.log("d: ", isKeyDPressed); // Log to console when "s" key is pressed
                } else if (kbInfo.event.key == "d" || kbInfo.event.key == "D" && isKeySPressed == false) {
                    isKeyDPressed = true;
                    console.log("d pressed"); // Log to console when "s" key is pressed
                    console.log("a: ", isKeyAPressed); // Log to console when "s" key is pressed
                    console.log("d: ", isKeyDPressed); // Log to console when "s" key is pressed
                } else if (kbInfo.event.key == " " || kbInfo.event.key == "Spacebar") {
                    // Debug: Log jump initiation
                    console.log(`Jump initiated: ${!isJumpButtonDown && isOnGround}`);
                    
                    if (!isJumpButtonDown && isOnGround) {
                        isJumpButtonDown = true;
                        jumpButtonPressTime = performance.now();
                        let jumpVelocity = calculateJumpVelocity();
                        let currentVelocity = player.physicsImpostor.getLinearVelocity();
                        currentVelocity.y = jumpVelocity;
                        player.physicsImpostor.setLinearVelocity(currentVelocity);
                    }
                }
                else if (kbInfo.event.key == "s" || kbInfo.event.key == "S") {
                    isKeySPressed = true;
                    console.log("Stop / Squish action initiated"); // Log to console when "s" key is pressed
                    // Implement additional effects here
                }
                break;

            case BABYLON.KeyboardEventTypes.KEYUP:
                // Debug: Log the state change on key up
                console.log(`Key Up: ${kbInfo.event.key}`);
                
                if (kbInfo.event.key == "a" || kbInfo.event.key == "A") {
                    isKeyAPressed = false;
                } else if (kbInfo.event.key == "d" || kbInfo.event.key == "D") {
                    isKeyDPressed = false;
                } else if (kbInfo.event.key == " " || kbInfo.event.key == "Spacebar") {
                    isJumpButtonDown = false;
                    isJumpButtonReleased = true;
                }
                else if (kbInfo.event.key == "s" || kbInfo.event.key == "S") {
                    isKeySPressed = false;
                    console.log("Stop / Squish action terminated"); // Log to console when "s" key is released
                    // Implement additional effects here
                    playerDampingForce = 0.7;
                }
                break;
        }
    });
}

function handleInput() {
  // console.log("a: ", isKeyAPressed); // Log to console when "s" key is pressed
  // console.log("d: ", isKeyDPressed); // Log to console when "s" key is pressed

  // Debug: Log the current velocity before applying forces
  let currentVelocity = player.physicsImpostor.getLinearVelocity();
  //console.log(`Current Velocity: ${currentVelocity}`);

  if (isKeyAPressed) {
    let forceVector = new BABYLON.Vector3(-playerMovementForce, 0, 0);
    console.log(`Applying force to move left: ${forceVector}`); // Debug: Log the force vector
    player.physicsImpostor.applyForce(forceVector, player.getAbsolutePosition());
}

  if (isKeyDPressed) {
      console.log("Applying force to move right"); // Debug: Log right movement
      player.physicsImpostor.applyForce(new BABYLON.Vector3(playerMovementForce, 0, 0), player.getAbsolutePosition());
  }
  // If the S key is pressed, apply a damping force to simulate a stop/squish action
  if (isKeySPressed) {
      console.log("Applying damping force due to S key press"); // Debug: Log damping force application
      // Apply a larger damping force to quickly reduce the ball's velocity
      player.physicsImpostor.applyForce(player.physicsImpostor.getLinearVelocity().scale(-5), player.getAbsolutePosition());
  }

  // Debug: Log the new velocity after applying forces
  let newVelocity = player.physicsImpostor.getLinearVelocity();
  //console.log(`New Velocity: ${newVelocity}`);

  // Debug: Check if the physics impostor has mass
  let mass = player.physicsImpostor.mass;
  //console.log(`Player Mass: ${mass}`);
  if (mass <= 0) {
      console.error("The player's physics impostor has no mass or is static.");
  }
}


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
var isOnGround;
var physicsTimeStep;
var isMoving;;
var playerDampingForce = isKeySPressed && isOnGround ? 5 : 0.7;

// The updateGame function, called every frame
function updateGame() {
    let currentTime = performance.now();
    let deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;



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
          // Call updatePhysics with fixedTimeStep instead of deltaTime
          updatePhysics(physicsTimeStep);
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

function updatePhysics(physicsTimeStep) {
  // Apply movement forces if the player is moving.
  if (isMoving) {
    const movementForce = new BABYLON.Vector3(playerMovementForce * physicsTimeStep, 0, 0);
    player.physicsImpostor.applyForce(movementForce, player.getAbsolutePosition());
  }

  // Apply damping to simulate friction.
  const damping = new BABYLON.Vector3(-player.physicsImpostor.getLinearVelocity().x * playerDampingForce * physicsTimeStep, 0, 0);
  player.physicsImpostor.applyForce(damping, player.getAbsolutePosition());
}
var cameraPosition = 0;


window.addEventListener("resize", function () {
    engine.resize();
});

engine.runRenderLoop(function () {
    camera.position.x = player.position.x + cameraPosition;
    scene.render();
});

var accumulator = 0; // Ensure this is initialized to 0
console.log(`accumulator initial value: ${accumulator}`); // Should log 0
var fixedTimeStep = 1 / 60; // Ensure this is defined before gameLoop is called
var lastFrameTimeMs = performance.now(); // Initialize to the current time


createScene();
// Then, to show the inspector
if (scene) {
  scene.debugLayer.show();
}
var physicsUpdates = 0;
var physicsEngine = scene.getPhysicsEngine();

var lastUpdateTime = 0;
var physicsUpdateCounter = 0;
var lastPhysicsUpdateReset = performance.now();








// Your initialization code here...
// Create the scene, the camera, set up the physics engine, etc.





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

var fixedTimeStep = 1 / 60; // 60 physics updates per second, independent of FPS
var lastFrameTimeMs = 0; // The last frame's timestamp
var accumulator = 0; // Time accumulator for the fixed update

function gameLoop(timestamp) {
  if (!lastFrameTimeMs) lastFrameTimeMs = timestamp;

  var delta = (timestamp - lastFrameTimeMs) / 1000;
  lastFrameTimeMs = timestamp;
  accumulator += delta;

  // Physics updates should be fixed and independent of rendering FPS
  while (accumulator >= fixedTimeStep) {
    updateGame(fixedTimeStep); // Update the game state with a fixed time step
    accumulator -= fixedTimeStep;
  }

  handleInput(); // Check for user input and handle it
  render(); // Draw the current state to the screen

  requestAnimationFrame(gameLoop); // Request the next frame
}

setupInputHandlers();
requestAnimationFrame(gameLoop); // Start the game loop




