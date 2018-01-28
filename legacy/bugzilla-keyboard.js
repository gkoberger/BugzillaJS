'use strict';

/* global registerPref, $, _, settings, unsafeWindow */

registerPref('keyboard', {'title': 'Enable keyboard shortcuts',
                          'setting_default': false,
                          'callback': initKB,
                          'category': 'keyboard'});

// Watch for <esc> or '?'
var keyboard_is_enabled = false;
$(window).keypress(function(e) {
    if (e.keyCode == 27) { // <esc>
        $(window).trigger('close');
        $(document.activeElement).blur();
    }
    if (e.which == 63 &&
            !keyboard_is_enabled &&
            !$(e.target).is('input, textarea, select')) { // ?
        var msg = 'Keyboard shortcuts are disabled. ';
        msg += 'Do you want to enable them?';
        var enable = confirm(msg);
        if (enable) {
            _.storage.save('settings_keyboard', true);
            settings.keyboard = true;
            initKB();
            $('#shortcuts').show();
        }
    }
});

function initKB() {
    var $shortcuts = $('<div>', {'class': 'shortcuts quickmodal',
        'id': 'shortcuts'}).hide(),
        $shortcuts_table = $('<table>'),
        kbCallback = {};

    keyboard_is_enabled = true;

    $shortcuts.append($shortcuts_table);

    function addTitle(title) {
        var $tr = $('<tr>');
        var $th1 = $('<th>');
        var $th2 = $('<th>', {'text': title});

        $tr.append($th1).append($th2);

        $shortcuts_table.append($tr);
    }

    function newTable() {
        $shortcuts_table = $('<table>');
        $shortcuts.append($shortcuts_table);
    }

    function addShortcut(key, title, callback) {
        /* Make it do something */
        var keycode = '';
        for (var i = 0; i < key.length; i++) {
            keycode += key.charCodeAt(i) + '_';
        }

        if (key == '+') {
            keycode = '13_';
            key = '&lt;enter&gt;';
        }

        keycode = keycode.slice(0, -1);

        if (typeof callback == 'string') {
            var url = callback;
            callback = function() { unsafeWindow.location = url; };
        }

        kbCallback[keycode] = function() {
            if (key != '?') {
                $shortcuts.hide();
            }
            callback();
        };

        /* Add to menu */
        var $tr = $('<tr>'),
            $td1 = $('<td>', {'class': 'left'}),
            $td2 = $('<td>', {'text': title});

        if (key[0] == 'g') {
            $td1.append($('<strong>', {'html': key[0]}));
            $td1.append($('<em>', {'text': 'then'}));
            $td1.append($('<strong>', {'html': key[1]}));
        } else {
            $td1.append($('<strong>', {'html': key}));
        }

        $td1.append($('<span>', {'text': ':'}));

        $shortcuts_table.append($tr);
        $tr.append($td1);
        $tr.append($td2);
    }

    $(window).bind('close', function() {
        $('.quickmodal').hide();
    });

    var last_g = '';
    $(unsafeWindow).keypress(function(e) {
        if ($(e.target).is('input, textarea, select') ||
                e.ctrlKey ||
                e.metaKey ||
                e.altKey) {
            return;
        }

        var keycode = last_g + e.which;

        if (keycode in kbCallback) {
            e.preventDefault();
            kbCallback[keycode]();
        }
        last_g = e.which == 103 ? '103_' : '';
    });

    // Some fields auto-focus, which ruins this.
    $(document.activeElement).blur();

    $('body').append($shortcuts);

    function getNav(text) {
        return function() {
            $('.navigation:first a').each(function() {
              var $a = $(this);
              if ($a.text() == text) {
                window.location.href = $a.attr('href');
              }
            });
        };
    }

    var $elements = [];

    if ($('.bz_buglist').length) {
        $elements = $('.sorttable_body tr');
    }

    var el_count = $elements.length,
        el_current = 0;

    if (el_count) {
        $elements.eq(0).addClass('is-selected');
    }

    function updateSelected(diff) {
        if (!el_count) {
            return;
        }
        el_current += diff;

        if (el_current >= el_count) {
            el_current = 0;
        }
        if (el_current < 0) {
            el_current = el_count - 1;
        }

        $elements.filter('.is-selected').removeClass('is-selected');

        var $selected = $elements.eq(el_current);
        $selected.addClass('is-selected');

        // Scroll it into view
        var el_position = $selected.position().top;

        var visible_top = $(window).scrollTop(),
            visible_bottom = visible_top + $(window).height();

        if ($selected.length &&
                (el_position < visible_top || el_position > visible_bottom)) {
            $selected[0].scrollIntoView();
        }
    }

    /* ======================
     * Shortcuts
     * ====================== */

    addTitle('Global Shortcuts');

    addShortcut('?', 'View shortcuts', function() {
        $('#shortcuts').toggle();
    });

    addShortcut('n', 'Quick file a new bug', function() {
        $(window).trigger('close');
        var $fileit = $('<div>', {'class': 'quickmodal',
            'id': 'fileit_quick'}).appendTo('body');
        $fileit.fileit();

        var msg = 'To close, hit &lt;esc&gt; &middot; ';
        msg += 'To browse components, use shortcut "gn"';
        $fileit.append($('<div>', {'class': 'light',
                                    'html': msg}));

        $fileit.find('input').focus();
    });

    addShortcut('s', 'Search', function() {
        var qs = $('#quicksearch_main');
        if (!qs.length) {
            qs = $('#quicksearch_top');
        }
        qs.removeClass('quicksearch_help_text').val('').focus();
    });

    addTitle('Site Navigation');

    addShortcut('gh', 'Go Home', './');

    addShortcut('gn', 'Go to new bug page', './enter_bug.cgi');

    addShortcut('gb', 'Go to bug #___', function() {
        var bug = prompt('What is the bug number?');
        if (bug) {
            unsafeWindow.location = './show_bug.cgi?id=' + bug;
        }
    });

    addShortcut('gs', 'Go to advanced search', './query.cgi?format=advanced');

    addShortcut('gp', 'Go to preferences', './userprefs.cgi');

    //addShortcut('g,', 'Go to BugzillaJS prefs', openPrefs);

    newTable();

    addTitle('Bug Shortcuts');

    addShortcut('r', 'Reply to bug', function() {
        $('#comment').focus();
    });

    addShortcut('J', 'Next bug in list', getNav('Next'));

    addShortcut('K', 'Previous bug in list', getNav('Prev'));

    addShortcut('H', 'First bug in list', getNav('First'));

    addShortcut('L', 'Last bug in list', getNav('Last'));

    addShortcut('gl', 'Go back to list of results',
        getNav('Show last search results'));

    addTitle('List Navigation');

    addShortcut('j', 'Next entry', function() {
        updateSelected(1);
    });

    addShortcut('k', 'Previous entry', function() {
        updateSelected(-1);
    });

    addShortcut('+', 'Go to selected row', function() {
        if (el_count) {
            window.location.href = $elements.filter('.is-selected').find('a').
                eq(0).attr('href');
        }
    });
}
