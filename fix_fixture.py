import json

input_file = 'backend/fixtures_ingredients.json'
output_file = 'backend/fixtures_ingredients_fixed.json'

with open(input_file, 'r') as f:
    data = json.load(f)

for entry in data:
    if entry['model'] == 'umami_api.tcm':
        fields = entry['fields']
        for field_name in ['four_qi', 'five_flavors', 'meridians']:
            if field_name in fields and isinstance(fields[field_name], str):
                try:
                    # Parse the string as JSON to get the list
                    fields[field_name] = json.loads(fields[field_name])
                except json.JSONDecodeError:
                    print(f"Failed to parse {field_name}: {fields[field_name]}")

with open(output_file, 'w') as f:
    json.dump(data, f, indent=2)

print("Fixed fixture saved to", output_file)
