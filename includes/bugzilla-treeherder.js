'use strict';

/* global registerPref, ifBug, settings */

registerPref('show_treeherder', {'title': 'Show inline Treeherder results',
                                 'setting_default': true,
                                 'callback': ifBug(initTreeherder),
                                 'category': 'bug'});

function initTreeherder() {
    if (!settings.show_treeherder) {
        return;
    }

    document.addEventListener('focus', detectIframeFocused);
    document.addEventListener('blur', detectIframeFocused);

    var baseHref = 'https://treeherder.mozilla.org/embed/resultset-status/';
    var selector = '.bz_comment_text ';
    selector += 'a[href^="https://treeherder.mozilla.org/#/jobs?"]';
    var treeherders = document.querySelectorAll(selector);

    for (var i = 0, il = treeherders.length; i < il; i++) {
        var treeherder = treeherders[i];
        var href = treeherder.href;
        var repo = href.match(/[&?]repo=([\w-]+)/);
        var revision = href.match(/[&?]revision=([\w-]+)/);

        if (!repo || !revision) {
            continue;
        }

        var iframe = document.createElement('iframe');
        iframe.src = baseHref + repo[1] + '/' + revision[1] + '/';
        iframe.classList.add('treeherder_inline_result');

        treeherder.parentNode.appendChild(iframe);
    }
}

// TODO : https://github.com/gkoberger/BugzillaJS/issues/69
// Once dropping Ominum, do this more properly by including a script in
// the iframes
function detectIframeFocused() {
    var iframes = document.getElementsByClassName('iframe_focused');
    if (iframes.length) {
        iframes[0].classList.remove('iframe_focused');
    }

    // We need a timeout here, otherwise document.activeElement has not
    // changed yet
    setTimeout(function() {
        if (document.activeElement.nodeName.toLowerCase() == 'iframe') {
            document.activeElement.classList.add('iframe_focused');
        }
    }, 0);
}
