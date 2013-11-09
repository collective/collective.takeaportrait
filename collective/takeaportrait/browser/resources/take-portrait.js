(function($) {

    var canvas = null, portrait = null, video = null, overlay = null,
        doPhotoButton = null, redoButton = null, savePhotoButton = null,
        savedImageData = null,
        mediaWidth = mediaHeight = 0,
        savedImageX = 0, savedImageY = 0, savedImageWidth = 0, savedImageHeight = 0,
        lineThick = 4,
        videoStarted = false;
    
    /**
     * Store photo in memory
     */
    function doPhoto(event) {
        event.preventDefault();
        doPhotoButton.hide();
        savePhotoButton.show();
        redoButton.show();
        var canvasElement = canvas.get(0);
        var context = canvasElement.getContext('2d');
        savedImageData = context.getImageData(mediaWidth/2-savedImageWidth/2, 0+lineThick,
                                              savedImageWidth, savedImageHeight);
    }

    /**
     * Draw guides lines for photo capture
     */
    function drawViewfinder() {
        var context = canvas.get(0).getContext('2d');
        savedImageHeight = canvas.height() - 2 * lineThick;
        savedImageWidth = parseInt(savedImageHeight*75/100);
        savedImageX = mediaWidth/2-savedImageWidth/2;
        savedImageY = 0 + lineThick;
        context.beginPath();
        context.lineWidth = lineThick;
        context.strokeStyle = '#74DF00';
        context.moveTo(mediaWidth/2-savedImageWidth/2-lineThick/2, 0);
        context.lineTo(mediaWidth/2-savedImageWidth/2-lineThick/2, savedImageHeight+lineThick*3/2);
        context.lineTo(mediaWidth/2+savedImageWidth/2+lineThick/2, savedImageHeight+lineThick*3/2);
        context.lineTo(mediaWidth/2+savedImageWidth/2+lineThick/2, lineThick/2);
        context.lineTo(mediaWidth/2-savedImageWidth/2-lineThick/2, lineThick/2);
        context.stroke();
            
    }

    /**
     * Draw preview of saved photo on the running video
     */
    function drawSavedPhoto() {
        var context = canvas.get(0).getContext('2d');
        context.putImageData(savedImageData, savedImageX, savedImageY)
    }

    function startVideo() {
        if (videoStarted) {
            // video already inited
            return;
        }
        videoStarted = true;
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
                        // test below seems weird, but anything else really worked
                        if (videoElement.videoWidth>0) {
                            context.drawImage(videoElement, 0, 0, mediaWidth, mediaHeight);
                            drawViewfinder();
                            if (savedImageData !== null) {
                                drawSavedPhoto();
                            }
                        }
                    }
                    doPhotoButton.show();
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
    
    /**
     * Perform an AJAX request to the server for storing image
     */
    function updatePortrait(event) {
        event.preventDefault();
        var tmpCanvas = $('<canvas width="' + savedImageData.width + 
                '" height="' + savedImageData.height + '""></canvas>').get(0);
        var context = tmpCanvas.getContext('2d');
        context.putImageData(savedImageData, 0, 0);
        
        $.ajax(portal_url + "/@@updateMyPortrait", {
            type: 'POST',
            dataType: 'text',
            data: {image: tmpCanvas.toDataURL('image/jpeg', 1.0)},
            success: function(data, jqXHR, textStatus) {
                if (data==='DONE') {
                    alert(123)
                }
            }
        })
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
                '<div style="text-align:center;">' +
                '<button id="shot" style="display:none">' + 
                '<img alt="" src="' + portal_url + '/++resource++collective.takeaportrait.resources/web_camera.png" />' +
                '</button>' +
                '<button id="redoPhoto" style="display:none">' + 
                '<img alt="" src="' + portal_url + '/++resource++collective.takeaportrait.resources/repeat.png" />' +
                '</button>' +
                '<button id="savePhoto" style="display:none">' + 
                '<img alt="" src="' + portal_url + '/++resource++collective.takeaportrait.resources/ok.png" />' +
                '</button>' +
                '</div>' +
                '</div>').appendTo($('body'));

        doPhotoButton = $('#shot');
        redoButton = $('#redoPhoto');
        savePhotoButton = $('#savePhoto');
        doPhotoButton.click(doPhoto);
        redoButton.click(function(event) {
            event.preventDefault();
            redoButton.hide();
            savePhotoButton.hide();
            doPhotoButton.show();
            savedImageData = null;
        })
        savePhotoButton.click(updatePortrait);
        
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
