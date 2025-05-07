window.onload = function () {
  let originalTimes = [], originalValues = [], sampleRate = 100;

  // 安全檢查
  if (typeof sp === 'undefined' || !sp.miniseed) {
    alert("❌ Seisplotjs 未正確載入！");
    return;
  }
  if (typeof DSP === 'undefined') {
    alert("❌ DSP.js 未正確載入！");
    return;
  }

  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const buffer = e.target.result;

      const records = sp.miniseed.parseDataRecords(buffer);
      const segments = sp.miniseed.assembleDataSegments(records);
      if (segments.length === 0) return alert("⚠️ 無法從檔案中取得有效波形");

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
    if (low >= high) return alert("⚠️ Low cut must be less than high cut");

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
