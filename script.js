document.addEventListener('DOMContentLoaded', function () {
    // Handle CSV and plot
    document.getElementById('csvFile').addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        const rows = text.trim().split('\n').map(row => row.split(',').map(Number));
        const metadata = rows.map(r => r.slice(0, 2));
        const spectra = rows.map(r => r.slice(2));
        const wavelengths = Array.from({ length: 51 }, (_, i) => 1550 + i * 8);
  
        const derivData = spectra.map(row => savgolDerivative(row, 5, 2, 2));
  
        const traces = derivData.map((derivRow, i) => ({
          x: wavelengths,
          y: derivRow,
          mode: 'lines',
          name: `Sample ${i + 1}`
        }));
  
        Plotly.newPlot('chart', traces, {
          title: 'Second Derivative of Spectra',
          xaxis: { title: 'Wavelength (nm)' },
          yaxis: { title: 'Second Derivative' }
        });
      };
      reader.readAsText(file);
    });
  
    function savgolDerivative(y, windowSize, polyOrder, deriv) {
      const half = Math.floor(windowSize / 2);
      const coeffs = savgolCoefficients(windowSize, polyOrder, deriv);
      const result = Array(y.length).fill(0);
  
      for (let i = half; i < y.length - half; i++) {
        let sum = 0;
        for (let j = -half; j <= half; j++) {
          sum += y[i + j] * coeffs[j + half];
        }
        result[i] = sum;
      }
  
      return result;
    }
  
    function savgolCoefficients(windowSize, polyOrder, deriv) {
      // Simplified for polyOrder = 2 and deriv = 2 with windowSize = 5
      return deriv === 2
        ? [2, -1, -2, -1, 2].map(c => c / 7)
        : Array(windowSize).fill(0);
    }
  
    // Theme Toggle Logic
    const themeSwitch = document.getElementById('themeSwitch');
    const themeText = document.getElementById('themeText');
    const html = document.documentElement;
  
    themeSwitch.addEventListener('change', function () {
      const isLight = html.getAttribute('data-theme') === 'light';
      html.setAttribute('data-theme', isLight ? 'dark' : 'light');
      themeText.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    });
  
    // Set initial theme
    html.setAttribute('data-theme', 'dark');
  });
  