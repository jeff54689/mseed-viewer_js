let originalTimes = [], originalValues = [], sampleRate = 100;

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const buffer = e.target.result;
    const records = sp.miniseed.parseDataRecords(buffer);
    const segments = sp.miniseed.assembleDataSegments(records);
    if (segments.length === 0) return alert("Failed to parse MiniSEED");

    const seg = segments[0];
    originalTimes = seg.times();
    originalValues = seg.y();
    sampleRate = seg.sampleRate;

    plotWaveform(originalTimes, originalValues);
    plotFFT(originalValues, sampleRate);
  };
  reader.readAsArrayBuffer(file);
});

document.getElementById('applyFilter').addEventListener('click', function() {
  const low = parseFloat(document.getElementById('lowCut').value);
  const high = parseFloat(document.getElementById('highCut').value);
  if (low >= high) return alert("Low cut must be < High cut");

  const filtered = bandpassFilter(originalValues, low, high, sampleRate);
  plotWaveform(originalTimes, filtered);
  plotFFT(filtered, sampleRate);
});

function bandpassFilter(signal, low, high, fs) {
  const iir = new IIRFilter(DSP.BANDPASS, (low + high) / 2, fs, 1);
  return signal.map(x => iir.process(x));
}

function plotWaveform(time, data) {
  Plotly.newPlot("waveform", [{
    x: time,
    y: data,
    type: 'scatter',
    mode: 'lines',
    name: 'Waveform'
  }], {
    margin: { t: 30 },
    xaxis: { title: 'Time (s)' },
    yaxis: { title: 'Amplitude' }
  });
}

function plotFFT(data, fs) {
  const N = data.length;
  const fft = new FFT(N, fs);
  fft.forward(data);
  const freqs = fft.getBandFrequencyArray();
  const mags = fft.spectrum;

  Plotly.newPlot("fft", [{
    x: freqs,
    y: mags,
    type: 'scatter',
    mode: 'lines',
    name: 'FFT'
  }], {
    margin: { t: 30 },
    xaxis: { title: 'Frequency (Hz)' },
    yaxis: { title: 'Amplitude' }
  });
}
