"""
Deploy KY Mine Permits Dashboard to kygis AGOL.
Uploads dist/ files as item resources so AGOL serves them as a web app.
Uses ArcGIS Pro's active portal connection.
"""

from arcgis.gis import GIS
import os
import sys

DIST_DIR = r"E:\ky-mine-dashboard\dist"
ITEM_ID = "75e1dba74b1d4068810652a98febb733"  # Existing item to update
TITLE = "Kentucky Mine Permits Dashboard"


def upload_directory(item, base_dir, prefix=""):
    """Recursively upload all files in a directory as item resources."""
    count = 0
    for entry in os.scandir(base_dir):
        resource_name = f"{prefix}{entry.name}" if prefix else entry.name

        if entry.is_file():
            try:
                item.add_resource(
                    file=entry.path,
                    file_name=resource_name,
                )
                count += 1
                if count % 20 == 0:
                    print(f"  ...uploaded {count} files")
            except Exception as e:
                print(f"  WARN: Failed to upload {resource_name}: {e}")
        elif entry.is_dir():
            count += upload_directory(item, entry.path, prefix=f"{resource_name}/")

    return count


def main():
    if not os.path.exists(DIST_DIR):
        print(f"ERROR: dist/ not found. Run 'npm run build' first.")
        sys.exit(1)

    print("Connecting to kygis AGOL via ArcGIS Pro...")
    gis = GIS("pro")
    print(f"Logged in as: {gis.users.me.username}")

    # Get existing item
    item = gis.content.get(ITEM_ID)
    if not item:
        print(f"ERROR: Item {ITEM_ID} not found")
        sys.exit(1)

    print(f"Found: {item.title} ({item.id})")

    # Clear existing resources
    print("Clearing old resources...")
    try:
        existing = item.resources.list()
        for r in existing:
            item.resources.remove(file=r["resource"])
    except Exception:
        pass

    # Upload all files from dist/
    print(f"Uploading files from {DIST_DIR}...")
    count = upload_directory(item, DIST_DIR)
    print(f"Uploaded {count} files.")

    # Set the item URL to point to the index.html resource
    app_url = (
        f"{gis.url}/sharing/rest/content/items/{item.id}"
        f"/resources/index.html"
    )
    item.update(item_properties={"url": app_url})
    print(f"\nApp URL: {app_url}")
    print("Done!")


if __name__ == "__main__":
    main()
