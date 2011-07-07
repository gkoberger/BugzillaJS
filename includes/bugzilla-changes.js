registerPref('changes', 'Show changes to the bug', ifBug(initChanges));

function initChanges() {
    if(settings['changes']) {
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
                $('.d' + comment.date).find('.bz_comment_text').before('<div class="history">' + formatChange(v.change.changes) + '</div>');
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
