"""
Submit files to an IPFS server conforming to the CGT submission
specification
"""
import os
import sys
# import time
import json
import glob
import pprint
import argparse
import ipfsapi

__CUR_CGT_INDEX_FILE_NAME__ = "current-cgt-index-hash.txt"


def get_index(ipfs, domain, pin):
    """ Get the current index using ./cur_cgt_index_hash or create one if not existent """
    if os.path.exists(__CUR_CGT_INDEX_FILE_NAME__):
        print("Loading existing index hash from ", __CUR_CGT_INDEX_FILE_NAME__)
        with open(__CUR_CGT_INDEX_FILE_NAME__) as f:
            index_hash = f.read().strip()
        index = json.loads(ipfs.cat(index_hash))
    else:
        print("No existing index hash, creating empty default")
        index = {"domain": domain, "submissions": []}
        index_hash = ipfs.add_str(json.dumps(index, sort_keys=True))
        with open(__CUR_CGT_INDEX_FILE_NAME__, "w") as f:
            f.write(index_hash)
        if pin:
            ipfs.pin_add(index_hash)
    return index, index_hash


def add_submission(ipfs, submission_hash, pin):
    """ Add the submission to the index if not already there """
    print("Adding submission", submission_hash)
    with open(__CUR_CGT_INDEX_FILE_NAME__) as f:
        index_hash = f.read().strip()
    index = json.loads(ipfs.cat(index_hash))

    if submission_hash in index["submissions"]:
        print("Submission already in steward's index")
    else:
        index["submissions"] = sorted(list(set(
            index["submissions"] + [submission_hash])))
        index_hash = ipfs.add_str(json.dumps(index, sort_keys=True))
        if pin:
            ipfs.pin_add(index_hash)
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
    parser.add_argument('--pin', required=False, default=False,
                        help="Pin objects in IPFS")
    args = parser.parse_args()

    # Hack
    # args.pin = True

    print("Connecting to infura...")
    ipfs = ipfsapi.connect("https://ipfs.infura.io", 5001)

    if args.pin:
        print("Pinning is ON")
    else:
        print("Pinning is OFF")

    print("Getting index...")
    index, index_hash = get_index(ipfs, args.domain, args.pin)
    print("Existing index:", index)

    # Add all the files to IPFS
    files = []
    paths = sorted(glob.glob("{}/**/*".format(args.path), recursive=True))
    paths = [p for p in paths if not os.path.isdir(p)]
    print("Found {} files".format(len(paths)))

    # print("NOTE LIMITING TO 5 FILES")
    # paths = paths[0:5]

    count = len(paths)
    for path in paths:
        print("Remaining: {} File: {} Size: {}".format(
            count, os.path.basename(path), os.path.getsize(path)), end="\r")
        result = ipfs.add(path, pin=args.pin)

        try:
            result = ipfs.add(path, pin=args.pin)
            files.append(result)
        except:
            print("Error adding {} {}".format(path, sys.exc_info()[0]))
            print("Continuing...")

        count -= 1

    print("Added {} files".format(len(files)))

    # Add the submission to IPFS
    submission = {"cgt_public_id": args.id}
    if args.days:
        submission["days_from_birth"] = args.days
    submission["files"] = sorted([{"name": f["Name"], "multihash": f["Hash"]} for f in files],
                                 key=lambda k: k["name"] + k["multihash"])
    # print("Submission:")
    # pprint.pprint(submission)
    submission_hash = ipfs.add_str(json.dumps(submission, sort_keys=True))
    if args.pin:
        ipfs.pin_add(submission_hash)
    print("Submision Hash:", submission_hash)

    add_submission(ipfs, submission_hash, args.pin)
