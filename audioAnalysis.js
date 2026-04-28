let fftInstance = null;
let fftSource = null;
let fftBins = 0;

function ensureFFT(audio, binsFFT) {
  if (!audio || !audio.isLoaded()) {
    return false;
  }

  if (!fftInstance || fftSource !== audio || fftBins !== binsFFT) {
    fftInstance = new p5.FFT(0.8, binsFFT);
    fftInstance.setInput(audio);
    fftSource = audio;
    fftBins = binsFFT;
  }

  return true;
}

function analyzeAudio(audio, binsFFT, bandsFFT, smoothingFactor = 0) {
  if (!ensureFFT(audio, binsFFT)) {
    console.log('analyzeAudio: audio not loaded yet');
    return {};
  }

  fftInstance.analyze();

  const energyData = {};
  bandsFFT.forEach((band) => {
    energyData[band] = fftInstance.getEnergy(band);
  });

  console.log('analyzeAudio:', {
    isPlaying: audio.isPlaying(),
    currentTime: audio.currentTime(),
    smoothingFactor,
    energyData,
  });

  return energyData;
}

function smoothCenteredMovingAverage(values, smoothingFactor) {
  const length = values.length;
  if (!length) {
    return [];
  }

  let windowSize = Math.round(smoothingFactor <= 1 ? smoothingFactor * length : smoothingFactor);
  windowSize = Math.max(1, Math.min(windowSize, length));
  if (windowSize <= 1) {
    return values;
  }

  const halfWindow = Math.floor(windowSize / 2);
  const smoothed = new Array(length);

  for (let i = 0; i < length; i++) {
    let start = Math.max(0, i - halfWindow);
    let end = Math.min(length - 1, i + halfWindow);
    let sum = 0;
    let count = 0;

    for (let j = start; j <= end; j++) {
      sum += values[j];
      count++;
    }

    smoothed[i] = sum / count;
  }

  return smoothed;
}

function getLogSpectrum(audio, binsFFT, outputBins = 128, smoothingFactor = 0) {
  if (!ensureFFT(audio, binsFFT)) {
    return [];
  }

  const spectrum = fftInstance.analyze();
  const logSpectrum = [];
  const minLog = Math.log10(1);
  const maxLog = Math.log10(spectrum.length);

  for (let i = 0; i < outputBins; i++) {
    const ratio = i / Math.max(outputBins - 1, 1);
    const index = Math.floor(Math.pow(10, minLog + ratio * (maxLog - minLog)) - 1);
    logSpectrum.push(spectrum[Math.min(Math.max(index, 0), spectrum.length - 1)]);
  }

  const smoothedSpectrum = smoothCenteredMovingAverage(logSpectrum, smoothingFactor);

  console.log('getLogSpectrum:', {
    binsFFT,
    outputBins,
    smoothingFactor,
    logSpectrumLength: smoothedSpectrum.length,
  });

  return smoothedSpectrum;
}
