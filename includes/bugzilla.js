var settings = [],
    settings_fields = [],
    bug_id = false,
    joinCount = 0,
    bz_comments = $('.bz_comment_text'),
    hidenobody_val = false,
    already_run = [],
    total_new = 0;

/** Get the bug ID **/

bug_id = $('title').text().match(/^(?:Bug )?([0-9]+)/)
bug_id = bug_id ? bug_id[1] : false

/* Register preferences */
registerPref('gitcomments', {'title': 'Style the comments',
                             'setting_default': true,
                             'callback': ifBug(addStyling),
                             'category': 'bug'});

/** Run the modules **/
addPrefs();
function ifBug(f) {
    if(bug_id) {
        return f;
    } else {
        return function(){};
    }
}

function addStyling() {
    if (settings['gitcomments']) {
        $('body').addClass('git_style')
        $('.git_style .ih_history br').replaceWith("<span>; </span>");
        bz_comments.each(function() {
            this.innerHTML = marked(this.innerHTML);
        });
        setTimeout(repositionScroll, 200);
    }
}

function repositionScroll() {
    //-- Reposition the scrollTo if necessary
    if(location.hash.match(/#c[0-9]*/)) {
        $(window).scrollTo($(location.hash));
    }
}

function addPrefs() {
    var $appendTo = $('#header > .links, #header :not(#login) > .links, #links-actions .links'),
        $li = $('<li>'),
        $a = $('<a>', {'class': 'bjs-prefs', 'href':'#', 'text': 'BugzillaJS Preferences'});

    $appendTo.append($('<span>', {'class': 'separator', 'text': '| '}));
    $li.append($a);
    $appendTo.append($li.clone());

    $('a.bjs-prefs').click(openPrefs);

    // Close on <esc>
    $(window).bind('close', function(e) {
        $('#prefs').remove();
    });

}

function openPrefs(e){
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
}

function registerPref(slug, o) {
    /* TODO: integrate these */
    registerPref_old(slug, o.title, o.setting_default, o.callback, o.category, o.is_new);
}

function registerPref_old(slug, details, setting_default, callback, category, is_new) {
    if(! already_run[slug]) {
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
                    total_new++;
                    show_new = true;
                }
            }

            settings_fields.push({'slug':slug, 'details':details, 'is_new': show_new, 'category': category});

            /* If it's enabled, run it! */
            if(settings[slug]) {
                callback();
            }
        });

        already_run[slug] = true;
    }
}

// New feature? Notify them!
setTimeout(function() {
    if(total_new > 0) {
        $('.bjs-prefs').after($('<span class="notify">'+total_new+'</span>'));
    }
}, 500);

function set_cookie(name, value) {
  var cookie_string = name + "=" + escape ( value );

  if (exp_y) {
    var expires = new Date();
    cookie_string += "; expires=" + expires.toGMTString();
  }
  cookie_string += "; secure";

  document.cookie = cookie_string;
}

function get_cookie ( cookie_name ) {
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

  if (results) {
    return (unescape(results[2]));
  } else {
    return null;
  }
}

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

