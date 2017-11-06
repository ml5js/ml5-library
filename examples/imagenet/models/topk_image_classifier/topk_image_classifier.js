"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../../src");
var squeezenet_1 = require("../squeezenet/squeezenet");
var TopKImageClassifier = (function () {
    function TopKImageClassifier(numClasses, k, math) {
        this.numClasses = numClasses;
        this.k = k;
        this.math = math;
        this.classLogitsMatrices = [];
        this.classExampleCount = [];
        this.varsLoaded = false;
        this.mathCPU = new src_1.NDArrayMathCPU();
        for (var i = 0; i < this.numClasses; i++) {
            this.classLogitsMatrices.push(null);
            this.classExampleCount.push(0);
        }
        this.squeezeNet = new squeezenet_1.SqueezeNet(this.math);
    }
    TopKImageClassifier.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.squeezeNet.load()];
                    case 1:
                        _a.sent();
                        this.varsLoaded = true;
                        return [2];
                }
            });
        });
    };
    TopKImageClassifier.prototype.clearClass = function (classIndex) {
        if (classIndex >= this.numClasses) {
            console.log('Cannot clear invalid class ${classIndex}');
            return;
        }
        this.classLogitsMatrices[classIndex] = null;
        this.classExampleCount[classIndex] = 0;
        this.clearTrainLogitsMatrix();
    };
    TopKImageClassifier.prototype.addImage = function (image, classIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.varsLoaded) {
                            console.warn('Cannot add images until vars have been loaded.');
                            return [2];
                        }
                        if (classIndex >= this.numClasses) {
                            console.warn('Cannot add to invalid class ${classIndex}');
                        }
                        this.clearTrainLogitsMatrix();
                        return [4, this.math.scope(function (keep, track) { return __awaiter(_this, void 0, void 0, function () {
                                var predResults, imageLogits, logitsSize, newTrainLogitsMatrix;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, this.squeezeNet.predict(image)];
                                        case 1:
                                            predResults = _a.sent();
                                            imageLogits = this.normalizeVector(predResults.logits);
                                            logitsSize = imageLogits.shape[0];
                                            if (this.classLogitsMatrices[classIndex] == null) {
                                                this.classLogitsMatrices[classIndex] = imageLogits.as2D(1, logitsSize);
                                            }
                                            else {
                                                newTrainLogitsMatrix = this.math.concat2D(this.classLogitsMatrices[classIndex].as2D(this.classExampleCount[classIndex], logitsSize), imageLogits.as2D(1, logitsSize), 0);
                                                this.classLogitsMatrices[classIndex].dispose();
                                                this.classLogitsMatrices[classIndex] = newTrainLogitsMatrix;
                                            }
                                            keep(this.classLogitsMatrices[classIndex]);
                                            this.classExampleCount[classIndex]++;
                                            return [2];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    TopKImageClassifier.prototype.predict = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var imageClass, confidences, topKIndices, indices, indicesForClasses, topKCountsForClasses, i, num, i, classForEntry, topConfidence, kVal, i, probability;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        imageClass = -1;
                        confidences = new Array(this.numClasses);
                        if (!this.varsLoaded) {
                            console.warn('Cannot predict until vars have been loaded.');
                            return [2, { classIndex: imageClass, confidences: confidences }];
                        }
                        return [4, this.math.scope(function (keep) { return __awaiter(_this, void 0, void 0, function () {
                                var predResults, imageLogits, logitsSize, newTrainLogitsMatrix, i, numExamples, knn, kVal, topK;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, this.squeezeNet.predict(image)];
                                        case 1:
                                            predResults = _a.sent();
                                            imageLogits = this.normalizeVector(predResults.logits);
                                            logitsSize = imageLogits.shape[0];
                                            if (this.trainLogitsMatrix == null) {
                                                newTrainLogitsMatrix = null;
                                                for (i = 0; i < this.numClasses; i++) {
                                                    newTrainLogitsMatrix = this.concatWithNulls(newTrainLogitsMatrix, this.classLogitsMatrices[i]);
                                                }
                                                this.trainLogitsMatrix = newTrainLogitsMatrix;
                                            }
                                            if (this.trainLogitsMatrix == null) {
                                                console.warn('Cannot predict without providing training images.');
                                                return [2, null];
                                            }
                                            keep(this.trainLogitsMatrix);
                                            numExamples = this.getNumExamples();
                                            knn = this.math
                                                .matMul(this.trainLogitsMatrix.as2D(numExamples, logitsSize), imageLogits.as2D(logitsSize, 1))
                                                .as1D();
                                            return [4, knn.data()];
                                        case 2:
                                            _a.sent();
                                            kVal = Math.min(this.k, numExamples);
                                            topK = this.mathCPU.topK(knn, kVal);
                                            return [2, topK.indices];
                                    }
                                });
                            }); })];
                    case 1:
                        topKIndices = _a.sent();
                        if (topKIndices == null) {
                            return [2, { classIndex: imageClass, confidences: confidences }];
                        }
                        indices = topKIndices.dataSync();
                        indicesForClasses = [];
                        topKCountsForClasses = [];
                        for (i = 0; i < this.numClasses; i++) {
                            topKCountsForClasses.push(0);
                            num = this.classExampleCount[i];
                            if (i > 0) {
                                num += indicesForClasses[i - 1];
                            }
                            indicesForClasses.push(num);
                        }
                        for (i = 0; i < indices.length; i++) {
                            for (classForEntry = 0; classForEntry < indicesForClasses.length; classForEntry++) {
                                if (indices[i] < indicesForClasses[classForEntry]) {
                                    topKCountsForClasses[classForEntry]++;
                                    break;
                                }
                            }
                        }
                        topConfidence = 0;
                        kVal = Math.min(this.k, this.getNumExamples());
                        for (i = 0; i < this.numClasses; i++) {
                            probability = topKCountsForClasses[i] / kVal;
                            if (probability > topConfidence) {
                                topConfidence = probability;
                                imageClass = i;
                            }
                            confidences[i] = probability;
                        }
                        return [2, { classIndex: imageClass, confidences: confidences }];
                }
            });
        });
    };
    TopKImageClassifier.prototype.getClassExampleCount = function () {
        return this.classExampleCount;
    };
    TopKImageClassifier.prototype.clearTrainLogitsMatrix = function () {
        if (this.trainLogitsMatrix != null) {
            this.trainLogitsMatrix.dispose();
            this.trainLogitsMatrix = null;
        }
    };
    TopKImageClassifier.prototype.concatWithNulls = function (ndarray1, ndarray2) {
        if (ndarray1 == null && ndarray2 == null) {
            return null;
        }
        if (ndarray1 == null) {
            return this.math.clone(ndarray2);
        }
        else if (ndarray2 === null) {
            return this.math.clone(ndarray1);
        }
        return this.math.concat2D(ndarray1, ndarray2, 0);
    };
    TopKImageClassifier.prototype.normalizeVector = function (vec) {
        var squared = this.math.multiplyStrict(vec, vec);
        var sum = this.math.sum(squared);
        var sqrtSum = this.math.sqrt(sum);
        return this.math.divide(vec, sqrtSum);
    };
    TopKImageClassifier.prototype.getNumExamples = function () {
        var total = 0;
        for (var i = 0; i < this.classExampleCount.length; i++) {
            total += this.classExampleCount[i];
        }
        return total;
    };
    TopKImageClassifier.prototype.dispose = function () {
        this.squeezeNet.dispose();
        this.clearTrainLogitsMatrix();
        this.classLogitsMatrices.forEach(function (classLogitsMatrix) { return classLogitsMatrix.dispose(); });
    };
    return TopKImageClassifier;
}());
exports.TopKImageClassifier = TopKImageClassifier;
//# sourceMappingURL=topk_image_classifier.js.map