registerPref('skipprocess', 'Rewrite URL for "Bug Processed" page?', ifBug(skipProcessPage));
registerPref('commentoverflow', 'Fix comment overflow issues?', ifBug(commentOverflow));
registerPref('removeflags', 'Remove flags, status and blocking?', false, ifBug(removeFlags));
registerPref('removeaccesskeys', 'Remove access keys?', false, ifBug(removeAccess));
registerPref('hidefirst', 'Hide first comment if empty?', ifBug(hideFirst));


function hideFirst() {
    // Hide the first comment if it's blank?
    if(settings['hidefirst']) {
        if($('.bz_first_comment .bz_comment_text').text() == "") {
            $('.bz_first_comment').hide();
            $('.bz_comment_table').addClass('no-first-comment');
        }
    }
}

function commentOverflow() {
    // Fix comment overflow
    // Idea by fwenzel
    if(settings['commentoverflow']) {
        $('body').addClass('bzJS-commentoverflow');
    }
}

function removeAccess() {
    // Remove accessibility keys
    // Inspired by jbalogh, who evidently hates accessibility.
    if(settings['removeaccesskeys']) {
        $('[accesskey]').each(function(i, e) {
            $(e).attr('accessKey', undefined);
            $(e).addClass('accessKey');
        });

        $('body').addClass('bzJS-removeaccesskeys');
    }
}

function removeFlags() {
    // Remove flags
    // Idea by jbalogh
    if(settings['removeflags']) {
        $('#flags, .flags_label').remove();

        $('#bz_show_bug_column_2 [id^=field_label_cf_]').each(function(){
            $(this).next().remove();
            $(this).remove();
        });
    }
}

function skipProcessPage() {
    if(settings['skipprocess']) {
        if($('#bugzilla-body dt').eq(0).text().match(/Changes submitted for bug/)) {
            var $parent = $('.bz_alias_short_desc_container'),
                $link = $parent.find('a[href^=show_bug.cgi]'),
                href = $link.attr('href'),
                title = $link.text() + " - " + $parent.find('#short_desc_nonedit_display').text();

            window.history.replaceState({}, title, href);
        }
    }
}

