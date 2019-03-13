import json
import argparse

parser = argparse.ArgumentParser(
    description="Normalize a json file INPLACE for submission")
parser.add_argument('--files', required=True,
                    nargs='+', action='append',
                    metavar=('name', 'path'),
                    help="Name and path to files to normalize")
args = parser.parse_args()

for path in args.files[0]:
    if path.endswith(".json"):
        print("Normalizing", path)
        with open(path) as f:
            normalized = json.dumps(json.loads(f.read()), sort_keys=True)
        with open(path, "w") as f:
            f.write(normalized)
