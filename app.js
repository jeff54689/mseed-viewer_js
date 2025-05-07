let timeArray = [], amplitudeArray = [], sampleRate = 100;

document.getElementById('csvInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const lines = event.target.result.trim().split('\n');
    timeArray = [];
    amplitudeArray = [];

    for (let i = 1; i < lines.length; i++) {
      const [time, amp] = lines[i].split(',');
      timeArray.push(new Date(time));
      amplitudeArray.push(parseFloat(amp));
    }

    // 自動估算 sample rate
    const dt = (timeArray[1] - timeArray[0]) / 1000;
    sampleRate = 1 / dt;

    plotWaveform(timeArray, amplitudeArray);
    plotFFT(amplitudeArray, sampleRate);
  };
  reader.readAsText(file);
});

document.getElementById('applyFilter').addEventListener('click', function () {
  const low = parseFloat(document.getElementById('lowCut').value);
  const high = parseFloat(document.getElementById('highCut').value);
  if (low >= high) return alert("Low cut must be less than high cut");

  const iir = new DSP.IIRFilter(DSP.BANDPASS, (low + high) / 2, sampleRate, 1);
  const filtered = amplitudeArray.map(a => iir.process(a));
  plotWaveform(timeArray, filtered);
  plotFFT(filtered, sampleRate);
});

function plotWaveform(times, values) {
  Plotly.newPlot("waveform", [{
    x: times,
    y: values,
    type: 'scatter',
    mode: 'lines'
  }]);
}

function plotFFT(data, fs) {
  const fft = new DSP.FFT(data.length, fs);
  fft.forward(data);
  const freqs = fft.getBandFrequencyArray();
  const mags = fft.spectrum;
  Plotly.newPlot("fft", [{
    x: freqs,
    y: mags,
    type: 'scatter',
    mode: 'lines'
  }]);
}
