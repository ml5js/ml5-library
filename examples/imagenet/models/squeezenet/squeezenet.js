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
//Object.defineProperty(exports, "__esModule", { value: true });
//var src_1 = require("../../src");
var GOOGLE_CLOUD_STORAGE_DIR = 'https://storage.googleapis.com/learnjs-data/checkpoint_zoo/';
var SqueezeNet = (function () {
    function SqueezeNet(math) {
        this.math = math;
        this.preprocessOffset = deeplearn.Array1D.new([103.939, 116.779, 123.68]);
    }
    SqueezeNet.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var checkpointLoader, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checkpointLoader = new deeplearn.CheckpointLoader(GOOGLE_CLOUD_STORAGE_DIR + 'squeezenet1_1/');
                        _a = this;
                        return [4, checkpointLoader.getAllVariables()];
                    case 1:
                        _a.variables = _b.sent();
                        return [2];
                }
            });
        });
    };
    SqueezeNet.prototype.predict = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var namedActivations, avgpool10, layerNames;
            return __generator(this, function (_a) {
                namedActivations = {};
                avgpool10 = this.math.scope(function (keep) {
                    var preprocessedInput = _this.math.subtract(input, _this.preprocessOffset);
                    var conv1 = _this.math.conv2d(preprocessedInput, _this.variables['conv1_W:0'], _this.variables['conv1_b:0'], 2, 0);
                    var conv1relu = keep(_this.math.relu(conv1));
                    namedActivations['conv_1'] = conv1relu;
                    var pool1 = keep(_this.math.maxPool(conv1relu, 3, 2, 0));
                    namedActivations['maxpool_1'] = pool1;
                    var fire2 = keep(_this.fireModule(pool1, 2));
                    namedActivations['fire2'] = fire2;
                    var fire3 = keep(_this.fireModule(fire2, 3));
                    namedActivations['fire3'] = fire3;
                    var pool2 = keep(_this.math.maxPool(fire3, 3, 2, 'valid'));
                    namedActivations['maxpool_2'] = pool2;
                    var fire4 = keep(_this.fireModule(pool2, 4));
                    namedActivations['fire4'] = fire4;
                    var fire5 = keep(_this.fireModule(fire4, 5));
                    namedActivations['fire5'] = fire5;
                    var pool3 = keep(_this.math.maxPool(fire5, 3, 2, 0));
                    namedActivations['maxpool_3'] = pool3;
                    var fire6 = keep(_this.fireModule(pool3, 6));
                    namedActivations['fire6'] = fire6;
                    var fire7 = keep(_this.fireModule(fire6, 7));
                    namedActivations['fire7'] = fire7;
                    var fire8 = keep(_this.fireModule(fire7, 8));
                    namedActivations['fire8'] = fire8;
                    var fire9 = keep(_this.fireModule(fire8, 9));
                    namedActivations['fire9'] = fire9;
                    var conv10 = keep(_this.math.conv2d(fire9, _this.variables['conv10_W:0'], _this.variables['conv10_b:0'], 1, 0));
                    namedActivations['conv10'] = conv10;
                    return _this.math.avgPool(conv10, conv10.shape[0], 1, 0).as1D();
                });
                layerNames = Object.keys(namedActivations);
                layerNames.forEach(function (layerName) { return _this.math.track(namedActivations[layerName]); });
                return [2, { namedActivations: namedActivations, logits: avgpool10 }];
            });
        });
    };
    SqueezeNet.prototype.fireModule = function (input, fireId) {
        var y1 = this.math.conv2d(input, this.variables["fire" + fireId + "/squeeze1x1_W:0"], this.variables["fire" + fireId + "/squeeze1x1_b:0"], 1, 0);
        var y2 = this.math.relu(y1);
        var left1 = this.math.conv2d(y2, this.variables["fire" + fireId + "/expand1x1_W:0"], this.variables["fire" + fireId + "/expand1x1_b:0"], 1, 0);
        var left2 = this.math.relu(left1);
        var right1 = this.math.conv2d(y2, this.variables["fire" + fireId + "/expand3x3_W:0"], this.variables["fire" + fireId + "/expand3x3_b:0"], 1, 1);
        var right2 = this.math.relu(right1);
        return this.math.concat3D(left2, right2, 2);
    };
    SqueezeNet.prototype.dispose = function () {
        this.preprocessOffset.dispose();
        for (var varName in this.variables) {
            this.variables[varName].dispose();
        }
    };
    return SqueezeNet;
}());
//exports.SqueezeNet = SqueezeNet;
//# sourceMappingURL=squeezenet.js.map
