let faceDetected = false;
let hasSorted = false;

async function startCamera() {
    const video = document.getElementById("video");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            setupCanvas();
            detectFace();
        };
    } catch (error) {
        document.getElementById("house").innerText = "Kamera-Zugriff erforderlich!";
    }
}

function setupCanvas() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

async function detectFace() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights');
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const hatImg = new Image();
    hatImg.src = "./sorting-hat.gif";

    setInterval(async () => {
        if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) {
            const detection = await faceapi.detectSingleFace(
                video, new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                if (!faceDetected) {
                    faceDetected = true;
                    setTimeout(() => sortHouse(detection), 3000);
                }
                // Hut über Kopf positionieren
                const { x, y, width, height } = detection.detection.box;
                const hatWidth = width * 1.2;
                const hatHeight = hatWidth * 0.9;
                const hatX = x - (hatWidth - width) / 2;
                const hatY = y - hatHeight * 0.75;
                ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
            }
        }
    }, 100);
}

// Regeln für Hauswahl: Dummy-Logik; eigene Charakteristika können eingetragen werden
function analyzePersonality(detection) {
    // Gesichtsproportionen auslesen (Beispiel)
    const landmarks = detection.landmarks.positions;
    const { width, height } = detection.detection.box;
    const faceRatio = height / width;
    if (faceRatio > 1.3) return "Ravenclaw";
    if (faceRatio < 1.1) return "Hufflepuff";
    return ["Gryffindor","Slytherin"][Math.floor(Math.random()*2)];
}

function sortHouse(detection) {
    if (hasSorted) return;
    hasSorted = true;
    const house = analyzePersonality(detection);
    document.getElementById("house").innerText = `Du gehörst zu ${house}!`;

    // Deutsche Sprachausgabe
    const speech = new SpeechSynthesisUtterance(
        `Der Sprechende Hut sagt: Du gehörst zu ${house}!`
    );
    speech.lang = "de-DE";
    speech.rate = 0.9;
    speech.pitch = 0.7;
    speechSynthesis.speak(speech);
}

startCamera();