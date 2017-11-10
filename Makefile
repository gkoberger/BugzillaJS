build:
	mkdir -p output
	jpm xpi --dest-dir output/

lint:
	jshint .
