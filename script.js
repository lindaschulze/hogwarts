// Globale Variablen
let video, canvas, ctx;
let model;
let hatImage;
let isProcessing = false;
let faceDetected = false;
let sortingTimer = null;

// Hogwarts Häuser
const houses = [
    { name: 'Gryffindor', class: 'gryffindor', text: 'Gryffindor! Tapferkeit und Mut!' },
    { name: 'Hufflepuff', class: 'hufflepuff', text: 'Hufflepuff! Treue und Fleiß!' },
    { name: 'Ravenclaw', class: 'ravenclaw', text: 'Ravenclaw! Weisheit und Klugheit!' },
    { name: 'Slytherin', class: 'slytherin', text: 'Slytherin! Ehrgeiz und List!' }
];

// Initialisierung
async function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('overlay');
    ctx = canvas.getContext('2d');
    
    updateStatus('Lade Gesichtserkennung...');
    
    try {
        // Lade das Gesichtserkennungsmodell
        model = await blazeface.load();
        updateStatus('Starte Kamera...');
        
        // Starte die Kamera
        await startCamera();
        
        // Lade das Hut-GIF
        await loadHatImage();
        
        updateStatus('Bereit! Schaue in die Kamera...');
        
        // Starte die Gesichtserkennung
        detectFaces();
        
    } catch (error) {
        console.error('Fehler bei der Initialisierung:', error);
        updateStatus('Fehler: ' + error.message);
    }
}

// Kamera starten
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        
        video.srcObject = stream;
        
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                // Canvas-Größe an Video anpassen
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve();
            };
        });
    } catch (error) {
        throw new Error('Kamera-Zugriff verweigert. Bitte erlaube den Kamerazugriff.');
    }
}

// Hut-Bild laden
function loadHatImage() {
    return new Promise((resolve, reject) => {
        hatImage = new Image();
        hatImage.onload = () => resolve();
        hatImage.onerror = () => reject(new Error('Hut-Bild konnte nicht geladen werden'));
        hatImage.src = './sorting-hat.gif';
    });
}

// Gesichtserkennung
async function detectFaces() {
    if (isProcessing) return;
    
    try {
        isProcessing = true;
        
        // Erkenne Gesichter
        const predictions = await model.estimateFaces(video, false);
        
        // Canvas leeren
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (predictions.length > 0) {
            // Erstes Gesicht verwenden
            const face = predictions[0];
            
            if (!faceDetected) {
                faceDetected = true;
                startSortingTimer();
            }
            
            // Zeichne den Hut über dem Gesicht
            drawHat(face);
        } else {
            // Kein Gesicht mehr erkannt
            if (faceDetected && sortingTimer) {
                clearTimeout(sortingTimer);
                sortingTimer = null;
                faceDetected = false;
            }
        }
        
        isProcessing = false;
        
        // Nächsten Frame verarbeiten
        requestAnimationFrame(detectFaces);
        
    } catch (error) {
        console.error('Fehler bei Gesichtserkennung:', error);
        isProcessing = false;
        requestAnimationFrame(detectFaces);
    }
}

// Hut zeichnen
function drawHat(face) {
    // Gesichtsposition ermitteln
    const start = face.topLeft;
    const end = face.bottomRight;
    const faceWidth = end[0] - start[0];
    const faceHeight = end[1] - start[1];
    
    // Hut-Position und Größe berechnen
    const hatWidth = faceWidth * 1.8;
    const hatHeight = hatWidth * 1.2;
    const hatX = start[0] - (hatWidth - faceWidth) / 2;
    const hatY = start[1] - hatHeight * 0.85;
    
    // Hut zeichnen
    ctx.drawImage(hatImage, hatX, hatY, hatWidth, hatHeight);
}

// Timer für Hauszuweisung
function startSortingTimer() {
    updateStatus('Hmm... lass mich nachdenken...');
    
    sortingTimer = setTimeout(() => {
        sortIntoHouse();
    }, 3000);
}

// Hauszuweisung
function sortIntoHouse() {
    // Zufälliges Haus auswählen
    const house = houses[Math.floor(Math.random() * houses.length)];
    
    // Ergebnis anzeigen
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="house-result ${house.class}">${house.text}</div>`;
    
    updateStatus('Der Hut hat gesprochen!');
    
    // Sprachausgabe
    speak(house.name);
    
    // Nach 5 Sekunden zurücksetzen
    setTimeout(() => {
        faceDetected = false;
        sortingTimer = null;
        resultDiv.innerHTML = '';
        updateStatus('Bereit für die nächste Person...');
    }, 8000);
}

// Sprachausgabe
function speak(houseName) {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `${houseName}!`;
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    utterance.pitch = 0.7;
    utterance.volume = 1.0;
    
    speechSynthesis.speak(utterance);
}

// Status aktualisieren
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// App starten
window.addEventListener('load', init);