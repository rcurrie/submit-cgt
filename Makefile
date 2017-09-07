debug:
	./node_modules/.bin/webpack-dev-server --open

build:
	./node_modules/.bin/webpack

get_latest_filter:
	curl -o clinicalFilter.tsv https://docs.google.com/spreadsheets/u/1/d/13n7-F_fi5TWS1vFwuW95X4U_KFqnXIX8eETi9lG04Dk/export?format=tsv

deploy:
	rsync -a --exclude='.git/' --exclude='node_modules' \
		. ubuntu@admin.cancergenetrust.org:~/submit-cgt

run:
	docker run -d --name submit \
		--net=searchcgt_default \
		-v `pwd`:/usr/share/nginx/html \
		-e VIRTUAL_HOST=submit.cancergenetrust.org \
		nginx:stable-alpine
