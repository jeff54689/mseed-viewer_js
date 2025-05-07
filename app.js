document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    const dataRecords = seisplotjs.miniseed.parseDataRecords(arrayBuffer);
    const segments = seisplotjs.miniseed.assembleDataSegments(dataRecords);

    if (segments.length === 0) {
      alert("無法解析 MiniSEED 檔案");
      return;
    }

    const seg = segments[0];
    const times = seg.times();
    const values = seg.y();

    Plotly.newPlot("waveform", [{
      x: times,
      y: values,
      type: "scatter",
      mode: "lines",
      name: `${seg.codes()}`,
    }], {
      title: `波形圖：${seg.codes()}`,
      xaxis: { title: "時間" },
      yaxis: { title: "振幅" }
    });
  };
  reader.readAsArrayBuffer(file);
});
