if($('#inline-history-ext').length == 0) {
    registerPref('changes', 'Show changes to the bug', ifBug(initChanges));
}

var bugs_all = {}; // Global-ish var.  Yucky.

// Return a formatted version of the changes
function formatChange(c) {
    changes_array = [];

    $.each(c, function (ck, cv) {
        var removed = cv.removed,
            added = cv.added;

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
        if(cv.field_name == 'cc') {
            text = "<span class='hide-cc'>" + text + ";</span> ";
        } else {
            text = text + "; ";
        }
        changes_array.push(text);
    });
    return changes_array.join('');
}


function initChanges() {
    if(settings['changes']) {
        var inputs = $('#blocked_input_area, #dependson_input_area'),
            bug_links = inputs.closest('td').find('a');

        addCCLink();
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

        if($('#inline-history-ext').length > 0 && !window.localStorage['inlinehistory-found2']) {
            alert('It looks like Bugzilla already has inline history, so you may want ' +
                  'to disable inline history in the BugzillaJS preferences.');
            window.localStorage['inlinehistory-found2'] = true;
        }
        url = 'https://api-dev.bugzilla.mozilla.org/latest/bug/' + bug_id + '/history'

        var changes = [];
        $.getJSON(url, function (d) {
            $.each(d.history, function (v, k) {
                changes.push({
                    'date': fixDate(k.change_time).getTime(),
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

            var timestamp = fixDate(date_ascii).getTime();

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
        var comment = everything[0];
        $.each(everything, function (k, v) {
            if (v.type == 'comment') {
                comment = v;
            } else if (v.date == comment.date) {
                var $his = $('<div>', {'class': 'history', 'text': formatChange(v.change.changes)});
                $('.d' + comment.date).find('.bz_comment_text').before($his);
            } else {
                var changes = v.change.changes,
                    $history = $('<div>', {'class': 'history p'+comment.date});

                $history.append($('<strong>', {'text': v.change.changer.name + ' '}));
                $history.append($('<span>', {'text': formatChange(v.change.changes)}));
                $history.append($('<span>', {'class': 'bz_comment_time', 'title': new Date(v.date),
                                             'data-timestamp': v.date, 'text': prettydate(v.date)}));

                if(changes.length == 1 && changes[0].field_name == 'cc') {
                    $history.addClass('hide-cc');
                }

                $('.d' + comment.date + ', .p' + comment.date).filter(':last').after($history);

            }
        });

        repositionScroll();
    }
}
function addCCLink() {
    var button = "<li><input id='hide-cc' type='checkbox'> " +
                 "<label for='hide-cc'>Hide CCs from history?"+
                 "</label></li>";

    $('.bz_collapse_expand_comments').append(button);

    var hidecc_val = unsafeWindow.localStorage['hidecc_val'],
        hideCCToggle = function() {
            $('body').toggleClass('setting-hide-cc', hidecc_val);
        };


    if(typeof hidecc_val == 'undefined') {
        hidecc_val = false;
    }

    // I hate this
    hidecc_val = hidecc_val == "true" ? true : false;

    $('#hide-cc').attr('checked', !!hidecc_val);
    $('#hide-cc').change(function(){
        hidecc_val = $(this).is(':checked');
        unsafeWindow.localStorage['hidecc_val'] = hidecc_val;
        hideCCToggle();
    });
    hideCCToggle();
}
