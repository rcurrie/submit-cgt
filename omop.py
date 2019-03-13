"""
Submit files to an IPFS server conforming to the CGT submission
specification
"""
import glob
import argparse
import json


parser = argparse.ArgumentParser(
    description="Convert between OMOP tsv and json")
parser.add_argument('--json', help="Convert to JSON")
parser.add_argument('--tsv', help="Convert to TSV")
args = parser.parse_args()

if args.json:
    print("Converting from TSV to JSON")

# Add all the files to IPFS
paths = glob.glob("{}/**/*".format(args.path), recursive=True)
print("Adding {} files".format(len(paths)))
print(paths)
files = [ipfs.add(path) for path in paths]

# Add the submission to IPFS
submission = {"id": args.id, "days_from_birth": int(args.days)}
submission["files"] = sorted([{"name": f["Name"], "multihash": f["Hash"]} for f in files],
                             key=lambda k: k["name"] + k["multihash"])
print("submission", submission)
submission_multihash = ipfs.add_str(json.dumps(submission, sort_keys=True))
print("submission_multihash", submission_multihash)

# Update steward index
steward_ipns_address = ipfs.id()["ID"]
print("Steward IPNS Address", steward_ipns_address)

steward_index_cid = ipfs.name_resolve(
    steward_ipns_address, opts={'local': True})["Path"].rsplit('/')[-1]
print("Steward index cid", steward_index_cid)

steward_index = json.loads(ipfs.cat(steward_index_cid))
print("Steward index", steward_index)

if submission_multihash in steward_index["submissions"]:
    print("Submission already in steward's index")
else:
    steward_index["submissions"] = sorted(steward_index["submissions"] + [submission_multihash])
    print("new steward_index", steward_index)

    steward_index_cid = ipfs.add_str(json.dumps(steward_index, sort_keys=True))
    print("new steward_index_cid", steward_index_cid)

    print("Publishing...")
    ipfs.name_publish(ipfs_path="/ipfs/{}".format(steward_index_cid),
                      resolve=False,
                      lifetime="24h")

print("Done.")
