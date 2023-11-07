import { scene } from './scene.js';

// Variables to track key states
var isKeyAPressed = false;
var isKeyDPressed = false;
// Add a new variable to track the "s" key state
var isKeySPressed = false;

export function setupInputHandlers() {
    var playerSpeed = 0;
    var keyADown = false;
    var keyDDown;

    // Define the player's speed and movement force
    var playerSpeed = 0;
    var playerMovementForce = 20;
    var playerDampingForce = 0.7;

    // Variables to track key states
    var isKeyAPressed = false;
    var isKeyDPressed = false;
    // Add a new variable to track the "s" key state
    var isKeySPressed = false;

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
    // Handle keyboard events
    scene.onKeyboardObservable.add((kbInfo) => {
        // Your switch case code goes here...
        // Move your KEYDOWN and KEYUP handlers here...
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                if (kbInfo.event.key == "a" || kbInfo.event.key == "A" && isKeySPressed == false) {
                    isKeyAPressed = true;
                } else if (kbInfo.event.key == "d" || kbInfo.event.key == "D" && isKeySPressed == false) {
                    isKeyDPressed = true;
                } else if (kbInfo.event.key == " " || kbInfo.event.key == "Spacebar") { // Check if space bar is pressed
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
                if (kbInfo.event.key == "a" || kbInfo.event.key == "A") {
                    isKeyAPressed = false;
                } else if (kbInfo.event.key == "d" || kbInfo.event.key == "D") {
                    isKeyDPressed = false;
                } else if (kbInfo.event.key == " " || kbInfo.event.key == "Spacebar") { // Check if space bar is released
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

export function handleInput() {


    // Apply continuous forces based on key states
    if (isKeyAPressed && isKeySPressed == false) {
        player.physicsImpostor.applyForce(new BABYLON.Vector3(-playerMovementForce, 0, 0), player.getAbsolutePosition());
    }
    if (isKeyDPressed && isKeySPressed == false) {
        player.physicsImpostor.applyForce(new BABYLON.Vector3(playerMovementForce, 0, 0), player.getAbsolutePosition());
    }
}
