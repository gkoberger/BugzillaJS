registerPref('commentoverflow', 'Fix comment overflow issues?');
registerPref('removeflags', 'Remove flags?', false);
registerPref('removeaccesskeys', 'Remove access keys?', false);
registerPref('hidefirst', 'Hide first comment if empty?');


if(bug_id) {

    // Hide the first comment if it's blank?
    if(settings['hidefirst']) {
        if($('.bz_first_comment .bz_comment_text').text() == "") {
            $('.bz_first_comment').hide();
            $('.bz_comment_table').addClass('no-first-comment');
        }
    }

    // Fix comment overflow
    // Idea by fwenzel
    if(settings['commentoverflow']) {
        $('body').addClass('bzJS-commentoverflow')
    }

    // Remove accessibility keys
    // Inspired by jbalogh, who evidently hates accessibility.
    if(settings['removeaccesskeys']) {
        $('[accesskey]').each(function(i, e) {
            $(e).attr('accessKey', false);
            $(e).addClass('accessKey');
        });

        $('body').addClass('bzJS-removeaccesskeys');
    }

    // Remove flags
    // Idea by jbalogh
    if(settings['removeflags']) {
        $('#flags, .flags_label').remove();
    }
}
