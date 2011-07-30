registerPref('commentoverflow', 'Fix comment overflow issues?', ifBug(commentOverflow));
registerPref('removeflags', 'Remove flags, status and blocking?', false, ifBug(removeFlags));
registerPref('removeaccesskeys', 'Remove access keys?', false, ifBug(removeAccess));
registerPref('dontguess', 'Don\'t guess OS and hardware?', false, dontGuess);
registerPref('hidefirst', 'Hide first comment if empty?', ifBug(hideFirst));
registerPref('shortertitle', 'Remove "Bug" from the title?', ifBug(shorterTitle));
registerPref('clonebug', 'Auto-fill product when cloning a bug?', ifBug(cloneBug));
registerPref('relatedbug', 'Add a "new" link for dependent and blocking fields?', ifBug(relatedBug));
registerPref('hidecc', 'Show a "hide cc" link?', ifBug(addCCLink));


function hideFirst() {
    // Hide the first comment if it's blank?
    if(settings['hidefirst']) {
        if($('.bz_first_comment .bz_comment_text').text() == "") {
            $('.bz_first_comment').hide();
            $('.bz_comment_table').addClass('no-first-comment');
        }
    }
}

function commentOverflow() {
    // Fix comment overflow
    // Idea by fwenzel
    if(settings['commentoverflow']) {
        $('body').addClass('bzJS-commentoverflow');
    }
}

function removeAccess() {
    // Remove accessibility keys
    // Inspired by jbalogh, who evidently hates accessibility.
    if(settings['removeaccesskeys']) {
        $('[accesskey]').each(function(i, e) {
            $(e).attr('accessKey', undefined);
            $(e).addClass('accessKey');
        });

        $('body').addClass('bzJS-removeaccesskeys');
    }
}

function shorterTitle() {
    if(settings['shortertitle']) {
        $('title').text($('title').text().replace(/Bug /, ''));
    }
}

function removeFlags() {
    // Remove flags
    // Idea by jbalogh
    if(settings['removeflags']) {
        $('#flags, .flags_label').remove();

        $('#bz_show_bug_column_2 [id^=field_label_cf_]').each(function(){
            $(this).next().remove();
            $(this).remove();
        });
    }
}

function dontGuess() {
    if(settings['dontguess'] && location.href.match(/enter_bug/)) {
        $('#rep_platform, #op_sys').each(function(){
            var $span = $("<span>&nbsp;(<a>guess</a>)</span>");
                $a = $("a", $span);

            $a.attr({"html": "guess", "href": "#", "data-val": $(this).val()});
            $a.click(function(){
                $(this).closest('td').find('select').val($(this).attr('data-val'));
                $(this).parent().hide();
                return false;
            });
            $(this).val("All").after($span);
        });

        $('#os_guess_note').parent().hide();

    }
}

function cloneBug() {
    if(settings['clonebug']) {
        $('.related_actions a').each(function(){
            $el = $(this);
            if($el.attr('href').match(/cloned_bug_id/)) {
                var url = $el.attr('href') + "&product=" + $('#product').val();
                url += '&component=' + $('#component').val();
                $el.attr('href', url);
            }
        });
    }
}

function relatedBug() {
    if(settings['relatedbug']) {
        var createLink = function(start, finish) {
            var new_location = window.location + "&product=" + $('#product').val();
            new_location += '&component=' + $('#component').val();
            new_location = new_location.replace(/#[^&]*/, ''); // Strip anchor
            new_location = new_location.replace(/show_bug/, 'enter_bug');
            new_location = new_location.replace(/id=/, finish + '=');

            var link = $('<a>new</a>').attr('href', new_location),
                link_empty = $('<span>&nbsp;(</span>').append(link.clone()).append('<span>)'),
                link_exists = $('<span><span>&nbsp;|&nbsp;</span></span>').append(link.clone());

            $('#' + start + '_edit_action').after(link_exists);
            $('#' + start).after(link_empty).css('width', '-moz-calc(100% - 60px)');
        };
        createLink("blocked", "dependson");
        createLink("dependson", "blocked");
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

