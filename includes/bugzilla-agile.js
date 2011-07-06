registerPref('sprint_points', 'Show total [points: N] for searches', sumPoints);

function sumPoints() {
    var completed = 0;
    var open = 0;
    if(settings['sprint_points']) {
        var closed_resolutions = ["VERI", "FIXE"];
        var closed_points = 0;
        var closed_stories = 0;
        var open_points = 0;
        var open_stories = 0;

        $('td.bz_status_whiteboard_column').each(function(){
            var resolution = $.trim($(this).siblings('.bz_resolution_column').text());
            var tags = $.trim($(this).text()).split(" ");
            var elements = [];

            for (i=0; i<tags.length; i++) {
                var tokens = tags[i].split("=");
                elements[tokens[0]] = tokens[1];
            }
            var points = 0;
            if (elements["p"] && typeof parseInt(elements["p"]) == "number") {
                points = parseInt(elements["p"]);
            }
            if ($.inArray(resolution, closed_resolutions) > -1){
                closed_stories++;
                closed_points += points;
            } else {
                open_stories++;
                open_points += points;
            }
        });

        $('table.bz_buglist').append('<tr><td colspan="99" align="right">Open Stories: ' + open_stories + '<br/>Open points: ' + open_points + '<br/>Closed Stories: ' + closed_stories + '<br/>Closed points: ' + closed_points + '</td></tr>');
        console.log("Open Stories: " + open_stories);
        console.log("Open points: " + open_points);
        console.log("Closed Stories: " + closed_stories);
        console.log("Closed points: " + closed_points);
    }
}
