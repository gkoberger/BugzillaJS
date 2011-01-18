// ==UserScript==
// @name           BugzillaJS
// @namespace      http://people.mozilla.com/~gkoberger/?full
// @include        https://bugzilla.mozilla.org/*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js
// ==/UserScript==


/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}
prettydate = function(d) {
    if (d == null || d.constructor != Date)
        return null;
    var now = new Date();
    var diff = (now.getTime() - d.getTime()) / 1000;

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

var settings = [],
    settings_fields = [],
    bug_id = false,
    joinCount = 0;

    if(! unsafeWindow) {
        unsafeWindow = window;
    }

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
    registerPref('hidenobody', 'Have a "Show only assigned bugs" option?');

    /** Get the bug ID **/

    bug_id = $('title').text().match(/Bug ([0-9]+)/)
    bug_id = bug_id ? bug_id[1] : false

    /** Run the modules **/

    addPrefs();

    if(settings['hidenobody']) {
        loadHideNobody();
    }

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

        $("<a href='#'>close preferences</a>").appendTo(prefs).click(function(){
            $('#prefs').remove();
            return false;
        });

        $("<span>&nbsp;|&nbsp;</span><a href='#'>refresh page</a>")
            .appendTo(prefs)
            .click(function(){ unsafeWindow.location.reload(); return false; });

        $('input', prefs).change(function(){
            unsafeWindow.localStorage['settings_' + $(this).attr('data-slug')] =
                settings[$(this).attr('data-slug')] =
                    $(this).is(':checked') ? 1 : 0;
        });

        return false;
    });

}

function registerPref(slug, details, setting_default) {
    if(setting_default == undefined) setting_default = true

    settings[slug] = setting_default;
    if('settings_' + slug in unsafeWindow.localStorage) {
        settings[slug] = unsafeWindow.localStorage['settings_' + slug];
    }

    settings_fields.push({'slug':slug, 'details':details});
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
    if('hidenobody_val' in unsafeWindow.localStorage) {
        hidenobody_val = unsafeWindow.localStorage['hidenobody_val'] * 1;
    }

    $('#hide-nobody').attr('checked', hidenobody_val);

    $('#hide-nobody').change(function(){
        unsafeWindow.localStorage['hidenobody_val'] = $(this).is(':checked') ? 1 : 0;
        hideNobodyToggle();
        return false;
    });
    hideNobodyToggle();
}

function hideNobodyToggle() {

    hidenobody_val = false;
    if('hidenobody_val' in unsafeWindow.localStorage) {
        hidenobody_val = unsafeWindow.localStorage['hidenobody_val'] * 1;
    }

    $('.bz_assigned_to_column').each(function(){
        if($(this).text().trim() == "nobody@mozilla.org") {
            $(this).closest('tr').toggle(!hidenobody_val);
        }
    });
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
    var button = $('<button type="button">Assign to me</button>');
    button.click(function() {
        $('#bz_assignee_edit_container').hide();
        $('#bz_assignee_input').show().removeClass('bz_default_hidden');
        assigned_to.val(user_name);
        return false;
    });
    $('#bz_assignee_edit_container').append(button);
}


function loadGravatars() {
    $('.bz_comment_head,.bz_first_comment_head').each(function () {
        // Only if logged in
        if($('a.email', this).length > 0) {
            email = $('a.email', this).attr('href').replace(/mailto:\s*/, '');
            $(this).prepend('<img src="http://www.gravatar.com/avatar/' + hex_md5(email) + '">');
        }

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

$('<style type=text/css>').appendTo($('head')).html('#prefs{border-width:0 0 1px 1px;border-color:#ccc;border-style:solid;padding:10px;position:fixed;top:0;right:0;width:300px;background-color:#f3f3f3}.git_style .bz_comment{-moz-border-radius:2px 2px 2px 2px;background-color:#EEEEEE;border:1px solid #CCCCCC;padding:3px;margin-left:15px;margin-bottom:1em}.git_style .bz_first_comment,.git_style .no-first-comment .bz_comment{margin-left:0}.git_style .bz_first_comment_head,.git_style .bz_comment_head{border:1px solid #CCCCCC;font-size:11px;overflow:auto;padding:5px;background:-moz-linear-gradient( center top, rgb(241,247,248) 28%, rgb(221,233,236) 64% ) repeat scroll 0% 0% transparent}.git_style .bz_first_comment_head{background:-moz-linear-gradient( center top, #E6F4EC 28%, #D8E6DE 64% ) repeat scroll 0% 0% transparent}.git_style .bz_comment_actions,.git_style .bz_comment_number{color:#999;padding-top:7px}.git_style .bz_comment_actions a,.git_style .bz_comment_number a{color:#666;text-decoration:none}.git_style .bz_comment_actions a:hover,.git_style .bz_comment_number a:hover{color:#444;text-decoration:underline}.git_style .bz_comment_text{background-color:#FFFFFF;border-left:1px solid #CCCCCC;border-right:1px solid #CCCCCC;border-bottom:1px solid #CCCCCC;margin:0;padding:10px;width:655px}.git_style .bz_first_comment .bz_comment_text,.git_style .no-first-comment .bz_comment_text{width:670px}.git_style .bz_comment_user{display:inline-block;padding-top:7px}.git_style .bz_comment_user a.email{text-decoration:none;color:#333;font-weight:bold}.git_style .bz_comment_time{color:#999}.git_style .bz_comment_head img,.git_style .bz_first_comment_head img{background-color:#FFFFFF;border:1px solid #BBBBBB;padding:2px;margin-right:5px}.bz_comment_head img,.bz_first_comment_head img{width:25px}.git_style .bz_comment_head img,.git_style .bz_first_comment_head img{float:left}.bzJS-commentoverflow .bz_comment pre{overflow-x:auto}.bzJS-removeaccesskeys .accessKeyt u{text-decoration:none}.img-gal{overflow:auto;width:100%}.git_style .img-gal{border-left:1px solid #ccc;border-right:1px solid #ccc;border-bottom:1px solid #ccc;overflow:auto;padding:20px 0 0 20px;background-color:#F1F7F8;width:655px}.git_style .bz_first_comment .img-gal{background-color:#F3FAF6;width:670px}.img-gal img{width:104px;height:104px;float:left;margin:0 20px 20px 0;border:1px solid #ddd;padding:4px;background-color:#fff}.git_style .changes{color:#555;margin-left:20px;padding-top:10px}.git_style .changes th{border-bottom:1px solid #DDDDDD;color:#666;padding:0 30px 0 10px;font-size:11px;text-align:left}.git_style .changes td{font-size:11px;padding:0 30px 0 10px}.history{background-color:#F3F3F3;border-bottom:1px solid #DDDDDD;border-top:2px solid #DDDDDD;font-size:12px;margin-bottom:10px;padding:5px}.bz_comment .history{border:none;color:#888;background-color:#fff;margin-bottom:0;padding:0 0 10px}.git_style .history{-moz-border-radius:3px 3px 3px 3px;background-color:#EEEEEE;border:1px solid #DDDDDD;color:#555;font-size:10px;margin:0 0 1em 15px;padding:5px 10px;width:663px;font-family:verdana}.git_style .bz_comment .history{padding:0 0 10px 0;color:#888;border:none;background-color:#fff;margin:0}.git_style #attachment_table{width:700px}.git_style .git-body{background-color:#F9F9F9;border-bottom:1px solid #CCCCCC;border-left:1px solid #CCCCCC;border-right:1px solid #CCCCCC;padding:10px;width:655px}.git-head{background-color:#EAF2F5;border:1px solid #BEDCE7;padding:10px}.git-head p{margin-top:0}.git-head span{font-size:11px;color:#888}.git-head span strong{color:#666}.git tr{border-top:1px solid #ddd}.git{background-color:#FFFFFF;border-bottom:1px solid #DDDDDD;border-collapse:collapse;margin:10px 0 0;width:100%}.git .changes_box{position:relative}.git td .changes_box div{display:none}.git td:hover .changes_box div{-webkit-border-radius:4px;-moz-border-radius:4px;background-color:black;color:#FFFFFF;font-size:10px;left:-165px;opacity:0.8;padding:2px 3px;position:absolute;text-align:center;top:0;width:150px;display:block}.git .changes_box strong{color:#444;display:block;float:left;padding-right:5px;padding-top:1px;text-align:right;width:25px}.git td.changes_td{width:80px}.git td{padding:5px;font-size:11px}.git td.add .stat-icon{background-position:0 0}.git td.modify .stat-icon{background-position:0px -50px}.git td.remove .stat-icon{background-position:0px -100px}.git td .stat-icon{background:url(http://github.com/images/modules/commit/file_modes.png) no-repeat scroll 0 0 transparent;display:block;height:19px;text-indent:-9999px;width:20px}.gb,.ga,.gd{-moz-border-radius:2px 2px 2px 2px;background-color:#DDD;float:left;height:8px;margin-right:2px;margin-top:5px;width:8px}.ga{background-color:#61C423}.gd{background-color:#C52323}.lb{height:100%;text-align:center;vertical-align:middle;width:100%}.lb img{background-color:#FFFFFF;border:1px solid #555;margin:20px;max-height:90%;max-width:90%;padding:5px}.overlay{background:none repeat scroll 0 0 rgba(0, 0, 0, 0.3);height:100%;left:0;position:fixed;text-align:center;top:0;width:100%}.opts{-moz-border-radius-bottomright:6px;background-color:#000;color:#AAA;font-weight:bold;left:0;padding:9px;position:fixed;top:0}.opts a{text-decoration:none;color:#fff}');