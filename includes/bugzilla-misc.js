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

function _build_query_string(dict) {
    var parts = []
    for (var key in dict) {
        parts.push(key + "=" + dict[key]);
    }
    return parts.join('&');
}

function _attachLinkToField(field_id, text, location) {
    var link = document.createElement('a');
    link.href = location;
    link.appendChild(document.createTextNode(text));

    var field = document.getElementById(field_id);
    var text_length = text.length + 3;
    field.style.maxWidth = 'calc(100% - ' + text_length + 'ch)';

    var td = field;
    while (td.nodeName.toLowerCase() != 'td') {
        td = td.parentNode;
    }
    td.appendChild(document.createTextNode(' ('));
    td.appendChild(link);
    td.appendChild(document.createTextNode(')'));
}

function relatedBug() {
    if(!settings['relatedbug']) {
        return;
    }

    var prefix = window.location.origin + '/enter_bug.cgi?';
    var url_parts = {};
    url_parts.product = document.querySelector('#product option[selected]').value;
    url_parts.component = document.querySelector('#component option[selected]').value;

    url_parts.dependson = bug_id;
    var new_blocked_bug_location = prefix + _build_query_string(url_parts);
    _attachLinkToField("blocked", "new", new_blocked_bug_location);

    delete url_parts.dependson;
    url_parts.blocked = bug_id;
    var new_dependson_bug_location = prefix + _build_query_string(url_parts);
    _attachLinkToField("dependson", "new", new_dependson_bug_location);
}

function browseComponent() {
    if (!settings['browseComponent']) {
        return;
    }

    var prefix = window.location.origin + '/buglist.cgi?';
    var url_parts = {};
    url_parts.product = document.querySelector('#product option[selected]').value;
    url_parts.component = document.querySelector('#component option[selected]').value;
    var browse_location = prefix + _build_query_string(url_parts);

    _attachLinkToField("component", "browse", browse_location);
}

