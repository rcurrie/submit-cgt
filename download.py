#!/usr/bin/env python3
"""
Download all the files from a steward and store by hash locally

Requirements:
    pip install ipfs-api
"""
import sys
import os
import json
import argparse
import ipfsapi


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=sys.modules[__name__].__doc__)
    parser.add_argument("-m", "--max", type=int, default=-1,
                        help="Max files per submission to download")
    parser.add_argument("-o", "--output", type=str, default=".",
                        help="Path to output folder")
    parser.add_argument("multihash", nargs='?', default="",
                        help="Multihash of steward index to download")
    args = parser.parse_args()

    # print("Connecting to ipfs.io...")
    # ipfs = ipfsapi.connect("https://ipfs.io", 5001)

    print("Connecting to infura.io...")
    ipfs = ipfsapi.connect("https://ipfs.infura.io", 5001)

    # Get and save the steward's index
    print("Getting steward index...")
    steward_index = json.loads(ipfs.cat(args.multihash))
    print("Found {} submissions".format(len(steward_index["submissions"])))
    ipfs.get(args.multihash, filepath=args.output)
    print("Downloading {} submissions from {}".format(
        len(steward_index["submissions"]), steward_index["domain"]))

    # For each submission get and save the index and all files
    for submission_multihash in steward_index["submissions"]:
        submission = json.loads(ipfs.cat(submission_multihash))
        ipfs.get(submission_multihash, filepath=args.output)
        print(submission["cgt_public_id"])

        for file in submission["files"][0:args.max]:
            if not os.path.exists("{}/{}".format(args.output, file["multihash"])):
                print(file["name"])
                try:
                    ipfs.get(file["multihash"], filepath=args.output)
                except:
                    print("Error downloading {} {}".format(file["multihash"], sys.exc_info()[0]))

    print("Done.")
