registerPref('prettydate', 'Turn timestamps into a nice looking date', ifBug(initPrettyDates));

var tz = {'A':'+1','ADT':'-3','AFT':'+450','AKDT':'-8','AKST':'-9','ALMT':'+6','AMST':'+5','AMST':'-3','AMT':'+4','AMT':'-4','ANAST':'+12','ANAT':'+12','AQTT':'+5','ART':'-3','AST':'-4','AZOST':'0','AZOT':'-1','AZST':'+5','AZT':'+4','B':'+2','BNT':'+8','BOT':'-4','BRST':'-2','BRT':'-3','BST':'+1','BTT':'+6','C':'+3','CAST':'+8','CAT':'+2','CCT':'+650','CDT':'-5','CEST':'+2','CET':'+1','CHADT':'+13:45','CHAST':'+12:45','CKT':'-10','CLST':'-3','CLT':'-4','COT':'-5','CST':'-6','CVT':'-1','CXT':'+7','ChST':'+10','D':'+4','DAVT':'+7','E':'+5','EASST':'-5','EAST':'-6','EAT':'+3','EAT':'+3','ECT':'-5','EDT':'-4','EEST':'+3','EET':'+2','EGST':'0','EGT':'-1','EST':'-5','ET':'-5','F':'+6','FJST':'+13','FJT':'+12','FKST':'-3','FKT':'-4','FNT':'-2','G':'+7','GALT':'-6','GAMT':'-9','GET':'+4','GFT':'-3','GILT':'+12','GMT':0,'GST':'+4','GYT':'-4','H':'+8','HAA':'-3','HAA':'-3','HAC':'-5','HADT':'-9','HAE':'-4','HAE':'-4','HAP':'-7','HAR':'-6','HAST':'-10','HAT':'-250','HAY':'-8','HKT':'+8','HLV':'-450','HNA':'-4','HNA':'-4','HNA':'-4','HNC':'-6','HNC':'-6','HNE':'-5','HNE':'-5','HNE':'-5','HNP':'-8','HNR':'-7','HNT':'-350','HNY':'-9','HOVT':'+7','I':'+9','ICT':'+7','IDT':'+3','IOT':'+6','IRDT':'+450','IRKST':'+9','IRKT':'+8','IRST':'+350','IST':'+2','IST':'+550','IST':'+1','JST':'+9','K':'+10','KGT':'+6','KRAST':'+8','KRAT':'+7','KST':'+9','KUYT':'+4','L':'+11','LHDT':'+11','LHST':'+1050','LINT':'+14','M':'+12','MAGST':'+12','MAGT':'+11','MART':'-950','MAWT':'+5','MDT':'-6','MHT':'+12','MMT':'+650','MSD':'+4','MSK':'+3','MST':'-7','MUT':'+4','MVT':'+5','MYT':'+8','N':'-1','NCT':'+11','NDT':'-250','NFT':'+1150','NOVST':'+7','NOVT':'+6','NPT':'+5:45','NST':'-350','NUT':'-11','NZDT':'+13','NZST':'+12','O':'-2','OMSST':'+7','OMST':'+6','P':'-3','PDT':'-7','PET':'-5','PETST':'+12','PETT':'+12','PGT':'+10','PHOT':'+13','PHT':'+8','PKT':'+5','PMDT':'-2','PMST':'-3','PONT':'+11','PST':'-8','PT':'-8','PWT':'+9','PYST':'-3','PYT':'-4','Q':'-4','R':'-5','RET':'+4','S':'-6','SAMT':'+4','SAST':'+2','SBT':'+11','SCT':'+4','SGT':'+8','SRT':'-3','SST':'-11','T':'-7','TAHT':'-10','TFT':'+5','TJT':'+5','TKT':'-10','TLT':'+9','TMT':'+5','TVT':'+12','U':'-8','ULAT':'+8','UYST':'-2','UYT':'-3','UZT':'+5','V':'-9','VET':'-450','VLAST':'+11','VLAT':'+10','VUT':'+11','W':'-10','WAST':'+2','WAT':'+1','WDT':'+9','WEST':'+1','WEST':'+1','WET':'0','WFT':'+12','WGST':'-2','WGT':'-3','WIB':'+7','WIT':'+9','WITA':'+8','WST':'+1','WST':'+8','WST':'-11','WT':'0','X':'-11','Y':'-12','YAKST':'+10','YAKT':'+9','YAPT':'+10','YEKST':'+6','YEKT':'+5','Z':'0'};

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
    if(settings['prettydate']) {
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
}

var prettydate = function(d) {
    if(!settings['prettydate']) return d;
    d = fixDate(d);

    var now = new Date(),
        diff = (now.getTime() - d.getTime()) / 1000;

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
