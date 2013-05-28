BugzillaJS.registerPref('gravatar', {'title': 'Show gravatars in comments',
                                     'setting_default': true,
                                     'callback': ifBug(setGravatars),
                                     'category': 'inline'});

function setGravatars() {
    $('.bz_comment_head,.bz_first_comment_head').each(function () {
        // Email addresses are only shown if the user is logged in
        if($(this).parent().hasClass('ih_history_item')) return;
        if($('a.email', this).length > 0) {
            var email = $('a.email', this).attr('href').replace(/mailto:\s*/, '');
            email = email.toLowerCase().replace(/\+(.*?)@/, "@");
            $(this).find('.gravatar').remove();
            $(this).prepend($('<img>', {'class': "gravatar", 'src': "https://secure.gravatar.com/avatar/" + hex_md5(email)}));
        }

    });
}

BugzillaJS.addFeature();
