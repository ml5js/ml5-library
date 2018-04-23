"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.__esModule = true;
/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
// Use custom CheckpointLoader until quantization is added to tf.
var core_1 = require("@magenta/core");
var util_1 = require("util");
/**
 * A class for keeping track of the parameters of an affine transformation.
 *
 * @param kernel A 2-dimensional tensor with the kernel parameters.
 * @param bias A 1-dimensional tensor with the bias parameters.
 */
var LayerVars = /** @class */ (function () {
    function LayerVars(kernel, bias) {
        if (util_1.isNullOrUndefined(kernel)) {
            throw Error('`kernel` is undefined.');
        }
        if (util_1.isNullOrUndefined(bias)) {
            throw Error('`bias` is undefined.');
        }
        this.kernel = kernel;
        this.bias = bias;
    }
    return LayerVars;
}());
exports.LayerVars = LayerVars;
/**
 * Helper function to compute an affine transformation.
 *
 * @param vars `LayerVars` containing the `kernel` and `bias` of the
 * transformation.
 * @param inputs A batch of input vectors to transform.
 */
function dense(vars, inputs) {
    return inputs.matMul(vars.kernel).add(vars.bias);
}
/**
 * Abstract Encoder class.
 */
var Encoder = /** @class */ (function () {
    function Encoder() {
    }
    return Encoder;
}());
exports.Encoder = Encoder;
/**
 * A single-layer bidirectional LSTM encoder.
 */
var BidirectonalLstmEncoder = /** @class */ (function (_super) {
    __extends(BidirectonalLstmEncoder, _super);
    /**
     * `BidirectonalLstmEncoder` contructor.
     *
     * @param lstmFwVars The forward LSTM `LayerVars`.
     * @param lstmBwVars The backward LSTM `LayerVars`.
     * @param muVars (Optional) The `LayerVars` for projecting from the final
     * states of the bidirectional LSTM to the mean `mu` of the random variable,
     * `z`. The final states are returned directly if not provided.
     */
    function BidirectonalLstmEncoder(lstmFwVars, lstmBwVars, muVars) {
        var _this = _super.call(this) || this;
        _this.lstmFwVars = lstmFwVars;
        _this.lstmBwVars = lstmBwVars;
        _this.muVars = muVars;
        _this.zDims = muVars ? _this.muVars.bias.shape[0] : null;
        return _this;
    }
    /**
     * Encodes a batch of sequences.
     * @param sequence The batch of sequences to be encoded.
     * @returns A batch of concatenated final LSTM states, or the `mu` if `muVars`
     * is known.
     */
    BidirectonalLstmEncoder.prototype.encode = function (sequence) {
        var _this = this;
        return core_1.tf.tidy(function () {
            var fwState = _this.singleDirection(sequence, true);
            var bwState = _this.singleDirection(sequence, false);
            var finalState = core_1.tf.concat([fwState[1], bwState[1]], 1);
            if (_this.muVars) {
                return dense(_this.muVars, finalState);
            }
            else {
                return finalState;
            }
        });
    };
    BidirectonalLstmEncoder.prototype.singleDirection = function (inputs, fw) {
        var batchSize = inputs.shape[0];
        var length = inputs.shape[1];
        var lstmVars = fw ? this.lstmFwVars : this.lstmBwVars;
        var state = [
            core_1.tf.zeros([batchSize, lstmVars.bias.shape[0] / 4]),
            core_1.tf.zeros([batchSize, lstmVars.bias.shape[0] / 4])
        ];
        var forgetBias = core_1.tf.scalar(1.0);
        var lstm = function (data, state) {
            return core_1.tf.basicLSTMCell(forgetBias, lstmVars.kernel, lstmVars.bias, data, state[0], state[1]);
        };
        var splitInputs = core_1.tf.split(inputs, length, 1);
        for (var _i = 0, _a = (fw ? splitInputs : splitInputs.reverse()); _i < _a.length; _i++) {
            var data_1 = _a[_i];
            state = lstm(data_1.squeeze([1]), state);
        }
        return state;
    };
    return BidirectonalLstmEncoder;
}(Encoder));
/**
 * A hierarchical encoder that uses the outputs from each level as the inputs
 * to the subsequent level.
 */
var HierarchicalEncoder = /** @class */ (function (_super) {
    __extends(HierarchicalEncoder, _super);
    /**
     * `HierarchicalEncoder` contructor.
     *
     * @param baseEncoders An list of `Encoder` objects to use for each.
     * @param numSteps A list containing the number of steps (outputs) for each
     * level of the hierarchy. This number should evenly divide the inputs for
     * each level. The final entry must always be `1`.
     * @param muVars The `LayerVars` for projecting from the final
     * states of the final level to the mean `mu` of the random variable, `z`.
     */
    function HierarchicalEncoder(baseEncoders, numSteps, muVars) {
        var _this = _super.call(this) || this;
        _this.baseEncoders = baseEncoders;
        _this.numSteps = numSteps;
        _this.muVars = muVars;
        _this.zDims = _this.muVars.bias.shape[0];
        return _this;
    }
    /**
     * Encodes a batch of sequences.
     * @param sequence The batch of sequences to be encoded.
     * @returns A batch of `mu` values.
     */
    HierarchicalEncoder.prototype.encode = function (sequence) {
        var _this = this;
        return core_1.tf.tidy(function () {
            var inputs = sequence;
            for (var level = 0; level < _this.baseEncoders.length; ++level) {
                var levelSteps = _this.numSteps[level];
                var splitInputs = core_1.tf.split(inputs, levelSteps, 1);
                var embeddings = [];
                for (var step = 0; step < levelSteps; ++step) {
                    embeddings.push(_this.baseEncoders[level].encode(splitInputs[step]));
                }
                inputs = core_1.tf.stack(embeddings, 1);
            }
            return dense(_this.muVars, inputs.squeeze([1]));
        });
    };
    return HierarchicalEncoder;
}(Encoder));
/**
 * Helper function to create LSTM cells and initial states for decoders.
 *
 * @param z A batch of latent vectors to decode, sized `[batchSize, zDims]`.   *
 * @param lstmCellVars The `LayerVars` for each layer of the decoder LSTM.
 * @param zToInitStateVars The `LayerVars` for projecting from the latent
 * variable `z` to the initial states of the LSTM layers.
 * @returns An Object containing the LSTM cells and initial states.
 */
function initLstmCells(z, lstmCellVars, zToInitStateVars) {
    var lstmCells = [];
    var c = [];
    var h = [];
    var initialStates = core_1.tf.split(dense(zToInitStateVars, z).tanh(), 4, 1);
    var _loop_1 = function (i) {
        var lv = lstmCellVars[i];
        var forgetBias = core_1.tf.scalar(1.0);
        lstmCells.push(function (data, c, h) {
            return core_1.tf.basicLSTMCell(forgetBias, lv.kernel, lv.bias, data, c, h);
        });
        c.push(initialStates[i * 2]);
        h.push(initialStates[i * 2 + 1]);
    };
    for (var i = 0; i < lstmCellVars.length; ++i) {
        _loop_1(i);
    }
    return { 'cell': lstmCells, 'c': c, 'h': h };
}
/**
 * Abstract Decoder class.
 */
var Decoder = /** @class */ (function () {
    function Decoder() {
    }
    return Decoder;
}());
exports.Decoder = Decoder;
/**
 * LSTM decoder with optional NADE output.
 */
var BaseDecoder = /** @class */ (function (_super) {
    __extends(BaseDecoder, _super);
    /**
     * `BaseDecoder` contructor.
     *
     * @param lstmCellVars The `LayerVars` for each layer of the decoder LSTM.
     * @param zToInitStateVars The `LayerVars` for projecting from the latent
     * variable `z` to the initial states of the LSTM layers.
     * @param outputProjectVars The `LayerVars` for projecting from the output
     * of the LSTM to the logits of the output categorical distrubtion
     * (if `nade` is null) or to bias values to use in the NADE (if `nade` is
     * not null).
     * @param nade (optional) A `Nade` to use for computing the output vectors at
     * each step. If not given, the final projection values are used as logits
     * for a categorical distribution.
     */
    function BaseDecoder(lstmCellVars, zToInitStateVars, outputProjectVars, nade) {
        var _this = _super.call(this) || this;
        _this.lstmCellVars = lstmCellVars;
        _this.zToInitStateVars = zToInitStateVars;
        _this.outputProjectVars = outputProjectVars;
        _this.zDims = _this.zToInitStateVars.kernel.shape[0];
        _this.outputDims = (nade) ? nade.numDims : outputProjectVars.bias.shape[0];
        _this.nade = nade;
        return _this;
    }
    /**
     * Decodes a batch of latent vectors, `z`.
     *
     * If `nade` is parameterized, samples are generated using the MAP (argmax) of
     * the Bernoulli random variables from the NADE, and these bit vector makes up
     * the final dimension of the output.
     *
     * If `nade` is not parameterized, sample labels are generated using the
     * MAP (argmax) of the logits output by the LSTM, and the onehots of those
     * labels makes up the final dimension of the output.
     *
     * @param z A batch of latent vectors to decode, sized `[batchSize, zDims]`.
     * @param length The length of decoded sequences.
     * @param temperature The softmax temperature to use when sampling from the
     * logits. Argmax is used if not provided.
     *
     * @returns A boolean tensor containing the decoded sequences, shaped
     * `[batchSize, length, depth]`.
     */
    BaseDecoder.prototype.decode = function (z, length, initialInput, temperature) {
        var _this = this;
        var batchSize = z.shape[0];
        return core_1.tf.tidy(function () {
            // Initialize LSTMCells.
            var lstmCell = initLstmCells(z, _this.lstmCellVars, _this.zToInitStateVars);
            // Generate samples.
            var samples = [];
            var nextInput = initialInput ?
                initialInput :
                core_1.tf.zeros([batchSize, _this.outputDims]);
            for (var i = 0; i < length; ++i) {
                _a = core_1.tf.multiRNNCell(lstmCell.cell, core_1.tf.concat([nextInput, z], 1), lstmCell.c, lstmCell.h), lstmCell.c = _a[0], lstmCell.h = _a[1];
                var logits = dense(_this.outputProjectVars, lstmCell.h[lstmCell.h.length - 1]);
                var timeSamples = void 0;
                if (_this.nade == null) {
                    var timeLabels = (temperature ?
                        core_1.tf.multinomial(logits.div(core_1.tf.scalar(temperature)), 1)
                            .as1D() :
                        logits.argMax(1).as1D());
                    nextInput = core_1.tf.oneHot(timeLabels, _this.outputDims).toFloat();
                    timeSamples = nextInput.toBool();
                }
                else {
                    var _b = core_1.tf.split(logits, [_this.nade.numHidden, _this.nade.numDims], 1), encBias = _b[0], decBias = _b[1];
                    nextInput =
                        _this.nade.sample(encBias, decBias);
                    timeSamples = nextInput.toBool();
                }
                samples.push(timeSamples);
            }
            return core_1.tf.stack(samples, 1);
            var _a;
        });
    };
    return BaseDecoder;
}(Decoder));
/**
 * Hierarchical decoder that produces intermediate embeddings to pass to
 * lower-level `Decoder` objects. The outputs from different decoders are
 * concatenated depth-wise (axis 3), and the outputs from different steps of the
 * conductor are concatenated across time (axis 1).
 */
var ConductorDecoder = /** @class */ (function (_super) {
    __extends(ConductorDecoder, _super);
    /**
     * `Decoder` contructor.
     * @param coreDecoders Lower-level `Decoder` objects to pass the conductor
     * LSTM output embeddings to for futher decoding.
     * @param lstmCellVars The `LayerVars` for each layer of the conductor LSTM.
     * @param zToInitStateVars The `LayerVars` for projecting from the latent
     * variable `z` to the initial states of the conductor LSTM layers.
     * @param numSteps The number of embeddings the conductor LSTM should produce
     * and pass to the lower-level decoder.
     */
    function ConductorDecoder(coreDecoders, lstmCellVars, zToInitStateVars, numSteps) {
        var _this = _super.call(this) || this;
        _this.coreDecoders = coreDecoders;
        _this.lstmCellVars = lstmCellVars;
        _this.zToInitStateVars = zToInitStateVars;
        _this.numSteps = numSteps;
        _this.zDims = _this.zToInitStateVars.kernel.shape[0];
        _this.outputDims =
            _this.coreDecoders.reduce(function (dims, dec) { return dims + dec.outputDims; }, 0);
        return _this;
    }
    /**
     * Hierarchically decodes a batch of latent vectors, `z`.
     *
     * @param z A batch of latent vectors to decode, sized `[batchSize, zDims]`.
     * @param length The length of decoded sequences.
     * @param temperature The softmax temperature to use when sampling from the
     * logits. Argmax is used if not provided.
     *
     * @returns A boolean tensor containing the decoded sequences, shaped
     * `[batchSize, length, depth]`.
     */
    ConductorDecoder.prototype.decode = function (z, length, initialInput, temperature) {
        var _this = this;
        var batchSize = z.shape[0];
        return core_1.tf.tidy(function () {
            // Initialize LSTMCells.
            var lstmCell = initLstmCells(z, _this.lstmCellVars, _this.zToInitStateVars);
            // Generate embeddings.
            var samples = [];
            var initialInput = _this.coreDecoders.map(function (_) { return undefined; });
            var dummyInput = core_1.tf.zeros([batchSize, 1]);
            for (var i = 0; i < _this.numSteps; ++i) {
                _a = core_1.tf.multiRNNCell(lstmCell.cell, dummyInput, lstmCell.c, lstmCell.h), lstmCell.c = _a[0], lstmCell.h = _a[1];
                var currSamples = [];
                for (var j = 0; j < _this.coreDecoders.length; ++j) {
                    currSamples.push(_this.coreDecoders[j].decode(lstmCell.h[lstmCell.h.length - 1], length / _this.numSteps, initialInput[j], temperature));
                }
                samples.push(core_1.tf.concat(currSamples, -1));
                initialInput = currSamples.map(function (s) { return s.slice([0, -1, 0], [batchSize, 1, s.shape[s.rank - 1]])
                    .squeeze([1])
                    .toFloat(); });
            }
            return core_1.tf.concat(samples, 1);
            var _a;
        });
    };
    return ConductorDecoder;
}(Decoder));
/**
 * A Neural Autoregressive Distribution Estimator (NADE).
 */
var Nade = /** @class */ (function () {
    /**
     * `Nade` contructor.
     *
     * @param encWeights The encoder weights (kernel), sized
     * `[numDims, numHidden, 1]`.
     * @param decWeightsT The transposed decoder weights (kernel), sized
     * `[numDims, numHidden, 1]`.
     */
    function Nade(encWeights, decWeightsT) {
        this.numDims = encWeights.shape[0];
        this.numHidden = encWeights.shape[2];
        this.encWeights = encWeights.as2D(this.numDims, this.numHidden);
        this.decWeightsT = decWeightsT.as2D(this.numDims, this.numHidden);
    }
    /**
     * Samples from the NADE given a batch of encoder and decoder biases.
     *
     * Selects the MAP (argmax) of each Bernoulli random variable.
     *
     * @param encBias A batch of biases to use when encoding, sized
     * `[batchSize, numHidden]`.
     * @param decBias A batch of biases to use when decoding, sized
     * `[batchSize, numDims]`.
     */
    Nade.prototype.sample = function (encBias, decBias) {
        var _this = this;
        var batchSize = encBias.shape[0];
        return core_1.tf.tidy(function () {
            var samples = [];
            var a = encBias.clone();
            for (var i = 0; i < _this.numDims; i++) {
                var h = core_1.tf.sigmoid(a);
                var encWeightsI = _this.encWeights.slice([i, 0], [1, _this.numHidden]).as1D();
                var decWeightsTI = _this.decWeightsT.slice([i, 0], [1, _this.numHidden]);
                var decBiasI = decBias.slice([0, i], [batchSize, 1]);
                var contfogitsI = decBiasI.add(core_1.tf.matMul(h, decWeightsTI, false, true));
                var condProbsI = contfogitsI.sigmoid();
                var samplesI = condProbsI.greaterEqual(core_1.tf.scalar(0.5)).toFloat().as1D();
                if (i < _this.numDims - 1) {
                    a = a.add(core_1.tf.outerProduct(samplesI.toFloat(), encWeightsI));
                }
                samples.push(samplesI);
            }
            return core_1.tf.stack(samples, 1);
        });
    };
    return Nade;
}());
exports.Nade = Nade;
/**
 * Main MusicVAE model class.
 *
 * A MusicVAE is a variational autoencoder made up of an `Encoder` and
 * `Decoder`, along with a `DataConverter` for converting between `Tensor`
 * and `NoteSequence` objects for input and output.
 *
 * Exposes methods for interpolation and sampling of musical sequences.
 */
var MusicVAE = /** @class */ (function () {
    /**
     * `MusicVAE` constructor.
     *
     * @param checkpointURL Path to the checkpoint directory.
     * @param dataConverter A `DataConverter` object to use for converting between
     * `NoteSequence` and `Tensor` objects. If not provided, a `converter.json`
     * file must exist within the checkpoint directory specifying the type and
     * args for the correct `DataConverter`.
     */
    function MusicVAE(checkpointURL, dataConverter) {
        this.checkpointURL = checkpointURL;
        this.dataConverter = dataConverter;
    }
    /**
     * Disposes of any untracked `Tensors` to avoid GPU memory leaks.
     */
    MusicVAE.prototype.dispose = function () {
        var _this = this;
        if (!util_1.isNullOrUndefined(this.rawVars)) {
            Object.keys(this.rawVars).forEach(function (name) { return _this.rawVars[name].dispose(); });
        }
        this.encoder = undefined;
        this.decoder = undefined;
        this.dataConverter = undefined;
    };
    MusicVAE.prototype.getLstmLayers = function (cellFormat, vars) {
        var lstmLayers = [];
        var l = 0;
        while (true) {
            var cellPrefix = cellFormat.replace('%d', l.toString());
            if (!(cellPrefix + 'kernel' in vars)) {
                break;
            }
            lstmLayers.push(new LayerVars(vars[cellPrefix + 'kernel'], vars[cellPrefix + 'bias']));
            ++l;
        }
        return lstmLayers;
    };
    /**
     * Loads variables from the checkpoint and instantiates the `Encoder` and
     * `Decoder`.
     */
    MusicVAE.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var LSTM_CELL_FORMAT, MUTLI_LSTM_CELL_FORMAT, CONDUCTOR_PREFIX, BIDI_LSTM_CELL, ENCODER_FORMAT, HIER_ENCODER_FORMAT, reader, vars, encMu, fwLayers_1, bwLayers_1, baseEncoders, fwLayers, bwLayers, decVarPrefix, decVarPrefixes, i, baseDecoders, condLstmLayers, condZtoInitState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.dispose();
                        LSTM_CELL_FORMAT = 'cell_%d/lstm_cell/';
                        MUTLI_LSTM_CELL_FORMAT = 'multi_rnn_cell/' + LSTM_CELL_FORMAT;
                        CONDUCTOR_PREFIX = 'decoder/hierarchical_level_0/';
                        BIDI_LSTM_CELL = 'cell_%d/bidirectional_rnn/%s/multi_rnn_cell/cell_0/lstm_cell/';
                        ENCODER_FORMAT = 'encoder/' + BIDI_LSTM_CELL;
                        HIER_ENCODER_FORMAT = 'encoder/hierarchical_level_%d/' + BIDI_LSTM_CELL.replace('%d', '0');
                        if (util_1.isNullOrUndefined(this.dataConverter)) {
                            fetch(this.checkpointURL + '/converter.json')
                                .then(function (response) { return response.json(); })
                                .then(function (converterSpec) {
                                _this.dataConverter = core_1.data.converterFromSpec(converterSpec);
                            });
                        }
                        reader = new core_1.CheckpointLoader(this.checkpointURL);
                        return [4 /*yield*/, reader.getAllVariables()];
                    case 1:
                        vars = _a.sent();
                        this.rawVars = vars; // Save for disposal.
                        encMu = new LayerVars(vars['encoder/mu/kernel'], vars['encoder/mu/bias']);
                        if (this.dataConverter.numSegments) {
                            fwLayers_1 = this.getLstmLayers(HIER_ENCODER_FORMAT.replace('%s', 'fw'), vars);
                            bwLayers_1 = this.getLstmLayers(HIER_ENCODER_FORMAT.replace('%s', 'bw'), vars);
                            if (fwLayers_1.length !== bwLayers_1.length || fwLayers_1.length !== 2) {
                                throw Error('Only 2 hierarchical encoder levels are supported. ' +
                                    ("Got " + fwLayers_1.length + " forward and " + bwLayers_1.length + " ") +
                                    'backward.');
                            }
                            baseEncoders = [0, 1].map(function (l) { return new BidirectonalLstmEncoder(fwLayers_1[l], bwLayers_1[l]); });
                            this.encoder = new HierarchicalEncoder(baseEncoders, [this.dataConverter.numSegments, 1], encMu);
                        }
                        else {
                            fwLayers = this.getLstmLayers(ENCODER_FORMAT.replace('%s', 'fw'), vars);
                            bwLayers = this.getLstmLayers(ENCODER_FORMAT.replace('%s', 'bw'), vars);
                            if (fwLayers.length !== bwLayers.length || fwLayers.length !== 1) {
                                throw Error('Only single-layer bidirectional encoders are supported. ' +
                                    ("Got " + fwLayers.length + " forward and " + bwLayers.length + " ") +
                                    'backward.');
                            }
                            this.encoder =
                                new BidirectonalLstmEncoder(fwLayers[0], bwLayers[0], encMu);
                        }
                        decVarPrefix = (this.dataConverter.numSegments) ? 'core_decoder/' : '';
                        decVarPrefixes = [];
                        if (this.dataConverter.NUM_SPLITS) {
                            for (i = 0; i < this.dataConverter.NUM_SPLITS; ++i) {
                                decVarPrefixes.push(decVarPrefix + ("core_decoder_" + i + "/decoder/"));
                            }
                        }
                        else {
                            decVarPrefixes.push(decVarPrefix + 'decoder/');
                        }
                        baseDecoders = decVarPrefixes.map(function (varPrefix) {
                            var decLstmLayers = _this.getLstmLayers(varPrefix + MUTLI_LSTM_CELL_FORMAT, vars);
                            var decZtoInitState = new LayerVars(vars[varPrefix + 'z_to_initial_state/kernel'], vars[varPrefix + 'z_to_initial_state/bias']);
                            var decOutputProjection = new LayerVars(vars[varPrefix + 'output_projection/kernel'], vars[varPrefix + 'output_projection/bias']);
                            // Optional NADE for the BaseDecoder.
                            var nade = ((varPrefix + 'nade/w_enc' in vars) ?
                                new Nade(vars[varPrefix + 'nade/w_enc'], vars[varPrefix + 'nade/w_dec_t']) :
                                null);
                            return new BaseDecoder(decLstmLayers, decZtoInitState, decOutputProjection, nade);
                        });
                        // ConductorDecoder variables.
                        if (this.dataConverter.numSegments) {
                            condLstmLayers = this.getLstmLayers(CONDUCTOR_PREFIX + LSTM_CELL_FORMAT, vars);
                            condZtoInitState = new LayerVars(vars[CONDUCTOR_PREFIX + 'initial_state/kernel'], vars[CONDUCTOR_PREFIX + 'initial_state/bias']);
                            this.decoder = new ConductorDecoder(baseDecoders, condLstmLayers, condZtoInitState, this.dataConverter.numSegments);
                        }
                        else if (baseDecoders.length === 1) {
                            this.decoder = baseDecoders[0];
                        }
                        else {
                            throw Error('Unexpected number of base decoders without conductor: ' +
                                ("" + baseDecoders.length));
                        }
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * @returns true iff an `Encoder` and `Decoder` have been instantiated for the
     * model.
     */
    MusicVAE.prototype.isInitialized = function () { return (!!this.encoder && !!this.decoder); };
    /**
     * Interpolates between the input `NoteSequence`s in latent space.
     *
     * If 2 sequences are given, a single linear interpolation is computed, with
     * the first output sequence being a reconstruction of sequence A and the
     * final output being a reconstruction of sequence B, with `numInterps`
     * total sequences.
     *
     * If 4 sequences are given, bilinear interpolation is used. The results are
     * returned in row-major order for a matrix with the following layout:
     *   | A . . C |
     *   | . . . . |
     *   | . . . . |
     *   | B . . D |
     * where the letters represent the reconstructions of the four inputs, in
     * alphabetical order, and there are `numInterps` sequences on each
     * edge for a total of `numInterps`^2 sequences.
     *
     * @param inputSequences An array of 2 or 4 `NoteSequence`s to interpolate
     * between.
     * @param numInterps The number of pairwise interpolation sequences to
     * return, including the reconstructions. If 4 inputs are given, the total
     * number of sequences will be `numInterps`^2.
     *
     * @returns An array of interpolation `NoteSequence` objects, as described
     * above.
     */
    MusicVAE.prototype.interpolate = function (inputSequences, numInterps) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var inputZs, interpZs, outputSequenes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.encode(inputSequences)];
                    case 1:
                        inputZs = _a.sent();
                        interpZs = core_1.tf.tidy(function () { return _this.getInterpolatedZs(inputZs, numInterps); });
                        inputZs.dispose();
                        outputSequenes = this.decode(interpZs);
                        interpZs.dispose();
                        return [2 /*return*/, outputSequenes];
                }
            });
        });
    };
    /**
     * Encodes the input `NoteSequence`s into latent vectors.
     *
     * @param inputSequences An array of `NoteSequence`s to encode.
     * @returns A `Tensor` containing the batch of latent vectors, sized
     * `[inputSequences.length, zSize]`.
     */
    MusicVAE.prototype.encode = function (inputSequences) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, core_1.tf.tidy(function () {
                        var inputTensors = core_1.tf.stack(inputSequences.map(function (t) { return _this.dataConverter.toTensor(t); }));
                        // Use the mean `mu` of the latent variable as the best estimate of `z`.
                        return _this.encoder.encode(inputTensors);
                    })];
            });
        });
    };
    /**
     * Decodes the input latnet vectors into `NoteSequence`s.
     *
     * @param z The latent vectors to decode, sized `[batchSize, zSize]`.
     * @param temperature (Optional) The softmax temperature to use when sampling.
     * The argmax is used if not provided.
     *
     * @returns The decoded `NoteSequence`s.
     */
    MusicVAE.prototype.decode = function (z, temperature) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var numSteps, ohSeqs, outputSequences, _i, ohSeqs_1, oh, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        numSteps = this.dataConverter.numSteps;
                        ohSeqs = core_1.tf.tidy(function () {
                            var ohSeqs = _this.decoder.decode(z, numSteps, undefined, temperature);
                            return core_1.tf.split(ohSeqs, ohSeqs.shape[0])
                                .map(function (oh) { return oh.squeeze([0]); });
                        });
                        outputSequences = [];
                        _i = 0, ohSeqs_1 = ohSeqs;
                        _c.label = 1;
                    case 1:
                        if (!(_i < ohSeqs_1.length)) return [3 /*break*/, 4];
                        oh = ohSeqs_1[_i];
                        _b = (_a = outputSequences).push;
                        return [4 /*yield*/, this.dataConverter.toNoteSequence(oh)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        oh.dispose();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, outputSequences];
                }
            });
        });
    };
    MusicVAE.prototype.getInterpolatedZs = function (z, numInterps) {
        if (z.shape[0] !== 2 && z.shape[0] !== 4) {
            throw new Error('Invalid number of input sequences. Requires length 2, or 4');
        }
        // Compute the interpolations of the latent variable.
        var interpolatedZs = core_1.tf.tidy(function () {
            var rangeArray = core_1.tf.linspace(0.0, 1.0, numInterps);
            var z0 = z.slice([0, 0], [1, z.shape[1]]).as1D();
            var z1 = z.slice([1, 0], [1, z.shape[1]]).as1D();
            if (z.shape[0] === 2) {
                var zDiff = z1.sub(z0);
                return core_1.tf.outerProduct(rangeArray, zDiff).add(z0);
            }
            else if (z.shape[0] === 4) {
                var z2 = z.slice([2, 0], [1, z.shape[1]]).as1D();
                var z3 = z.slice([3, 0], [1, z.shape[1]]).as1D();
                var revRangeArray = core_1.tf.scalar(1.0).sub(rangeArray);
                var r = numInterps;
                var finalZs = z0.mul(core_1.tf.outerProduct(revRangeArray, revRangeArray).as3D(r, r, 1));
                finalZs = core_1.tf.addStrict(finalZs, z1.mul(core_1.tf.outerProduct(rangeArray, revRangeArray).as3D(r, r, 1)));
                finalZs = core_1.tf.addStrict(finalZs, z2.mul(core_1.tf.outerProduct(revRangeArray, rangeArray).as3D(r, r, 1)));
                finalZs = core_1.tf.addStrict(finalZs, z3.mul(core_1.tf.outerProduct(rangeArray, rangeArray).as3D(r, r, 1)));
                return finalZs.as2D(r * r, z.shape[1]);
            }
            else {
                throw new Error('Invalid number of note sequences. Requires length 2, or 4');
            }
        });
        return interpolatedZs;
    };
    /**
     * Samples sequences from the model prior.
     *
     * @param numSamples The number of samples to return.
     * @param temperature The softmax temperature to use when sampling.
     *
     * @returns An array of sampled `NoteSequence` objects.
     */
    MusicVAE.prototype.sample = function (numSamples, temperature) {
        if (temperature === void 0) { temperature = 0.5; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var randZs, outputSequenes;
            return __generator(this, function (_a) {
                randZs = core_1.tf.tidy(function () { return core_1.tf.randomNormal([numSamples, _this.decoder.zDims]); });
                outputSequenes = this.decode(randZs, temperature);
                randZs.dispose();
                return [2 /*return*/, outputSequenes];
            });
        });
    };
    return MusicVAE;
}());
exports.MusicVAE = MusicVAE;
