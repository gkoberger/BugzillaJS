//Lightweight JSONP fetcher - www.nonobtrusive.com
var JSONP = (function(){
	var counter = 0, head, query, key;
	function load(url) {
		var script = document.createElement('script'),
			done = false;
		script.src = url;
		script.async = true;

		script.onload = script.onreadystatechange = function() {
			if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
				done = true;
				script.onload = script.onreadystatechange = null;
				if ( script && script.parentNode ) {
					script.parentNode.removeChild( script );
				}
			}
		};
		if ( !head ) {
			head = document.getElementsByTagName('head')[0];
		}
		head.appendChild( script );
	}
	function jsonp(url, params, callback) {
		query = "?";
		params = params || {};
		for ( key in params ) {
			if ( params.hasOwnProperty(key) ) {
				query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
			}
		}
		var jsonp = "json" + (++counter);
		unsafeWindow[ jsonp ] = function(data){
			callback(data);
			try {
				delete unsafeWindow[ jsonp ];
			} catch (e) {}
			unsafeWindow[ jsonp ] = null;
		};

		load(url + query + "callback=" + jsonp);
		return jsonp;
	}
	return {
		get:jsonp
	};
}());
