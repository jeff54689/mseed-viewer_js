window.onload = function () {
  let originalTimes = [], originalValues = [], sampleRate = 100;

  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const buffer = e.target.result;

      if (typeof sp === 'undefined' || !sp.miniseed) {
        alert("❌ Seisplotjs (sp) 未正確載入！");
        return;
      }
      if (typeof DSP === 'undefined') {
        alert("❌ DSP.js 未正確載入！");
        return;
      }

      try {
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
      } catch (err) {
        console.error(err);
        alert("讀取 MiniSEED 時發生錯誤");
      }
    };
    reader.readAsArrayBuffer(file);
  });

  document.getElementById('applyFilter').addEventListener('click', function () {
    const low = parseFloat(document.getElementById('lowCut').value);
    const high = parseFloat(document.getElementById('highCut').value);
    if (low >= high) return alert("⚠️ Low cut must be less than High cut!");
    if (originalValues.length === 0) return alert("請先上傳 .mseed 檔案");

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
     
