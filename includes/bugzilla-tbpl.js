registerPref('show_tbpl', {'title': 'Show inline TBPL results',
                                    'setting_default': true,
                                    'callback': ifBug(initTBPL),
                                    'category': 'bug'});

function initTBPL() {
    if (!settings['show_tbpl']) {
        return;
    }
    bz_comments.find('a[href^="https://tbpl.mozilla.org/?"]').each(function() {
        var $comment = $(this).parent();
        var src = $(this).attr('href') + '&embed=true';
        var $iframe = $('<iframe src="' + src + '" class="tbpl_inline_result">');
        $comment.after($iframe);
    });
}
