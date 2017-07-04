debug:
	sudo ./node_modules/webpack-dev-server/bin/webpack-dev-server.js \
		--progress --colors

get_latest_filter:
	curl -o clinicalFilter.tsv https://docs.google.com/spreadsheets/u/1/d/13n7-F_fi5TWS1vFwuW95X4U_KFqnXIX8eETi9lG04Dk/export?format=tsv
