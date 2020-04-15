let cartoonGan;
let video;
let videoSize;

function preload(){
}

function setup(){
    cartoonGan = ml5.cartoon(
      // NOTE: to use local model,
      // - copy the model files from the local model example
      // - uncomment the following to load local model
      //
      // "./model/model.json",
      modelLoaded)
}

function modelLoaded(){
    // load up video capture and wait until we have some
    video = createCapture(
      // define our own constraints, rather than using default VIDEO
      {
        audio: false,
        video: {
          mandatory: {
            minWidth: 160,
            minHeight: 90,
            maxWidth: 640,
            maxHeight: 480
          },
/*
          // the following prevents selection of some virtual cameras...

            maxWidth: 320,
            maxHeight: 240
          },
          optional: [{
            facingMode: "user" //or "environment"
          }, 
          {
            maxFrameRate: 15 
          }]
*/
        }
      }
    );
    video.elt.onloadeddata = (ev) => {
      // remember the actual video size
      videoSize = {width: video.elt.videoWidth, height: video.elt.videoHeight};

      // NOTE: uncomment if you want, but frame rate won't improve
      // // half size display
      // videoSize = {width: videoSize.width / 2, height: videoSize.height / 2};
      // video.size(videoSize.width, videoSize.height);

      // make the video and canvas the same size
      createCanvas(videoSize.width, videoSize.height);

      // start up result generation
      cartoonGan.generate(video, gotResults)
      .then((data) => {
        // we've started
        console.log('started up');
      });
    };

    // hide the video element so we only see the transformed output
    video.hide();
}

function gotResults(err, result){
    if(err){
        console.error(err);
        return;
    }

    // render this result
    image(result.image, 0,0, videoSize.width, videoSize.height);

    // kick off the next one
    cartoonGan.generate(video, gotResults)
}

