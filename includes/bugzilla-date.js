registerPref('prettydate', 'Turn timestamps into a nice looking date', ifBug(initPrettyDates));

function initPrettyDates() {
    if(settings['prettydate']) {
        $('.bz_comment_time').each(function () {
            var time_ascii = $(this).text().trim();
            if(!$(this).attr('data-timestamp')) {
                $(this).attr('data-timestamp', time_ascii)
                       .attr('title', time_ascii)
                       .text(prettydate(time_ascii.replace(/-/g, '/')));
            }
        });
    }
}

var prettydate = function(d) {
    if(!settings['prettydate']) return d;
    if(typeof d == "string") d = new Date(d);

    var now = new Date(),
        diff = (now.getTime() - d.getTime()) / 1000;

    console.log(now, d, diff, now.getTime(), d.getTime());

    // FIXME: calculation not very accurate towards months/years
    if (diff < 0)  return "just now";
    if (diff == 0) return "now";
    if (diff == 1) return "1 second ago";
    if (diff < 60) return "" + Math.round(diff) + " seconds ago";
    diff = Math.round(diff / 60);
    if (diff == 1) return "1 minute ago";
    if (diff < 60) return "" + diff + " minutes ago";
    diff = Math.round(diff / 60);
    if (diff == 1) return "1 hour ago";
    if (diff < 24) return "" + diff + " hours ago";
    diff = Math.round(diff / 24);
    if (diff == 1) return "1 day ago";
    if (diff < 7)  return "" + diff + " days ago";
    diff = Math.round(diff / 7);
    if (diff == 1) return "1 week ago";
    if (diff < 4)  return "" + diff + " weeks ago";
    diff = Math.round(diff / 4);
    if (diff == 1) return "1 month ago";
    if (diff < 12) return "" + diff + " months ago";
    diff = Math.round(diff / 12);
    if (diff == 1) return "1 year ago";
    return "" + diff + " years ago";
};
