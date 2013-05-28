BugzillaJS.registerPref('git', {'title': 'Show GitHub logs inline',
                                'setting_default': true,
                                'callback': ifBug(initGit),
                                'category': 'inline'});

function initGit() {
    BugzillaJS.on("comment", function(comment, _) {
        var comment = $(comment);
        $('a', comment).each(function () {
            var url = $(this).attr('href')
                isGithub = url.match(/github.com\/([-\w]*)\/([-\w]*)\/commit\/(\w*)/);

            if (isGithub) {
                giturl = 'https://github.com/api/v2/json/commits/show/' +
                         isGithub[1] + '/' + isGithub[2] + '/' + isGithub[3];
                         //'?callback=cbk'



                JSONP.get( giturl, {}, function (d) {
                    git = $('<div>', {'class': "git-body"}).insertAfter(comment);
                    head = $('<div>', {'class': "git-head"}).appendTo(git);

                    head.append($('<p>', {'text': d.commit.message}));

                    var $span = $('<span>'),
                        $strong = $('<strong>', {'text': d.commit.author.name}),
                        $date = $('<span>', {'text': d.commit.authored_date});

                    $span.append($strong).append($date);
                    head.append($span);

                    table = $("<table>", {'class': 'git'}).appendTo(git);

                    if (d.commit.added) {
                        $.each(d.commit.added, function (k, v) {
                            table.append("<tr><td class='add'>" +
                                "<div class='stat-icon'></td><td>" + v +
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
                    BugzillaJS.repositionScroll();
                });
            }
        });
    });

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
}

BugzillaJS.addFeature();
