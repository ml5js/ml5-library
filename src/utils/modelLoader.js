/**
 * Check if the provided URL string starts with a hostname,
 * such as http://, https://, etc.
 * @param {string} str
 * @returns {boolean}
 */
function isAbsoluteURL(str) {
  const pattern = new RegExp('^(?:[a-z]+:)?//', 'i');
  return pattern.test(str);
}

/**
 * Accepts a URL that may be a complete URL, or a relative location.
 * Returns an absolute URL based on the current window location.
 * @param {string} absoluteOrRelativeUrl
 * @returns {string}
 */
function getModelPath(absoluteOrRelativeUrl) {
  if (!isAbsoluteURL(absoluteOrRelativeUrl) && typeof window !== 'undefined') {
    return window.location.pathname + absoluteOrRelativeUrl;
  }
  return absoluteOrRelativeUrl;
}

export default {
  isAbsoluteURL,
  getModelPath
}
