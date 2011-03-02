registerPref('gallery', 'Display images and attachments as an inline gallery');
registerPref('lightbox', 'Use lightboxes for images?');

if(bug_id && (settings['gallery'] || settings['lightbox'])) {
    bz_comments.each(function() {
        var comment = $(this),
            images = new Array();
        $('a', comment).each(function () {
            if ($(this).attr('href').match(/(\.(jpg|gif|png))/i)) {

                if (settings['gallery']) {
                    images.push($(this).attr('href'));
                }

                if (settings['lightbox']) {
                    $(this).click(bzLightbox);
                }
            }
        });

        if (settings['gallery'] && images.length) {
            gal = $('<div class="img-gal">').insertAfter(comment);
            $.each(images, function (k, v) {
                a = $('<a href="' + v + '" title="' + v + '" target="_blank"><img src="' + v + '"></a>').appendTo(gal);
                if(settings['lightbox']) {
                    $(a).click(bzLightbox);
                }
            });
        }
    });
}

function bzLightbox() {
    $('.lb, .overlay').remove();
    overlay = $('<div>').addClass('overlay').appendTo('body').css({opacity: 0});

    img = $('<img>').attr('src', $(this).attr('href')).addClass('lb').css({'opacity': 0}).appendTo('body');
    $(img).css({'margin-left':-1 * ($(img).width()/2), 'top':$(window).scrollTop() + 5});

    $(overlay).click(function(e){
        $('.lb').remove();
        $('.overlay').remove();
    });

    opts = $('<div>').addClass('opts').appendTo(overlay)
    $(opts).append("<a href='"+$(this).attr('href')+
                   "' target='_blank' class='full_image'>full image</a>");
    $(opts).append(" | <a class='close_overlay' href='#'>close</a>");

    $('.full_image', opts).click(function(e){ e.stopPropagation(); });
    $('.close_overlay', opts).click(function(e){ e.preventDefault(); });

    $(img).css({'opacity': 1});
    $(overlay).css({'opacity': 1});

    return false;
}
