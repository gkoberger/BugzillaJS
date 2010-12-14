// ==UserScript==
// @name           BugzillaJS
// @namespace      http://people.mozilla.com/~gkoberger
// @include        https://bugzilla.mozilla.org/*
// ==/UserScript==


var script = document.createElement("script");
script.setAttribute("src",
        "https://people.mozilla.com/~gkoberger/bugzillajs/min/bugzilla.debug.js");

var link = document.createElement("link");
link.setAttribute("href",
        "https://people.mozilla.com/~gkoberger/bugzillajs/min/style.min.css");
link.setAttribute("rel", "stylesheet");

document.body.appendChild(script);
document.body.appendChild(link);

