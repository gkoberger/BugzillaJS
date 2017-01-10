'use strict';

/* global registerPref, $, _, ifBug, bz_comments */

registerPref('gallery', {
    'title': 'Display images and attachments as an inline gallery',
    'setting_default': true,
    'callback': ifNotSecurityBug(initImageInline),
    'category': 'inline'});

registerPref('lightbox', {
    'title': 'Use lightbox for images',
    'setting_default': true,
    'callback': ifNotSecurityBug(initImageLightbox),
    'category': 'inline'});

function ifNotSecurityBug(func) {
    if (document.body.classList.contains('bz_group_websites-security')) {
        return function() {};
    }

    return ifBug(func);
}

var image_attachments = {},
    imageBothRun = false;

function initImageBoth() {
    if (imageBothRun) {
        return;
    }
    imageBothRun = true;

    $('#attachment_table tr, #attachments tr').each(function() {
        var $this = $(this);
        if ($this.prop('class').match('image')) {
            var $a = $this.find('a b').parent();
            $a.addClass('is-image');
            var attachment_id = $a.prop('href').match(/id=([0-9]*)/)[1];
            image_attachments[attachment_id] = $a.prop('href');
        }
    });

    bz_comments.each(function() {
        var $comment = $(this);

        $('a', $comment).each(function() {
            var $a = $(this);
            var attachment_id = $a.prop('name').match('attach_([0-9]+)$'),
                is_image_attachment = (attachment_id &&
                    attachment_id[1] in image_attachments);

            /* If it's an image, add the image class */
            if ($a.prop('href').match(/(\.(jpg|gif|png))/i) ||
                    is_image_attachment) {
                $a.addClass('is-image');
                $comment.addClass('has-image');
            }
        });
    });
}

function initImageLightbox() {
    initImageBoth();

    function closeLightbox(e) {
        if (e) {
            e.preventDefault();
        }
        $('.lb, .overlay').remove();
    }

    function bzLightbox(e) {
        /* TODO: Fix this! */
        if (e) {
            e.preventDefault();
        }

        var $this = $(e.currentTarget);
        $(window).trigger('close');

        var $overlay = $('<div>').addClass('overlay').appendTo('body').
            css({opacity: 0});
        var $overlay2 = $('<div>').addClass('overlay2').appendTo('body');

        $overlay2.css({'top': $(window).scrollTop() + 5});

        var $img = $('<img>').prop('src', $this.prop('href')).addClass('lb')
                        .css({'opacity': 0}).appendTo($overlay2);

        $overlay.add($overlay2).click(closeLightbox);

        var $opts = $('<div>').addClass('opts').appendTo($overlay);

        $opts.append('<a href="' + $this.prop('href') +
                       '" target="_blank" class="full_image">full image</a>');
        $opts.append(' | <a class="close_overlay" href="#">close</a>');

        $('.full_image', $opts).click(function(e) { e.stopPropagation(); });
        $('.close_overlay', $opts).click(function(e) { e.preventDefault(); });

        $img.css({'opacity': 1});
        $overlay.css({'opacity': 1});
    }

    /* Close on <esc> */
    $(window).bind('close', closeLightbox);

    $('#attachment_table, .bz_comment_table, #bugzilla-body').delegate('.is-image',
        'click', bzLightbox);
}

function initImageInline() {
    initImageBoth();

    bz_comments.each(function() {
        var $comment = $(this);
        if (!$comment.hasClass('has-image')) {
            return;
        }

        var $gal = $('<div>', {'class': 'img-gal'}).insertAfter($comment);
        $comment.find('.is-image').each(function() {
            var href = $(this).attr('href'),
                $a = $('<a>', {'class': 'preview-img is-image', 'href': href,
                               'target': '_blank'});
            $gal.append($a);

            var $img;
            if (href.match('^http:')) { // Not https? Blah..
                _.getImage(href, function(src) {
                    $img = $('<img>', {'src': src});
                    $a.append($img);
                });
            } else {
                $img = $('<img>', {'src': href});
                $a.append($img);
            }

        });

    });
}

