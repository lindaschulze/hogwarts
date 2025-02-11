console.log("Script is running...");

// Check if face-api.js is loaded
if (typeof faceapi === "undefined") {
    console.error("❌ face-api.js is NOT loaded! Check the CDN URL.");
} else {
    console.log("✅ face-api.js is loaded correctly.");
}

// Wait for document load
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Document fully loaded, initializing face-api.js...");

    await loadModels();  // Load models before starting video
    startVideo();
});

// Load Face-api.js models
async function loadModels() {
    console.log("Loading models...");
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        await faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        console.log("✅ Models loaded successfully!");
    } catch (error) {
        console.error("❌ Error loading models:", error);
    }
}

// Start webcam
function startVideo() {
    const video = document.getElementById("video");
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => console.error("❌ Error accessing webcam:", err));

    video.addEventListener("playing", detectFace);
}

// Detect face and classify into a Hogwarts house
async function detectFace() {
    console.log("Detecting face...");
}
