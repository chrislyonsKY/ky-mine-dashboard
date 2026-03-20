"""
Publish SMIS Permit Transfers DBF to kygis AGOL as a hosted feature layer.
Converts DBF to CSV first, then uploads and publishes.
Uses ArcGIS Pro's active portal connection.
"""

from arcgis.gis import GIS
import csv
import struct
import os

DBF_PATH = r"C:\P2P\smis_permit_transfers.dbf"
CSV_PATH = r"C:\P2P\smis_permit_transfers.csv"
TITLE = "SMIS Permit Transfers"
TAGS = "SMIS, mining, permits, transfers, DMP, EEC"
DESCRIPTION = (
    "Permit transfer history from the Surface Mining Information System (SMIS). "
    "Contains permit transfer chains, activity dates, bond status, "
    "and permit lifecycle data. Updated monthly. "
    "Source: Division of Mine Permits, Energy and Environment Cabinet."
)


def dbf_to_csv(dbf_path, csv_path):
    """Convert DBF to CSV."""
    with open(dbf_path, "rb") as f:
        buf = f.read()

    num_records = struct.unpack_from("<I", buf, 4)[0]
    header_size = struct.unpack_from("<H", buf, 8)[0]
    record_size = struct.unpack_from("<H", buf, 10)[0]

    # Read field descriptors
    fields = []
    offset = 32
    while buf[offset] != 0x0D and offset < header_size:
        name = buf[offset : offset + 11].decode("ascii").replace("\x00", "")
        ftype = chr(buf[offset + 11])
        flen = buf[offset + 16]
        fields.append({"name": name, "type": ftype, "len": flen})
        offset += 32

    print(f"DBF: {num_records} records, {len(fields)} fields")

    # Write CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=[f["name"] for f in fields])
        writer.writeheader()

        data_start = header_size
        for i in range(num_records):
            rec_offset = data_start + i * record_size
            if buf[rec_offset] == 0x2A:  # deleted record
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

    print(f"CSV written: {csv_path}")
    return csv_path


def main():
    print("Connecting via ArcGIS Pro's active portal...")
    gis = GIS("pro")
    print(f"Logged in as: {gis.users.me.username}")
    print(f"Portal: {gis.url}")

    if not os.path.exists(DBF_PATH):
        print(f"ERROR: File not found: {DBF_PATH}")
        return

    # Convert DBF to CSV
    print(f"\nConverting {DBF_PATH} to CSV...")
    csv_path = dbf_to_csv(DBF_PATH, CSV_PATH)

    # Upload CSV
    print(f"\nUploading {csv_path}...")
    item_properties = {
        "title": TITLE,
        "tags": TAGS,
        "description": DESCRIPTION,
        "type": "CSV",
        "snippet": "SMIS permit transfer history - updated monthly",
    }

    item = gis.content.add(
        item_properties=item_properties,
        data=csv_path,
    )
    print(f"Uploaded item: {item.id} - {item.title}")

    # Publish as hosted feature layer
    print("Publishing as hosted feature layer...")
    published = item.publish()
    print(f"Published: {published.id} - {published.url}")

    # Share with org
    published.share(org=True)
    print("Shared with organization.")

    print("\n=== DONE ===")
    print(f"Item ID: {published.id}")
    print(f"URL: {published.url}")

    # Cleanup CSV
    os.remove(csv_path)
    print("Cleaned up temp CSV.")


if __name__ == "__main__":
    main()
