const video = document.getElementById('video');
const hat = document.getElementById('hat');
const description = document.getElementById('house-description');

// Modelle von CDN laden
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'),
    faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights')
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
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withAgeAndGender();
        
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, faceapi.resizeResults(detections, displaySize));
        faceapi.draw.drawFaceLandmarks(canvas, faceapi.resizeResults(detections, displaySize));

        if (detections.length > 0) {
            const person = detections[0];
            const landmarks = person.landmarks;
            const box = person.detection.box;

            // Setzt das GIF auf die Kopfposition
            const headCenterX = box.x + box.width / 2;
            hat.style.left = `${headCenterX}px`;
            hat.style.top = `${box.y - 50}px`;

            // Kriterien für Häuserzuweisung
            const { gender } = person;
            if (/* Check for red hair & no glasses */) {
                assignHouse('Gryffindor', 'Mut, Tapferkeit, Entschlossenheit');
            } else if (/* Check for black hair & no glasses */) {
                assignHouse('Hufflepuff', 'Loyalität, Fleiß, Gerechtigkeitssinn');
            } 
            // Weitere Kriterien hier...
        }
    }, 100);
});

function assignHouse(house, traits) {
    description.innerHTML = `<strong>${house}:</strong> ${traits}`;
}
