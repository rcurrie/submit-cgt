DOMAIN ?= "ucsf.edu"
ID ?= "f9b6a782-bbf5-4be8-bf7e-d1a9586d9552"

clean:
	echo "Resetting steward to no submissions, no peers, and domain = $(DOMAIN)"
	rm -rf ~/.ipfs
	ipfs init --profile server
	echo '{"domain": "$(DOMAIN)", "submissions": []}' | ipfs add -q | xargs ipfs name publish

up:
	ipfs daemon

normalize:
	python3 normalize.py \
		--files `find ~/UCSC/cgt/ucsf/submissions/$(ID)/0 -type f`

submit:
	python3 submit.py \
		--id $(ID) \
		--days 0 \
		--files `find ~/UCSC/cgt/ucsf/submissions/$(ID)/0 -type f`
