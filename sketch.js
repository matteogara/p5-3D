let audio;
let playPauseButton;
let customCylinder;

function preload() {
  audio = loadSound('assets/audio.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  customCylinder = new CustomCylinder(40, 200, 64);
  createAudioControls();
}

const bins = 32;
const smoothingFactor = 0.01;

function draw() {
  background(220);

  // ambientLight(100);
  // directionalLight(255, 255, 255, 0, 1, 1);
  // pointLight(255, 0, 0, 0, -150, 0);
  // spotLight(255, 0, 0, 0, 0, 800, 0, 0, -1, PI / 32);
  

  // fill(100, 150, 255);
  // noStroke();
  // cylinder(100, 200);
  orbitControl();

  if (audio && audio.isLoaded() && audio.isPlaying()) {
    const spectrum = getLogSpectrum(audio, bins, width, smoothingFactor);
    customCylinder.storeSpectrum(spectrum);
  }

  // Disegna sempre il cilindro personalizzato
  customCylinder.draw();
}

function drawAudioSpectrum(spectrum = []) {
  if (!spectrum.length) {
    return;
  }

  noFill();
  stroke(50, 150, 255);
  strokeWeight(2);

  beginShape();
  const step = width / Math.max(spectrum.length - 1, 1);
  for (let i = 0; i < spectrum.length; i++) {
    const x = i * step;
    const y = map(spectrum[i], 0, 255, height, 0);
    vertex(x, y);
  }
  endShape();
}

function createAudioControls() {
  playPauseButton = createButton('Play audio');
  playPauseButton.position(10, height + 10);
  playPauseButton.mousePressed(toggleAudioPlayback);
}

function toggleAudioPlayback() {
  if (!audio.isPlaying()) {
    audio.setLoop(true);
    audio.play();
    playPauseButton.html('Pause audio');
  } else {
    audio.pause();
    playPauseButton.html('Play audio');
  }
}

function keyPressed() {
  if (key === ' ') {
    // Esporta il cilindro in STL quando viene premuta la barra spaziatrice
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `customCylinder_${timestamp}.stl`;
    exportCylinderToSTL(customCylinder, filename);
  }
}
