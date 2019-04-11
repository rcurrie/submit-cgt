build:
	# Build docker image with conversion tools
	docker build --no-cache -t cgt-submit .

debug:
	# Run the docker mapping out of local directory
	docker run --rm -it \
		--name cgt-submit \
		--user=`id -u`:`id -g` \
		-v `readlink -f ~/data`:/data \
		-v `readlink -f ~/public_html`:/public_html \
		-v `pwd`:/app \
		-e HOME=/app \
		--entrypoint /bin/bash \
		cgt-submit
