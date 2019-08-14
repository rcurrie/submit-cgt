#!/usr/bin/env python3
"""
Download all the files from a steward and store by hash locally
"""
import sys
import os
import argparse
import requests


def download(multihash, path, gateway):
    """ Download file from IPFS gateway """
    r = requests.get("{}/{}".format(gateway, multihash), stream=True)
    with open("{}/{}".format(path, multihash), "wb") as fd:
        for chunk in r.iter_content(chunk_size=128):
            fd.write(chunk)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=sys.modules[__name__].__doc__)
    parser.add_argument("-m", "--max", type=int, default=None,
                        help="Max files per submission to download")
    parser.add_argument("-o", "--output", type=str, default=".",
                        help="Path to output folder")
    parser.add_argument("-g", "--gateway", type=str, default="https://ipfs.infura.io/ipfs",
                        help="IPFS Gateway, see https://ipfs.github.io/public-gateway-checker/")
    parser.add_argument("multihash", nargs='?', default="",
                        help="Multihash of steward index to download")
    args = parser.parse_args()

    found = []

    # Get and save the steward's index
    print("Getting steward index...")
    steward_index = requests.get("{}/{}".format(args.gateway, args.multihash)).json()
    print("Found {} submissions".format(len(steward_index["submissions"])))
    download(args.multihash, args.output, args.gateway)
    found.append(args.multihash)
    print("Downloading {} submissions from {}".format(
        len(steward_index["submissions"]), steward_index["domain"]))

    # For each submission get and save the index and all files
    for submission_multihash in steward_index["submissions"]:
        # if submission_multihash != "QmPCzjCw71Tu3rB5ZfxvRpY4tDdFHRxw3bVe8BHjBnQtra":
        #     continue
        submission = requests.get("{}/{}".format(args.gateway, submission_multihash)).json()
        download(submission_multihash, args.output, args.gateway)
        found.append(submission_multihash)
        print(submission["cgt_public_id"])

        for file in submission["files"][0:args.max]:
            if not os.path.exists("{}/{}".format(args.output, file["multihash"])):
                print(file["name"])
                try:
                    download(file["multihash"], args.output, args.gateway)
                except KeyboardInterrupt:
                    sys.exit()
            found.append(file["multihash"])

    print("Done.")
    print("Found {} blobs".format(len(found)))
    print("Extra blobs in download:", set(os.listdir(args.output)) - set(found))
