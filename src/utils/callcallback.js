// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


/**
 * Most ml5 methods accept a callback function which will be
 * called with the arguments (error, result).
 *
 * Generic type T describes the type of the result.
 * @template T
 * @callback ML5Callback<T>
 * @param {unknown} error - any error thrown during the execution of the function.
 * @param {T} [result] - the expected result, if successful.
 * @return {void} - callbacks can have side effects, but should not return a value.
 */

/**
 * Generic type T describes the type of the result, ie. the value that the Promise will resolve to.
 * @template T
 * @param {Promise<T>} promise - the Promise to resolve.
 * @param {ML5Callback<T>} [callback] - optional callback function to be called
 *     with the result or error from the resolved Promise.
 * @return {Promise<T>} - returns the underlying Promise, which may be rejected.
 */
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
