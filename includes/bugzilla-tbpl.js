registerPref('show_tbpl', {'title': 'Show inline TBPL results',
                                    'setting_default': true,
                                    'callback': ifBug(initTBPL),
                                    'category': 'bug'});

function initTBPL() {
    if (!settings['show_tbpl']) {
        return;
    }

    document.addEventListener('focus', detectIframeFocused);
    document.addEventListener('blur', detectIframeFocused);

    var tbpls = document.querySelectorAll('.bz_comment_text a[href^="https://tbpl.mozilla.org/?"]');
    for (var i=0, il=tbpls.length; i < il; i++) {
        var tbpl = tbpls[i];

        var iframe = document.createElement('iframe');
        iframe.src = tbpl.href + '&embed=true';
        iframe.classList.add('tbpl_inline_result');

        tbpl.parentNode.appendChild(iframe);
    }
}

// TODO : Once dropping Ominum https://github.com/gkoberger/BugzillaJS/issues/69,
// do this more properly by including a script in the iframes
function detectIframeFocused() {
    var iframes = document.getElementsByClassName('iframe_focused');
    if (iframes.length) {
        iframes[0].classList.remove('iframe_focused');
    }

    // We need a timeout here, otherwise document.activeElement has not changed yet
    setTimeout(function () {
        if (document.activeElement.nodeName.toLowerCase() == 'iframe') {
            document.activeElement.classList.add('iframe_focused');
        }
    }, 0);
}
