BugzillaJS.registerPref('openall', {'title': 'Option to open all bugs in tabs',
                                    'setting_default': true,
                                    'callback': loadOpenAll,
                                    'category': 'listings'});

function loadOpenAll() {
    var openAll = function(e) {
        e.preventDefault();

        var all = $('.bz_id_column a');
        if(all.length < 10 || confirm("You're trying to open " + all.length + " tabs. Are you sure you want to do this?")) {
            $('.bz_id_column a').each(function() {
                if($(this).attr('href')) {
                    window.open($(this).attr('href'),'_blank');
                }
            });
        }
    }

    var a = $('<a>', {'href': '#', 'click': openAll, 'text': 'Open All in Tabs'}),
        pipe = $('<span>', {'html': '&nbsp;|'}),
        td = $('<td>');

    td.append(a).append(pipe);
    $('.bz_query_edit').before(td);
}

BugzillaJS.addFeature();
