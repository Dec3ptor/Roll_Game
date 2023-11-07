import { scene } from './scene.js';



export var player;

export var createPlayer = function() {
    // Ensure the scene is not null
    if (!scene) {
        console.error('The scene has not been initialized.');
        return;
    }

    
    // BALL CREATION
    player = BABYLON.Mesh.CreateSphere("player", 16, 2, scene);
  player.position.y = 160;
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
  }