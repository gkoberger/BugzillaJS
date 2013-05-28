BugzillaJS.registerPref('reporter_assignee', 'Highlight reporter and assignee comments?', ifBug(initHighlightRA));

function initHighlightRA() {
    if(!settings['reporter_assignee'])
        return;

    var assignee = false,
        reporter = false;

    // Figure out who's the assignee and who's the reporter
    $('.vcard').each(function(i, el) {
        var t = $(el).closest('tr').find('b').text();
        if(t == "Assigned To") {
            assignee = $(el).text();
        } else if(t == "Reported") {
            reporter = $(el).text();
        }
    });

    BugzillaJS.on("comment", function(comment) {
        var $comment = $(comment),
            text = $comment.find('.vcard').text();
        if(text == assignee) {
            $comment.find('.fn').after($('<span>', {'text':'(assignee)', 'class':'assignee'}));
            $comment.addClass('bz_assignee');
        }
        if(text == reporter) {
            $comment.find('.fn').after($('<span>', {'text':'(reporter)', 'class':'reporter'}));
            $comment.addClass('bz_reporter');
        }
    });
}
