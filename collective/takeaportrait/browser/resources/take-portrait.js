(function($) {

    var canvas = null, portrait = null, video = null, overlay = null,
        doPhotoButton = null, redoButton = null, savePhotoButton = null,
        savedPhoto = null,
        mediaWidth = mediaHeight = 0,
        lineThick = 6;
    
    function doPhoto(event) {
        event.preventDefault();
        doPhotoButton.hide();
        savedPhoto = $('<img src="" />');
        savedPhoto.attr('src', canvas.toDataURL('image/png'));
        
    }

    function drawViewfinder() {
        var context = canvas.get(0).getContext('2d'),
            height = canvas.height() - 2 * lineThick,
            width = parseInt(height*75/100);
        context.beginPath();
        context.lineWidth = lineThick;
        context.strokeStyle = '#74DF00';
        context.moveTo(mediaWidth/2-width/2, 0);
        context.lineTo(mediaWidth/2-width/2, height+lineThick*3/2);
        context.lineTo(mediaWidth/2+width/2, height+lineThick*3/2);
        context.lineTo(mediaWidth/2+width/2, lineThick/2);
        context.lineTo(mediaWidth/2-width/2, lineThick/2);
        context.stroke();
            
    }

    function drawSavedPhoto() {
        var context = canvas.get(0).getContext('2d');
        // TODO
    }

    function startVideo() {
        navigator.getUserMedia(
            {video: true, audio: false},
            function(userMedia) {
                var context = canvas.get(0).getContext('2d');
                var videoElement = video.get(0);
                // portrait.hide();
                canvas.show();
                window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                video.attr('src', window.URL.createObjectURL(userMedia));

                video.bind('canplay', function(event) {
                    overlay.find('img').show();
                    function videoLoop() {
                        window.setTimeout(videoLoop, 20);
                        // test below seems weird, but anything else worked
                        if (videoElement.videoWidth>0) {
                            context.drawImage(videoElement, 0, 0, mediaWidth, mediaHeight);
                            drawViewfinder();
                            if (savedPhoto!=null) {
                                drawSavedPhoto();
                            }
                        }
                    }
                    videoElement.play();
                    videoLoop();
                });
               
            },
            function(error) {
                if (window.console && window.console.error) {
                    window.console.error("Can't init video:" + error.code);
                }
            });
    }
    
    function init() {
        jarn.i18n.loadCatalog('collective.takeaportrait');
        var _ = jarn.i18n.MessageFactory('collective.takeaportrait');

        // new help text
        var defaultUploadField = $('#form\\.portrait');
        var forHelpText = defaultUploadField.parent().prev('.formHelp');
        if (forHelpText.length>0) {
            var translation = _('additional_help_text');
            translation = translation ==='additional_help_text' ?
                'Alternatively you can take a photo using your webcam by clicking the "Take a photo" button.' :
                translation;
            forHelpText.html(forHelpText.html() + '<br />' + translation);
        }

        // old portrait img
        portrait = $('label[for=form\\.portrait]').nextAll('img');
        
        // canvas
        mediaWidth = overlay.width();
        mediaHeight = overlay.height()
        canvas = $('<canvas id="form.newphoto" width="' + mediaWidth +
                '" height="' + parseInt(mediaHeight/100*90) + '"></canvas>');
        canvas.prependTo(overlay);

        // video
        video = $('<video id="form.video"></video>');
        video.hide().insertAfter(canvas);
        
        // new button
        var newFieldContainer = $('<div class="widget"></div>')
        defaultUploadField.parent().after(newFieldContainer);
        newFieldContainer.append('<input type="button" id="form.takephoto" value="' +
                _('Take a photo') + '"/>');
        
        return $('#form\\.takephoto');
    }
    
    $(document).ready(function() {
        
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia;
        
        overlay = $('<div id="newPortrait" style="display:none">' +
                '<div style="text-align:center;"><button id="shot">' + 
                '<img style="display:none" alt="" src="' + portal_url + '/++resource++collective.takeaportrait.resources/web_camera.png" />' +
                '</button></div>' +
                '</div>').appendTo($('body'));
        doPhotoButton = $('#shot');
        doPhotoButton.click(doPhoto);
        overlay.css('width', parseInt($(document).width()/100*90)+'px');
        overlay.css('height', parseInt($( window ).height()/100*90)+'px');
        
        if ($('.template-personal-information #form\\.portrait').length>0 &&
                !!(navigator.getUserMedia) && Modernizr.canvas) {
            
            var button = init();
            if (button.length==0) {
                // something goes wrong
                return
            }
            button.click(function(event) {
               event.preventDefault();
               $('#newPortrait').overlay({
                    fixed: true,
                    top: 30,
                    mask: {loadSpeed: 200, opacity: 0.9},
                    closeOnClick: false
               });
               overlay.overlay().load();
               startVideo();
            });

        }
    });
})(jQuery);
