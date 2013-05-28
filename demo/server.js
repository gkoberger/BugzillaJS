#!/usr/bin/env node

var static = require("node-static");

var fileServer = new static.Server("./");

require("http").createServer(function(req, res) {
  req.addListener("end", function () {
    fileServer.serve(req, res);
  });
}).listen(4444);
