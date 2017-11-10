'use strict';

/* global registerPref, ifBug, hex_md5 */

registerPref('gravatar', {'title': 'Show gravatars in comments',
                          'setting_default': true,
                          'callback': ifBug(setGravatars),
                          'category': 'inline'});

function setGravatars() {
    // Some Bugzilla themes have gravatar support
    if (document.body.classList.contains('bz_gravatar')) {
        return;
    }

    var selector = '.bz_comment_head, .bz_first_comment_head';
    var comments = document.querySelectorAll(selector);
    for (var i = 0, il = comments.length; i < il; i++) {
        var comment = comments[i];
        if (comment.parentNode.classList.contains('ih_history_item')) {
            continue;
        }

        // Email addresses are only shown if the user is logged in
        var emails = comment.querySelectorAll('a.email');
        if (emails.length === 0) {
            continue;
        }

        var email_node = emails[0];
        var email = email_node.href.substr(7); // removes "mailto:"
        // removes + aliases
        email = email.toLowerCase().replace(/\+(.*?)@/, '@');
        var hash = memoized_hex_md5(email);

        var img = document.createElement('img');
        img.className = 'gravatar';
        img.src = 'https://secure.gravatar.com/avatar/' + hash;
        comment.insertBefore(img, comment.firstChild);
    }
}

var md5_cache = {};
function memoized_hex_md5(email) {
    if (!md5_cache[email]) {
        md5_cache[email] = hex_md5(email);
    }

    return md5_cache[email];
}
