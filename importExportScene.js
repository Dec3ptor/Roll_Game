export function exportScene(scene) {
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

export function importScene(scene, file) {
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