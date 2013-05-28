BugzillaJS.registerPref('prettydate', {'title': 'Turn timestamps into relative dates',
                                       'setting_default': true,
                                       'callback': ifBug(initPrettyDates),
                                       'category': 'comments'});

function fixDate(date) {
    if(typeof date == "object") return date;
    if(typeof date == "number" || date.match(/^[0-9]*$/)) {
        return new Date(parseInt(date));
    }

    // Don't do anything if it's like 2011-07-22T21:49:28Z
    if(date.match(/[-0-9]+T[0-9]+/)) {
        return new Date(date);
    }

    // Replace - with /
    date = date.replace(/-/g, '/');

    // JS doesn't understand all timezones.
    date = date.replace(/[a-zA-Z]{3,}/, function(m) {
        if(typeof tz[m] != 'undefined') {
            var post = "";
            if(tz[m].length <= 3) {
                post = "00";
            }
            return 'GMT' + tz[m] + post;
        }
        return m;
    });
    return new Date(date);
}

function initPrettyDates() {
    $('.bz_comment_time').each(function () {
        var time_ascii = $(this).text().trim();
        if(!$(this).attr('data-timestamp')) {
            $(this).attr('data-timestamp', time_ascii)
                   .attr('title', time_ascii)
                   .text(prettydate(time_ascii));
        }
    });
    setInterval(function() {
        $('[data-timestamp]').each(function(i, el) {
            $(el).text(prettydate($(el).attr('data-timestamp')));
        });
    }, 1000 * 60 * 3); // 3 minutes
}

var prettydate = function(d) {
    if(!settings['prettydate']) return d;
    d = fixDate(d);

    var now = new Date(),
        diff = (now.getTime() - d.getTime()) / 1000,
        output = "",
        weeks = months = 0;

    // FIXME: calculation not very accurate towards months/years
    if (diff < 0)  return "just now";
    if (diff == 0) return "now";
    if (diff == 1) return "1 second ago";
    if (diff < 60) return "" + Math.round(diff) + " seconds ago";
    diff = Math.floor(diff / 60);
    if (diff == 1) return "1 minute ago";
    if (diff < 60) return "" + diff + " minutes ago";
    diff = Math.floor(diff / 60);
    if (diff == 1) return "1 hour ago";
    if (diff < 24) return "" + diff + " hours ago";
    diff = Math.floor(diff / 24);
    if (diff == 1) return "1 day ago";
    if (diff < 7)  return "" + diff + " days ago";
    weeks = diff = Math.floor(diff / 7);
    if (diff == 1) return "1 week ago";
    if (diff < 4)  return "" + diff + " weeks ago";
    diff = Math.floor(diff / 4);
    if (diff == 1) return "1 month ago";
    if (diff < 12) return "" + diff + " months ago";
    diff = Math.floor(weeks / 52);
    if (diff == 1) output = "1 year";
    else output = "" + diff + " years";
    weeks = Math.floor(weeks - diff * 52.143);
    months = Math.floor(weeks / 4.345);
    if (months <= 0) return output + " ago";
    if (months == 1) return output + ", 1 month ago";
    return output += ", " + months + " months ago";
};
