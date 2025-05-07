document.getElementById('applyFilter').addEventListener('click', function() {
  const cutoff = parseFloat(document.getElementById('lowpass').value);
  const filter = new DSP.IIRFilter(DSP.LOWPASS, cutoff, seismogram.sampleRate);
  const filtered = seismogram.yArray.map(sample => filter.process(sample));
  Plotly.newPlot('waveform', [{
    x: seismogram.timeArray,
    y: filtered,
    type: 'scatter',
    mode: 'lines',
    name: 'Filtered Waveform'
  }], {
    title: '濾波後波形圖',
    xaxis: { title: '時間 (s)' },
    yaxis: { title: '振幅' }
  });

  // FFT 分析
  const fft = new DSP.FFT(filtered.length, seismogram.sampleRate);
  fft.forward(filtered);
  const frequencies = fft.getBandFrequencyArray();
  const spectrum = fft.spectrum;
  Plotly.newPlot('fft', [{
    x: frequencies,
    y: spectrum,
    type: 'scatter',
    mode: 'lines',
    name: 'FFT Spectrum'
  }], {
    title: '頻譜圖',
    xaxis: { title: '頻率 (Hz)' },
    yaxis: { title: '振幅' }
  });
});
