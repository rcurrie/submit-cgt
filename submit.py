"""
Submit files to an IPFS server conforming to the CGT submission
specification
"""
import os
import json
import glob
import pprint
import argparse
import ipfsapi

__CUR_CGT_INDEX_FILE_NAME__ = "current-cgt-index-hash.txt"


def get_index(ipfs, domain):
    """ Get the current index using ./cur_cgt_index_hash or create one if not existent """
    if os.path.exists(__CUR_CGT_INDEX_FILE_NAME__):
        print("Loading existing index hash from ", __CUR_CGT_INDEX_FILE_NAME__)
        with open(__CUR_CGT_INDEX_FILE_NAME__) as f:
            index_hash = f.read()
        index = json.loads(ipfs.cat(index_hash))
    else:
        print("No existing index hash, creating empty default")
        index = {"domain": domain, "submissions": []}
        index_hash = ipfs.add_str(json.dumps(index, sort_keys=True))
        with open(__CUR_CGT_INDEX_FILE_NAME__, "w") as f:
            f.write(index_hash)
    return index, index_hash


def add_submission(ipfs, submission_hash):
    """ Add the submission to the index if not already there """
    with open(__CUR_CGT_INDEX_FILE_NAME__) as f:
        index_hash = f.read()
    index = json.loads(ipfs.cat(index_hash))

    if submission_hash in index["submissions"]:
        print("Submission already in steward's index")
    else:
        index["submissions"] = sorted(
            index["submissions"] + [submission_hash])
        index_hash = ipfs.add_str(json.dumps(index, sort_keys=True))
        with open(__CUR_CGT_INDEX_FILE_NAME__, "w") as f:
            f.write(index_hash)

    print("Steward index:")
    pprint.pprint(index)
    print("Index hash:")
    pprint.pprint(index_hash)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Make a CGT submission to an IPFS server")
    parser.add_argument('--id', required=True,
                        help="Public patient identifier")
    parser.add_argument('--path', required=True,
                        help="Path to files for submission")
    parser.add_argument('--domain', required=False,
                        help="Domain to initialize index")
    parser.add_argument('--days', required=False,
                        help="Days from birth of submission")
    args = parser.parse_args()

    print("Connecting to infura...")
    ipfs = ipfsapi.connect("https://ipfs.infura.io", 5001)

    print("Getting index...")
    index, index_hash = get_index(ipfs, args.domain)

    # Add all the files to IPFS
    files = []
    paths = sorted(glob.glob("{}/**/*".format(args.path), recursive=True))
    paths = [p for p in paths if not os.path.isdir(p)]
    print("Found {} files".format(len(paths)))

    print("NOTE LIMITING TO 7 FILES")
    paths = paths[0:7]

    count = len(paths)
    for path in paths:
        print("Remaining: {} File: {} Size: {}".format(
            count, os.path.basename(path), os.path.getsize(path)), end="\r")
        files.append(ipfs.add(path))
        count -= 1

    print("Added {} files".format(len(files)))

    # Add the submission to IPFS
    submission = {"cgt_public_id": args.id}
    if args.days:
        submission["days_from_birth"] = args.days
    submission["files"] = sorted([{"name": f["Name"], "multihash": f["Hash"]} for f in files],
                                 key=lambda k: k["name"] + k["multihash"])
    print("Submission:")
    pprint.pprint(submission)
    submission_hash = ipfs.add_str(json.dumps(submission, sort_keys=True))
    print("Submision Hash:", submission_hash)

    add_submission(ipfs, submission_hash)
