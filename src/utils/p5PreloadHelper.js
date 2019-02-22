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
      return fn.apply(obj, [...args, function doingPreloads() {
        const targetPreloadFn = '_decrementPreload';
        if (window[targetPreloadFn]) return window[targetPreloadFn]();
        return null;
      }]);
    };
    window.p5.prototype.registerPreloadMethod(`${key}`, obj);
  });

  return obj;
}
