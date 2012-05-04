registerPref('commentoverflow', {'title': 'Add scrollbar to overflowing comments',
                          'setting_default': true,
                          'callback': ifBug(commentOverflow),
                          'category': 'comments'});

registerPref('removeflags', {'title': 'Remove flags, status and blocking',
                             'setting_default': false,
                             'callback': ifBug(removeFlags),
                             'category': 'bug'});

registerPref('removeaccesskeys', {'title': 'Remove access keys',
                                  'setting_default': false,
                                  'callback': removeAccess,
                                  'category': 'bug'});

registerPref('dontguess', {'title': 'Don\'t guess OS and hardware',
                                    'setting_default': false,
                                    'callback': dontGuess,
                                    'category': 'bug'});

registerPref('hidefirst', {'title': 'Hide the first comment if empty',
                                    'setting_default': true,
                                    'callback': ifBug(hideFirst),
                                    'category': 'comments'});

registerPref('shortertitle', {'title': 'Make the page title easier to read in tabs',
                                       'setting_default': true,
                                       'callback': ifBug(shorterTitle),
                                       'category': 'bug'});

registerPref('clonebug', {'title': 'Auto-fill product when cloning a bug',
                                   'setting_default': true,
                                   'callback': ifBug(cloneBug),
                                   'category': 'bug'});

registerPref('relatedbug', {'title': 'Add a "new" link for dependant and blocking fields',
                                     'setting_default': true,
                                     'callback': ifBug(relatedBug),
                                     'category': 'bug'});

registerPref('browseComponent', {'title': 'Add a "browse" link for component fields',
                                 'setting_default': true,
                                 'callback': ifBug(browseComponent),
                                 'category': 'bug'});


function hideFirst() {
    // Hide the first comment if it's blank?
    if($('.bz_first_comment .bz_comment_text').text() == "") {
        $('.bz_first_comment').hide();
        $('.bz_comment_table').addClass('no-first-comment');
    }
}

function commentOverflow() {
    // Fix comment overflow
    // Idea by fwenzel
    $('body').addClass('bzJS-commentoverflow');
}

function removeAccess() {
    // Remove accessibility keys
    // Inspired by jbalogh, who evidently hates accessibility.
    $('label[accesskey]').each(function(i, e) {
        $(e).removeAttr('accessKey accesskey');
        $(e).addClass('accessKey');
    });

    $('body').addClass('bzJS-removeaccesskeys');
}

function shorterTitle() {
    $('title').text($('title').text().replace(/Bug /, ''));
}

function removeFlags() {
    // Remove flags
    // Idea by jbalogh
    $('#flags, .flags_label').remove();

    $('#bz_show_bug_column_2 [id^=field_label_cf_]').each(function(){
        $(this).next().remove();
        $(this).remove();
    });
}

function dontGuess() {
    if(location.href.match(/enter_bug/)) {
        $('#rep_platform, #op_sys').each(function(){
            var $parent = $('<span>', {'css': {'padding-left': 10}}),
                $s1 = $("<span>", {'text': '('}),
                $a = $("<a>", {'text': 'guess'}),
                $s2 = $("<span>", {'text': ')'});

            $parent.append($s1).append($a).append($s2);

            $a.attr({"href": "#", "data-val": $(this).val()});
            $a.click(function(){
                $(this).closest('td').find('select').val($(this).attr('data-val'));
                $(this).parent().hide();
                return false;
            });
            $(this).val("All").after($parent);
        });

        $('#os_guess_note').parent().hide();
    }
}

function cloneBug() {
    $('.related_actions a').each(function(){
        $el = $(this);
        if($el.attr('href').match(/cloned_bug_id/)) {
            var url = $el.attr('href') + "&product=" + $('#product').val();
            url += '&component=' + $('#component').val();
            $el.attr('href', url);
        }
    });
}

function createLink(start, text, location) {
    var link = $('<a>', {'text': text, 'href': location}),
        link_empty = $('<span>', {'css': {'padding-left': 5}, 'text': '('}).append(link.clone()).append($('<span>', {'text': ')'})),
        link_exists = $('<span>', {'text': '|', 'css': {'padding': '0 5px'}}).after(link.clone());

    $('#' + start + '_edit_action').after(link_exists);
    $('#' + start).after(link_empty).css('max-width', '-moz-calc(100% - ' + (text.length + 3) + 'ch)');
}

function relatedBug() {
    if(settings['relatedbug']) {
        var new_location = window.location + "&product=" + $('#product').val();
        new_location += '&component=' + $('#component').val();
        new_location = new_location.replace(/#[^&]*/, ''); // Strip anchor
        new_location = new_location.replace(/show_bug/, 'enter_bug');

        createLink("blocked", "new", new_location.replace(/id=/,  'dependson='));
        createLink("dependson", "new", new_location.replace(/id=/,  'blocked='));
    }
}

function browseComponent() {
    // TODO: add setting
    var browse_location = window.location + "&product=" + $('#product').val();
    browse_location += '&component=' + $('#component').val();
    browse_location = browse_location.replace(/#[^&]*/, ''); // Strip anchor
    browse_location = browse_location.replace(/show_bug/, 'buglist');
    browse_location = browse_location.replace(/id=[^&]*&/, '');

    createLink("component", "browse", browse_location);
}
