$(function() {

  if ($('textarea#ta').length) {
    CKEDITOR.replace('ta');
  }

  $('a.confirmDeletion').on('click', function() {
    if (!confirm('Confirm deletion'))
      return false;
  });

  $('#startInterview').on('click', function() {
    if (!confirm('Are you ready for video interview?'))
      return false;

    $('#interviwer_name').attr('disabled', true);
    $("#startInterview").hide();

    $('.recordVideo').html('<div class="row"><div class="col-md-6"><video id="gum" autoplay muted></video></div><div class="col-md-6"><div class="botui-app-container" id="api-bot"><bot-ui></bot-ui></div></div></div>');

    'use strict';

    /* globals MediaRecorder */

    const mediaSource = new MediaSource();
    mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
    let mediaRecorder;
    let recordedBlobs;
    let sourceBuffer;
    let subtitleText;

    const constraints = {
      audio: true,
      video: true
    };

    function handleError(error) {
      console.log('navigator.getUserMedia error: ', error);
    }

    function handleSuccess(stream) {
      //recordButton.disabled = false;
      console.log('getUserMedia() got stream: ', stream);
      window.stream = stream;

      const gumVideo = document.querySelector('video#gum');
      gumVideo.srcObject = stream;
      startRecording();
      initBotUI();
    }

    navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);




    /* const recordButton = document.querySelector('button#record');
    recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        //playButton.disabled = false;
        downloadButton.disabled = false;
    }
    }); */



    /* const downloadButton = document.querySelector('button#download');
    downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
    }); */

    // window.isSecureContext could be used for Chrome
    let isSecureOrigin = location.protocol === 'https:' || location.hostname === 'localhost';
    if (!isSecureOrigin) {
      alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.\n\nChanging protocol to HTTPS');
      location.protocol = 'HTTPS';
    }



    function handleSourceOpen(event) {
      console.log('MediaSource opened');
      sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
      console.log('Source buffer: ', sourceBuffer);
    }

    function handleDataAvailable(event) {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    }

    function handleStop(event) {
      console.log('Recorder stopped: ', event);
    }

    function startRecording() {
      recordedBlobs = [];
      subtitleText = '';
      let options = {
        mimeType: 'video/webm;codecs=vp9'
      };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {
          mimeType: 'video/webm;codecs=vp8'
        };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.log(options.mimeType + ' is not Supported');
          options = {
            mimeType: 'video/webm'
          };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {
              mimeType: ''
            };
          }
        }
      }
      try {
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e) {
        console.error(`Exception while creating MediaRecorder: ${e}`);
        alert(`Exception while creating MediaRecorder: ${e}. mimeType: ${options.mimeType}`);
        return;
      }
      console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
      //recordButton.textContent = 'Stop Recording';

      //downloadButton.disabled = true;
      mediaRecorder.onstop = handleStop;
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(10); // collect 10ms of data
      console.log('MediaRecorder started', mediaRecorder);
    }

    function stopRecording() {

      mediaRecorder.stop();
      const blob = new Blob(recordedBlobs, {
        type: 'video/webm'
      });


      // converts blob to base64
      var blobToBase64 = function(blob, cb) {
        var reader = new FileReader();
        reader.onload = function() {
          var dataUrl = reader.result;
          var base64 = dataUrl.split(',')[1];
          cb(base64);
        };
        reader.readAsDataURL(blob);
      };

      blobToBase64(blob, function(base64) { // encode
        var id = $('#id').val();
        var subText = subtitleText;
        var update = {
          'blob': base64,
          'id': id,
          'subText': subText
        };

        $.ajax({
          type: 'POST',
          url: '/interviews/savevideo',
          data: update

        }).done(function(data) {
          // print the output from the upload.php script
          $(location).attr('href', '/thankyou');
        });
      });
    }

    function texttovoice(voiceText) {
      var startSpeechTime = new Date().getTime();
      var endSpeechTime = 0;
      var text = voiceText;
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      var interviewerName = $('#interviwer_name').val();
      msg.voice = voices[$('#voices').val()];
      msg.rate = 1;
      msg.pitch = 1;
      msg.text = text;

      speechSynthesis.speak(msg);

      msg.onend = function(e) {
        endSpeechTime = new Date().getTime();
      };

      return endSpeechTime - startSpeechTime;
    }

    function convertWebVttFormat(inputTime) {
      var distance = inputTime;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = ("0" + Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).slice(-2);
      var minutes = ("0" + Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).slice(-2);
      var seconds = ("0" + Math.floor((distance % (1000 * 60)) / 1000)).slice(-2);
      var miliseconds = ("00" + Math.floor((distance % (1000)))).slice(-3);

      // Output the result in an element with id="demo"
      finalCounter = hours + ":" +
        minutes + ":" + seconds + "." + miliseconds;
      return finalCounter;
    }

    function initBotUI() {
      var botui = new BotUI('api-bot');
      var socket = io.connect('http://localhost:65080/');
      var interviewerName = $('#interviwer_name').val();
      var count = 1;
      var totalquestion = 4;
      var startInterviewTime = new Date().getTime();
      var statQuestionTime = new Date().getTime();
      var endQuestionTime = new Date().getTime();
      var questionText = '';
      var subTitleCounter = 1;



      var welcomeText = 'Hey ' + interviewerName + '. Welcome to virtual interview Room, Click start when you ready for the interview.';

      botui.message.add({
        /* human: true, */
        content: welcomeText,
        delay: 100,
      }).then(function() {
        texttovoice(welcomeText);
        botui.action.button({
          action: [{ // show only one button
            text: 'Start',
            value: 'start'
          }]
        }).then(function(res) {

          endQuestionTime = new Date().getTime();
          subtitleText = subtitleText + "WEBVTT FILE\n\n" + subTitleCounter + "\n" + convertWebVttFormat(statQuestionTime - startInterviewTime) + " --> " + convertWebVttFormat(endQuestionTime - startInterviewTime) + " D:vertical A:start\n" + interviewerName + "\n";
          subTitleCounter++;
          socket.emit('fromClient', {
            client: res.value
          }); // sends the message typed to server
          //texttovoice(res.value);

        }).then(
          function() {
            socket.on('fromServer', function(data) { // recieveing a reply from server.

              statQuestionTime = new Date().getTime();
              texttovoice(data.server);
              questionText = data.server;
              if (data.server == "Thank you we will get back to you soon.") {
                setTimeout(stopRecording(), 1000);

              } else {
                botui.message.add({
                  content: data.server,
                  delay: 100,
                }).then(function(res) {
                  if (totalquestion == count) {
                    botui.action.button({
                      action: [{ // show only one button
                        text: 'Click to finish',
                        value: 'finish'
                      }]
                    }).then(function(res) {
                      endQuestionTime = new Date().getTime();
                      subtitleText = subtitleText + "\n" + subTitleCounter + "\n" + convertWebVttFormat(statQuestionTime - startInterviewTime) + " --> " + convertWebVttFormat(endQuestionTime - startInterviewTime) + " \n" + questionText + "\n";
                      subTitleCounter++;
                      socket.emit('fromClient', {
                        client: res.value
                      }); // sends the message typed to server
                      //texttovoice(res.value);
                      count++;
                    });
                  } else {
                    botui.action.button({
                      action: [{ // show only one button
                        text: 'Once you finish click here for next question',
                        value: 'question-' + count
                      }]
                    }).then(function(res) {
                      endQuestionTime = new Date().getTime();
                      subtitleText = subtitleText + "\n" + subTitleCounter + "\n" + convertWebVttFormat(statQuestionTime - startInterviewTime) + " --> " + convertWebVttFormat(endQuestionTime - startInterviewTime) + " \n" + questionText + "\n";
                      subTitleCounter++;
                      socket.emit('fromClient', {
                        client: res.value
                      }); // sends the message typed to server
                      //texttovoice(res.value);
                      count++;
                    });
                  }

                })
              }


            });
          })
      });
    }


  });

  if ($("[data-fancybox]").length) {
    $("[data-fancybox]").fancybox();
  }

});