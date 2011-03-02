registerPref('git', 'Show git log inline');

if(bug_id && settings['git'] && false) {
    comments.bind('loadcomment', function(comment){
        $('a', comment).each(function () {
            url = $(this).attr('href')
            isGithub = url.match(/github.com\/(\w*)\/(\w*)\/commit\/(\w*)/)

            if (isGithub) {
                giturl = 'http://github.com/api/v2/json/commits/show/' +
                         t[1] + '/' + t[2] + '/' + t[3] + '?callback=?'

                $.getJSON(giturl, function (d) {
                    git = $('<div class="git-body">').insertAfter(comment);
                    head = $('<div class="git-head">').appendTo(git);

                    head.append('<p>' + d.commit.message + '</p>');
                    head.append("<span><strong>" + d.commit.author.name +
                        "</strong>&nbsp;" +
                        prettydate(new Date(d.commit.authored_date)) +
                        '</span>');

                    table = $("<table class='git'></table>").appendTo(git);

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

