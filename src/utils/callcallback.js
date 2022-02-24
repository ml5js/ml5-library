// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export default function callCallback(promise, callback) {
  if (!callback) return promise;
  return new Promise((resolve, reject) => {
    promise
      .then((result) => {
        callback(undefined, result);
        resolve(result);
      })
      .catch((error) => {
        callback(error);
        reject(error);
      });
  });
}
