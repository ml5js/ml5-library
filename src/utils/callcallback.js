export default function callCallback(promise, callback) {
  return callback ? promise.then((result) => {
    callback(undefined, result);
  }, (error) => {
    callback(error);
  }) : promise;
}
