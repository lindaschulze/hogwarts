console.log("Script is running...");

// Wait for document to load
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

// Detect face and position sorting hat
async function detectFace() {
    console.log("Detecting face...");
    const video = document.getElementById("video");
    const hat = document.getElementById("sorting-hat");

    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.appendChild(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

        if (detections) {
            console.log("Face detected!");

            // Get face bounding box
            const { x, y, width, height } = detections.detection.box;

            // Position the hat above the detected face
            hat.style.left = `${x + width / 2 - 50}px`;  // Center horizontally
            hat.style.top = `${y - 80}px`;  // Slightly above the head
            hat.style.width = "100px";  // Adjust size as needed
            hat.style.display = "block";  // Make it visible
        } else {
            console.log("No face detected");
            hat.style.display = "none";  // Hide hat if no face detected
        }
    }, 500);  // Update every 500ms
}

