"""
Monthly update: Overwrite the SMIS Permit Transfers hosted feature layer on kygis AGOL.

Prerequisites:
  - ArcGIS Pro signed into kygis portal
  - New DBF at C:\P2P\smis_permit_transfers.dbf

Usage:
  "C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" scripts/update_transfers.py

Can be scheduled via Windows Task Scheduler for automated monthly updates.
"""

from arcgis.gis import GIS
from arcgis.features import FeatureLayerCollection
import csv
import struct
import os
import sys
from datetime import datetime

DBF_PATH = r"C:\P2P\smis_permit_transfers.dbf"
CSV_PATH = r"C:\P2P\smis_permit_transfers_update.csv"
HOSTED_LAYER_ITEM_ID = "be555bd5a0d3487caad8208c65d1616b"


def dbf_to_csv(dbf_path, csv_path):
    """Convert DBF to CSV."""
    with open(dbf_path, "rb") as f:
        buf = f.read()

    num_records = struct.unpack_from("<I", buf, 4)[0]
    header_size = struct.unpack_from("<H", buf, 8)[0]
    record_size = struct.unpack_from("<H", buf, 10)[0]

    fields = []
    offset = 32
    while buf[offset] != 0x0D and offset < header_size:
        name = buf[offset : offset + 11].decode("ascii").replace("\x00", "")
        ftype = chr(buf[offset + 11])
        flen = buf[offset + 16]
        fields.append({"name": name, "type": ftype, "len": flen})
        offset += 32

    with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=[f["name"] for f in fields])
        writer.writeheader()

        data_start = header_size
        for i in range(num_records):
            rec_offset = data_start + i * record_size
            if buf[rec_offset] == 0x2A:
                continue
            field_offset = rec_offset + 1
            rec = {}
            for field in fields:
                val = buf[field_offset : field_offset + field["len"]].decode(
                    "ascii", errors="replace"
                ).strip()
                rec[field["name"]] = val
                field_offset += field["len"]
            writer.writerow(rec)

    print(f"Converted: {num_records} records -> {csv_path}")
    return csv_path


def main():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"=== SMIS Transfer Update — {timestamp} ===\n")

    if not os.path.exists(DBF_PATH):
        print(f"ERROR: DBF not found at {DBF_PATH}")
        sys.exit(1)

    # Check DBF modification date
    mod_time = datetime.fromtimestamp(os.path.getmtime(DBF_PATH))
    print(f"DBF last modified: {mod_time.strftime('%Y-%m-%d %H:%M')}")

    # Connect via Pro
    print("Connecting to kygis AGOL via ArcGIS Pro...")
    gis = GIS("pro")
    print(f"Logged in as: {gis.users.me.username}")

    # Find the hosted layer
    item = gis.content.get(HOSTED_LAYER_ITEM_ID)
    if not item:
        print(f"ERROR: Item {HOSTED_LAYER_ITEM_ID} not found")
        sys.exit(1)
    print(f"Found item: {item.title} (type: {item.type})")

    # Convert DBF to CSV
    print("\nConverting DBF to CSV...")
    csv_path = dbf_to_csv(DBF_PATH, CSV_PATH)

    # Overwrite the hosted feature layer
    print("Overwriting hosted feature layer...")
    flc = FeatureLayerCollection.fromitem(item)
    result = flc.manager.overwrite(csv_path)
    print(f"Overwrite result: {result}")

    # Update item description with timestamp
    item.update(
        item_properties={
            "description": (
                f"Permit transfer history from SMIS. "
                f"Last updated: {timestamp}. "
                f"Source: Division of Mine Permits, EEC."
            )
        }
    )
    print(f"Updated item description with timestamp.")

    # Cleanup
    try:
        os.remove(csv_path)
    except OSError:
        pass

    print(f"\n=== DONE — {timestamp} ===")


if __name__ == "__main__":
    main()
