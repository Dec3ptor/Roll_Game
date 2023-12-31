var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var cameraPosition = 0;
var camera;
var player;
var fpsLabel;
var objectsLabel;
var isEditModeEnabled = false; // Flag to track if edit mode is enabled
var cameraTargetDistance = 10; // Adjust the target distance as needed
var cameraZoomSpeed = 0.1; // Adjust the zoom speed as needed
// Define the jump variables
var gravityForce = 15;


let spacePressed = false;
// Global variable to keep track of the time the space key is pressed
var spaceKeyDownTime = null;

// Global variables to control jumping
var jumpFromSurfaceOnly = true; // Set to true if the ball needs to be on a surface to jump
var currentSurface = null; // The surface that the ball is currently touching

let fps = 60;
const fpsDisplay = document.getElementById('fps-display');
const fpsSlider = document.getElementById('fps-slider');

// Update the fps value when the slider is moved
fpsSlider.addEventListener('input', function() {
    fps = parseInt(this.value);
    fpsDisplay.textContent = fps + " FPS";
});

// Define a class for the background
class Background {
    constructor(scene, zPosition, index, width = 20, height = 20) {
        this.scene = scene;

        // Create the background plane
        this.plane = BABYLON.MeshBuilder.CreatePlane("background" + index, { width: width, height: height }, this.scene);
        this.plane.position.z = zPosition;

        // Create a semi-transparent black material for the background
        var material = new BABYLON.StandardMaterial("backgroundMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 0, 0); // Set color to black
        material.alpha = 0.5; // Set alpha to make it semi-transparent

        this.plane.material = material;

        // Create a separate plane for the text
        this.textPlane = BABYLON.MeshBuilder.CreatePlane("textPlane" + index, { width: 1, height: 1 }, this.scene);
        this.textPlane.position.z = zPosition - 0.1; // Position it slightly in front of the background plane

        // Create a dynamic texture for the text
        var texture = new BABYLON.DynamicTexture("dynamic texture", 512, this.scene, true);
        texture.drawText(index, null, 200, "bold 120px Arial", "red", "transparent", true);

        // Create a material for the text plane
        var textMaterial = new BABYLON.StandardMaterial("textMaterial", this.scene);
        textMaterial.diffuseTexture = texture;
        textMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // Set color to white
        textMaterial.alpha = 1; // Set alpha to make it opaque

        this.textPlane.material = textMaterial;
    }
}

// Define a class to manage the backgrounds
class BackgroundManager {
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
// Enable Edit Mode function
var enableEditMode = function () {
    isEditModeEnabled = true;
    player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3.Zero());
    camera.detachControl(canvas);
    console.log("Edit mode enabled");
};

// Disable Edit Mode function
var disableEditMode = function () {
    isEditModeEnabled = false;
    player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, false);
    console.log("Edit mode disabled");
};
// Manually handle mouse events on the canvas
canvas.addEventListener("mousedown", function (event) {
    if (isEditModeEnabled) {
        // Perform edit mode actions here...
        console.log("Edit mode action: Mouse down");
    } else {
        // Perform regular actions here...
        console.log("Regular action: Mouse down");
    }
});

canvas.addEventListener("mousemove", function (event) {
    if (isEditModeEnabled) {
        // Perform edit mode actions here...
        console.log("Edit mode action: Mouse move");
    } else {
        // Perform regular actions here...
        console.log("Regular action: Mouse move");
    }
});

canvas.addEventListener("mouseup", function (event) {
    if (isEditModeEnabled) {
        // Perform edit mode actions here...
        console.log("Edit mode action: Mouse up");
    } else {
        // Perform regular actions here...
        console.log("Regular action: Mouse up");
    }
});
var createDynamicTextTexture = function (scene, text, textColor, backgroundColor) {
  var texture = new BABYLON.DynamicTexture("textTexture", 512, scene, true);
  texture.hasAlpha = true;

  var ctx = texture.getContext();

  // Clear the texture
  ctx.clearRect(0, 0, texture.getSize().width, texture.getSize().height);

  // Set the background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, texture.getSize().width, texture.getSize().height);

  // Set the text color and properties
  ctx.font = "bold 120px Arial";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw the text in the center of the texture
  ctx.fillText(text, texture.getSize().width / 2, texture.getSize().height / 2);

  texture.update();

  return texture;
};

var createTestGrounds = function (
  scene,
  amount,
  sizeRange,
  angleRange,
  maxVerticalJump,
  heightRange,
  {
    position,
    size,
    thickness = 1, // New thickness parameter
    type = "rectangle", // New type parameter
    textureColor = "red",
    textureText,
    textColor = "white",
    friction = 0.5,
    restitution = 0.2,
    gap = 0, // New gap parameter
    offset = 0, // New offset parameter
  } = {}
) {
  var grounds = [];
  var previousHeight = 0; // initial height
  var totalSizeSoFar = offset; // total size of all grounds created so far, start from offset if provided

  for (var i = 0; i < amount; i++) {
    var calculatedSize = i === 0 ? sizeRange[0] : Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    var calculatedAngle = i === 0 ? 0 : Math.random() * (angleRange[1] - angleRange[0]) + angleRange[0];

    // If size was provided, use it instead of calculatedSize
    if (size) {
      calculatedSize = size;
    }

    // Calculate position based on the total size of the previous grounds and the offset
    var positionX = totalSizeSoFar + (gap * i); // Include the gap in the calculation

    // If position was provided and it's the first ground, use it instead
    if (position && i === 0) {
      positionX = position.x;
    }

    // Generate a new height within the specified range, but ensure it's not too far from the previous height
    var height = i === 0 ? 0 : Math.random() * (heightRange[1] - heightRange[0]) + heightRange[0];
    if (Math.abs(height - previousHeight) > maxVerticalJump) {
      height = height > previousHeight ? previousHeight + maxVerticalJump : previousHeight - maxVerticalJump;
    }

    // If position was provided and it's the first ground, use its y value as height
    if (position && i === 0) {
      height = position.y;
    }

    // Calculate position
    var calculatedPosition = new BABYLON.Vector3(positionX, height, 0);

// Replace it with the new ground creation code:
var ground;
if (type === "rectangle") {
  ground = BABYLON.MeshBuilder.CreateBox("ground" + i, {width: calculatedSize, height: thickness, depth: calculatedSize}, scene);
  ground.rotation = new BABYLON.Vector3(0, 0, BABYLON.Tools.ToRadians(calculatedAngle));
} else if (type === "round") {
  ground = BABYLON.MeshBuilder.CreateCylinder("ground" + i, {diameter: calculatedSize, height: thickness}, scene);
} else if (type === "sphere") {
  ground = BABYLON.MeshBuilder.CreateSphere("ground" + i, {diameter: calculatedSize}, scene);
}

// Assign position to the ground
ground.position = calculatedPosition;


    // Assign the name to the ground
    ground.name = "surface" + i;

    // Create the texture
    var texture = createDynamicTextTexture(scene, textureText ? textureText : (i + 1).toString(), textColor);
    ground.material = new BABYLON.StandardMaterial("groundMaterial" + i, scene);
    ground.material.diffuseTexture = texture;
    ground.material.diffuseColor = new BABYLON.Color3.FromHexString(textureColor);
    
    // Enable physics on the ground with a box impostor
// Original line:
// ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);

// Replace with:
if (type === "rectangle") {
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);
} else if (type === "round") {
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.CylinderImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);
} else if (type === "sphere") {
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);
}


    // Add the ground to the array
    grounds.push(ground);
    
    // Update previousHeight and totalSizeSoFar
    previousHeight = height;
    totalSizeSoFar += calculatedSize;
  }

  return grounds;
};






var createScene = function (level) {
  var scene = new BABYLON.Scene(engine);

camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
camera.maxZ = 5000; // Adjust the value as needed
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);
  
  var cameraTargetDistance = 10; // Adjust the target distance as needed

  var gravityVector = new BABYLON.Vector3(0, -15, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  scene.enablePhysics(gravityVector, physicsPlugin);

  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

// BALL CREATION
player = BABYLON.Mesh.CreateSphere("player", 16, 2, scene);
player.position.y = 20;
player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6, friction: 0.7 }, scene);

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
// Create a material for the ball
var ballMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
ballMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Set color to red
player.material = ballMaterial;

// Create a lines mesh for the ball
var linesPoints = [];
for (var angle = 0; angle < 2 * Math.PI; angle += Math.PI / 32) {
    var x = 1 * Math.cos(angle); // replace 2 with the actual radius if it's different
    var y = 1 * Math.sin(angle); // replace 2 with the actual radius if it's different
    linesPoints.push(new BABYLON.Vector3(x, y, 0));
}
var ballLines1 = BABYLON.MeshBuilder.CreateLines("ballLines", { points: linesPoints }, scene);
ballLines1.parent = player; // Make the lines mesh a child of the ball

// Position and rotate the lines mesh around the ball
ballLines1.parent = player; // Make the lines mesh a child of the ball
ballLines1.position.y = 0; // Adjust the vertical position as needed
ballLines1.rotation.x = Math.PI / 2; // Adjust the rotation angle around the x-axis as needed
ballLines1.rotation.z = Math.PI / 2; // Adjust the rotation angle around the z-axis as needed
  
  var ballLines2 = BABYLON.MeshBuilder.CreateLines("ballLines", { points: linesPoints }, scene);
ballLines2.parent = player; // Make the lines mesh a child of the ball

// Position and rotate the lines mesh around the ball
ballLines2.parent = player; // Make the lines mesh a child of the ball
ballLines2.position.y = 0; // Adjust the vertical position as needed
ballLines2.rotation.x = Math.PI / 360; // Adjust the rotation angle around the x-axis as needed
ballLines2.rotation.z = Math.PI / 360; // Adjust the rotation angle around the z-axis as needed

  var backgroundManager = new BackgroundManager(scene);

    // Add backgrounds based on the level
    if (level === 1) {

    } else if (level === 2) {
        backgroundManager.addBackground(20, 80, 40);
        backgroundManager.addBackground(15, 30, 30);
        backgroundManager.addBackground(10, 10, 10);

// Rest of the code...

// Usage example:
//var ground1 = createSurface(scene, BABYLON.Vector3.Zero(), 20, 0, true);
//var ground2 = createSurface(scene, new BABYLON.Vector3(20, -Math.tan(Math.PI / 12) * 20, 0), 20, Math.PI / 12, true);
      
      //(scene, amount, sizeRange, angleRange, maxVerticalJump, heightRange)
//var grounds = createTestGrounds(scene, 100, [15, 15], [0, 5], 0, [0, 0]);

//(scene, amount, sizeRange, angleRange, maxVerticalJump, heightRange, {optional parameters})
      
// Create the base ground
var grounds = createTestGrounds(scene, 1, [35, 35], [0, 0], 0, [0, 0], {
  position: {x: 0, y: 0, z: 0},
  size: 10,
  thickness: 2,
  type: "rectangle",
  textureColor: "#FF0000",
  textureText: "Ground",
  textColor: "white",
  friction: 0.5,
  restitution: 0.2,
  gap: 0,
});

// Create tower levels
var levels = 100; // More levels to reach
var levelHeight = 1; // Smaller vertical distance between levels
var sizeRange = [2, 8]; // Smaller sizes
var xOffsetRange = [-20, 30]; // Greater range in the x-axis
var yOffsetRange = [1, 5]; // Gaps within 0 - 5
var angleRange = [-60, 60];
var types = ["rectangle", "sphere", "round"];

for(var i = 0; i < levels; i++){
  // Random x-offset for each level
  var xOffset = Math.random() * (xOffsetRange[1] - xOffsetRange[0]) + xOffsetRange[0];

  // Random y-offset for each level
  var yOffset = Math.random() * (yOffsetRange[1] - yOffsetRange[0]) + yOffsetRange[0];

  // Random size for each level
  var size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];

  // Random type for each level
  var type = types[Math.floor(Math.random() * types.length)];

  // Steep angles for each level
  var angle = Math.random() * (angleRange[1] - angleRange[0]) + angleRange[0];

  // Create the next level
  var newGrounds = createTestGrounds(scene, 1, [size, size], [angle, angle], 0, [0, 0], {
    position: {x: xOffset, y: levelHeight * (i + 1) + yOffset, z: 0}, // Position the level upwards in the y-axis
    size: size,
    thickness: 2,
    type: type,
    textureColor: "#00FF00",
    textureText: "Ground",
    textColor: "white",
    friction: 0.5,
    restitution: 0.2,
    gap: 0,
  });
  
  grounds = grounds.concat(newGrounds);
}

scene.onBeforeRenderObservable.add(() => {
    if (player.position.y < -30) {
        player.position = new BABYLON.Vector3(0, 20, 0);  // Replace with your desired starting position
        player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));  // This stops the player's momentum
    }
});
// Rest of the code...d



        var inclineRadius = 10;
        var inclineSegments = 500;
        var inclineAngle = Math.PI / inclineSegments;

        // Create an array of points along the incline path
        var pathPoints = [];
        for (var i = 0; i < inclineSegments; i++) {
            var angle = i * inclineAngle;
            var x = inclineRadius * Math.cos(angle);
            var z = inclineRadius * Math.sin(angle);
            var y = inclineRadius - inclineRadius * Math.cos(angle);
            pathPoints.push(new BABYLON.Vector3(x, y, z));
        }

        // Define the shape of the incline (a rectangle in this case)
        var shape = [
            new BABYLON.Vector3(-1, 0, 0),
            new BABYLON.Vector3(-1, 0, -2),
            new BABYLON.Vector3(1, 0, -2),
            new BABYLON.Vector3(1, 0, 0)
        ];

        // Extrude the shape along the path
        var inclineMesh = BABYLON.MeshBuilder.ExtrudeShape("incline", { shape: shape, path: pathPoints, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
        inclineMesh.rotation.x = Math.PI / 2; // Adjust the angle of the incline
        //inclineMesh.position = ground1.position; // Set the position relative to ground1

        // Set up physics impostor for the incline
        inclineMesh.physicsImpostor = new BABYLON.PhysicsImpostor(inclineMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    } else if (level === 3) {

    }

    var playerSpeed = 0;
    var keyADown = false;
    var keyDDown;

    // Show FPS
    fpsLabel = document.createElement("div");
    fpsLabel.style.position = "absolute";
    fpsLabel.style.color = "white";
    fpsLabel.style.fontFamily = "Arial";
    fpsLabel.style.fontSize = "20px";
    fpsLabel.style.top = "10px";
    fpsLabel.style.left = "10px";
    document.body.appendChild(fpsLabel);

    // Show loaded objects
    objectsLabel = document.createElement("div");
    objectsLabel.style.position = "absolute";
    objectsLabel.style.color = "white";
    objectsLabel.style.fontFamily = "Arial";
    objectsLabel.style.fontSize = "20px";
    objectsLabel.style.top = "40px";
    objectsLabel.style.left = "10px";
    document.body.appendChild(objectsLabel);

    var isCreatingMesh = false;
    var newMesh;
    var editingMesh = null;
    var isEditModeEnabled = false;

 // Enable Edit Mode function
var enableEditMode = function () {
    isEditModeEnabled = true;
    player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3.Zero());
    camera.detachControl(canvas);
    console.log("Edit mode enabled");
};

// Disable Edit Mode function
var disableEditMode = function () {
    isEditModeEnabled = false;
    player.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, false);
    console.log("Edit mode disabled");
};


    var handleMouseDown = function (event) {
        if (!isCreatingMesh && isEditModeEnabled && event.button === 0) {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                editingMesh = pickResult.pickedMesh;
                isMouseDown = true;
            }
        }
    };

    var handleMouseUp = function () {
        if (!isCreatingMesh && editingMesh) {
            isMouseDown = false;
            editingControl = null;
        }
    };

    var handleMouseMove = function (event) {
        if (!isCreatingMesh && editingMesh && isMouseDown) {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                var newPosition = pickResult.pickedPoint;
                editingMesh.position = newPosition;

                if (editingControl === "move") {
                    // Implement movement logic
                } else if (editingControl === "stretch") {
                    // Implement stretching logic
                } else if (editingControl === "rotate") {
                    // Implement rotation logic
                }
            }
        }
    };

    var handleMouseClick = function (event) {
        if (isCreatingMesh && isEditModeEnabled && event.button === 0) {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                newMesh = BABYLON.MeshBuilder.CreateBox("newMesh", { width: 1, height: 1, depth: 1 }, scene);
                newMesh.position = pickResult.pickedPoint;
                newMesh.physicsImpostor = new BABYLON.PhysicsImpostor(newMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

                // Show movement, stretch, and rotate controls
                // ...

                isCreatingMesh = false;
            }
        }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleMouseClick);

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


// Handle keyboard events
scene.onKeyboardObservable.add((kbInfo) => {
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
// Modify your calculateJumpVelocity() function
function calculateJumpVelocity() {
  if (!jumpButtonPressTime) {
    return 0;
  }
  let timeHeldDown = (performance.now() - jumpButtonPressTime) / 1000; // Time in seconds
  let jumpForce;
  // Implement easing function for jump, use Math.sqrt for example
  if (timeHeldDown < jumpDurationMax) {
    jumpForce = jumpForceInitial * Math.sqrt(1 - (timeHeldDown / jumpDurationMax));
  } else {
    jumpForce = 0;
  }
  return jumpForce;
}

scene.registerBeforeRender(function () {
  let currentTime = performance.now();
  let deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;

  // Apply a constant force downwards when player is not on ground
  if (!isOnGround && player.physicsImpostor) {
    let fallingForce = calculateFallingForce(deltaTime);
    let currentVelocity = player.physicsImpostor.getLinearVelocity();
    currentVelocity.y -= fallingForce;
    player.physicsImpostor.setLinearVelocity(currentVelocity);
  }
  
  // Apply jump force when jump button is pressed
  if (isJumpButtonDown && player.physicsImpostor) {
    let jumpVelocity = calculateJumpVelocity(deltaTime);
    let currentVelocity = player.physicsImpostor.getLinearVelocity();
    currentVelocity.y += jumpVelocity;
    player.physicsImpostor.setLinearVelocity(currentVelocity);
  }
});

  
function calculateFallingForce(deltaTime) {
  // Use a constant value for the force of gravity. This can be tweaked as needed
  return 9.8 * deltaTime;
}
// Then modify the registerBeforeRender function to call checkIfOnGround
scene.registerBeforeRender(function () {
  let currentTime = performance.now();
  let deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;

  checkIfOnGround(); // Check if the ball is on the ground

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
});
// Add a variable to keep track of the last surface
let lastSurface = null;
// Register collision event handlers for each surface
grounds.forEach((ground) => {
  player.physicsImpostor.registerOnPhysicsCollide(ground.physicsImpostor, function(main, collided) {
    // If the player is touching a new surface, log a message
    if (collided.object.name !== lastSurface) {
      console.log("Ball is touching surface:", collided.object.name);
      lastSurface = collided.object.name;
    }
  });
});

// Update player position and speed in the scene.registerBeforeRender function
scene.registerBeforeRender(function () {
  // Apply continuous forces based on key states
  if (isKeyAPressed && isKeySPressed == false) {
    player.physicsImpostor.applyForce(new BABYLON.Vector3(-playerMovementForce, 0, 0), player.getAbsolutePosition());
  }
  if (isKeyDPressed && isKeySPressed == false) {
    player.physicsImpostor.applyForce(new BABYLON.Vector3(playerMovementForce, 0, 0), player.getAbsolutePosition());
  }

  // Apply damping force to gradually reduce the speed
  player.physicsImpostor.applyForce(player.physicsImpostor.getLinearVelocity().scale(-playerDampingForce), player.getAbsolutePosition());

  // Update player's position based on physics impostor
  player.position = player.physicsImpostor.getObjectCenter();

  // Update player's speed
  playerSpeed = player.physicsImpostor.getLinearVelocity().x;

  // Update FPS
  fpsLabel.textContent = "FPS: " + engine.getFps().toFixed();

  // Update loaded objects
  objectsLabel.textContent = "Objects: " + scene.meshes.length;
});

    return scene;
};

function createSurface(scene, position, size, rotation, hasPhysics, allowXMovement, allowYMovement, allowZMovement) {
  // Create the visual mesh
  var mesh = BABYLON.Mesh.CreateGround("surface", size, size, 2, scene);
  mesh.position = position;
  mesh.rotation = rotation;

  // Assign a material to the mesh
  var material = new BABYLON.StandardMaterial("surfaceMaterial", scene);
  material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Adjust the color as desired
  mesh.material = material;

  // Add physics properties if needed
  if (hasPhysics) {
    mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    // Set movement restrictions
    if (!allowXMovement) {
      mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.physicsBody.fixedRotation = true;
    }

    if (!allowYMovement) {
      mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.physicsBody.fixedRotation = true;
    }

    if (!allowZMovement) {
      mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.physicsBody.fixedRotation = true;
    }

// Collision event handler
mesh.physicsImpostor.onCollideEvent = function (otherMesh) {
  if (otherMesh && otherMesh.name && otherMesh.name.startsWith("surface")) {
    // Perform the necessary actions
    console.log("Player collided with a surface:", otherMesh.name);

    // Stop physics movement if required
    if (shouldStopPhysicsMovement()) {
      mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
      mesh.physicsImpostor.physicsBody.fixedRotation = true;
    }
  }
};

  }

  return mesh;
}

var currentLevel = 2;
var scene = createScene(currentLevel);

engine.runRenderLoop(function () {
    camera.position.x = player.position.x + cameraPosition;
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});

document.getElementById("cameraPosition1").addEventListener("click", function () {
    cameraPosition = -5;
});

document.getElementById("cameraPosition2").addEventListener("click", function () {
    cameraPosition = -10;
});

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
});


function exportScene(scene) {
    var serializedScene = BABYLON.SceneSerializer.Serialize(scene, function(serializedNode) {
        if (serializedNode.name === "player" && mesh.name !== "ballMaterial" && mesh.name !== "ballLines") {
            // Exclude the player from serialization
            return false;
        }
        return true;
    });
    var strScene = JSON.stringify(serializedScene);

    var blob = new Blob([strScene], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    a.href = url;
    a.download = 'scene.babylon';
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function importScene(scene, file) {
    var reader = new FileReader();

    reader.onload = function(event) {
        var contents = event.target.result;
        var parsedData = JSON.parse(contents);

        // Clear the 'grounds' array
        grounds = [];

        // Remove all objects from the previous level, excluding the player
        scene.meshes.forEach(function(mesh) {
            if (mesh.name !== "player" && mesh.name !== "ballMaterial" && mesh.name !== "ballLines") {
                mesh.dispose();
            }
        });

        // Import the new scene
        BABYLON.SceneLoader.ImportMesh("", "", "data:" + JSON.stringify(parsedData), scene, function(newMeshes) {
            // Update the 'grounds' array with the new references to ground meshes
            grounds = newMeshes.filter(function(mesh) {
                // Adjust the condition as per your ground mesh naming or identification
                return mesh.name.startsWith("ground");
            });

            // Check if the player is on the ground
            checkIfOnGround();

            // Reload the game to start fresh with the new level
            window.location.reload();
        });
    };

    reader.readAsText(file);
}

// Button to export the scene
var exportButton = document.createElement("button");
exportButton.id = "exportButton";
exportButton.textContent = "Export Scene";
exportButton.style.width = "100px";
exportButton.style.height = "30px";
exportButton.style.backgroundColor = "#4CAF50"; // Change to your preferred color
exportButton.style.color = "white"; // Change to your preferred color
exportButton.style.border = "none";
exportButton.style.cursor = "pointer";
exportButton.style.padding = "5px 10px";
exportButton.style.textAlign = "center";
exportButton.style.textDecoration = "none";
exportButton.style.display = "inline-block";
exportButton.style.fontSize = "16px";
exportButton.style.margin = "4px 2px";
exportButton.style.transitionDuration = "0.4s";
exportButton.style.borderRadius = "12px";
document.body.appendChild(exportButton);

// File input to import a scene
var importButton = document.createElement("input");
importButton.type = "file";
importButton.id = "importButton";
importButton.style.display = "none";
document.body.appendChild(importButton);

// Label for the file input, styled as a button
var importLabel = document.createElement("label");
importLabel.htmlFor = "importButton";
importLabel.textContent = "Import Scene";
importLabel.style.width = "100px";
importLabel.style.height = "30px";
importLabel.style.backgroundColor = "#4CAF50"; // Change to your preferred color
importLabel.style.color = "white"; // Change to your preferred color
importLabel.style.border = "none";
importLabel.style.cursor = "pointer";
importLabel.style.padding = "5px 10px";
importLabel.style.textAlign = "center";
importLabel.style.textDecoration = "none";
importLabel.style.display = "inline-block";
importLabel.style.fontSize = "16px";
importLabel.style.margin = "4px 2px";
importLabel.style.transitionDuration = "0.4s";
importLabel.style.borderRadius = "12px";
document.body.appendChild(importLabel);

document.getElementById('exportButton').addEventListener('click', function() {
    exportScene(scene);
});

document.getElementById('importButton').addEventListener('change', function(event) {
    importScene(scene, event.target.files[0]);
});


function gameLoop() {
    handleInput();        // Check for user input and handle it
    updateGame();         // Update the game state
    render();             // Draw the current state to the screen

    // Call the game loop again after a delay based on the desired FPS
    setTimeout(gameLoop, 1000 / fps);
}

// Start the game loop
gameLoop();

function setupInputHandlers() {
    // Handle keyboard events
    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        // Your switch case code goes here...
      }
    });
}

function handleInput() {
  // Apply continuous forces based on key states
  if (isKeyAPressed && isKeySPressed == false) {
    player.physicsImpostor.applyForce(new BABYLON.Vector3(-playerMovementForce, 0, 0), player.getAbsolutePosition());
  }
  if (isKeyDPressed && isKeySPressed == false) {
    player.physicsImpostor.applyForce(new BABYLON.Vector3(playerMovementForce, 0, 0), player.getAbsolutePosition());
  }
}
