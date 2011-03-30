var settings = [],
    settings_fields = [],
    bug_id = false,
    joinCount = 0,
    bz_comments = $('.bz_comment_text'),
    hidenobody_val = false;

/** Get the bug ID **/

bug_id = $('title').text().match(/Bug ([0-9]+)/)
bug_id = bug_id ? bug_id[1] : false


/* Register preferences */
registerPref('prettydate', 'Turn timestamps into a nice looking date', ifBug(correctDates));
registerPref('gitcomments', 'Use git-style comments?', ifBug(addStyling));
registerPref('hidenobody', 'Have a "Show only assigned bugs" option?', loadHideNobody);

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
    }
}

function addPrefs() {
    d = "<span class='separator'>| </span>" +
        "<li><a href=''>BugzillaJS Preferences</a></li>";

    $(d).appendTo('#header .links, #links-actions .links')
        .click(function(){
            $('#prefs').remove();

            prefs = $('<div id="prefs">').appendTo('body')
            $.each(settings_fields, function(k, v){
                o = "<div>";

                o += "<input type='checkbox' id='setting_"+v.slug+"' " +
                     "data-slug='"+v.slug+"' "+
                     (settings[v.slug] ? "checked='checked'" : "")+
                     ">";

                o += "<label for='setting_"+v.slug+"'>" + v.details +
                     "</label></div>";

                prefs.append(o);
            });

        $("<br>").appendTo(prefs);

        $("<a>", {'class': 'refresh', 'text': 'reload page', 'href': '#'})
            .appendTo(prefs)
            .click(function(){ window.location.reload(); return false; });

        $("<a href='#'>close preferences</a>").appendTo(prefs).click(function(){
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
}

function correctDates() {
    // Load comments
    // (We need to do it this way because the DOM doesn't give us enough info)

    comments = [];

    $.getJSON('https://api-dev.bugzilla.mozilla.org/latest/bug/' + bug_id + '/comment', function (d) {

        //-- Add comments to the comment array

        $.each(d.comments, function (v, k) {
            comments.push({
                'date': new Date(k.creation_time).getTime(),
                'type': 'comment'
            });
        });

        //-- Associate comments from the API with comments in the DOM

        var i = 0;
        $('.bz_comment').each(function () {
            $(this).attr('id', 'd' + new Date(d.comments[i].creation_time).getTime());
            $('.bz_comment_time', this).attr('data-timestamp',
                new Date(d.comments[i].creation_time));
            i++;
        });

        loadPrettydate();

        joinComments();

    });
}


// Join the comments after both changes and comments have loaded

function joinComments() {
    joinCount++;
    if (joinCount < 2) return;

    // Combine and sort the comments / changes

    everything = $.merge(comments, changes).sort(function (x, y) {
        return (x.date + (x.type == 'change')) - (y.date + (y.type == 'change'));
    });

    // Now, loop through them and add to the DOM

    comment = everything[0];

    $.each(everything, function (k, v) {
        if (v.type == 'comment') {
            comment = v
        } else if (v.date == comment.date) {
            $('#d' + comment.date).find('.bz_comment_text').prepend('<div class="history">' + formatChange(v.change.changes) + '</div>');
        } else {
            $('#d' + comment.date + ', .p' + comment.date).filter(':last').after(
                '<div class="history p'+comment.date+'"><strong>' + v.change.changer.name + '</strong> ' +
                formatChange(v.change.changes) +
                ' <span class="bz_comment_time" title="'+new Date(v.date)+
                '" data-timestamp="'+new Date(v.date)+'">' + new Date(v.date) +
                '</span></div>');
        }
    });

    loadPrettydate('.history .bz_comment_time');
}

function loadPrettydate(selector) {
    selector = selector || '.bz_comment_time';

    if(settings['prettydate']) {

        $(selector).each(function () {
            $(this).attr('title', $(this).text().trim())
                   .html(prettydate(new Date($(this).attr('data-timestamp'))));
        });
    }
}

function loadHideNobody() {
    $('.bz_result_count').eq(0)
                         .after('<input id="hide-nobody" type="checkbox"> ' +
                                '<label for="hide-nobody">Show only assigned bugs'+
                                '</label>');

    hidenobody_val = false;

    _.storage.request('hidenobody_val', function(v){
        if(typeof hidenobody_val != "undefined") {
            hidenobody_val = v;
        }

        $('#hide-nobody').attr('checked', hidenobody_val);

        $('#hide-nobody').change(function(){
            hidenobody_val = $(this).is(':checked');
            _.storage.save('hidenobody_val', hidenobody_val, hideNobodyToggle);
            return false; // This seems wrong?
        });
        hideNobodyToggle();
    });

}

function hideNobodyToggle() {
    $('.bz_assigned_to_column').each(function(){
        if($(this).text().trim() == "nobody@mozilla.org") {
            $(this).closest('tr').toggle(!hidenobody_val);
        }
    });
}


// Return a formatted version of the changes
function formatChange(c) {
    changes_array = [];
    $.each(c, function (ck, cv) {
        removed = cv.removed
        added = cv.added

        if(cv.field_name == 'depends_on' || cv.field_name == 'blocks') {
                f = function(text){
                    u = "<a href='https://bugzilla.mozilla.org/show" +
                        "_bug.cgi?id=$1'>$1</a>";
                    return text.replace(/([0-9]+)/g, u);
                }
                if(removed) removed = f(removed);
                if(added) added = f(added);
        }

        text = cv.field_name + ": " +
               (removed ? "<del>" + removed + "</del> => " : "") + added;
        changes_array.push(text);
    });
    return changes_array.join('; ');
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
