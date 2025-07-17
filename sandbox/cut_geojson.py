import json

# Pfade zu den Eingabe-/Ausgabedateien
input_geojson_path = r"C:\Users\korvi\Documents\Universitaet\Mobile GIS LBS\Mobile-GIS-LBS-app\hello\www\sandbox\kit_campus_pois.geojson"
attribute_count_path = r"C:\Users\korvi\Documents\Universitaet\Mobile GIS LBS\Mobile-GIS-LBS-app\hello\www\sandbox\attribute_counts.json"
output_geojson_path = r"C:\Users\korvi\Documents\Universitaet\Mobile GIS LBS\Mobile-GIS-LBS-app\hello\www\sandbox\kit_campus_pois_filtered.geojson"

# Lade Attribut-Häufigkeiten
with open(attribute_count_path, "r", encoding="utf-8") as f:
    attribute_counts = json.load(f)

# Behalte nur Attribute mit Häufigkeit > 3
attributes_to_keep = {key for key, count in attribute_counts.items() if count > 3}

# Lade die GeoJSON-Datei
with open(input_geojson_path, "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# Filtere die Features
filtered_features = []
for feature in geojson_data.get("features", []):
    properties = feature.get("properties", {})
    new_properties = {k: v for k, v in properties.items() if k in attributes_to_keep}
    new_feature = {
        "type": "Feature",
        "geometry": feature.get("geometry"),
        "properties": new_properties
    }
    filtered_features.append(new_feature)

# Neues GeoJSON erstellen
filtered_geojson = {
    "type": "FeatureCollection",
    "features": filtered_features
}

# Speichern
with open(output_geojson_path, "w", encoding="utf-8") as f:
    json.dump(filtered_geojson, f, indent=2, ensure_ascii=False)
