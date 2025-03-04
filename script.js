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
    const hatImg = new Image();
    hatImg.src = "./sorting-hat.gif"; // Pfad überprüfen

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
        console.log(detections);  // Überprüfen, ob das Gesicht erkannt wird

        if (detections) {
            const x = detections.box.x;
            const y = detections.box.y - 120; // Hut höher setzen
            const width = detections.box.width * 1.2;
            const height = width * 1.2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(hatImg, x, y, width, height);
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

document.getElementById("video").addEventListener("play", detectFace);
setTimeout(sortHouse, 5000);
startCamera();
