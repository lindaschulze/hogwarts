const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sortingHat = document.getElementById('sorting-hat');
const houseResult = document.getElementById('house-result');

// Start webcam
async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
}

// Load Face-api.js models from CDN
async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/models');
    await faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@latest/models');
}

// Start face detection
async function detectFace() {
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);

        detections.forEach(det => {
            const { gender, expressions } = det;
            const hairColor = getHairColor(det); // Custom function to analyze hair
            const faceBox = det.detection.box;

            // Position Sorting Hat on head
            sortingHat.style.display = "block";
            sortingHat.style.left = `${faceBox.x + faceBox.width / 2 - 60}px`;
            sortingHat.style.top = `${faceBox.y - 100}px`;

            // Assign house
            if (expressions.neutral > 0.7) {
                houseResult.textContent = "You belong to Slytherin!";
            } else if (hairColor === 'red') {
                houseResult.textContent = "You belong to Gryffindor!";
            } else if (hairColor === 'blonde') {
                houseResult.textContent = "You belong to Hufflepuff!";
            } else if (hairColor === 'black') {
                houseResult.textContent = "You belong to Ravenclaw!";
            } else if (hairColor === 'none') {
                houseResult.textContent = "You are a House Elf!";
            } else {
                houseResult.textContent = "Sorting Error!";
            }
        });
    }, 1000);
}

// Custom function to analyze hair color (basic placeholder)
function getHairColor(detection) {
    const colors = ['red', 'blonde', 'black', 'none'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Start everything
startVideo().then(loadModels).then(detectFace);
