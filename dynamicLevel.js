export var grounds = [];

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
      size,
      thickness = 1, // New thickness parameter
      type = "rectangle", // New type parameter
      textureColor = "red",
      textureText,
      textColor = "white",
      friction = 0.5,
      restitution = 50,
      gap = 0, // New gap parameter
      offset = 0, // New offset parameter
    } = {}
  ) {
    grounds = [];
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