// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


/**
 * a list to store all functions to hook p5 preload
 * @param {obj} object or prototype to wrap with
 * @returns obj
 */
export default function registerPreload(obj) {
  if (typeof window === 'undefined') return obj;
  if (typeof window.p5 === 'undefined') return obj;
  if (typeof window.p5.prototype === 'undefined') return obj;
  if (typeof window.p5.prototype.registerPreloadMethod === 'undefined') return obj;

  const preloadFn = obj;
  Object.keys(obj).forEach((key) => {
    const fn = obj[key];

    preloadFn[key] = function preloads(...args) {
      let originCallback = null;
      let argLen = args.length;
      if (typeof args[argLen - 1] === 'function') {
        // find callback function attached
        originCallback = args[argLen - 1];
        argLen -= 1;
      }
      return fn.apply(obj, [...args.slice(0, argLen), function doingPreloads() {
        const targetPreloadFn = '_decrementPreload';
        try {
          if (originCallback) originCallback();
        } catch (err) {
          console.error(err);
        }
        if (window[targetPreloadFn]) return window[targetPreloadFn]();
        return null;
      }]);
    };
    window.p5.prototype.registerPreloadMethod(`${key}`, obj);
  });

  return obj;
}
