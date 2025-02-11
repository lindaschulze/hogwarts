// Wait for the document to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Document loaded, waiting for face-api.js...");

    // Check if face-api.js is loaded
    if (typeof faceapi === "undefined") {
        console.error("face-api.js is not loaded. Check the script URL.");
        return;
    }

    console.log("face-api.js loaded successfully!");
    
    // Load Face-api.js models
    await loadModels();
    startVideo();
});

// Load face-api.js models from CDN
async function loadModels() {
    console.log("Loading models...");
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/weights');
    await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/weights');
    await faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/weights');
    console.log("Models loaded!");
}

// Start the video stream from the webcam
function startVideo() {
    const video = document.getElementById("video");
    
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => console.error("Error accessing webcam:", err));
    
    video.addEventListener("playing", detectFace);
}

// Detect face and classify into a Hogwarts house
async function detectFace() {
    const video = document.getElementById("video");
    const houseResult = document.getElementById("house-result");
    const sortingHat = document.getElementById("sorting-hat");

    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        console.log("Detections:", detections);

        if (detections.length === 0) {
            houseResult.textContent = "No face detected!";
            sortingHat.style.display = "none";
            return;
        }

        const det = detections[0];
        const faceBox = det.detection.box;

        // Position sorting hat
        positionSortingHat(faceBox);

        // Detect hair color & expression
        const hairColor = getHairColor(video, det);
        const noSmile = det.expressions.neutral > 0.7;

        // Sorting logic
        if (noSmile) {
            houseResult.textContent = "You belong to Slytherin!";
        } else if (hairColor === "red") {
            houseResult.textContent = "You belong to Gryffindor!";
        } else if (hairColor === "blonde") {
            houseResult.textContent = "You belong to Hufflepuff!";
        } else if (hairColor === "black") {
            houseResult.textContent = "You belong to Ravenclaw!";
        } else {
            houseResult.textContent = "You are a House Elf!";
        }
    }, 1000);
}

// Position sorting hat above the detected face
function positionSortingHat(faceBox) {
    const sortingHat = document.getElementById("sorting-hat");
    sortingHat.style.display = "block";
    sortingHat.style.left = `${faceBox.x + faceBox.width / 2 - 60}px`;
    sortingHat.style.top = `${faceBox.y - 120}px`; // Move slightly above the head
}

// Dummy function to classify hair color (needs proper implementation)
function getHairColor(video, detection) {
    return "red"; // Always return "red" for now to test Gryffindor
}
