DOMAIN ?= ucsf.edu
ID ?= 104ec531-5d95-41e2-ac72-f6cff2006b8e

up:
	ipfs daemon

clean:
	echo "Resetting steward to no submissions, no peers, and domain = $(DOMAIN)"
	rm -rf ~/.ipfs
	ipfs init --profile server
	echo '{"domain": "$(DOMAIN)", "submissions": []}' | ipfs add -q | xargs ipfs name publish

cors:
	ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
	ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
	ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'

normalize:
	python3 normalize.py \
		--files `find submissions/* -type f -name "*.json"`

submit:
	python3 submit.py --id $(ID) --days 0 --path submissions/$(ID)/0

add:
	curl "https://ipfs.infura.io:5001/api/v0/add?pin=false" \
    -X POST \
    -H "Content-Type: multipart/form-data" \
    -F file=@"submissions/104ec531-5d95-41e2-ac72-f6cff2006b8e/0/foundation.json"
