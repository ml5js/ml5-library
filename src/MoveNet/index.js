class MoveNet{
    constructor(video, options,callback){
        poseDetection.createDetector(poseDetection.SupportedModels.MoveNet,options)
            .then((model) => {
                this.net = model;
                this.video = video;
                callback(null);
            })
            .catch((error) => {
                callback(error);
            });
    }
    async pose(){
        return new Promise((resolve, reject) => {
            try{
                const poses = await detector.estimatePoses(this.video);
            }catch(err){
                reject(err);
                return;
            }
            resolve(poses);
        });
    }
}
const moveNet = (videoOrOptionsOrCallback, optionsOrCallback, cb) => {
  let video;
  let options = {};
  let callback = cb;

  if (videoOrOptionsOrCallback instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'object' && videoOrOptionsOrCallback.elt instanceof HTMLVideoElement) {
    video = videoOrOptionsOrCallback.elt; // Handle a p5.js video element
  } else if (typeof videoOrOptionsOrCallback === 'object') {
    options = videoOrOptionsOrCallback;
  } else if (typeof videoOrOptionsOrCallback === 'function') {
    callback = videoOrOptionsOrCallback;
  }

  if (typeof optionsOrCallback === 'object') {
    options = optionsOrCallback;
  } else if (typeof optionsOrCallback === 'string') {
    detectionType = optionsOrCallback;
  }
  
  if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback;
  } 

  return new MoveNet(video, options, callback);
};

export default moveNet;
