function readMSeed(arrayBuffer) {
  const records = sp.miniseed.parseDataRecords(arrayBuffer);
  const segments = sp.miniseed.assembleDataSegments(records);
  if (segments.length === 0) return null;
  const seg = segments[0];
  return {
    times: seg.times(),
    values: seg.y(),
    sampleRate: seg.sampleRate
  };
}
