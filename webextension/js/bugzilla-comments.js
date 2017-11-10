'use strict';

/*global registerPref, ifBug, settings, bz_comments */

registerPref('reporter_assignee',
    {title: 'Highlight reporter and assignee comments',
    callback: ifBug(initHighlightRA),
    category: 'comments'});

function initHighlightRA() {
    if (!settings.reporter_assignee) {
        return;
    }

    if (document.body.classList.contains('bug_modal')) {
        // This feature is already implemented in the BMO experimental modal UI.
        return;
    }

    var selector = '#bz_assignee_edit_container .vcard .fn';
    var assignee_el = document.querySelector(selector);
    if (!assignee_el) {
        // The user is probably not logged in
        return;
    }
    var assignee = assignee_el.textContent;


    var reporter = false;
    for (var field of document.querySelectorAll('.field_label')) {
        if (field.textContent.includes('Reported')) {
            reporter = field.nextElementSibling.querySelector('.vcard .fn').
                textContent;
            break;
        }
    }

    bz_comments.each(function(i, comment) {
        var commenter = comment.parentNode.querySelector('.vcard .fn');
        var span;

        if (commenter.textContent == assignee) {
            span = document.createElement('span');
            span.textContent = '(assignee)';
            span.classList.add('assignee');
            commenter.parentNode.insertBefore(span, commenter.nextSibling);
        }

        if (commenter.textContent == reporter) {
            span = document.createElement('span');
            span.textContent = '(reporter)';
            span.classList.add('reporter');
            commenter.parentNode.insertBefore(span, commenter.nextSibling);
        }
    });
}
