import { createPlayer} from './createPlayer.js';
import { BackgroundManager } from './backgroundManager.js';
import { createTestGrounds, createGlowingBall } from './dynamicLevel.js';
// scene.js
import { camera, setCamera } from './renderScene.js';
// Import required modules

// Declare scene variable but don't assign it yet
export var scene;// Get the canvas DOM element
export var canvas = document.getElementById("renderCanvas");
export var grounds = [];

// Initialize the BABYLON 3D engine
export var engine = new BABYLON.Engine(canvas, true);



// Define createScene function but don't execute it yet
export var createScene = function () {
    // Initialize scene here to ensure it's the same instance
    scene = new BABYLON.Scene(engine);
    var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    // Move player creation after physics is enabled
    createPlayer();
    loadBackgrounds();
    loadGrounds();

    // Instead of reassigning camera, initialize it if it's null
    if (!camera) {
        setCamera(new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene));
        camera.maxZ = 5000; // Adjust the value as needed
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, false);

        var cameraTargetDistance = 10; // Adjust the target distance as needed
    }

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    //         var inclineRadius = 10;
    //         var inclineSegments = 500;
    //         var inclineAngle = Math.PI / inclineSegments;

    //         // Create an array of points along the incline path
    //         var pathPoints = [];
    //         for (var i = 0; i < inclineSegments; i++) {
    //             var angle = i * inclineAngle;
    //             var x = inclineRadius * Math.cos(angle);
    //             var z = inclineRadius * Math.sin(angle);
    //             var y = inclineRadius - inclineRadius * Math.cos(angle);
    //             pathPoints.push(new BABYLON.Vector3(x, y, z));
    //         }

    //         // Define the shape of the incline (a rectangle in this case)
    //         var shape = [
    //             new BABYLON.Vector3(-1, 0, 0),
    //             new BABYLON.Vector3(-1, 0, -2),
    //             new BABYLON.Vector3(1, 0, -2),
    //             new BABYLON.Vector3(1, 0, 0)
    //         ];

    //         // Extrude the shape along the path
    //         var inclineMesh = BABYLON.MeshBuilder.ExtrudeShape("incline", { shape: shape, path: pathPoints, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
    //         inclineMesh.rotation.x = Math.PI / 2; // Adjust the angle of the incline
    //         //inclineMesh.position = ground1.position; // Set the position relative to ground1

    //         // Set up physics impostor for the incline
    //         inclineMesh.physicsImpostor = new BABYLON.PhysicsImpostor(inclineMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    
    return scene;
};
// Export functions to load backgrounds and grounds but don't execute them yet
export function loadBackgrounds() {
    var backgroundManager = new BackgroundManager(scene);

    // Add backgrounds 
    backgroundManager.addBackground(20, 80, 40);
    backgroundManager.addBackground(15, 30, 30);
    backgroundManager.addBackground(10, 10, 10);
}

export function loadGrounds() {
    // Usage example:
    //var ground1 = createSurface(scene, BABYLON.Vector3.Zero(), 20, 0, true);
    //var ground2 = createSurface(scene, new BABYLON.Vector3(20, -Math.tan(Math.PI / 12) * 20, 0), 20, Math.PI / 12, true);

    //(scene, amount, sizeRange, angleRange, maxVerticalJump, heightRange)
    //var grounds = createTestGrounds(scene, 100, [15, 15], [0, 5], 0, [0, 0]);

    //(scene, amount, sizeRange, angleRange, maxVerticalJump, heightRange, {optional parameters})

    // Create the base ground
    var grounds = createTestGrounds(scene, 1, [35, 35], [0, 0], 0, [0, 0], {
        position: { x: 0, y: 0, z: 0 },
        specificSize: { width: 10000000, depth: 1 }, // Specific size
        thickness: 2,
        type: "rectangle",
        textureColor: "#FF0000",
        textureText: "Ground",
        textColor: "white",
        friction: 0.5,
        restitution: 0.5,
        gap: 0,
    });

    console.log("Base ground created:", grounds);


    // Create tower levels
    var levels = 100; // More levels to reach
    var levelHeight = 0.2; // Smaller vertical distance between levels
    var sizeRange = [2, 8]; // Smaller sizes
    var xOffsetRange = [-20, 150]; // Greater range in the x-axis
    var yOffsetRange = [1, 5]; // Gaps within 0 - 5
    var angleRange = [-60, 60];
    var types = ["rectangle", "sphere", "round"];

    for (var i = 0; i < levels; i++) {
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
    
        // Determine whether to use specific size based on the type
        var groundOptions = {
            position: { x: xOffset, y: levelHeight * (i + 1) + yOffset, z: 0 },
            thickness: 2,
            type: type,
            textureColor: "#00FF00",
            textureText: "Ground",
            textColor: "white",
            friction: 0.5,
            restitution: 0.5,
            gap: 0
        };
    
        if (type === "rectangle") {
            // Use specific size for rectangle type
            groundOptions.specificSize = { width: size, depth: size }; // Example specific size
        } else {
            // Use random size for other types
            groundOptions.size = size;
        }
    
        // Create the next level
        var newGrounds = createTestGrounds(scene, 1, [size, size], [angle, angle], 0, [0, 0], groundOptions);
        console.log("Ground at level " + (i + 1) + ":", newGrounds);
    
        grounds = grounds.concat(newGrounds);
    
        // Determine the position for the glowing ball
        var ballPosition = new BABYLON.Vector3(xOffset, levelHeight * (i + 1) + yOffset + 1, 0); // 1 unit above the ground
        
        // Create and place the glowing ball
        createGlowingBall(scene, ballPosition);
    
        levelHeight += 0.01;
    }
    
    console.log("All grounds:", grounds);

}

//     var levels = 100;
//     var ballFrequency = 1;
//     var xOffset = 0; // Starting x-offset
//     var yOffset = 0; // Starting y-offset
//     var levelWidth = 5; // Width of each level
//     var levelHeight = 2; // Height of each level
//     var hillHeight = 600; // Maximum height of hills
//     var hillStep = 1; // Height increment for each step of the hill

//     for (var i = 0; i < levels; i++) {
//         var size = levelWidth; // Uniform size for each level
//         var type = "rectangle"; // Use rectangles for flat levels
//         var height = yOffset;

//         // Logic to create hills/steps
//         if (i % 10 < 5) {
//             // Going up
//             height += hillStep;
//             if (height > hillHeight) height = hillHeight;
//         } else {
//             // Going down
//             height -= hillStep;
//             if (height < 0) height = 0;
//         }

//         // Create the level
//         var newGround = createTestGrounds(scene, 1, [size, size], [0, 0], 0, [height, height], {
//             position: { x: xOffset, y: height, z: 0 },
//             size: size,
//             thickness: 2,
//             type: type,
//             textureColor: "#00FF00",
//             textureText: "Ground",
//             textColor: "white",
//             friction: 0.5,
//             restitution: 0.5,
//             gap: 0,
//         });

//         grounds.push(newGround);

//         // Place a glowing ball on every 5th ground
//         if (i % ballFrequency === 0) {
//             var ballPosition = new BABYLON.Vector3(xOffset, height + 1, 0); // 1 unit above the ground
//             createGlowingBall(scene, ballPosition, i);
//         }

//         xOffset += levelWidth; // Move to the next level position
//     }

//     console.log("All structured grounds and balls created:", grounds);

// }




// export function loadGrounds(scene) {
//     // Create the base ground
//     var baseGround = createTestGrounds(scene, 1, [35, 35], [0, 0], 0, [0, 0], {
//         position: { x: 0, y: 0, z: 0 },
//         size: 10,
//         thickness: 2,
//         type: "rectangle",
//         textureColor: "#FF0000",
//         textureText: "Base",
//         textColor: "white",
//         friction: 0.5,
//         restitution: 0.5,
//         gap: 0
//     });

//     console.log("Base ground created:", baseGround);

//     // Parameters for skatepark elements
//     var skateElements = 50;
//     var sizeRange = [5, 15];
//     var xOffsetRange = [-20, 60];
//     var yOffsetRange = [0, 50];
//     var angleRange = [-45, 45];
//     var types = ["rectangle", "round", "ramp"];  // Including bowl shape

//     for (var i = 0; i < skateElements; i++) {
//         var xOffset = Math.random() * (xOffsetRange[1] - xOffsetRange[0]) + xOffsetRange[0];
//         var yOffset = Math.random() * (yOffsetRange[1] - yOffsetRange[0]) + yOffsetRange[0];
//         var size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
//         var angle = Math.random() * (angleRange[1] - angleRange[0]) + angleRange[0];
//         var type = types[Math.floor(Math.random() * types.length)];

//         // Create skatepark elements
//         var skateGround = createTestGrounds(scene, 1, [size, size], [angle, angle], 0, [yOffset, yOffset], {
//             position: { x: xOffset, y: yOffset, z: 0 },
//             size: size,
//             thickness: 2,
//             type: type,
//             textureColor: "#00FF00",
//             textureText: type.charAt(0).toUpperCase() + type.slice(1),
//             textColor: "white",
//             friction: 0.5,
//             restitution: 0.5,
//             gap: 0
//         });

//         console.log("Skatepark element created:", skateGround);
//     }

//     console.log("All grounds:", grounds);
// }
