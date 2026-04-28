// Classe per esportare geometria in formato STL
class STLExporter {
  constructor() {
    this.triangles = [];
  }

  // Aggiunge un triangolo alla mesh
  addTriangle(v1, v2, v3, normal = null) {
    if (!normal) {
      // Calcola normale se non fornita
      const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
      const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
      normal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
      ];
      // Normalizza
      const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
      if (length > 0) {
        normal = [normal[0] / length, normal[1] / length, normal[2] / length];
      }
    }

    this.triangles.push({
      normal: normal,
      vertices: [v1, v2, v3]
    });
  }

  // Converte CustomCylinder in mesh STL
  cylinderToSTL(customCylinder) {
    this.triangles = [];

    if (customCylinder.spectrumHistory.length === 0) {
      console.warn('STLExporter: Nessuna storia dello spettro disponibile');
      return;
    }

    const history = customCylinder.spectrumHistory;
    const height = customCylinder.height;
    const baseRadius = customCylinder.radius;
    const segments = history[0].length;

    if (segments < 2) {
      console.warn('STLExporter: Il cilindro necessita almeno di 2 segmenti per la generazione');
      return;
    }

    const vertexRings = [];
    for (let i = 0; i < history.length; i++) {
      const spectrum = history[i];
      const angle = (TWO_PI / history.length) * i;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const ring = [];

      for (let j = 0; j < segments; j++) {
        const radius = baseRadius + (spectrum[j] / 255) * baseRadius;
        const y = (j / (segments - 1) - 0.5) * height;
        ring.push([radius * cosAngle, y, radius * sinAngle]);
      }

      vertexRings.push(ring);
    }

    // Pareti laterali
    for (let i = 0; i < history.length; i++) {
      const nextI = (i + 1) % history.length;
      for (let j = 0; j < segments - 1; j++) {
        const v1 = vertexRings[i][j];
        const v2 = vertexRings[i][j + 1];
        const v3 = vertexRings[nextI][j];
        const v4 = vertexRings[nextI][j + 1];

        this.addTriangle(v1, v2, v3);
        this.addTriangle(v2, v4, v3);
      }
    }

    // Tappo superiore sul piano y = +height/2
    const topCenter = [0, height / 2, 0];
    for (let i = 0; i < history.length; i++) {
      const nextI = (i + 1) % history.length;
      const v1 = vertexRings[i][segments - 1];
      const v2 = vertexRings[nextI][segments - 1];
      this.addTriangle(v2, v1, topCenter);
    }

    // Tappo inferiore sul piano y = -height/2
    const bottomCenter = [0, -height / 2, 0];
    for (let i = 0; i < history.length; i++) {
      const nextI = (i + 1) % history.length;
      const v1 = vertexRings[i][0];
      const v2 = vertexRings[nextI][0];
      this.addTriangle(v1, v2, bottomCenter);
    }

    console.log('STLExporter.cylinderToSTL:', {
      trianglesGenerated: this.triangles.length,
      spectrumHistoryLength: history.length,
      segments
    });
  }

  // Genera stringa STL binaria
  generateSTLString() {
    let stlString = 'solid CustomCylinder\n';

    this.triangles.forEach(triangle => {
      stlString += `  facet normal ${triangle.normal[0]} ${triangle.normal[1]} ${triangle.normal[2]}\n`;
      stlString += '    outer loop\n';
      triangle.vertices.forEach(vertex => {
        stlString += `      vertex ${vertex[0]} ${vertex[1]} ${vertex[2]}\n`;
      });
      stlString += '    endloop\n';
      stlString += '  endfacet\n';
    });

    stlString += 'endsolid CustomCylinder\n';

    return stlString;
  }

  // Esporta il file STL
  exportSTL(filename = 'customCylinder.stl') {
    const stlContent = this.generateSTLString();

    // Crea un blob e scarica il file
    const blob = new Blob([stlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    console.log('STLExporter.exportSTL:', {
      filename,
      trianglesExported: this.triangles.length
    });
  }
}

// Funzione globale per esportare il cilindro
function exportCylinderToSTL(customCylinder, filename = 'customCylinder.stl') {
  const exporter = new STLExporter();
  exporter.cylinderToSTL(customCylinder);
  exporter.exportSTL(filename);
}