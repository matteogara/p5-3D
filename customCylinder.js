class CustomCylinder {
  constructor(radius, height, maxHistoryLength = 100) {
    this.radius = radius;
    this.height = height;
    this.spectrumHistory = [];
    this.maxHistoryLength = maxHistoryLength; // Numero massimo di frame da memorizzare
  }

  // Metodo per memorizzare i valori dello spettro audio nel tempo
  storeSpectrum(spectrum) {
    if (!Array.isArray(spectrum)) {
      console.warn('CustomCylinder.storeSpectrum: spectrum deve essere un array');
      return;
    }

    // Aggiungi il nuovo spettro alla storia
    this.spectrumHistory.push([...spectrum]);

    // Mantieni solo gli ultimi maxHistoryLength spettri
    if (this.spectrumHistory.length > this.maxHistoryLength) {
      this.spectrumHistory.shift();
    }

    console.log('CustomCylinder.storeSpectrum:', {
      radius: this.radius,
      height: this.height,
      currentHistoryLength: this.spectrumHistory.length,
      spectrumLength: spectrum.length,
      spectrumValues: spectrum,
    });
  }

  // Metodo per ottenere la storia completa dello spettro
  getSpectrumHistory() {
    return this.spectrumHistory;
  }

  // Metodo per ottenere l'ultimo spettro memorizzato
  getLastSpectrum() {
    return this.spectrumHistory.length > 0 ? this.spectrumHistory[this.spectrumHistory.length - 1] : [];
  }

  // Metodo per svuotare la storia
  clearHistory() {
    this.spectrumHistory = [];
  }

  // Metodo per disegnare il cilindro personalizzato basato sulla storia dello spettro
  draw() {
    if (this.spectrumHistory.length === 0) {
      return;
    }

    noFill();
    stroke(50, 150, 255, 150);
    strokeWeight(2);

    const angleStep = TWO_PI / this.spectrumHistory.length;

    for (let i = 0; i < this.spectrumHistory.length; i++) {
      const spectrum = this.spectrumHistory[i];
      const angle = i * angleStep;

      push();
      rotateY(angle);

      beginShape();
      const step = this.height / Math.max(spectrum.length - 1, 1);
      for (let j = 0; j < spectrum.length; j++) {
        const x = map(spectrum[j], 0, 255, this.radius, this.radius * 2);
        const y = j * step - this.height / 2;
        const z = 0;
        vertex(x, y, z);
      }
      endShape();

      pop();
    }

    console.log('CustomCylinder.draw:', {
      historyLength: this.spectrumHistory.length,
      radius: this.radius,
      height: this.height,
    });
  }
}