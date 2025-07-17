import json

# Pfad zur GeoJSON-Datei
input_geojson_path = r"C:\Users\korvi\Documents\Universitaet\Mobile GIS LBS\Mobile-GIS-LBS-app\hello\www\sandbox\kit_campus_pois_selected_attributes.geojson"
output_json_path = "attribute_counts.json"

# GeoJSON-Datei laden
with open(input_geojson_path, 'r', encoding='utf-8') as f:
    geojson_data = json.load(f)

# Initialisiere das Zähler-Dictionary
attribute_counts = {}

# Iteriere über alle Features und zähle nicht-leere Werte für jedes Attribut
for feature in geojson_data.get("features", []):
    properties = feature.get("properties", {})
    for key, value in properties.items():
        if value not in [None, "", [], {}]:  # Leere Werte ignorieren
            attribute_counts[key] = attribute_counts.get(key, 0) + 1

# Speichere das Ergebnis als JSON
with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(attribute_counts, f, indent=2, ensure_ascii=False)
