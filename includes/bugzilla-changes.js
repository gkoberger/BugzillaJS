registerPref('changes', 'Show changes to the bug', ifBug(initChanges));

var bugs_all = {}; // Global-ish var.  Yucky.

// Return a formatted version of the changes
function formatChange(c) {
    changes_array = [];
    $.each(c, function (ck, cv) {
        removed = cv.removed
        added = cv.added

        if(cv.field_name == 'depends_on' || cv.field_name == 'blocks') {
            f = function(text){
                if(text in bugs_all) {
                    return new XMLSerializer().serializeToString(bugs_all[text][0])
                }

                u = "<a href='https://bugzilla.mozilla.org/show" +
                "_bug.cgi?id=$1'>$1</a>";
                return text.replace(/([0-9]+)/g, u);
            }
            if(removed) removed = f(removed);
            if(added) added = f(added);
        }

        text = cv.field_name + ": " +
               (removed ? "<del>" + removed + "</del> => " : "") + added;
        changes_array.push(text);
    });
    return changes_array.join('; ');
}


function initChanges() {
    if(settings['changes']) {
        var inputs = $('#blocked_input_area, #dependson_input_area'),
            bug_links = inputs.closest('td').find('a');

        bug_links.each(function() {
            var el = $(this),
                bug_href = el.attr('href').match(/show_bug.cgi\?id=(.*)/);

            if(bug_href) {
                if(el.parent().is('.bz_closed')) {
                    el = el.parent();
                }
                bugs_all[bug_href[1]] = el;
            }
        });

        if($('#inline-history-ext') && !window.localStorage['inlinehistory-found']) {
            alert('It looks like you already have inline history, so you may want ' +
                  'to disable inline history in the BugzillaJS preferences.');
            window.localStorage['inlinehistory-found'] = true;
        }
        url = 'https://api-dev.bugzilla.mozilla.org/latest/bug/' + bug_id + '/history'

        var changes = [];
        $.getJSON(url, function (d) {
            $.each(d.history, function (v, k) {
                changes.push({
                    'date': new Date(k.change_time).getTime(),
                    'change': k,
                    'type': 'change'
                });
            });
            apply_changes(changes);
        });
    }

    var comments = [];
    function apply_changes(changes) {
        var i = 0;
        $('.bz_comment').each(function (v, k) {
            var date_el = $(this).find('.bz_comment_time'),
                date_ascii = date_el.text();

            if(date_el.attr('data-timestamp')) {
                date_ascii = date_el.attr('data-timestamp');
            }

            date_ascii = date_ascii.replace(/-/g,'/');
            var timestamp = new Date(date_ascii.trim()).getTime();

            $(this).addClass('d' + timestamp);
            comments.push({
                'date': timestamp,
                'type': 'comment'
            });
        });

        everything = $.merge(comments, changes).sort(function (x, y) {
            return (x.date + (x.type == 'change')) - (y.date + (y.type == 'change'));
        });

        // Now, loop through them and add to the DOM
        comment = everything[0];
        $.each(everything, function (k, v) {
            if (v.type == 'comment') {
                comment = v;
            } else if (v.date == comment.date) {
                $('.d' + comment.date).find('.bz_comment_text').before('<div class="history">' + formatChange(v.change.changes));
            } else {
                $('.d' + comment.date + ', .p' + comment.date).filter(':last').after(
                    '<div class="history p'+comment.date+'"><strong>' + v.change.changer.name + '</strong> ' +
                    formatChange(v.change.changes) +
                    ' <span class="bz_comment_time" title="'+new Date(v.date)+
                    '" data-timestamp="'+new Date(v.date)+'">' + prettydate(new Date(v.date)) +
                    '</span></div>');
            }
        });

        repositionScroll();
    }
}
