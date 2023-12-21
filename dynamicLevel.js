import { grounds } from './scene.js';
// Declare the array to store glowing balls
export var glowBalls = [];
import { player, createPlayer } from './createPlayer.js';
import { changePlayerSize } from './content.js';

export var createDynamicTextTexture = function (scene, text, textColor, backgroundColor) {
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
  
  export var createTestGrounds = function (
    scene,
    amount,
    sizeRange,
    angleRange,
    maxVerticalJump,
    heightRange,
    {
      position,
      specificSize, // New parameter for specific size
      thickness = 1,
      type = "rectangle",
      textureColor = "red",
      textureText,
      textColor = "white",
      friction = 0.5,
      restitution = 50,
      gap = 0,
      offset = 0,
    } = {}
  ) {
    var previousHeight = 0;
    var totalSizeSoFar = offset;

    for (var i = 0; i < amount; i++) {
      var calculatedSize = specificSize ? specificSize : (i === 0 ? sizeRange[0] : Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0]);
      var calculatedAngle = i === 0 ? 0 : Math.random() * (angleRange[1] - angleRange[0]) + angleRange[0];
      var positionX = totalSizeSoFar + (gap * i);

      if (position && i === 0) {
        positionX = position.x;
      }

      var height = i === 0 ? 0 : Math.random() * (heightRange[1] - heightRange[0]) + heightRange[0];
      if (Math.abs(height - previousHeight) > maxVerticalJump) {
        height = height > previousHeight ? previousHeight + maxVerticalJump : previousHeight - maxVerticalJump;
      }

      if (position && i === 0) {
        height = position.y;
      }

      var calculatedPosition = new BABYLON.Vector3(positionX, height, 0);
      var ground;

      if (type === "rectangle") {
        ground = BABYLON.MeshBuilder.CreateBox("ground" + i, {width: calculatedSize.width, height: thickness, depth: calculatedSize.depth}, scene);
        ground.rotation = new BABYLON.Vector3(0, 0, BABYLON.Tools.ToRadians(calculatedAngle));
  } else if (type === "round") {
    ground = BABYLON.MeshBuilder.CreateCylinder("ground" + i, {diameter: calculatedSize, height: thickness}, scene);
  } else if (type === "sphere") {
    ground = BABYLON.MeshBuilder.CreateSphere("ground" + i, {diameter: calculatedSize}, scene);
  }
  // Check if ground is initialized
  if (!ground) {
    console.error("Failed to create ground of type:", type, " at iteration:", i);
    continue;
  }

  ground.position = calculatedPosition;
  ground.name = "surface" + i;

  var texture = createDynamicTextTexture(scene, textureText ? textureText : (i + 1).toString(), textColor);
  ground.material = new BABYLON.StandardMaterial("groundMaterial" + i, scene);
  ground.material.diffuseTexture = texture;
  ground.material.diffuseColor = new BABYLON.Color3.FromHexString(textureColor);

  if (type === "rectangle") {
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);
  } else if (type === "round") {
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.CylinderImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);
  } else if (type === "sphere") {
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0, restitution: restitution, friction: friction}, scene);
  }
  
  
  grounds.push(ground);
  previousHeight = height;
  totalSizeSoFar += specificSize ? specificSize.width : calculatedSize.width; // Adjust total size based on specific size
}

return grounds;
};

// Global flag to prevent multiple collision detections
var isCollisionHandling = false;

export function createGlowingBall(scene, position, index) {
    // Create a sphere mesh for the glowing ball
    var ball = BABYLON.MeshBuilder.CreateSphere("glowingBall" + index, { diameter: 1 }, scene);
    ball.position = position;

    // Add glowing material or shader
    var glowMaterial = new BABYLON.StandardMaterial("glowMat" + index, scene);
    ball.material = glowMaterial;

    // Set up collision detection (without physics)
    ball.actionManager = new BABYLON.ActionManager(scene);
    ball.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
        { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: player },
        function () {
            if (!isCollisionHandling) {
                isCollisionHandling = true; // Set the flag to true to prevent further triggers

                console.log("Ball Hit Lol");
                changePlayerSize(1.2); // Increase player size

                // Remove the ball after touch
                ball.dispose();

                // Remove the ball from the glowBalls array
                const ballIndex = glowBalls.indexOf(ball);
                if (ballIndex > -1) {
                    glowBalls.splice(ballIndex, 1);
                }

                // Reset the flag after a short delay
                setTimeout(() => { isCollisionHandling = false; }, 100); // Delay in milliseconds
            }
        }
    ));

    // Add the ball to the glowBalls array
    glowBalls.push(ball);
}


