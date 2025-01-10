const video = document.getElementById('video');
const hat = document.getElementById('hat');
const description = document.getElementById('house-description');

// Modelle laden
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));
}

video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        try {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, faceapi.resizeResults(detections, displaySize));
            faceapi.draw.drawFaceLandmarks(canvas, faceapi.resizeResults(detections, displaySize));

            if (detections.length > 0) {
                const person = detections[0];
                const landmarks = person.landmarks;
                const box = person.detection.box;

                // Hut über dem Kopf positionieren
                const headCenterX = box.x + box.width / 2;
                hat.style.left = `${headCenterX}px`;
                hat.style.top = `${box.y - 100}px`;

                // Haarfarbe analysieren
                const hairColor = detectHairColor(video, box);

                // Brillenerkennung
                const wearingGlasses = detectGlasses(landmarks);

                // Häuserzuweisung
                if (hairColor === 'red' && !wearingGlasses) {
                    assignHouse('Gryffindor', 'Mut, Tapferkeit, Entschlossenheit');
                } else if (hairColor === 'black' && !wearingGlasses) {
                    assignHouse('Hufflepuff', 'Loyalität, Fleiß, Gerechtigkeitssinn');
                } else if (wearingGlasses) {
                    assignHouse('Ravenclaw', 'Weisheit, Intelligenz, Kreativität');
                } else if (hairColor === 'blond' && !wearingGlasses) {
                    assignHouse('Slytherin', 'Ehrgeiz, Gerissenheit, Führung');
                } else if (hairColor === 'brown' && !wearingGlasses) {
                    assignHouse('Muggle', 'Keine magischen Fähigkeiten');
                } else if (hairColor === 'bald') {
                    assignHouse('Dobby', 'Treue, Opferbereitschaft, Mut');
                } else {
                    assignHouse('Muggle', 'Keine magischen Fähigkeiten'); // Fallback
                }
            } else {
                // Keine Gesichter erkannt
                assignHouse('Muggle', 'Keine magischen Fähigkeiten');
            }
        } catch (error) {
            console.error('Fehler bei der Erkennung:', error);
            // Bei Fehler: Fallback auf Muggle
            assignHouse('Muggle', 'Keine magischen Fähigkeiten');
        }
    }, 100);
});

function detectHairColor(video, box) {
    try {
        // Analysiere die Pixel in der Nähe der Stirn
        const canvas = document.createElement('canvas');
        canvas.width = box.width;
        canvas.height = box.height / 4; // Nur den oberen Bereich verwenden
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, box.x, box.y, box.width, box.height / 4, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Farbwerte analysieren
        let redCount = 0, blackCount = 0, blondCount = 0, brownCount = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];

            if (r > 150 && g < 100 && b < 100) redCount++; // Rot
            else if (r < 50 && g < 50 && b < 50) blackCount++; // Schwarz
            else if (r > 200 && g > 180 && b < 100) blondCount++; // Blond
            else if (r > 100 && g > 50 && b < 50) brownCount++; // Braun
        }

        // Meistens vorkommende Farbe zurückgeben
        const colors = { red: redCount, black: blackCount, blond: blondCount, brown: brownCount };
        return Object.keys(colors).reduce((a, b) => (colors[a] > colors[b] ? a : b));
    } catch (error) {
        console.error('Fehler bei der Haarfarbenerkennung:', error);
        return null; // Fallback, wenn die Erkennung fehlschlägt
    }
}

function detectGlasses(landmarks) {
    try {
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const leftDistance = distanceBetweenPoints(leftEye[0], leftEye[3]);
        const rightDistance = distanceBetweenPoints(rightEye[0], rightEye[3]);

        // Wenn der Abstand zwischen den äußeren Punkten der Augen ungewöhnlich klein ist, trägt die Person wahrscheinlich eine Brille
        return leftDistance < 20 && rightDistance < 20;
    } catch (error) {
        console.error('Fehler bei der Brillenerkennung:', error);
        return false; // Standardwert: keine Brille
    }
}

function distanceBetweenPoints(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function assignHouse(house, traits) {
    description.innerHTML = `<strong>${house}:</strong> ${traits}`;
}
