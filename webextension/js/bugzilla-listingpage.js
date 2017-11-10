'use strict';

/* global registerPref, $ */

registerPref('openall', {'title': 'Option to open all bugs in tabs',
                         'setting_default': true,
                         'callback': loadOpenAll,
                         'category': 'listings'});

function loadOpenAll() {
    var openAll = function(e) {
        e.preventDefault();

        var all = $('.bz_id_column a');
        var msg = 'You\'re trying to open ' + all.length + ' tabs. ';
        msg += 'Are you sure you want to do this?';
        if (all.length < 10 || confirm(msg)) {
            $('.bz_id_column a').each(function() {
                if ($(this).attr('href')) {
                    window.open($(this).attr('href'), '_blank');
                }
            });
        }
    };

    var a = $('<a>', {'href': '#',
        'click': openAll,
        'text': 'Open All in Tabs'}),
        td = $('<td>');

    td.append(a);
    $('.bz_query_edit').before(td);
}
