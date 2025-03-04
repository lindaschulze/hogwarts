async function startCamera() {
    const video = document.getElementById("video");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Kamera-Zugriff verweigert", error);
    }
}

async function detectFace() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights');
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
        if (detections) {
            const x = detections.box.x;
            const y = detections.box.y - 50;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "brown";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 60, y + 50);
            ctx.lineTo(x - 60, y + 50);
            ctx.closePath();
            ctx.fill();
        }
    }, 100);
}

function sortHouse() {
    const houses = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];
    const chosenHouse = houses[Math.floor(Math.random() * houses.length)];
    document.getElementById("house").innerText = `Du bist in ${chosenHouse}!`;

    const speech = new SpeechSynthesisUtterance(`You belong to ${chosenHouse}!`);
    speechSynthesis.speak(speech);
}

video.addEventListener("play", detectFace);

setTimeout(sortHouse, 5000);

startCamera();
