var settings = [];
var settings_fields = [];
var bug_id = false;
var joinCount = 0;

$(document).ready(function(){
    registerPref('changes', 'Show changes to the bug');
    registerPref('git', 'Show git log inline');
    registerPref('gallery', 'Display images and attachments as an inline gallery');
    registerPref('prettydate', 'Turn timestamps into a nice looking date');
    registerPref('gravatar', 'Show gravatars for comments');
    registerPref('assigntome', 'Add an Assign to Me button?');
    registerPref('gitcomments', 'Use git-style comments?');
    registerPref('lightbox', 'Use lightboxes for images?');
    registerPref('commentoverflow', 'Fix comment overflow issues?');
    registerPref('removeflags', 'Remove flags?', false);
    registerPref('removeaccesskeys', 'Remove access keys?', false);
    registerPref('hidefirst', 'Hide first comment if empty?');

    /** Get the bug ID **/

    bug_id = $('title').text().match(/Bug ([0-9]+)/)
    bug_id = bug_id ? bug_id[1] : false

    /** Run the modules **/

    addPrefs();

    if(bug_id) {

        correctDates();

        if (settings['gitcomments']) {
            $('body').addClass('git_style')
        }

        if (settings['changes']) {
            loadChanges();
        }

        if(settings['gravatar']) {
            loadGravatars();
        }

        if (settings['gallery'] || settings['git']) {
            parseLinks();
        }

        if (settings['assigntome']) {
            loadAssignToMe();
        }

        if (settings['hidefirst']) {
            loadHideFirst();
        }

        if(settings['commentoverflow']) {
            loadCommentOverflow();
        }

        if(settings['removeflags']) {
            loadRemoveFlags();
        }

        if(settings['removeaccesskeys']) {
            loadRemoveAccessKeys();
        }

        if (settings['lightbox']) {
            $('.img-gal a').click(function(){
                $('.lb').remove();
                overlay =
                $('<div>').addClass('overlay').appendTo('body').css('opacity',
                    0).animate({'opacity':1}, 'fast');

                div = $('<div>').addClass('lb').appendTo(overlay);
                img = $('<img>').attr('src', $(this).attr('href'))
                                .appendTo(div);

                opts = $('<div>').addClass('opts').appendTo(overlay)
                $(opts).append("<a href='"+$(this).attr('href')+
                               "' target='_blank'>full image</a>");
                $(opts).append(" | <a class='close_overlay'>close</a>");

                $(div).add(overlay).click(function(e){
                    $('.overlay, .lb, .close_overlay').remove();
                    e.stopPropagation() //return false;
                });

                return false;
            });

        }
    }
});

function addPrefs() {
    d = "<span class='separator'>| </span>" +
        "<li><a href=''>BugzillaJS Preferences</a></li>";

    $(d).appendTo('#header .links, #links-actions .links')
        .click(function(){
            $('#prefs').remove();

            prefs = $('<div id="prefs">').appendTo('body')
            $.each(settings_fields, function(k, v){
                o = "<div>"

                o += "<input type='checkbox' id='setting_"+v.slug+"' " +
                     "data-slug='"+v.slug+"' "+
                     (settings[v.slug] ? "checked='checked'" : "")+
                     ">";

                o += "<label for='setting_"+v.slug+"'>" + v.details +
                     "</label></div>";

                prefs.append(o);
            });

        $("<a href='#'>close preferences</a>").appendTo(prefs).click(function(){
            $('#prefs').remove();
            return false;
        });

        $("<span>&nbsp;|&nbsp;</span><a href='#'>refresh page</a>")
            .appendTo(prefs)
            .click(function(){ window.location.reload(); return false; });

        $('input', prefs).change(function(){
            window.localStorage['settings_' + $(this).attr('data-slug')] =
                settings[$(this).attr('data-slug')] =
                    $(this).is(':checked') ? 1 : 0;
        });

        return false;
    });

}

function registerPref(slug, details, setting_default) {
    if(setting_default == undefined) setting_default = true

    settings[slug] = window.localStorage['settings_' + slug] == null ? setting_default : window.localStorage['settings_' + slug]*1;
    settings_fields.push({'slug':slug, 'details':details});
}

function loadPrettydate(selector) {

    selector = selector || '.bz_comment_time';

    if(settings['prettydate']) {

        $(selector).each(function () {

            $(this).attr('title', $(this).text().trim())
                .html(prettydate(new Date($(this).attr('data-timestamp')
                            .replace(/[-+]?[0-9]*\s*\(.*\)/, ''))));

        });

    }
}

function loadRemoveFlags() {
    // Idea by jbalogh
    $('#flags, .flags_label').remove();
}

function loadRemoveAccessKeys() {
    // Inspired by jbalogh, who evidently hates accessibility.
    $('[accesskey]').each(function(i, e) {
        $(e).attr('accessKey', false);
        $(e).addClass('accessKey');
    });

    $('body').addClass('bzJS-removeaccesskeys');
}

function loadCommentOverflow() {
    // Idea by fwenzel
    $('body').addClass('bzJS-commentoverflow')
}

function loadHideFirst() {
    if($('.bz_first_comment .bz_comment_text').text() == "") {
        $('.bz_first_comment').hide();
        $('.bz_comment_table').addClass('no-first-comment');
    }
}

function loadAssignToMe() {
    // Based on code written by oremj and fwenzel
    // http://github.com/fwenzel/jetpacks/tree/gh-pages/bugzilla/assign-to-me/

    var logout_re = /[\s\S]*Log.*out.*[\s]\s*(.*)\s/m,
        logout_link = $('#footer #links-actions li'),
        user_name = false;

    logout_link.each(function(){
        if($(this).text().match(logout_re)) {
        user_name = $(this).text().replace(logout_re, '$1');
        }
    });
    var assigned_to = $('#assigned_to');

    // already the assignee?
    if (assigned_to.val() == user_name) return;

    // does button already exist? Mozilla bug 535001
    if ($('#bz_assignee_edit_container button').size()) return;

    // otherwise, make an assignee button
    var button = $('<button>Assign to me</button>');
    button.click(function() {
        assigned_to.val(user_name);
        $('#commit_top').click();
    });
    $('#bz_assignee_edit_container').append(button);
}


function loadGravatars() {
    $('.bz_comment_head,.bz_first_comment_head').each(function () {
        email = $('a[class=email]', this).attr('href').replace(/mailto:\s*/, '')
        $(this).prepend('<img src="http://www.gravatar.com/avatar/' + hex_md5(email) + '">');
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

function loadChanges() {

    // Now, load the changes from the API

    changes = [];

    $.getJSON('https://api-dev.bugzilla.mozilla.org/latest/bug/' + bug_id + '/history', function (d) {
        $.each(d.history, function (v, k) {
            changes.push({
                'date': new Date(k.change_time).getTime(),
                'change': k,
                'type': 'change'
            })
        });
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
            $('#d' + comment.date).after('<div class="history"><strong>' + v.change.changer.name + '</strong> ' +
                formatChange(v.change.changes) +
                ' <span class="bz_comment_time" title="'+new Date(v.date)+
                '" data-timestamp="'+new Date(v.date)+'">' + new Date(v.date) +
                '</span></div>');
        }
    });

    loadPrettydate('.history .bz_comment_time');

}

// Return a formatted version of the changes

function formatChange(c) {
    changes_array = [];
    $.each(c, function (ck, cv) {
        changes_array.push(cv.field_name + ": " + (cv.removed ? "<del>" + cv.removed + "</del> => " : "") + cv.added)
    });

    return changes_array.join('; ');
}

function parseLinks() {
    $('.bz_comment_text').each(function () {
        comment = $(this);

        (function (comment) {
            var images = new Array();
            $('a', comment).each(function () {
                if (settings['gallery'] && $(this).attr('href').match(/(\.(jpg|gif|png))/i)) {
                    images.push($(this).attr('href'));
                } else if (settings['git'] && (t = $(this).attr('href').match(/github.com\/([a-zA-Z0-9]*)\/([a-zA-Z0-9]*)\/commit\/([a-zA-Z0-9]*)/))) {

                    jQuery.getJSON('http://github.com/api/v2/json/commits/show/' + t[1] + '/' + t[2] + '/' + t[3] + '?callback=?', function (d) {

                        git = $('<div class="git-body">').insertAfter(comment);
                        head = $('<div class="git-head">').appendTo(git);

                        head.append('<p>' + d.commit.message + '</p>');
                        head.append("<span><strong>" + d.commit.author.name + '</strong>&nbsp;' + prettydate(new Date(d.commit.authored_date)) + '</span>');

                        table = $("<table class='git'></table>").appendTo(git);

                        if (d.commit.added) {
                            $.each(d.commit.added, function (k, v) {
                                table.append("<tr><td class='add'><div class='stat-icon'></td><td>" + v +
                                    "</td><td class='changes_td'>" + gitBox(5, 0) + "</td></tr>");
                            });
                        }

                        if (d.commit.removed) {
                            $.each(d.commit.removed, function (k, v) {
                                table.append("<tr><td class='remove'><div class='stat-icon'></td><td>" + v +
                                    "</td><td class='changes_td'>" + gitBox(0, 5) + "</td></tr>");
                            });
                        }

                        if (d.commit.modified) {
                            $.each(d.commit.modified, function (k, v) {
                                additions = (v.diff.match(/^\+[^+]/gm) || '').length
                                deletions = (v.diff.match(/^\-[^-]/gm) || '').length
                                table.append("<tr><td class='modify'><div class='stat-icon'></div></td><td>" +
                                             v.filename + "</td><td class='changes_td'>" +
                                             gitBox(additions, deletions) + "</td></tr>");

                            });
                        }
                    });
                }
            });

            if (settings['gallery'] && images.length) {
                gal = $('<div class="img-gal">').insertAfter(comment);
                $.each(images, function (k, v) {
                    $(gal).append('<a href="' + v + '" title="' + v + '" target="_blank"><img src="' + v + '"></a>')
                });
            }

        })(comment);
    });
}

function gitBox(a, d) {
    output = "<div>" + a + " additions & " + d + " deletions</div>";

    total = a + d;
    if (total > 5) {
        a = Math.round((a / total) * 5)
        d = Math.round((d / total) * 5)
    }

    t = 0;

    for (i = 0; i < a && t < 5; i++, t++) output += "<span class='ga'/>";
    for (i = 0; i < d && t < 5; i++, t++) output += "<span class='gd'/>";
    for (i = 0; i < 5 && t < 5; i++, t++) output += "<span class='gb'/>";

    return "<div class='changes_box'><strong>" + total + "</strong> " + output + "</div>";
}


function set_cookie( name, value ) {
  var cookie_string = name + "=" + escape ( value );

  if ( exp_y )
  {
    var expires = new Date (  );
    cookie_string += "; expires=" + expires.toGMTString();
  }
        cookie_string += "; secure";

  document.cookie = cookie_string;
}
function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}
