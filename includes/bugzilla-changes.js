registerPref('changes', 'Show changes to the bug');

if(bug_id && settings['changes']) {
    changes = [];

    url = 'https://api-dev.bugzilla.mozilla.org/latest/bug/' + bug_id + '/history'

    $.getJSON(url, function (d) {
        $.each(d.history, function (v, k) {
            changes.push({
                'date': new Date(k.change_time).getTime(),
                'change': k,
                'type': 'change'
            })
        });
        joinComments();
    });
}
