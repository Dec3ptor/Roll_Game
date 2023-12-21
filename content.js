// import { setupInputHandlers, handleInput } from './input.js';
// import { updateCamera, cameraPosition } from './rendering.js';
import { scene, engine, canvas, createScene, grounds } from './scene.js';
import { createTestGrounds } from './dynamicLevel.js';
import { importScene, exportScene } from './importExportScene.js';
import { player, createPlayer } from './createPlayer.js';
import { render, camera, setCamera, cameraZoomSpeed } from './renderScene.js';

// Define the jump variables
var gravityForce = 15;

// Global variable to track the size state of the player
var isPlayerBig = false;

let spacePressed = false;
// Global variable to keep track of the time the space key is pressed
var spaceKeyDownTime = null;

// Global variables to control jumping
var jumpFromSurfaceOnly = true; // Set to true if the ball needs to be on a surface to jump
var currentSurface = null; // The surface that the ball is currently touching

// Define the minimum and maximum zoom distances
var minZoomDistance = 5;  // Modify this value to set the minimum zoom distance
var maxZoomDistance = 10;  // Modify this value to set the maximum zoom distance


function checkIfOnGround() {
    var playerRadius = player.scaling.y; // Assuming uniform scaling
    var origin = player.getAbsolutePosition().subtract(new BABYLON.Vector3(0, playerRadius - 0.01, 0)); // Start just inside the sphere's surface
    var directions = [
        new BABYLON.Vector3(0, -1, 0), // Down
        new BABYLON.Vector3(playerRadius * 0.5, -1, 0), // Right
        new BABYLON.Vector3(-playerRadius * 0.5, -1, 0), // Left
        new BABYLON.Vector3(playerRadius * 0.5, -0.9, 0), // Diagonal Right
        new BABYLON.Vector3(-playerRadius * 0.5, -0.9, 0) // Diagonal Left
    ];
    var length = 0.4; // Small length, just enough to detect the ground
    var onGround = false;
    var angleThreshold = 0.6; // Angle threshold

    for (var i = 0; i < directions.length; i++) {
        var ray = new BABYLON.Ray(origin, directions[i], length);
        var hit = scene.pickWithRay(ray, function(mesh){
            return grounds.includes(mesh);
        });

        if (hit.hit) {
            var angle = BABYLON.Vector3.Dot(hit.getNormal(true), new BABYLON.Vector3(0,1,0));
            if (angle > angleThreshold) {
                onGround = true;
                break;
            }
        }
    }

    isOnGround = onGround;
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
var isKeyShiftPressed;
var playerMovementForce = 20;
var playerDampingForce = 0.7;
var isKeyQPressed;

var jumpForce = 10;
var isJumping = false;
var jumpCooldown = 0; // Cooldown time in seconds after a jump
var lastJumpTime = 0;
let jumpStartTime;
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
    isKeyQPressed = false;
    isKeyShiftPressed = false;
    let lastFrameTime = performance.now();

    // Initialize a variable to keep track of the previous velocity
    let previousVelocity = null;
    var velocityThreshold = 1;

    // Jumping variables
    let jumpForceInitial = 1; // The initial force applied when the jump starts
    let jumpDurationMax = 0.2; // The maximum time the jump button can be held down for
    let isJumpButtonDown = false; // Whether the jump button is currently pressed

    let isOnGround = false;

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
                  handleKeyDown(kbInfo.event.key);
                  console.log("a pressed"); // Log to console when "s" key is pressed
                    console.log("a: ", isKeyAPressed); // Log to console when "s" key is pressed
                    console.log("d: ", isKeyDPressed); // Log to console when "s" key is pressed
                } else if (kbInfo.event.key == "d" || kbInfo.event.key == "D" && isKeySPressed == false) {
                    console.log("d pressed"); // Log to console when "s" key is pressed
                    console.log("a: ", isKeyAPressed); // Log to console when "s" key is pressed
                    console.log("d: ", isKeyDPressed); // Log to console when "s" key is pressed
                    handleKeyDown(kbInfo.event.key);

                } else if (kbInfo.event.key == " " || kbInfo.event.key == "Spacebar") {
                    // Debug: Log jump initiation
                    console.log(`Jump initiated: ${!isJumpButtonDown && isOnGround}`);

                    // if (!isJumpButtonDown && isOnGround) {
                    //     isJumpButtonDown = true;
                    //     jumpButtonPressTime = performance.now();
                    //     let jumpVelocity = calculateJumpVelocity();
                    //     let currentVelocity = player.physicsImpostor.getLinearVelocity();
                    //     currentVelocity.y = jumpVelocity;
                    //     player.physicsImpostor.setLinearVelocity(currentVelocity);
                    // }
                    handleKeyDown(kbInfo.event.key);
                }
                else if (kbInfo.event.key == "s" || kbInfo.event.key == "S") {
                    isKeySPressed = true;
                    console.log("Stop / Squish action initiated"); // Log to console when "s" key is pressed
                    // Implement additional effects here
                }
                else if (kbInfo.event.key == "Shift")
                {
                    isKeyShiftPressed = true;
                    handleKeyDown(kbInfo.event.key);
                    console.log("Shify key hit"); 

                }
                else if (kbInfo.event.key == "q" || kbInfo.event.key == "Q")
                {
                    isKeyQPressed = true;
                    handleKeyDown(kbInfo.event.key);
                    console.log("E key hit"); 

                }
                break;

            case BABYLON.KeyboardEventTypes.KEYUP:
                // Debug: Log the state change on key up
                console.log(`Key Up: ${kbInfo.event.key}`);
                
                if (kbInfo.event.key == "a" || kbInfo.event.key == "A") {
                  handleKeyUp(kbInfo.event.key);
                } else if (kbInfo.event.key == "d" || kbInfo.event.key == "D") {
                    handleKeyUp(kbInfo.event.key);

                } else if (kbInfo.event.key == " " || kbInfo.event.key == "Spacebar") {

                    handleKeyUp(kbInfo.event.key);

                }
                else if (kbInfo.event.key == "s" || kbInfo.event.key == "S") {
                    isKeySPressed = false;
                    console.log("Stop / Squish action terminated"); // Log to console when "s" key is released
                    // Implement additional effects here
                    playerDampingForce = 0.7;
                }
                else if (kbInfo.event.key == "q" || kbInfo.event.key == "Q") {
                    isKeyQPressed = false;
                    // Implement additional effects here
                }
                else if (kbInfo.event.key == "Shift")
                {
                    isKeyShiftPressed = false;
                    handleKeyUp(kbInfo.event.key);

                }
                break;
        }
    });
}

function handleInput() {
    let currentVelocity = player.physicsImpostor.getLinearVelocity();
    let spinSpeed = 0.1;

    // Adjust playerMovementForce based on player's size
    let sizeFactor = player.scaling.x; // Assuming uniform scaling
    let scaledMovementForce = playerMovementForce * sizeFactor;

    if (isKeyAPressed) {
        let forceVector = new BABYLON.Vector3(-scaledMovementForce, 0, 0);
        player.physicsImpostor.applyForce(forceVector, player.getAbsolutePosition());

        let currentAngularVelocity = player.physicsImpostor.getAngularVelocity();
        currentAngularVelocity.z += spinSpeed;
        player.physicsImpostor.setAngularVelocity(currentAngularVelocity);
    }

    if (isKeyDPressed) {
        player.physicsImpostor.applyForce(new BABYLON.Vector3(scaledMovementForce, 0, 0), player.getAbsolutePosition());

        let currentAngularVelocity = player.physicsImpostor.getAngularVelocity();
        currentAngularVelocity.z -= spinSpeed;
        player.physicsImpostor.setAngularVelocity(currentAngularVelocity);
    }
    // If the S key is pressed, apply a damping force to simulate a stop/squish action
    if (isKeySPressed == true && isOnGround == true) {
        console.log("Applying damping force due to S key press"); // Debug: Log damping force application
        // Apply a larger damping force to quickly reduce the ball's velocity
        player.physicsImpostor.applyForce(player.physicsImpostor.getLinearVelocity().scale(-20), player.getAbsolutePosition());
    }
    // Example usage
    if (isKeyShiftPressed) {
        togglePlayerSize();
            // Move player creation after physics is enabled
            // createPlayer();
    }
    if (isKeyQPressed) {
        // togglePlayerSize();
            createPlayer();
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

function togglePlayerSize() {
    // Store the current linear and angular velocities
    var currentLinearVelocity = player.physicsImpostor.getLinearVelocity();
    var currentAngularVelocity = player.physicsImpostor.getAngularVelocity();

    // Calculate the change in radius based on scaling
    var originalRadius = player.scaling.y / 2;
    var newRadius = 2.5;

    // Toggle the size of the           
    if (!isPlayerBig) {
        player.position.y += newRadius - originalRadius;
        // Increase the size
        player.scaling = new BABYLON.Vector3(3, 3, 3);
        isPlayerBig = true;
        jumpForce = 15;
        minZoomDistance = 40;  // Modify this value to set the minimum zoom distance
        maxZoomDistance = 60;  // Modify this value to set the maximum zoom distance
    } else {
        // Reset to normal size
        player.scaling = new BABYLON.Vector3(1, 1, 1);
        isPlayerBig = false;
        jumpForce = 10;
        minZoomDistance = 5;  // Modify this value to set the minimum zoom distance
        maxZoomDistance = 10;  // Modify this value to set the maximum zoom distance
    }


    // Dispose of the existing physics impostor
    if (player.physicsImpostor) {
        player.physicsImpostor.dispose();
    }

    // Adjust the mass based on the size
    var newMass = isPlayerBig ? 1 : 1; // Adjust the mass as needed

    // Create a new physics impostor to match the new size
    player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, { mass: newMass, restitution: 0.6, friction: 0.7 }, scene);

    // Reapply the saved velocities
    player.physicsImpostor.setLinearVelocity(currentLinearVelocity);
    player.physicsImpostor.setAngularVelocity(currentAngularVelocity);
    isKeyShiftPressed = false;
}

export async function changePlayerSize(scaleFactor) {
    // Store the current linear and angular velocities
    var currentLinearVelocity = player.physicsImpostor.getLinearVelocity();
    var currentAngularVelocity = player.physicsImpostor.getAngularVelocity();

    // Calculate the distance from the pivot to the bottom of the player before scaling
    var halfOriginalHeight = player.scaling.y / 2.5;

    // Calculate and apply the new scaling factor
    var newScale = player.scaling.x * scaleFactor; // This line was correct
    player.scaling = new BABYLON.Vector3(newScale, newScale, newScale); // Apply the new scale

    // Calculate the new half height after scaling
    var halfNewHeight = player.scaling.y / 2;

    // Adjust the player's y position so the bottom aligns with the ground
    player.position.y += halfNewHeight - halfOriginalHeight;

    // Adjust other properties based on newScale
    jumpForce *= scaleFactor * 1.1; // Proportionally increase or decrease jump force
    minZoomDistance *= scaleFactor; // Adjust zoom distance
    maxZoomDistance *= scaleFactor; // Adjust zoom distance

    // Dispose of the existing physics impostor
    if (player.physicsImpostor) {
        await player.physicsImpostor.dispose();
    }

    // Adjust the mass based on the size (example logic, adjust as needed)
    var newMass = newScale; // Adjust the mass based on the new scale

    // Create a new physics impostor to match the new size
    player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, { mass: newMass, restitution: 0.6, friction: 0.7 }, scene);

    // Reapply the saved velocities
    player.physicsImpostor.setLinearVelocity(currentLinearVelocity);
    player.physicsImpostor.setAngularVelocity(currentAngularVelocity);
}


function handleKeyDown(key) {
  // Handle key down events
  if (key === "a" || key === "A") {
      isKeyAPressed = true;
  } else if (key === "d" || key === "D") {
      isKeyDPressed = true;
  } else if (key === " " && !isJumping && performance.now() - lastJumpTime > jumpCooldown * 1000) {
      //isJumping = true;
      lastJumpTime = performance.now();
      performJump(jumpForce);
  } else if (key === "Shift") {
    isKeyShiftPressed = true;

  } else if (key === "s" || key === "S") {
      isKeySPressed = true;
      // Additional effects for S key...
  }
}
function handleKeyUp(key) {
  // Handle key up events
  if (key === "a" || key === "A") {
      isKeyAPressed = false;
  } else if (key === "d" || key === "D") {
      isKeyDPressed = false;
  } else if (key === " ") {
      isJumping = false;
    } else if (key === "Shift") {
        isKeyShiftPressed = false;
  } else if (key === "s" || key === "S") {
      isKeySPressed = false;
      // Additional effects for releasing S key...
  }
}
function performJump(force) {
  // Only allow jumping if the player is on the ground and not currently jumping
  if (!isOnGround || isJumping) {
      return;
  }

  // Reset vertical velocity
  let currentVelocity = player.physicsImpostor.getLinearVelocity();
  currentVelocity.y = 0;
  player.physicsImpostor.setLinearVelocity(currentVelocity);

  // Apply a consistent jump force
  let jumpVector = new BABYLON.Vector3(0, force, 0);
  player.physicsImpostor.applyImpulse(jumpVector, player.getAbsolutePosition());

  // Set isJumping to true to prevent immediate re-jumping
  isJumping = true;
  // Set a timeout to reset isJumping after a short delay
  setTimeout(() => {
      isJumping = false;
  }, jumpCooldown * 1000);
}

// function compressBall(onComplete) {
//   // Create an animation to compress the ball
//   var compressAnimation = new BABYLON.Animation("compress", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

//   var keyFrames = []; 
//   keyFrames.push({
//       frame: 0,
//       value: new BABYLON.Vector3(1, 1, 1)
//   });
//   keyFrames.push({
//       frame: 15,
//       value: new BABYLON.Vector3(1, 0.6, 1) // Adjust the compression scale as needed
//   });

//   compressAnimation.setKeys(keyFrames);

//   player.animations = [];
//   player.animations.push(compressAnimation);

//   scene.beginAnimation(player, 0, 15, false, 1, () => {
//       if (onComplete) onComplete();
//   });
// }

// function decompressBall() {
//   // Create an animation to decompress the ball
//   var decompressAnimation = new BABYLON.Animation("decompress", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

//   var keyFrames = []; 
//   keyFrames.push({
//       frame: 0,
//       value: new BABYLON.Vector3(1, 0.6, 1) // The compressed scale
//   });
//   keyFrames.push({
//       frame: 15,
//       value: new BABYLON.Vector3(1, 1, 1)
//   });

//   decompressAnimation.setKeys(keyFrames);

//   player.animations = [];
//   player.animations.push(decompressAnimation);

//   scene.beginAnimation(player, 0, 15, false);
// }

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

var previousHorizontalOffset;
var cameraTargetDistance = 10; // Adjust the target distance as needed

  
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


// Define a speed factor. This determines how much the ball's speed affects the zoom.
var speedFactor = 0.1;  // Modify this value to adjust the speed factor

// Store the previous zoom distance for smoothing
var previousZoomDistance = camera.position.z;

engine.runRenderLoop(function () {
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
     scene.render();
}
)





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




