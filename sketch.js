let audio;
let playPauseButton;

function preload() {
  audio = loadSound('assets/audio.mp3');
}

function setup() {
  createCanvas(400, 400);
  createAudioControls();
}

const bins = 256;
const smoothingFactor = 0.02;

function draw() {
  background(220);

  if (audio && audio.isLoaded() && audio.isPlaying()) {
    const spectrum = getLogSpectrum(audio, bins, width, smoothingFactor);
    drawAudioSpectrum(spectrum);
  }
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
