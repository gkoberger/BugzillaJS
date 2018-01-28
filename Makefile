build:
	mkdir -p output
	zip -r -FS output/bugzillajs.xpi js css icon.png icon64.png manifest.json options/options.js options/options.html

clean:
	mkdir -p output && rm -R output/

lint:
	jshint .
