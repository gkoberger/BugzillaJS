registerPref('gravatar', 'Show gravatars for comments');

if(bug_id && settings['gravatar']) {
    $('.bz_comment_head,.bz_first_comment_head').each(function () {
        // Email addresses are only shown if the user is logged in
        if($('a.email', this).length > 0) {
            email = $('a.email', this).attr('href').replace(/mailto:\s*/, '');
            $(this).prepend('<img src="http://www.gravatar.com/avatar/' + hex_md5(email) + '">');
        }

    });
}
