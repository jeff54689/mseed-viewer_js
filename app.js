window.onload = function () {
  let originalTimes = [], originalValues = [], sampleRate = 100;

  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const buffer = e.target.result;

      if (typeof sp === 'undefined') return alert("sp (Seisplotjs) not loaded!");
      if (typeof DSP === 'undefined') return alert("DSP.js not loaded!");

      const records = sp.miniseed.parseDataRecords(buffer);
      const segments = sp.miniseed.assembleDataSegments(records);
      if (segments.length === 0) return alert("No valid data segments");

      const seg = segments[0];
      originalTimes = seg.times();
      originalValues = seg.y();
      sampleRate = seg.sampleRate;

      plotWaveform(originalTimes, originalValues);
      const { freqs, mags } = computeFFT(originalValues, sampleRate);
      plotFFT(freqs, mags);
    };
    reader.readAsArrayBuffer(file);
  });

  document.getElementById('applyFilter').addEventListener('click', function () {
    const low = parseFloat(document.getElementById('lowCut').value);
    const high = parseFloat(document.getElementById('highCut').value);
    if (low >= high) return alert("Low cut must be < High cut");

    const filtered = bandpassFilter(originalValues, low, high, sampleRate);
    plotWaveform(originalTimes, filtered);
    const { freqs, mags } = computeFFT(filtered, sampleRate);
    plotFFT(freqs, mags);
  });

  function bandpassFilter(signal, low, high, fs) {
    const iir = new DSP.IIRFilter(DSP.BANDPASS, (low + high) / 2, fs, 1);
    return signal.map(x => iir.process(x));
  }

  function computeFFT(data, fs) {
    const fft = new DSP.FFT(data.length, fs);
    fft.forward(data);
    return {
      freqs: fft.getBandFrequencyArray(),
      mags: fft.spectrum
    };
  }

  function plotWaveform(times, data) {
    Plotly.newPlot("waveform", [{
      x: times,
      y: data,
      type: 'scatter',
      mode: 'lines'
    }], {
      title: "Waveform",
      xaxis: { title: "Time (s)" },
      yaxis: { title: "Amplitude" }
    });
  }

  function plotFFT(freqs, mags) {
    Plotly.newPlot("fft", [{
      x: freqs,
      y: mags,
      type: 'scatter',
      mode: 'lines'
    }], {
      title: "FFT Spectrum",
      xaxis: { title: "Frequency (Hz)" },
      yaxis: { title: "Magnitude" }
    });
  }
};
