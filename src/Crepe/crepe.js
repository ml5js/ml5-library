crepe = (function() {
  // function error(message) {
  //   document.getElementById('status').innerHTML = 'Error: ' + message;
  //   return message;
  // }

  // function status(message) {
  //   document.getElementById('status').innerHTML = message;
  // }

  // a function that accepts the activation vector for each frame
  // const updateActivation = (function() {
  //   const inferno = [ // the 'inferno' colormap from matplotlib
  //     [  0,  0,  3,255], [  0,  0,  4,255], [  0,  0,  6,255], [  1,  0,  7,255], [  1,  1,  9,255], [  1,  1, 11,255], [  2,  1, 14,255], [  2,  2, 16,255],
  //     [  3,  2, 18,255], [  4,  3, 20,255], [  4,  3, 22,255], [  5,  4, 24,255], [  6,  4, 27,255], [  7,  5, 29,255], [  8,  6, 31,255], [  9,  6, 33,255],
  //     [ 10,  7, 35,255], [ 11,  7, 38,255], [ 13,  8, 40,255], [ 14,  8, 42,255], [ 15,  9, 45,255], [ 16,  9, 47,255], [ 18, 10, 50,255], [ 19, 10, 52,255],
  //     [ 20, 11, 54,255], [ 22, 11, 57,255], [ 23, 11, 59,255], [ 25, 11, 62,255], [ 26, 11, 64,255], [ 28, 12, 67,255], [ 29, 12, 69,255], [ 31, 12, 71,255],
  //     [ 32, 12, 74,255], [ 34, 11, 76,255], [ 36, 11, 78,255], [ 38, 11, 80,255], [ 39, 11, 82,255], [ 41, 11, 84,255], [ 43, 10, 86,255], [ 45, 10, 88,255],
  //     [ 46, 10, 90,255], [ 48, 10, 92,255], [ 50,  9, 93,255], [ 52,  9, 95,255], [ 53,  9, 96,255], [ 55,  9, 97,255], [ 57,  9, 98,255], [ 59,  9,100,255],
  //     [ 60,  9,101,255], [ 62,  9,102,255], [ 64,  9,102,255], [ 65,  9,103,255], [ 67, 10,104,255], [ 69, 10,105,255], [ 70, 10,105,255], [ 72, 11,106,255],
  //     [ 74, 11,106,255], [ 75, 12,107,255], [ 77, 12,107,255], [ 79, 13,108,255], [ 80, 13,108,255], [ 82, 14,108,255], [ 83, 14,109,255], [ 85, 15,109,255],
  //     [ 87, 15,109,255], [ 88, 16,109,255], [ 90, 17,109,255], [ 91, 17,110,255], [ 93, 18,110,255], [ 95, 18,110,255], [ 96, 19,110,255], [ 98, 20,110,255],
  //     [ 99, 20,110,255], [101, 21,110,255], [102, 21,110,255], [104, 22,110,255], [106, 23,110,255], [107, 23,110,255], [109, 24,110,255], [110, 24,110,255],
  //     [112, 25,110,255], [114, 25,109,255], [115, 26,109,255], [117, 27,109,255], [118, 27,109,255], [120, 28,109,255], [122, 28,109,255], [123, 29,108,255],
  //     [125, 29,108,255], [126, 30,108,255], [128, 31,107,255], [129, 31,107,255], [131, 32,107,255], [133, 32,106,255], [134, 33,106,255], [136, 33,106,255],
  //     [137, 34,105,255], [139, 34,105,255], [141, 35,105,255], [142, 36,104,255], [144, 36,104,255], [145, 37,103,255], [147, 37,103,255], [149, 38,102,255],
  //     [150, 38,102,255], [152, 39,101,255], [153, 40,100,255], [155, 40,100,255], [156, 41, 99,255], [158, 41, 99,255], [160, 42, 98,255], [161, 43, 97,255],
  //     [163, 43, 97,255], [164, 44, 96,255], [166, 44, 95,255], [167, 45, 95,255], [169, 46, 94,255], [171, 46, 93,255], [172, 47, 92,255], [174, 48, 91,255],
  //     [175, 49, 91,255], [177, 49, 90,255], [178, 50, 89,255], [180, 51, 88,255], [181, 51, 87,255], [183, 52, 86,255], [184, 53, 86,255], [186, 54, 85,255],
  //     [187, 55, 84,255], [189, 55, 83,255], [190, 56, 82,255], [191, 57, 81,255], [193, 58, 80,255], [194, 59, 79,255], [196, 60, 78,255], [197, 61, 77,255],
  //     [199, 62, 76,255], [200, 62, 75,255], [201, 63, 74,255], [203, 64, 73,255], [204, 65, 72,255], [205, 66, 71,255], [207, 68, 70,255], [208, 69, 68,255],
  //     [209, 70, 67,255], [210, 71, 66,255], [212, 72, 65,255], [213, 73, 64,255], [214, 74, 63,255], [215, 75, 62,255], [217, 77, 61,255], [218, 78, 59,255],
  //     [219, 79, 58,255], [220, 80, 57,255], [221, 82, 56,255], [222, 83, 55,255], [223, 84, 54,255], [224, 86, 52,255], [226, 87, 51,255], [227, 88, 50,255],
  //     [228, 90, 49,255], [229, 91, 48,255], [230, 92, 46,255], [230, 94, 45,255], [231, 95, 44,255], [232, 97, 43,255], [233, 98, 42,255], [234,100, 40,255],
  //     [235,101, 39,255], [236,103, 38,255], [237,104, 37,255], [237,106, 35,255], [238,108, 34,255], [239,109, 33,255], [240,111, 31,255], [240,112, 30,255],
  //     [241,114, 29,255], [242,116, 28,255], [242,117, 26,255], [243,119, 25,255], [243,121, 24,255], [244,122, 22,255], [245,124, 21,255], [245,126, 20,255],
  //     [246,128, 18,255], [246,129, 17,255], [247,131, 16,255], [247,133, 14,255], [248,135, 13,255], [248,136, 12,255], [248,138, 11,255], [249,140,  9,255],
  //     [249,142,  8,255], [249,144,  8,255], [250,145,  7,255], [250,147,  6,255], [250,149,  6,255], [250,151,  6,255], [251,153,  6,255], [251,155,  6,255],
  //     [251,157,  6,255], [251,158,  7,255], [251,160,  7,255], [251,162,  8,255], [251,164, 10,255], [251,166, 11,255], [251,168, 13,255], [251,170, 14,255],
  //     [251,172, 16,255], [251,174, 18,255], [251,176, 20,255], [251,177, 22,255], [251,179, 24,255], [251,181, 26,255], [251,183, 28,255], [251,185, 30,255],
  //     [250,187, 33,255], [250,189, 35,255], [250,191, 37,255], [250,193, 40,255], [249,195, 42,255], [249,197, 44,255], [249,199, 47,255], [248,201, 49,255],
  //     [248,203, 52,255], [248,205, 55,255], [247,207, 58,255], [247,209, 60,255], [246,211, 63,255], [246,213, 66,255], [245,215, 69,255], [245,217, 72,255],
  //     [244,219, 75,255], [244,220, 79,255], [243,222, 82,255], [243,224, 86,255], [243,226, 89,255], [242,228, 93,255], [242,230, 96,255], [241,232,100,255],
  //     [241,233,104,255], [241,235,108,255], [241,237,112,255], [241,238,116,255], [241,240,121,255], [241,242,125,255], [242,243,129,255], [242,244,133,255],
  //     [243,246,137,255], [244,247,141,255], [245,248,145,255], [246,250,149,255], [247,251,153,255], [249,252,157,255], [250,253,160,255], [252,254,164,255],
  //     [252,254,164,255]
  //   ];

  //   // store the array for
  //   for (var i = 0; i < inferno.length; i++) {
  //     array = new Uint8ClampedArray(4);
  //     array.set(inferno[i]);
  //     inferno[i] = array;
  //   }

  //   const canvas = document.getElementById('activation');
  //   const ctx = canvas.getContext('2d');
  //   const buffer = ctx.createImageData(canvas.width,canvas.height);
  //   var column = 0;

  //   return function(activation) {
  //     // render
  //     for (var i = 0; i < 360; i++) {
  //       value = Math.floor(activation[i] * 256.0);
  //       if (isNaN(value) || value < 0) value = 0;
  //       if (value > 256) value = 1;
  //       buffer.data.set(inferno[value], ((canvas.height - 1 - i) * canvas.width + column) * 4);
  //     }

  //     column = (column + 1) % canvas.width;
  //     ctx.putImageData(buffer, canvas.width - column, 0);
  //     ctx.putImageData(buffer, -column, 0);
  //   };
  // })();

  var audioContext;
  var running = false;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    document.getElementById('srate').innerHTML = audioContext.sampleRate;
  } catch (e) {
    error('Could not instantiate AudioContext: ' + e.message);
    throw e;
  }

  // perform resampling the audio to 16000 Hz, on which the model is trained.
  // setting a sample rate in AudioContext is not supported by most browsers at the moment.
  function resample(audioBuffer, onComplete) {
    const interpolate = (audioBuffer.sampleRate % 16000 != 0);
    const multiplier = audioBuffer.sampleRate / 16000;
    const original = audioBuffer.getChannelData(0);
    const subsamples = new Float32Array(1024);
    for (var i = 0; i < 1024; i++) {
      if (!interpolate) {
        subsamples[i] = original[i * multiplier];
      } else {
        // simplistic, linear resampling
        var left = Math.floor(i * multiplier);
        var right = left + 1;
        var p = i * multiplier - left;
        subsamples[i] = (1 - p) * original[left] + p * original[right];
      }
    }
    onComplete(subsamples);
  }

  // bin number -> cent value mapping
  const cent_mapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191))

  function process_microphone_buffer(event) {
    resample(event.inputBuffer, function(resampled) {
      tf.tidy(() => {
        running = true;

        // run the prediction on the model
        const frame = tf.tensor(resampled.slice(0, 1024));
        const zeromean = tf.sub(frame, tf.mean(frame));
        const framestd = tf.tensor(tf.norm(zeromean).dataSync()/Math.sqrt(1024));
        const normalized = tf.div(zeromean, framestd);
        const input = normalized.reshape([1, 1024]);
        const activation = model.predict([input]).reshape([360]);

        // the confidence of voicing activity and the argmax bin
        const confidence = activation.max().dataSync()[0];
        const center = activation.argMax().dataSync()[0];
        document.getElementById('voicing-confidence').innerHTML = confidence.toFixed(3);

        // slice the local neighborhood around the argmax bin
        const start = Math.max(0, center - 4);
        const end = Math.min(360, center + 5);
        const weights = activation.slice([start], [end - start]);
        const cents = cent_mapping.slice([start], [end - start]);

        // take the local weighted average to get the predicted pitch
        const products = tf.mul(weights, cents);
        const productSum = products.dataSync().reduce((a, b) => a + b, 0);
        const weightSum = weights.dataSync().reduce((a, b) => a + b, 0);
        const predicted_cent = productSum / weightSum;
        const predicted_hz = 10 * Math.pow(2, predicted_cent / 1200.0);

        // update the UI and the activation plot
        var result = (confidence > 0.5) ? predicted_hz.toFixed(3) + ' Hz' : '&nbsp;no voice&nbsp&nbsp;';
        var strlen = result.length;
        for (var i = 0; i < 11 - strlen; i++) result = "&nbsp;" + result;
        document.getElementById('estimated-pitch').innerHTML = result;
        updateActivation(activation.dataSync());
      });
    });
  }

  function initAudio() {
    if (!navigator.getUserMedia) {
      if (navigator.mediaDevices) {
        navigator.getUserMedia = navigator.mediaDevices.getUserMedia;
      } else {
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      }
    }
    if (navigator.getUserMedia) {
      status('Initializing audio...')
      navigator.getUserMedia({audio: true}, function(stream) {
        status('Setting up AudioContext ...');
        console.log('Audio context sample rate = ' + audioContext.sampleRate);
        const mic = audioContext.createMediaStreamSource(stream);

        // We need the buffer size that is a power of two and is longer than 1024 samples when resampled to 16000 Hz.
        // In most platforms where the sample rate is 44.1 kHz or 48 kHz, this will be 4096, giving 10-12 updates/sec.
        const minBufferSize = audioContext.sampleRate / 16000 * 1024;
        for (var bufferSize = 4; bufferSize < minBufferSize; bufferSize *= 2);
        console.log('Buffer size = ' + bufferSize);
        const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
        scriptNode.onaudioprocess = process_microphone_buffer;

        // It seems necessary to connect the stream to a sink for the pipeline to work, contrary to documentataions.
        // As a workaround, here we create a gain node with zero gain, and connect temp to the system audio output.
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, audioContext.currentTime);

        mic.connect(scriptNode);
        scriptNode.connect(gain);
        gain.connect(audioContext.destination);

        if (audioContext.state === 'running') {
          status('Running ...');
        } else {
          // user gesture (like click) is required to start AudioContext, in some browser versions
          status('<a href="javascript:crepe.resume();" style="color:red;">* Click here to start the demo *</a>')
        }
      }, function(message) {
        error('Could not access microphone - ' + message);
      });
    } else error('Could not access microphone - getUserMedia not available');
  }

  async function initTF() {
    try {
      status('Loading Keras model...');
      window.model = await tf.loadModel('model/model.json');
      status('Model loading complete');
    } catch (e) {
      throw error(e);
    }
    initAudio();
  }

  initTF();

  return {
    'audioContext': audioContext,
    'resume': function() {
      audioContext.resume();
      status('Running ...');
    }
  }
})();