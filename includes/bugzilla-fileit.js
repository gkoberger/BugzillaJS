/*
*
* Shamelessly stolen from Heather Arthur's "FileIt"
* http://harthur.github.com/fileit/
*
*/

(function() {
    // Mozilla only, since it uses the API
    if(window.location.href.match('bugzilla.mozilla.org')) {
        BugzillaJS.registerPref('fileit', {'title': 'Add a "File It" box to the new bug page',
                                           'setting_default': true,
                                           'callback': initFileit,
                                           'is_new': true,
                                           'category': 'bug'});
    }

    var o = {'minLength': 3, 'maxDisplay': 20, 'time_diff': 12 * 60 * 60 /* 12 hours */ };
    var KEY = { ESC: 27, RETURN: 13, TAB: 9, BS: 8, DEL: 46, UP: 38, DOWN: 40 };

    var components = false;

    function getComponents() {
        if(!components) {
            components = window.localStorage['fileit-components'];

            var last_updated = window.localStorage['fileit-updated'],
                new_time = new Date().getTime() / 1000;

            if(!last_updated || new_time > parseInt(last_updated) + o['time_diff'] || !components) {
                getConfig();
            } else {
                components = JSON.parse(components);
            }

            window.localStorage['fileit-updated'] = new_time;
        }
    }

    function initFileit() {
        if(window.location.href.match('enter_bug.cgi')) {
            var $fileid_div = $('<div>');
            $('#bugzilla-body > h2').after($fileid_div);
            $fileid_div.fileit();
        }
    }

    $.fn.fileit = function() {
        getComponents();

        $el = $(this);
        var dd_active = 0,
            dd_total = 0,
            dd_current = "";

        var $input = $('<input>', {'placeholder': 'component...'}),
            $fileit = $('<form>', {'class': 'fileit'}),
            $dropdown = $('<ul>').hide();

        $fileit.append($('<span>', {'text': 'File a bug in'}));
        $fileit.append($input);
        $fileit.append($('<button>', {'text': 'Go'}));
        $fileit.append($dropdown);

        $el.append($fileit);

        $dropdown.css({'left': $input.position()['left'] + 10,  // +10 is for padding
                       'width': $input.outerWidth()});

        $fileit.submit(function(e) {
            e.preventDefault();
            var go = $dropdown.find('li').eq(dd_active).attr('data-comp');
            if(!go) { go = $input.val(); }

            if(go.indexOf('/') == -1) return; // Not the right format

            $input.val(go).css({'background-color': '#ddd'});
            dd_current = go;
            dd_reset();

            var comp = toComponent(go);
            window.location.href = ("http://bugzilla.mozilla.org/enter_bug.cgi?"
                        + "product=" + encodeURIComponent(comp[0]) + "&"
                        + "component=" + encodeURIComponent(comp[1]));
        });

        $input.keyup(function(e) {
            if(e.which == KEY.DOWN) {
                dd_update(1);
                return false;
            } else if (e.which == KEY.UP) {
                dd_update(-1);
                return false;
            } else {
                var val = $input.val();
                if(val == dd_current) return;
                if(val.length < o.minLength) {
                    dd_reset();
                    return;
                }

                dd_current = val;
                dd_reset();

                var words = val.toLowerCase().replace(/\//g, ' ').split(' ');
                for(var i=0; i<components.length;i++) {
                    var c = components[i],
                        is_match = true;
                    for(var k in words) {
                        if(c.search.indexOf(words[k]) == -1) {
                            is_match = false;
                            break;
                        }
                    }

                    if(is_match) {
                        var $li = $('<li>', {'data-comp': c.string});
                        $li.append($('<span>', {'text': c.product}));
                        $li.append($('<strong>', {'text': c.component}));

                        $dropdown.append($li);
                        if(dd_total++ >= o.maxDisplay) {
                            break;
                        }
                    }
                }
                $dropdown.find('li').first().addClass('active');
                $dropdown.toggle(!!$dropdown.children().length);
            }
        });

        var dd_close = false;
        $input.blur(function() {
            dd_close = setTimeout(function() {
                dd_reset();
                dd_close = false;
            }, 300); // In case they click something in the dropdown
        });

        $dropdown.delegate('li', 'click', function() {
            if(dd_close) clearTimeout(dd_close);

            $dropdown.find('.active').removeClass('active');
            $(this).addClass('active');

            $dropdown.find('li').each(function(i) {
                if($(this).hasClass('active')) {
                    dd_active = i;
                    return false;
                }
            });


            $fileit.submit();
        });

        function dd_update(diff) {
            dd_active += diff;

            if(dd_active >= dd_total) dd_active = 0;
            if(dd_active < 0) dd_active = dd_total - 1;

            var $active = $dropdown.find('li').eq(dd_active);
            $('.active', $dropdown).removeClass('active');
            $active.addClass('active');

            $input.val($active.attr('data-comp')).focus();
            dd_current = $input.val();
        }

        function dd_reset() {
            $dropdown.empty().hide();
            dd_active = 0;
            dd_total = 0;
        }
    }

    function getConfig() {
        var url = "https://api-dev.bugzilla.mozilla.org/latest//configuration?flags=0&cached_ok=1";

        $.get( url, {}, function(d) {
            var config = JSON.parse(d);

            components = [];

            for(var product in config.product) {
                var comps = config.product[product].component;
                for (var component in comps) {
                    var name = componentName({product: product, component: component});
                    components.push({
                        product: product,
                        component: component,
                        string: name,
                        search: searchName(name)
                    });
                }
            }

            window.localStorage['fileit-components'] = JSON.stringify(components);
        });
    }

    function componentName(comp) {
      return comp.product + "/" + comp.component;
    }

    function toComponent (name) {
      return name.split("/");
    }

    function searchName (name) {
      return name.replace(/[\/\s]/g, "").toLowerCase();
    }
})();
