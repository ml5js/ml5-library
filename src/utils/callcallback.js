// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default function callCallback(promise, callback) {
  return callback ? promise.then((result) => {
    callback(undefined, result);
  }, (error) => {
    callback(error);
  }) : promise;
}
