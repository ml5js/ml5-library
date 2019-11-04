function isAbsoluteURL(str) {
    const pattern = new RegExp('^(?:[a-z]+:)?//', 'i');
    return !!pattern.test(str);
}

function getModelPath(absoluteOrRelativeUrl) {
    const modelJsonPath = isAbsoluteURL(absoluteOrRelativeUrl) ? absoluteOrRelativeUrl : window.location.pathname + absoluteOrRelativeUrl
    return modelJsonPath;
}

export default {
    isAbsoluteURL,
    getModelPath
}