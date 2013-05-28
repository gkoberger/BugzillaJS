%(scripts)s

// Initialize the Marked markdown parser
marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    highlight: function(code, lang) {
        return hljs.highlight(lang, code).value;
    }
});

var listen = self.on || self.addEventListener;

listen.call(self, "message", function(msg) {
    if (msg.data)
        msg = msg.data;
    if (msg.name == "markdown") {
        self.postMessage({
            cid: msg.cid,
            message: marked(msg.message).replace(/^\s*<p>|<\/p>\s*$/gi, "")
        });
    }
});
