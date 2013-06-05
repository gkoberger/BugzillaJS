#!/usr/bin/env node

var static = require("node-static");

var fileServer = new static.Server("./");

require("http").createServer(function(req, res) {
  req.addListener("end", function () {
    if (/^\/show_bug\.cgi\?id=[\d]*$/.test(req.url))
      req.url = "/index.html";
    fileServer.serve(req, res);
  });
}).listen(4444, function() {
  console.log("Server listening at http://localhost:4444");
});
