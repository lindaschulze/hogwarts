let hasSpoken = false;
let faceDetected = false;

async function startCamera() {
    const video = document.getElementById("video");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } // Frontkamera bevorzugen
        });
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            const canvas = document.getElementById("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.play();
            detectFace();
        };
    } catch (error) {
        console.error("Kamera-Zugriff verweigert", error);
        document.getElementById("house").innerText = "Kamera-Zugriff erforderlich!";
    }
}

async function detectFace() {
    try {
        // Lade die notwendigen Modelle
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights');
        
        const video = document.getElementById("video");
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        
        // Lade das GIF
        const hatImg = new Image();
        hatImg.src = "./sorting-hat.gif";
        
        setInterval(async () => {
            if (video.readyState === 4) {
                const detections = await faceapi.detectSingleFace(
                    video, 
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks();
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (detections) {
                    if (!faceDetected) {
                        faceDetected = true;
                        // Starte 3-Sekunden Timer beim ersten Gesichtserkennen
                        setTimeout(() => sortHouse(detections), 3000);
                    }
                    
                    const { x, y, width, height } = detections.detection.box;
                    
                    // Hut über dem Kopf positionieren
                    const hatWidth = width * 1.5;
                    const hatHeight = hatWidth * 0.8;
                    const hatX = x - (hatWidth - width) / 2;
                    const hatY = y - hatHeight * 0.7;
                    
                    ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
                }
            }
        }, 100);
    } catch (error) {
        console.error("Fehler beim Laden der face-api Modelle:", error);
    }
}

function analyzePersonality(detections) {
    // Hier kannst du deine Regeln implementieren
    // Beispiel basierend auf Gesichtsmerkmalen:
    
    const landmarks = detections.landmarks.positions;
    const faceBox = detections.detection.box;
    
    // Berechne verschiedene Gesichtsproportionen
    const faceWidth = faceBox.width;
    const faceHeight = faceBox.height;
    const faceRatio = faceHeight / faceWidth;
    
    // Augenabstand
    const leftEye = landmarks[36]; // Linker Augenwinkel
    const rightEye = landmarks[45]; // Rechter Augenwinkel
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    
    // Mund-Eigenschaften
    const mouthLeft = landmarks[48];
    const mouthRight = landmarks[54];
    const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
    
    // Bewertungssystem (du kannst deine eigenen Regeln hier einfügen)
    let scores = {
        gryffindor: 0,
        hufflepuff: 0,
        ravenclaw: 0,
        slytherin: 0
    };
    
    // Beispiel-Regeln (ersetze diese mit deinen eigenen):
    if (faceRatio > 1.3) scores.gryffindor += 2; // Längliches Gesicht
    if (faceRatio < 1.1) scores.hufflepuff += 2; // Rundliches Gesicht
    if (eyeDistance / faceWidth > 0.25) scores.ravenclaw += 2; // Große Augen
    if (mouthWidth / faceWidth > 0.15) scores.slytherin += 2; // Breiter Mund
    
    // Zufälliger Bonus für Unvorhersagbarkeit
    const randomHouse = ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'];
    scores[randomHouse[Math.floor(Math.random() * 4)]] += 1;
    
    // Finde das Haus mit der höchsten Punktzahl
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function sortHouse(detections) {
    if (hasSpoken) return;
    hasSpoken = true;
    
    // Analysiere die Persönlichkeit basierend auf Gesichtsmerkmalen
    const chosenHouse = analyzePersonality(detections);
    
    const houseNames = {
        gryffindor: "Gryffindor",
        hufflepuff: "Hufflepuff", 
        ravenclaw: "Ravenclaw",
        slytherin: "Slytherin"
    };
    
    const houseName = houseNames[chosenHouse];
    
    // Zeige das Ergebnis an
    document.getElementById("house").innerHTML = `
        <div style="animation: fadeIn 2s;">
            🎭 Der Sprechende Hut hat entschieden... 🎭<br>
            <strong style="font-size: 32px; color: ${getHouseColor(chosenHouse)}">
                ${houseName}!
            </strong>
        </div>
    `;
    
    // Sprachausgabe auf Deutsch
    setTimeout(() => {
        const speech = new SpeechSynthesisUtterance(
            `Hmmm... interessant. Du gehörst nach... ${houseName}!`
        );
        speech.lang = 'de-DE';
        speech.rate = 0.8; // Langsamer sprechen für dramatischen Effekt
        speech.pitch = 0.7; // Tiefere Stimme
        speechSynthesis.speak(speech);
    }, 1000);
}

function getHouseColor(house) {
    const colors = {
        gryffindor: '#ff6b6b',
        hufflepuff: '#ffd93d', 
        ravenclaw: '#4ecdc4',
        slytherin: '#95e1d3'
    };
    return colors[house];
}

// CSS Animation hinzufügen
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// App starten
startCamera();
