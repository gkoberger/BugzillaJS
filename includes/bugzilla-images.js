registerPref('gallery', 'Display images and attachments as an inline gallery', function(){
    // Ugh, chaining.
    registerPref('lightbox', 'Use lightboxes for images?', ifBug(initImageStuff));
});

function initImageStuff() {
    if(settings['gallery'] || settings['lightbox']) {

        var image_attachments = {};

        $('#attachment_table tr').each(function() {
          if($(this).prop('class').match('image')) {
            var $a = $(this).find('a b').parent();
            if (settings['lightbox']) {
                $a.click(bzLightbox);
            }

            image_attachments[$a.prop('href').match(/id=([0-9]*)/)[1]] = true;
          }
        });

        bz_comments.each(function() {
            var comment = $(this),
                images = new Array();
            $('a', comment).each(function () {
                var attachment_id = $(this).prop('name').match('attach_([0-9]+)$');
                var is_image_attachment = (attachment_id && attachment_id[1] in image_attachments);

                if ($(this).prop('href').match(/(\.(jpg|gif|png))/i) || is_image_attachment) {

                    if (settings['gallery']) {
                        images.push($(this).prop('href'));
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
        function closeBzLightbox() {
          $('.lb, .overlay').remove();
        }
        
        closeBzLightbox();
        overlay = $('<div>').addClass('overlay').appendTo('body').css({opacity: 0});
        overlay2 = $('<div>').addClass('overlay2').appendTo('body');

        $(overlay2).css({'top':$(window).scrollTop() + 5});

        img = $('<img>').prop('src', $(this).prop('href')).addClass('lb').css({'opacity': 0}).appendTo(overlay2);

        $(overlay).add(overlay2).click(closeBzLightbox);

        opts = $('<div>').addClass('opts').appendTo(overlay)
        $(opts).append("<a href='"+$(this).prop('href')+
                       "' target='_blank' class='full_image'>full image</a>");
        $(opts).append(" | <a class='close_overlay' href='#'>close</a>");

        $('.full_image', opts).click(function(e){ e.stopPropagation(); });
        $('.close_overlay', opts).click(function(e){ e.preventDefault(); });

        $(img).css({'opacity': 1});
        $(overlay).css({'opacity': 1});

        $(document).keyup(function(e) {
          // Esc key
          if (e.keyCode == 27) {
            closeBzLightbox();
          }
        });

        return false;
    }
}
