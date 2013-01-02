registerPref('show_tbpl', {'title': 'Show inline TBPL results',
                                    'setting_default': true,
                                    'callback': ifBug(initTBPL),
                                    'category': 'bug'});

function initTBPL() {
    if(settings['show_tbpl']) {
        bz_comments.find('a').each(function() {
            var $comment = $(this).parent();
            var linkText = $(this).text();
            if (linkText.indexOf("https://tbpl.mozilla.org/?") == 0) {
                var $iframe = $('<iframe>', {'style':'width:100%; border:none; background-color:white;'});
                $comment.after($iframe);
                var iframe = $iframe[0];
                iframe.onload = function() {
                    var topbar = iframe.contentWindow.getElementById("topbar");
                    topbar.parentNode.removeChild(topbar);
                };
                iframe.src = linkText + "&embed=true";
            }
        });
    }
}
