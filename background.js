// Define a class for the background
export class Background {
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
