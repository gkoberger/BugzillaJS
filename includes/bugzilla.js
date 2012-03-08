var settings = [],
    settings_fields = [],
    bug_id = false,
    joinCount = 0,
    bz_comments = $('.bz_comment_text'),
    hidenobody_val = false,
    already_run = [];

/** Get the bug ID **/

bug_id = $('title').text().match(/^(?:Bug )?([0-9]+)/)
bug_id = bug_id ? bug_id[1] : false

/* Register preferences */
registerPref('gitcomments', 'Use github-style comments?', ifBug(addStyling));

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
    d = "<span class='separator'>| </span>" +
        "<li><a href=''>BugzillaJS Preferences</a></li>";

    $(d).appendTo('#header .links, #links-actions .links')
        .click(function(){
            $('#prefs').remove();

            var prefs = $('<div id="prefs">').appendTo('body'),
                header = $("<div class='header'>").appendTo(prefs),
                footer = $("<div>").appendTo(prefs);


            $("<div>").html("Now works on any Bugzilla installation! Add sites in <em>Add-on Preferences</em>.")
                .appendTo(header);

            $("<a>", {href: 'https://github.com/gkoberger/bugzillajs', class: 'cta'})
                .html("<strong>Bug or Feature Request?</strong> We're on github &raquo;")
                .appendTo(header);

            $("<a>", {href: 'https://addons.mozilla.org/en-US/firefox/addon/bugzillajs/reviews/add', class: 'cta2'})
                .html("<strong>Like BugzillaJS?</strong> Write a review! &raquo;")
                .appendTo(header);

            $.each(settings_fields, function(k, v){
                o = "<div>";
                o += "<input type='checkbox' id='setting_"+v.slug+"' " +
                     "data-slug='"+v.slug+"' "+
                     (settings[v.slug] ? "checked='checked'" : "")+
                     ">";
                o += "<label for='setting_"+v.slug+"'>" + v.details +
                     "</label></div>";
                header.append(o);
            });

        $("<br>").appendTo(header);

        $("<a>", {'class': 'refresh', 'text': 'reload page', 'href': '#'})
            .appendTo(footer)
            .click(function(){ window.location.reload(); return false; });


        $("<a href='#'>close</a>").appendTo(footer).click(function(){
            $('#prefs').remove();
            return false;
        });

        $('input', prefs).change(function(){
            _.storage.save('settings_' + $(this).attr('data-slug'), $(this).is(':checked'));
        });

        return false;
    });

}

function registerPref(slug, details, setting_default, callback) {
    if(! already_run[slug]) {
        if(typeof setting_default == "function") callback = setting_default;
        if(setting_default == undefined) setting_default = true

        callback = callback || function(){};

        settings[slug] = setting_default;

        _.storage.request('settings_' + slug, function(v){
            if(typeof v != "undefined") {
                settings[slug] = v;
            }

            settings_fields.push({'slug':slug, 'details':details});

            callback();
        });

        already_run[slug] = true;
    }
}

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
