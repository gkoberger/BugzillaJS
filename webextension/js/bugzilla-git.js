'use strict';

/* global registerPref, ifBug, bz_comments, $, repositionScroll */

registerPref('git', {'title': 'Show GitHub logs inline',
                     'setting_default': true,
                     'callback': ifBug(initGit),
                     'category': 'inline'});

function initGit() {
    var github_regexp = /github.com\/([-\w]*)\/([-\w]*)\/commit\/(\w*)/;
    bz_comments.each(function() {
        var $comment = $(this);
        $('a', $comment).each(function() {
            var url = $(this).attr('href');
            var isGithub = url.match(github_regexp);

            if (!isGithub) {
                return;
            }

            var giturl = 'https://api.github.com/repos/' + isGithub[1] + '/' +
                     isGithub[2] + '/commits/' + isGithub[3];
                     //'?callback=cbk'

            $.getJSON(giturl, function(d) {
                var $git = $('<div>', {'class': 'git-body'}).
                    insertAfter($comment);
                var $head = $('<div>', {'class': 'git-head'}).appendTo($git);

                $head.append($('<p>', {'text': d.commit.message}));

                var $span = $('<span>'),
                    $strong = $('<strong>', {'text': d.commit.author.name}),
                    $date = $('<span>', {'text': d.commit.author.date});

                $span.append($strong).append($date);
                $head.append($span);

                var $table = $('<table>', {'class': 'git'}).appendTo($git);

                $.each(d.files, function(k, file) {
                    if (file.status === 'added') {
                        $table.append('<tr><td class="add">' +
                            '<div class="stat-icon"></td><td>' + file.filename +
                            '</td><td class="changes_td">' + gitBox(5, 0) +
                            '</td></tr>');
                    }

                    if (file.status === 'removed') {
                        $table.append('<tr><td class="remove">' +
                            '<div class="stat-icon"></td><td>' + file.filename +
                            '</td><td class="changes_td">' + gitBox(0, 5) +
                            '</td></tr>');
                    }

                    if (file.status === 'modified') {
                        $table.append('<tr><td class="modify">' +
                            '<div class="stat-icon"></div></td><td>' +
                            file.filename + '</td><td class="changes_td">' +
                            gitBox(file.additions, file.deletions) +
                            '</td></tr>');
                    }
                });
                repositionScroll();
            });
        });
    });

    function gitBox(added, deleted) {
        var output = '<div>' + added + ' additions & ' +
            deleted + ' deletions</div>';

        var total = added + deleted;
        if (total > 5) {
            added = Math.round((added / total) * 5);
            deleted = Math.round((deleted / total) * 5);
        }

        var t = 0;
        var i;
        for (i = 0; i < added && t < 5; i++, t++) {
            output += '<span class="ga"/>';
        }
        for (i = 0; i < deleted && t < 5; i++, t++) {
            output += '<span class="gd"/>';
        }
        for (i = 0; i < 5 && t < 5; i++, t++) {
            output += '<span class="gb"/>';
        }

        return '<div class="changes_box"><strong>' + total + '</strong> ' +
            output + '</div>';
    }
}
