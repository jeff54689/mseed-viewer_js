import sys
from obspy import read


if len(sys.argv) != 2:
    print("Usage: python mseed_to_csv.py yourfile.mseed")
    sys.exit(1)

filename = sys.argv[1]
st = read(filename)
tr = st[0]

csv_name = filename.replace(".mseed", ".csv")

with open(csv_name, "w") as f:
    f.write("time,amplitude\n")
    for t, a in zip(tr.times("utcdatetime"), tr.data):
        f.write(f"{t.isoformat()},{a}\n")

print(f"✅ Converted to: {csv_name}")
