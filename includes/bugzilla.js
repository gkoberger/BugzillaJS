var settings = {},
    settings_fields = []
    hidenobody_val = false;

/** Get the bug ID **/

var bug_id = $('title').text().match(/^(?:Bug )?([0-9]+)/)
bug_id = bug_id ? bug_id[1] : false

/** Run the modules **/
function ifBug(f) {
    if(bug_id) {
        return f;
    } else {
        return function(){};
    }
}

var BugzillaJS = new EventEmitter();

BugzillaJS.bugID = bug_id;
BugzillaJS.already_run = {};
BugzillaJS.total_new = 0;

BugzillaJS.run = function() {
    function addStyling() {
        if (!settings['gitcomments'])
            return;

        $('body').addClass('git_style')
        $('.git_style .ih_history br').replaceWith("<span>; </span>");
        setTimeout(BugzillaJS.repositionScroll, 200);
    }
    /* Register preferences */
    BugzillaJS.registerPref('gitcomments', {'title': 'Style the comments',
                                            'setting_default': true,
                                            'callback': ifBug(addStyling),
                                            'category': 'bug'});

    BugzillaJS.addPrefs();

    // Initialize the Marked markdown parser
    marked.setOptions({
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        highlight: function(code, lang) {
            return hljs.highlight(lang, code).value;
        }
    });

    // Allow all features to register themselves
    setTimeout(function() {
        BugzillaJS.comments.each(function() {
            //this.innerHTML = marked(this.innerHTML);
            BugzillaJS.emit("comment", this);
        });
    }, 0);

    // New feature? Notify them!
    setTimeout(function() {
        if(BugzillaJS.total_new > 0) {
            $('.bjs-prefs').after($('<span class="notify">'
                + BugzillaJS.total_new + '</span>'));
        }
    }, 500);
};

BugzillaJS.comments = $('.bz_comment');

BugzillaJS.repositionScroll = function() {
    //-- Reposition the scrollTo if necessary
    if(location.hash.match(/#c[0-9]*/)) {
        $(window).scrollTo($(location.hash));
    }
};

BugzillaJS.addPrefs = function() {
    var $appendTo = $('#header .links, #links-actions .links'),
        $li = $('<li>'),
        $a = $('<a>', {'class': 'bjs-prefs', 'href':'#', 'text': 'BugzillaJS Preferences'});

    $appendTo.append($('<span>', {'class': 'separator', 'text': '| '}));
    $li.append($a);
    $appendTo.append($li.clone());

    $('a.bjs-prefs').click(this.openPrefs);

    // Close on <esc>
    $(window).bind('close', function(e) {
        $('#prefs').remove();
    });
};

BugzillaJS.openPrefs = function(e){
    if(e) e.preventDefault();

    $('#prefs').remove();

    var $prefs = $('<div>', {'id': 'prefs'}),
        $prefs_h = $('<div>', {'class': 'header'});
        $prefs_f = $('<div>', {'class': 'footer'});

    $('body').append($prefs);
    $prefs.append($prefs_h).append($prefs_f);

    $.each(categories, function(v, k) {
        var content = k.split(' | '),
            title = content[0],
            desc = content[1];

        var $h3 = $('<h3>', {'text': title}),
            $desc = $('<p>', {'text': desc}),
            $opts = $('<div>', {'id': 'cat-' + v});

        $prefs_h.append($h3);
        $prefs_h.append($desc);
        $prefs_h.append($opts);
    });

    $.each(settings_fields, function(k, v){
        var $opt = $('<div>');

        $opt.append($('<input>', {'type': 'checkbox', 'id': 'setting_' + v.slug,
                                  'data-slug': v.slug, 'checked': settings[v.slug]}));

        $opt.append($('<label>', {'for': 'setting_' + v.slug, 'text': v.details}));

        if(v.is_new) {
            $opt.find('label').prepend($('<span>', {'class': 'show_new', 'text': 'new'}));
        }

        $('#cat-' + v.category).append($opt);
    });

    /* Save button */
    var $save = $("<a>", {'class': 'refresh', 'text': 'Save Changes', 'href': '#'});
    $save.appendTo($prefs_f);
    $save.click(function(){
        $('input', $prefs_h).each(function(){
            _.storage.save('settings_' + $(this).attr('data-slug'), $(this).is(':checked'));
        });

        window.location.reload();
        return false;
    });

    /* Close button */
    $('<a>', {'href': '#', 'text': 'cancel'}).appendTo($prefs_f).click(function(e){
        e.preventDefault();
        $(window).trigger('close');
    });
};

BugzillaJS.registerPref = function(slug, o) {
    /* TODO: integrate these */
    this._registerPref_old(slug, o.title, o.setting_default, o.callback, o.category, o.is_new);
};

BugzillaJS._registerPref_old = function(slug, details, setting_default, callback, category, is_new) {
    if(this.already_run[slug])
        return;

    if(typeof setting_default == "function") {
        callback = setting_default;
        setting_default = null;
    }
    if(setting_default == null || setting_default == undefined) setting_default = true;

    callback = callback || function(){};

    settings[slug] = setting_default;

    _.storage.request('settings_' + slug, function(v){
        var show_new = false;
        if(typeof v != "undefined") {
            settings[slug] = v;
        } else {
            if(is_new) {
                BugzillaJS.total_new++;
                show_new = true;
            }
        }

        settings_fields.push({'slug':slug, 'details':details, 'is_new': show_new, 'category': category});

        /* If it's enabled, run it! */
        if(settings[slug]) {
            callback();
        }
    });

    this.already_run[slug] = true;
};

BugzillaJS.run();

