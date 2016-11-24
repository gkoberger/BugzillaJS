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

    if (document.body.classList.contains("bug_modal")) {
        // This feature is already implemented in the BMO experimental modal UI.
        return;
    }

	var assignee = $( "tr > th:contains('Assigned To')").next().find('.fn').html();
    var reporter = $( ".field_label:contains('Reported:')").next().find('.fn').html();

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
