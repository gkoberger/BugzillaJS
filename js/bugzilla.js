'use strict';
/* exported bz_comments */

/* global $, browser, categories */

var settings = [],
    settings_fields = [],
    bug_id = false,
    bz_comments = $('.bz_comment_text:not(#comment_preview_text),' +
                    '.comment-text:not(#comment-preview)'),
    already_run = [],
    total_new = 0,
    is_mozilla_theme;

/** Get the bug ID **/

bug_id = $('title').text().match(/^(?:Bug )?([0-9]+)/);
bug_id = bug_id ? bug_id[1] : false;

is_mozilla_theme = document.body.classList.contains('skin-Mozilla');

/* Register preferences */
registerPref('gitcomments', {'title': 'Style the comments like Github',
                             'setting_default': true,
                             'callback': ifBug(addStyling),
                             'category': 'bug'});

/** Run the modules **/
function ifBug(f) {
    if (bug_id) {
        return f;
    } else {
        return function() {};
    }
}

function addStyling() {
    if (settings.gitcomments) {
        $('body').addClass('git_style');
        $('.git_style .ih_history br').replaceWith('<span>; </span>');
        setTimeout(repositionScroll, 200);
    }
}

function repositionScroll() {
    //-- Reposition the scrollTo if necessary
    if (location.hash.match(/#c[0-9]*/)) {
        $(window).scrollTo($(location.hash));
    }
}

function registerPref(slug, o) {
    /* TODO: integrate these */
    registerPref_old(slug,
        o.title,
        o.setting_default,
        o.callback,
        o.category,
        o.is_new);
}

function registerPref_old(slug,
  details,
  setting_default,
  callback,
  category,
  is_new) {
    if (! already_run[slug]) {
        if (typeof setting_default == 'function') {
            callback = setting_default;
            setting_default = null;
        }
        if (setting_default == null || setting_default === undefined) {
            setting_default = true;
        }

        callback = callback || function() {};

        settings[slug] = setting_default;

        browser.storage.sync.get('settings_' + slug).then(function(result) {
            var v = result['settings_' + slug];
            var show_new = false;
            if (typeof v != 'undefined') {
                settings[slug] = v;
            } else {
                if (is_new) {
                    total_new++;
                    notifyNew();
                    show_new = true;
                }
            }

            settings_fields.push({'slug': slug,
                'details': details,
                'is_new': show_new,
                'category': category});

            // If it's enabled and we're on a Bugzilla page, run it!
            if (window.wrappedJSObject.BUGZILLA && settings[slug]) {
                callback();
            }
        });

        already_run[slug] = true;
    }
}

function getNotifyElt(prefMenu) {
    var notifyElt = prefMenu.nextElementSibling;
    if (notifyElt && notifyElt.classList.contains('notify')) {
        return notifyElt;
    }

    notifyElt = document.createElement('span');
    notifyElt.classList.add('notify');
    return prefMenu.parentNode.insertBefore(notifyElt,
                                            prefMenu.nextElementSibling);
}

// New feature? Notify them!
function notifyNew() {
    if (total_new <= 0) {
        return;
    }
    var prefMenu = document.querySelector('.bjs-prefs');
    var notifyElt = getNotifyElt(prefMenu);
    notifyElt.textContent = total_new;
}
