"""
Delete a submission from the a CGT steward's index
"""
import json
import pprint
import argparse
import ipfsapi

__CUR_CGT_INDEX_FILE_NAME__ = "current-cgt-index-hash.txt"


def get_index(ipfs):
    """ Get the current index using ./cur_cgt_index_hash """
    print("Loading existing index hash from ", __CUR_CGT_INDEX_FILE_NAME__)
    with open(__CUR_CGT_INDEX_FILE_NAME__) as f:
        index_hash = f.read().strip()
    return json.loads(ipfs.cat(index_hash)), index_hash


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Delete a submission")
    parser.add_argument("multihash",
                        help="Multihash of submission to delete")
    parser.add_argument('--pin', required=False, default=False,
                        help="Pin objects in IPFS")
    args = parser.parse_args()

    print("Connecting to infura...")
    ipfs = ipfsapi.connect("https://ipfs.infura.io", 5001)

    print("Getting index...")
    index, index_hash = get_index(ipfs)
    print("Existing index hash:", index_hash)
    print("Existing index:")
    pprint.pprint(index)

    if args.multihash in index["submissions"]:
        print("Deleting submission {} from {}".format(args.multihash, index_hash))
        index["submissions"].remove(args.multihash)
        assert args.multihash not in index["submissions"]

        index_hash = ipfs.add_str(json.dumps(index, sort_keys=True))
        if args.pin:
            ipfs.pin_add(index_hash)
        # Update index hash
        print("New index hash:", index_hash)
        with open(__CUR_CGT_INDEX_FILE_NAME__, "w") as f:
            f.write(index_hash)
    else:
        print("Submission {} is not in {}".format(args.multihash, index_hash))
