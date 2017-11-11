(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.deeplearn = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = require('./lib/alea');

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = require('./lib/xor128');

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = require('./lib/xorwow');

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = require('./lib/xorshift7');

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = require('./lib/xor4096');

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = require('./lib/tychei');

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = require('./seedrandom');

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

module.exports = sr;

},{"./lib/alea":3,"./lib/tychei":4,"./lib/xor128":5,"./lib/xor4096":6,"./lib/xorshift7":7,"./lib/xorwow":8,"./seedrandom":9}],3:[function(require,module,exports){
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; }
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],4:[function(require,module,exports){
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
};

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],5:[function(require,module,exports){
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],6:[function(require,module,exports){
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
};

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  this,                                     // window object or global
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);

},{}],7:[function(require,module,exports){
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v, w;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, w, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      w = X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) w = X[7] = -1; else w = X[j];

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);


},{}],8:[function(require,module,exports){
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],9:[function(require,module,exports){
/*
Copyright 2014 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (pool, math) {
//
// The following constants are related to IEEE 754 limits.
//
var global = this,
    width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; }
  prng.quick = function() { return arc4.g(4) / 0x100000000; }
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); }
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}
math['seed' + rngname] = seedrandom;

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
};

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if ((typeof module) == 'object' && module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = require('crypto');
  } catch (ex) {}
} else if ((typeof define) == 'function' && define.amd) {
  define(function() { return seedrandom; });
}

// End anonymous scope, and pass initial values.
})(
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);

},{"crypto":1}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var MANIFEST_FILE = 'manifest.json';
var CheckpointLoader = (function () {
    function CheckpointLoader(urlPath) {
        this.urlPath = urlPath;
        if (this.urlPath.charAt(this.urlPath.length - 1) !== '/') {
            this.urlPath += '/';
        }
    }
    CheckpointLoader.prototype.loadManifest = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', _this.urlPath + MANIFEST_FILE);
            xhr.onload = function () {
                _this.checkpointManifest = JSON.parse(xhr.responseText);
                resolve();
            };
            xhr.onerror = function (error) {
                throw new Error(MANIFEST_FILE + " not found at " + _this.urlPath + ". " + error);
            };
            xhr.send();
        });
    };
    CheckpointLoader.prototype.getCheckpointManifest = function () {
        var _this = this;
        if (this.checkpointManifest == null) {
            return new Promise(function (resolve, reject) {
                _this.loadManifest().then(function () {
                    resolve(_this.checkpointManifest);
                });
            });
        }
        return new Promise(function (resolve, reject) {
            resolve(_this.checkpointManifest);
        });
    };
    CheckpointLoader.prototype.getAllVariables = function () {
        var _this = this;
        if (this.variables != null) {
            return new Promise(function (resolve, reject) {
                resolve(_this.variables);
            });
        }
        return new Promise(function (resolve, reject) {
            _this.getCheckpointManifest().then(function (checkpointDefinition) {
                var variableNames = Object.keys(_this.checkpointManifest);
                var variablePromises = [];
                for (var i = 0; i < variableNames.length; i++) {
                    variablePromises.push(_this.getVariable(variableNames[i]));
                }
                Promise.all(variablePromises).then(function (variables) {
                    _this.variables = {};
                    for (var i = 0; i < variables.length; i++) {
                        _this.variables[variableNames[i]] = variables[i];
                    }
                    resolve(_this.variables);
                });
            });
        });
    };
    CheckpointLoader.prototype.getVariable = function (varName) {
        var _this = this;
        if (!(varName in this.checkpointManifest)) {
            throw new Error('Cannot load non-existant variable ' + varName);
        }
        var variableRequestPromiseMethod = function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            var fname = _this.checkpointManifest[varName].filename;
            xhr.open('GET', _this.urlPath + fname);
            xhr.onload = function () {
                var values = new Float32Array(xhr.response);
                var ndarray = ndarray_1.NDArray.make(_this.checkpointManifest[varName].shape, { values: values });
                resolve(ndarray);
            };
            xhr.onerror = function (error) {
                throw new Error("Could not fetch variable " + varName + ": " + error);
            };
            xhr.send();
        };
        if (this.checkpointManifest == null) {
            return new Promise(function (resolve, reject) {
                _this.loadManifest().then(function () {
                    new Promise(variableRequestPromiseMethod).then(resolve);
                });
            });
        }
        return new Promise(variableRequestPromiseMethod);
    };
    return CheckpointLoader;
}());
exports.CheckpointLoader = CheckpointLoader;

},{"../math/ndarray":63}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var STATS_SAMPLE_PERCENTAGE = 0.1;
var InMemoryDataset = (function () {
    function InMemoryDataset(dataShapes) {
        this.dataShapes = dataShapes;
        this.normalizationInfo = {};
    }
    InMemoryDataset.prototype.getDataShape = function (dataIndex) {
        return this.dataShapes[dataIndex];
    };
    InMemoryDataset.prototype.getData = function () {
        return this.dataset;
    };
    InMemoryDataset.prototype.getStats = function () {
        var _this = this;
        if (this.dataset == null) {
            throw new Error('Data is null.');
        }
        return this.dataset.map(function (d) { return _this.getStatsForData(d); });
    };
    InMemoryDataset.prototype.getStatsForData = function (data) {
        var inputMin = Number.POSITIVE_INFINITY;
        var inputMax = Number.NEGATIVE_INFINITY;
        var exampleIndices = data.map(function (example, i) { return i; });
        util.shuffle(exampleIndices);
        exampleIndices =
            exampleIndices.slice(exampleIndices.length * STATS_SAMPLE_PERCENTAGE);
        for (var i = 0; i < exampleIndices.length; i++) {
            var inputValues = data[exampleIndices[i]].getValues();
            for (var j = 0; j < inputValues.length; j++) {
                inputMin = Math.min(inputMin, inputValues[j]);
                inputMax = Math.max(inputMax, inputValues[j]);
            }
        }
        return {
            inputMin: inputMin,
            inputMax: inputMax,
            exampleCount: data.length,
            shape: data[0].shape,
        };
    };
    InMemoryDataset.prototype.normalizeExamplesToRange = function (examples, curLowerBounds, curUpperBounds, newLowerBounds, newUpperBounds) {
        var curBoundsIsPerDimension = (curUpperBounds instanceof Float32Array &&
            curLowerBounds instanceof Float32Array);
        var newBoundsIsPerDimension = (newLowerBounds instanceof Float32Array &&
            newUpperBounds instanceof Float32Array);
        var inputSize = util.sizeFromShape(examples[0].shape);
        var newExamples = [];
        examples.forEach(function (example) {
            var inputValues = example.getValues();
            var normalizedValues = new Float32Array(inputSize);
            for (var j = 0; j < inputSize; j++) {
                var curLowerBound = curBoundsIsPerDimension ?
                    curLowerBounds[j] :
                    curLowerBounds;
                var curUpperBound = curBoundsIsPerDimension ?
                    curUpperBounds[j] :
                    curUpperBounds;
                var curRange = curUpperBound - curLowerBound;
                var newLowerBound = newBoundsIsPerDimension ?
                    newLowerBounds[j] :
                    newLowerBounds;
                var newUpperBound = newBoundsIsPerDimension ?
                    newUpperBounds[j] :
                    newUpperBounds;
                var newRange = newUpperBound - newLowerBound;
                if (curRange === 0) {
                    normalizedValues[j] = newLowerBound;
                }
                else {
                    normalizedValues[j] = newLowerBound +
                        newRange * (inputValues[j] - curLowerBound) / curRange;
                }
            }
            newExamples.push(ndarray_1.NDArray.make(example.shape, { values: normalizedValues }));
        });
        return newExamples;
    };
    InMemoryDataset.prototype.computeBounds = function (dataIndex) {
        var _this = this;
        if (this.dataset == null) {
            throw new Error('Data is null.');
        }
        var size = util.sizeFromShape(this.dataset[dataIndex][0].shape);
        this.normalizationInfo[dataIndex] = {
            isNormalized: false,
            minValues: new Float32Array(size),
            maxValues: new Float32Array(size)
        };
        for (var i = 0; i < size; i++) {
            this.normalizationInfo[dataIndex].minValues[i] = Number.POSITIVE_INFINITY;
            this.normalizationInfo[dataIndex].maxValues[i] = Number.NEGATIVE_INFINITY;
        }
        this.dataset[dataIndex].forEach(function (example) {
            var inputValues = example.getValues();
            for (var k = 0; k < size; k++) {
                _this.normalizationInfo[dataIndex].minValues[k] = Math.min(_this.normalizationInfo[dataIndex].minValues[k], inputValues[k]);
                _this.normalizationInfo[dataIndex].maxValues[k] = Math.max(_this.normalizationInfo[dataIndex].maxValues[k], inputValues[k]);
            }
        });
    };
    InMemoryDataset.prototype.normalizeWithinBounds = function (dataIndex, lowerBound, upperBound) {
        if (this.dataset == null) {
            throw new Error('Data is null.');
        }
        if (dataIndex >= this.dataset.length) {
            throw new Error('dataIndex out of bounds.');
        }
        if (this.normalizationInfo[dataIndex] == null) {
            this.computeBounds(dataIndex);
        }
        var curLowerBounds;
        var curUpperBounds;
        if (this.normalizationInfo[dataIndex].isNormalized) {
            curLowerBounds = this.normalizationInfo[dataIndex].lowerBound;
            curUpperBounds = this.normalizationInfo[dataIndex].upperBound;
        }
        else {
            curLowerBounds = this.normalizationInfo[dataIndex].minValues;
            curUpperBounds = this.normalizationInfo[dataIndex].maxValues;
        }
        this.dataset[dataIndex] = this.normalizeExamplesToRange(this.dataset[dataIndex], curLowerBounds, curUpperBounds, lowerBound, upperBound);
        this.normalizationInfo[dataIndex].isNormalized = true;
        this.normalizationInfo[dataIndex].lowerBound = lowerBound;
        this.normalizationInfo[dataIndex].upperBound = upperBound;
    };
    InMemoryDataset.prototype.isNormalized = function (dataIndex) {
        return this.normalizationInfo != null &&
            this.normalizationInfo[dataIndex].isNormalized;
    };
    InMemoryDataset.prototype.removeNormalization = function (dataIndex) {
        if (this.dataset == null) {
            throw new Error('Training or test data is null.');
        }
        if (!this.isNormalized(dataIndex)) {
            return;
        }
        this.dataset[dataIndex] = this.normalizeExamplesToRange(this.dataset[dataIndex], this.normalizationInfo[dataIndex].lowerBound, this.normalizationInfo[dataIndex].upperBound, this.normalizationInfo[dataIndex].minValues, this.normalizationInfo[dataIndex].maxValues);
        this.normalizationInfo[dataIndex].isNormalized = false;
    };
    InMemoryDataset.prototype.unnormalizeExamples = function (examples, dataIndex) {
        if (!this.isNormalized(dataIndex)) {
            return examples;
        }
        return this.normalizeExamplesToRange(examples, this.normalizationInfo[dataIndex].lowerBound, this.normalizationInfo[dataIndex].upperBound, this.normalizationInfo[dataIndex].minValues, this.normalizationInfo[dataIndex].maxValues);
    };
    InMemoryDataset.prototype.dispose = function () {
        if (this.dataset == null) {
            return;
        }
        for (var i = 0; i < this.dataset.length; i++) {
            for (var j = 0; j < this.dataset[i].length; j++) {
                this.dataset[i][j].dispose();
            }
        }
        this.dataset = [];
    };
    return InMemoryDataset;
}());
exports.InMemoryDataset = InMemoryDataset;

},{"../math/ndarray":63,"../util":95}],12:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var InMemoryShuffledInputProviderBuilder = (function () {
    function InMemoryShuffledInputProviderBuilder(inputs) {
        this.inputs = inputs;
        this.idx = 0;
        this.inputCounter = 0;
        this.epoch = 0;
        this.shuffledIndices = util.createShuffledIndices(inputs[0].length);
        this.numInputs = inputs.length;
        var numExamples = this.inputs[0].length;
        for (var i = 0; i < this.numInputs; i++) {
            util.assert(this.inputs[i].length === numExamples, 'Number of examples must match across different inputs.');
        }
        for (var i = 0; i < this.numInputs; i++) {
            var inputShape = this.inputs[i][0].shape;
            for (var j = 0; j < this.inputs[i].length; j++) {
                util.assertShapesMatch(inputShape, this.inputs[i][j].shape);
            }
        }
    }
    InMemoryShuffledInputProviderBuilder.prototype.getCurrentExampleIndex = function () {
        var returnIdx = this.idx;
        this.inputCounter++;
        if (this.inputCounter >= this.numInputs) {
            this.idx++;
            this.inputCounter = 0;
            if (this.idx >= this.inputs[0].length) {
                this.idx = 0;
                this.epoch++;
            }
        }
        return returnIdx;
    };
    InMemoryShuffledInputProviderBuilder.prototype.getNextInput = function (inputId) {
        var currentExampleIndex = this.getCurrentExampleIndex();
        return this.inputs[inputId][this.shuffledIndices[currentExampleIndex]];
    };
    InMemoryShuffledInputProviderBuilder.prototype.getEpoch = function () {
        return this.epoch;
    };
    InMemoryShuffledInputProviderBuilder.prototype.getInputProviders = function () {
        var inputProviders = [];
        for (var i = 0; i < this.numInputs; i++) {
            inputProviders.push(this.getInputProvider(i));
        }
        return inputProviders;
    };
    return InMemoryShuffledInputProviderBuilder;
}());
exports.InMemoryShuffledInputProviderBuilder = InMemoryShuffledInputProviderBuilder;
var InCPUMemoryShuffledInputProviderBuilder = (function (_super) {
    __extends(InCPUMemoryShuffledInputProviderBuilder, _super);
    function InCPUMemoryShuffledInputProviderBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InCPUMemoryShuffledInputProviderBuilder.prototype.getInputProvider = function (inputId) {
        var shuffledInputProvider = this;
        return {
            getNextCopy: function (math) {
                return ndarray_1.NDArray.like(shuffledInputProvider.getNextInput(inputId));
            },
            disposeCopy: function (math, copy) {
                copy.dispose();
            }
        };
    };
    return InCPUMemoryShuffledInputProviderBuilder;
}(InMemoryShuffledInputProviderBuilder));
exports.InCPUMemoryShuffledInputProviderBuilder = InCPUMemoryShuffledInputProviderBuilder;
var InGPUMemoryShuffledInputProviderBuilder = (function (_super) {
    __extends(InGPUMemoryShuffledInputProviderBuilder, _super);
    function InGPUMemoryShuffledInputProviderBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InGPUMemoryShuffledInputProviderBuilder.prototype.getInputProvider = function (inputId) {
        var shuffledInputProvider = this;
        return {
            getNextCopy: function (math) {
                return math.clone(shuffledInputProvider.getNextInput(inputId));
            },
            disposeCopy: function (math, copy) {
                copy.dispose();
            }
        };
    };
    return InGPUMemoryShuffledInputProviderBuilder;
}(InMemoryShuffledInputProviderBuilder));
exports.InGPUMemoryShuffledInputProviderBuilder = InGPUMemoryShuffledInputProviderBuilder;

},{"../math/ndarray":63,"../util":95}],13:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var dataset_1 = require("./dataset");
var PARSING_IMAGE_CANVAS_HEIGHT_PX = 1000;
function getXhrDatasetConfig(jsonConfigPath) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', jsonConfigPath);
        xhr.onload = function () {
            resolve(JSON.parse(xhr.responseText));
        };
        xhr.onerror = function (error) {
            reject(error);
        };
        xhr.send();
    });
}
exports.getXhrDatasetConfig = getXhrDatasetConfig;
var XhrDataset = (function (_super) {
    __extends(XhrDataset, _super);
    function XhrDataset(xhrDatasetConfig) {
        var _this = _super.call(this, xhrDatasetConfig.data.map(function (x) { return x.shape; })) || this;
        _this.xhrDatasetConfig = xhrDatasetConfig;
        return _this;
    }
    XhrDataset.prototype.getNDArray = function (info) {
        var dataPromise = info.dataType === 'png' ?
            parseTypedArrayFromPng(info, info.shape) :
            parseTypedArrayFromBinary(info);
        return dataPromise.then(function (data) {
            var inputSize = util.sizeFromShape(info.shape);
            var ndarrays = [];
            for (var i = 0; i < data.length / inputSize; i++) {
                var values = data.subarray(i * inputSize, (i + 1) * inputSize);
                var ndarray = ndarray_1.NDArray.make(info.shape, { values: new Float32Array(values) });
                ndarrays.push(ndarray);
            }
            return ndarrays;
        });
    };
    XhrDataset.prototype.fetchData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = _this.xhrDatasetConfig.data.map(function (x) { return _this.getNDArray(x); });
            Promise.all(promises).then(function (data) {
                _this.dataset = data;
                resolve();
            });
        });
    };
    return XhrDataset;
}(dataset_1.InMemoryDataset));
exports.XhrDataset = XhrDataset;
function parseTypedArrayFromBinary(info) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', info.path);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (event) {
            var data = (info.dataType === 'float32') ?
                new Float32Array(xhr.response) :
                new Uint8Array(xhr.response);
            resolve(data);
        };
        xhr.onerror = function (err) { return reject(err); };
        xhr.send();
    });
}
function parseGrayscaleImageData(data, result, resultOffset) {
    var idx = resultOffset;
    for (var i = 0; i < data.length; i += 4) {
        result[idx++] = data[i];
    }
}
function parseRGBImageData(data, result, resultOffset) {
    var idx = resultOffset;
    for (var i = 0; i < data.length; i += 4) {
        result[idx] = data[i];
        result[idx + 1] = data[i + 1];
        result[idx + 2] = data[i + 2];
        idx += 3;
    }
}
function parseImage(img, shape) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var N = img.height;
    var inputSize = util.sizeFromShape(shape);
    var result = new Uint8Array(N * inputSize);
    if (img.width !== shape[0] * shape[1]) {
        throw new Error("Image width (" + img.width + ") must be multiple of " +
            ("rows*columns (" + shape[0] + "*" + shape[1] + ") of the ndarray"));
    }
    canvas.width = img.width;
    canvas.height = PARSING_IMAGE_CANVAS_HEIGHT_PX;
    var sx = 0;
    var sWidth = canvas.width;
    var sHeight = canvas.height;
    var dx = 0;
    var dy = 0;
    var dWidth = sWidth;
    var dHeight = sHeight;
    var depth = shape[2];
    var offset = 0;
    var numPasses = Math.ceil(N / canvas.height);
    for (var pass = 0; pass < numPasses; ++pass) {
        var sy = pass * canvas.height;
        if ((pass === numPasses - 1) && (N % canvas.height > 0)) {
            canvas.height = N % canvas.height;
            sHeight = canvas.height;
            dHeight = sHeight;
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        (depth === 1) ? parseGrayscaleImageData(data, result, offset) :
            parseRGBImageData(data, result, offset);
        offset += canvas.height * inputSize;
    }
    return result;
}
function parseTypedArrayFromPng(info, shape) {
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.setAttribute('crossOrigin', '');
        img.onload = function () {
            var result = parseImage(img, shape);
            img.src = '';
            img = null;
            resolve(result);
        };
        img.src = info.path;
    });
}

},{"../math/ndarray":63,"../util":95,"./dataset":11}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isMobile() {
    var a = navigator.userAgent || navigator.vendor || window.opera;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
        .test(a) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
            .test(a.substr(0, 4));
}
exports.isMobile = isMobile;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var device_util = require("./device_util");
var util = require("./util");
var Type;
(function (Type) {
    Type[Type["NUMBER"] = 0] = "NUMBER";
    Type[Type["BOOLEAN"] = 1] = "BOOLEAN";
})(Type = exports.Type || (exports.Type = {}));
exports.URL_PROPERTIES = [
    { name: 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED', type: Type.BOOLEAN },
    { name: 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE', type: Type.BOOLEAN },
    { name: 'WEBGL_VERSION', type: Type.NUMBER },
    { name: 'WEBGL_FLOAT_TEXTURE_ENABLED', type: Type.BOOLEAN }, {
        name: 'WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED',
        type: Type.BOOLEAN
    }
];
function getWebGLRenderingContext(webGLVersion) {
    if (webGLVersion === 0) {
        throw new Error('Cannot get WebGL rendering context, WebGL is disabled.');
    }
    var tempCanvas = document.createElement('canvas');
    if (webGLVersion === 1) {
        return (tempCanvas.getContext('webgl') ||
            tempCanvas.getContext('experimental-webgl'));
    }
    return tempCanvas.getContext('webgl2');
}
function loseContext(gl) {
    if (gl != null) {
        var loseContextExtension = gl.getExtension('WEBGL_lose_context');
        if (loseContextExtension == null) {
            throw new Error('Extension WEBGL_lose_context not supported on this browser.');
        }
        loseContextExtension.loseContext();
    }
}
function isWebGLVersionEnabled(webGLVersion) {
    var gl = getWebGLRenderingContext(webGLVersion);
    if (gl != null) {
        loseContext(gl);
        return true;
    }
    return false;
}
function isWebGLDisjointQueryTimerEnabled(webGLVersion) {
    var gl = getWebGLRenderingContext(webGLVersion);
    var extensionName = webGLVersion === 1 ? 'EXT_disjoint_timer_query' :
        'EXT_disjoint_timer_query_webgl2';
    var ext = gl.getExtension(extensionName);
    var isExtEnabled = ext != null;
    if (gl != null) {
        loseContext(gl);
    }
    return isExtEnabled;
}
function isFloatTextureReadPixelsEnabled(webGLVersion) {
    if (webGLVersion === 0) {
        return false;
    }
    var gl = getWebGLRenderingContext(webGLVersion);
    if (webGLVersion === 1) {
        if (gl.getExtension('OES_texture_float') == null) {
            return false;
        }
    }
    else {
        if (gl.getExtension('EXT_color_buffer_float') == null) {
            return false;
        }
    }
    var frameBuffer = gl.createFramebuffer();
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var internalFormat = webGLVersion === 2 ? gl.RGBA32F : gl.RGBA;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    var frameBufferComplete = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);
    loseContext(gl);
    return frameBufferComplete;
}
function isWebGLGetBufferSubDataAsyncExtensionEnabled(webGLVersion) {
    if (webGLVersion !== 2) {
        return false;
    }
    var gl = getWebGLRenderingContext(webGLVersion);
    var ext = gl.getExtension('WEBGL_get_buffer_sub_data_async');
    var isEnabled = ext != null;
    loseContext(gl);
    return isEnabled;
}
var Environment = (function () {
    function Environment(features) {
        this.features = {};
        if (features != null) {
            this.features = features;
        }
    }
    Environment.prototype.get = function (feature) {
        if (feature in this.features) {
            return this.features[feature];
        }
        this.features[feature] = this.evaluateFeature(feature);
        return this.features[feature];
    };
    Environment.prototype.evaluateFeature = function (feature) {
        if (feature === 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED') {
            var webGLVersion = this.get('WEBGL_VERSION');
            if (webGLVersion === 0) {
                return false;
            }
            return isWebGLDisjointQueryTimerEnabled(webGLVersion);
        }
        else if (feature === 'WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE') {
            return this.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED') &&
                !device_util.isMobile();
        }
        else if (feature === 'WEBGL_VERSION') {
            if (isWebGLVersionEnabled(2)) {
                return 2;
            }
            else if (isWebGLVersionEnabled(1)) {
                return 1;
            }
            return 0;
        }
        else if (feature === 'WEBGL_FLOAT_TEXTURE_ENABLED') {
            return isFloatTextureReadPixelsEnabled(this.get('WEBGL_VERSION'));
        }
        else if (feature === 'WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED') {
            return isWebGLGetBufferSubDataAsyncExtensionEnabled(this.get('WEBGL_VERSION'));
        }
        throw new Error("Unknown feature " + feature + ".");
    };
    return Environment;
}());
exports.Environment = Environment;
var DEEPLEARNJS_FLAGS_PREFIX = 'dljsflags';
function getFeaturesFromURL() {
    var features = {};
    if (typeof window === 'undefined') {
        return features;
    }
    var urlParams = util.getQueryParams(window.location.search);
    if (DEEPLEARNJS_FLAGS_PREFIX in urlParams) {
        var urlFlags_1 = {};
        var keyValues = urlParams[DEEPLEARNJS_FLAGS_PREFIX].split(',');
        keyValues.forEach(function (keyValue) {
            var _a = keyValue.split(':'), key = _a[0], value = _a[1];
            urlFlags_1[key] = value;
        });
        exports.URL_PROPERTIES.forEach(function (urlProperty) {
            if (urlProperty.name in urlFlags_1) {
                console.log("Setting feature override from URL " + urlProperty.name + ": " +
                    ("" + urlFlags_1[urlProperty.name]));
                if (urlProperty.type === Type.NUMBER) {
                    features[urlProperty.name] = +urlFlags_1[urlProperty.name];
                }
                else if (urlProperty.type === Type.BOOLEAN) {
                    features[urlProperty.name] = urlFlags_1[urlProperty.name] === 'true';
                }
                else {
                    console.warn("Unknown URL param: " + urlProperty.name + ".");
                }
            }
        });
    }
    return features;
}
exports.ENV = new Environment(getFeaturesFromURL());
function setEnvironment(environment) {
    exports.ENV = environment;
}
exports.setEnvironment = setEnvironment;

},{"./device_util":14,"./util":95}],16:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var initializers_1 = require("../initializers");
var concat_util = require("../math/concat_util");
var conv_util = require("../math/conv_util");
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var GraphLayers = (function () {
    function GraphLayers(g) {
        this.g = g;
    }
    GraphLayers.prototype.dense = function (name, x, units, activation, useBias, kernelInitializer, biasInitializer) {
        if (activation === void 0) { activation = null; }
        if (useBias === void 0) { useBias = true; }
        if (kernelInitializer === void 0) { kernelInitializer = new initializers_1.VarianceScalingInitializer(); }
        if (biasInitializer === void 0) { biasInitializer = new initializers_1.ZerosInitializer(); }
        var weights = this.g.variable(name + '-weights', kernelInitializer.initialize([x.shape[0], units], x.shape[0], units));
        var out = this.g.matmul(x, weights);
        if (useBias) {
            var bias = this.g.variable(name + '-bias', biasInitializer.initialize([units], x.shape[0], units));
            out = this.g.add(out, bias);
        }
        if (activation != null) {
            out = activation(out);
        }
        return out;
    };
    return GraphLayers;
}());
exports.GraphLayers = GraphLayers;
var Graph = (function () {
    function Graph() {
        this.nodes = [];
        this.layers = new GraphLayers(this);
    }
    Graph.prototype.variable = function (name, data) {
        return this.addNodeAndReturnOutput(new VariableNode(this, name, data));
    };
    Graph.prototype.placeholder = function (name, shape) {
        return this.addNodeAndReturnOutput(new PlaceholderNode(this, name, shape));
    };
    Graph.prototype.constant = function (value) {
        var finalValue;
        if (typeof value === 'number') {
            finalValue = ndarray_1.Scalar.new(value);
        }
        else if (value instanceof ndarray_1.NDArray) {
            finalValue = value;
        }
        else if (value instanceof Array) {
            var flatValues = util.flatten(value);
            var vals = new Float32Array(flatValues);
            finalValue = ndarray_1.NDArray.make(util.inferShape(value), { values: vals });
        }
        else {
            throw new Error('unimplemented constant type.');
        }
        return this.addNodeAndReturnOutput(new ConstantNode(this, finalValue));
    };
    Graph.prototype.reshape = function (x, shape) {
        return this.addNodeAndReturnOutput(new ReshapeNode(this, 'Reshape', x, shape));
    };
    Graph.prototype.fusedLinearCombination = function (x1, x2, c1, c2) {
        return this.addNodeAndReturnOutput(new FusedLinearCombinationNode(this, x1, x2, c1, c2));
    };
    Graph.prototype.add = function (x1, x2) {
        return this.addNodeAndReturnOutput(new AddNode(this, x1, x2));
    };
    Graph.prototype.subtract = function (x1, x2) {
        return this.addNodeAndReturnOutput(new SubtractNode(this, x1, x2));
    };
    Graph.prototype.multiply = function (x1, x2) {
        return this.addNodeAndReturnOutput(new MultiplyNode(this, x1, x2));
    };
    Graph.prototype.divide = function (x1, x2) {
        return this.addNodeAndReturnOutput(new DivideNode(this, x1, x2));
    };
    Graph.prototype.reduceSum = function (x) {
        return this.addNodeAndReturnOutput(new ReduceSumNode(this, x));
    };
    Graph.prototype.concat3d = function (x1, x2, axis) {
        return this.addNodeAndReturnOutput(new Concat3DNode(this, x1, x2, axis));
    };
    Graph.prototype.matmul = function (x1, x2) {
        return this.addNodeAndReturnOutput(new MatMulNode(this, x1, x2));
    };
    Graph.prototype.conv2d = function (x, w, b, fieldSize, outputDepth, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        return this.addNodeAndReturnOutput(new Convolution2DNode(this, x, w, b, fieldSize, outputDepth, stride, zeroPad));
    };
    Graph.prototype.maxPool = function (x, fieldSize, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        return this.addNodeAndReturnOutput(new MaxPoolNode(this, x, fieldSize, stride, zeroPad));
    };
    Graph.prototype.exp = function (x) {
        return this.addNodeAndReturnOutput(new ExpNode(this, x));
    };
    Graph.prototype.log = function (x) {
        return this.addNodeAndReturnOutput(new LogNode(this, x));
    };
    Graph.prototype.relu = function (x) {
        return this.addNodeAndReturnOutput(new ReLUNode(this, x));
    };
    Graph.prototype.tanh = function (x) {
        return this.addNodeAndReturnOutput(new TanHNode(this, x));
    };
    Graph.prototype.sigmoid = function (x) {
        return this.addNodeAndReturnOutput(new SigmoidNode(this, x));
    };
    Graph.prototype.square = function (x) {
        return this.addNodeAndReturnOutput(new SquareNode(this, x));
    };
    Graph.prototype.softmax = function (x) {
        return this.addNodeAndReturnOutput(new SoftmaxNode(this, x));
    };
    Graph.prototype.softmaxCrossEntropyCost = function (x, target) {
        return this.addNodeAndReturnOutput(new SoftmaxCrossEntropyCostNode(this, x, target));
    };
    Graph.prototype.meanSquaredCost = function (label, prediction) {
        return this.addNodeAndReturnOutput(new MeanSquaredCostNode(this, label, prediction));
    };
    Graph.prototype.argmax = function (x) {
        return this.addNodeAndReturnOutput(new ArgMaxNode(this, x));
    };
    Graph.prototype.argmaxEquals = function (x1, x2) {
        return this.addNodeAndReturnOutput(new ArgMaxEqualsNode(this, x1, x2));
    };
    Graph.prototype.addNodeAndReturnOutput = function (node) {
        this.nodes.push(node);
        node.validate();
        return node.output;
    };
    Graph.prototype.getNodes = function () {
        return this.nodes;
    };
    return Graph;
}());
exports.Graph = Graph;
var Tensor = (function () {
    function Tensor(shape) {
        this.shape = shape;
        this.id = Tensor.nextID++;
    }
    Tensor.nextID = 0;
    return Tensor;
}());
exports.Tensor = Tensor;
var Node = (function () {
    function Node(graph, name, inputs, output) {
        this.graph = graph;
        this.name = name;
        this.inputs = inputs;
        this.output = output;
        this.id = Node.nextID++;
        output.node = this;
    }
    Node.nextID = 0;
    return Node;
}());
exports.Node = Node;
var VariableNode = (function (_super) {
    __extends(VariableNode, _super);
    function VariableNode(graph, name, data) {
        var _this = _super.call(this, graph, name, {}, new Tensor(data.shape)) || this;
        _this.data = data;
        return _this;
    }
    VariableNode.prototype.validate = function () {
        util.assert(this.data != null, 'Error adding variable op: Data for variable \'' + this.name +
            '\' is null or undefined');
    };
    return VariableNode;
}(Node));
exports.VariableNode = VariableNode;
var PlaceholderNode = (function (_super) {
    __extends(PlaceholderNode, _super);
    function PlaceholderNode(graph, name, shape) {
        return _super.call(this, graph, name, {}, new Tensor(shape)) || this;
    }
    PlaceholderNode.prototype.validate = function () { };
    return PlaceholderNode;
}(Node));
exports.PlaceholderNode = PlaceholderNode;
var ConstantNode = (function (_super) {
    __extends(ConstantNode, _super);
    function ConstantNode(graph, data) {
        var _this = _super.call(this, graph, 'Constant', {}, new Tensor(data.shape)) || this;
        _this.data = data;
        return _this;
    }
    ConstantNode.prototype.validate = function () {
        util.assert(this.data != null, 'Error adding constant: data for placeholder \'' + this.name +
            '\' is null or undefined');
    };
    return ConstantNode;
}(Node));
exports.ConstantNode = ConstantNode;
var ReshapeNode = (function (_super) {
    __extends(ReshapeNode, _super);
    function ReshapeNode(graph, name, x, shape) {
        var _this = _super.call(this, graph, name, { x: x }, new Tensor(shape)) || this;
        _this.name = name;
        _this.x = x;
        _this.shape = shape;
        return _this;
    }
    ReshapeNode.prototype.validate = function () {
        var xSize = util.sizeFromShape(this.x.shape);
        var shapeSize = util.sizeFromShape(this.shape);
        util.assert(xSize === shapeSize, "Error making reshape operation: input to reshape '" + this.name + "'" +
            (" of shape (" + this.x.shape + ") does not match size of ") +
            ("requested shape " + this.shape + "."));
    };
    ReshapeNode.X = 'x';
    return ReshapeNode;
}(Node));
exports.ReshapeNode = ReshapeNode;
var FusedLinearCombinationNode = (function (_super) {
    __extends(FusedLinearCombinationNode, _super);
    function FusedLinearCombinationNode(graph, t1, t2, c1, c2) {
        var _this = _super.call(this, graph, 'Linear Combination', { t1: t1, t2: t2, c1: c1, c2: c2 }, new Tensor(t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        _this.c1 = c1;
        _this.c2 = c2;
        return _this;
    }
    FusedLinearCombinationNode.prototype.validate = function () {
        util.assertShapesMatch(this.t1.shape, this.t2.shape);
        if (!util.isScalarShape(this.c1.shape)) {
            throw new Error('Error adding fusedLinearCombination: c1 is not a scalar, got ' +
                ("shape: " + this.c1.shape));
        }
        if (!util.isScalarShape(this.c2.shape)) {
            throw new Error('Error adding fusedLinearCombination: c2 is not a scalar, got ' +
                ("shape: " + this.c2.shape));
        }
    };
    FusedLinearCombinationNode.T1 = 't1';
    FusedLinearCombinationNode.T2 = 't2';
    FusedLinearCombinationNode.C1 = 'c1';
    FusedLinearCombinationNode.C2 = 'c2';
    return FusedLinearCombinationNode;
}(Node));
exports.FusedLinearCombinationNode = FusedLinearCombinationNode;
var AddNode = (function (_super) {
    __extends(AddNode, _super);
    function AddNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Add', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    AddNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding add operation op: one of inputs must be scalar or the ' +
            ("shapes " + this.t1.shape + " and " + this.t2.shape + " must match."));
    };
    AddNode.T1 = 't1';
    AddNode.T2 = 't2';
    return AddNode;
}(Node));
exports.AddNode = AddNode;
var SubtractNode = (function (_super) {
    __extends(SubtractNode, _super);
    function SubtractNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Subtract', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    SubtractNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding subtract op: one of inputs must be scalar or the ' +
            ("shapes " + this.t1.shape + " and " + this.t2.shape + " must match."));
    };
    SubtractNode.T1 = 't1';
    SubtractNode.T2 = 't2';
    return SubtractNode;
}(Node));
exports.SubtractNode = SubtractNode;
var MultiplyNode = (function (_super) {
    __extends(MultiplyNode, _super);
    function MultiplyNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Multiply', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    MultiplyNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding multiply op: one of inputs must be scalar or the ' +
            ("shapes " + this.t1.shape + " and " + this.t2.shape + " must match."));
    };
    MultiplyNode.T1 = 't1';
    MultiplyNode.T2 = 't2';
    return MultiplyNode;
}(Node));
exports.MultiplyNode = MultiplyNode;
var DivideNode = (function (_super) {
    __extends(DivideNode, _super);
    function DivideNode(graph, t1, t2) {
        var _this = _super.call(this, graph, 'Divide', { t1: t1, t2: t2 }, new Tensor(util.sizeFromShape(t1.shape) === 1 ? t2.shape : t1.shape)) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        return _this;
    }
    DivideNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.t1.shape) === 1 ||
            util.sizeFromShape(this.t2.shape) === 1 ||
            util.arraysEqual(this.t1.shape, this.t2.shape), 'Error adding divide op: one of inputs must be scalar or the ' +
            ("shapes " + this.t1.shape + " and " + this.t2.shape + " must match."));
    };
    DivideNode.T1 = 't1';
    DivideNode.T2 = 't2';
    return DivideNode;
}(Node));
exports.DivideNode = DivideNode;
var ReduceSumNode = (function (_super) {
    __extends(ReduceSumNode, _super);
    function ReduceSumNode(graph, x) {
        return _super.call(this, graph, 'ReduceSum', { x: x }, new Tensor([])) || this;
    }
    ReduceSumNode.prototype.validate = function () { };
    ReduceSumNode.X = 'x';
    return ReduceSumNode;
}(Node));
exports.ReduceSumNode = ReduceSumNode;
var Concat3DNode = (function (_super) {
    __extends(Concat3DNode, _super);
    function Concat3DNode(graph, x1, x2, axis) {
        var _this = _super.call(this, graph, 'Concat3D', { x1: x1, x2: x2 }, new Tensor(concat_util.computeOutShape(x1.shape, x2.shape, axis))) || this;
        _this.x1 = x1;
        _this.x2 = x2;
        _this.axis = axis;
        return _this;
    }
    Concat3DNode.prototype.validate = function () {
        concat_util.assertParams(this.x1.shape, this.x2.shape, this.axis);
    };
    Concat3DNode.X1 = 'x1';
    Concat3DNode.X2 = 'x2';
    Concat3DNode.AXIS = 'axis';
    return Concat3DNode;
}(Node));
exports.Concat3DNode = Concat3DNode;
function getMatMulOutputShape(x1Shape, x2Shape) {
    if (x1Shape.length === 1 && x2Shape.length === 1) {
        return [1];
    }
    else if (x1Shape.length === 1 && x2Shape.length === 2) {
        return [x2Shape[1]];
    }
    else if (x1Shape.length === 2 && x2Shape.length === 1) {
        return [x1Shape[0]];
    }
    return [x1Shape[0], x2Shape[1]];
}
var MatMulNode = (function (_super) {
    __extends(MatMulNode, _super);
    function MatMulNode(graph, x1, x2) {
        var _this = _super.call(this, graph, 'MatMul', { x1: x1, x2: x2 }, new Tensor(getMatMulOutputShape(x1.shape, x2.shape))) || this;
        _this.x1 = x1;
        _this.x2 = x2;
        return _this;
    }
    MatMulNode.prototype.validate = function () {
        if (this.x1.shape.length === 2 && this.x2.shape.length === 2) {
            util.assert(this.x1.shape[1] === this.x2.shape[0], 'Error adding matmul op: inner shapes of matrices with shapes ' +
                (this.x1.shape + " and " + this.x2.shape + " must match."));
        }
        else if (this.x1.shape.length === 2 && this.x2.shape.length === 1) {
            util.assert(this.x1.shape[1] === this.x2.shape[0], 'Error adding matmul op: second dimension of matrix with shape ' +
                this.x1.shape.toString() +
                (" must match size of vector with shape " + this.x2.shape + "."));
        }
        else if (this.x1.shape.length === 1 && this.x2.shape.length === 2) {
            util.assert(this.x1.shape[0] === this.x2.shape[0], "Error adding matmul op: size of vector with shape " + this.x1.shape +
                " must match first dimension of matrix with " +
                ("shape " + this.x2.shape + "."));
        }
        else {
            throw new Error('Error adding matmul op: inputs must be vectors or matrices.');
        }
    };
    MatMulNode.X1 = 'x1';
    MatMulNode.X2 = 'x2';
    return MatMulNode;
}(Node));
exports.MatMulNode = MatMulNode;
var Convolution2DNode = (function (_super) {
    __extends(Convolution2DNode, _super);
    function Convolution2DNode(graph, x, w, b, fieldSize, outputDepth, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this, graph, 'Convolution 2D', { x: x, w: w, b: b }, new Tensor(conv_util.computeOutputShape3D(x.shape, fieldSize, outputDepth, stride, zeroPad))) || this;
        _this.x = x;
        _this.w = w;
        _this.b = b;
        _this.fieldSize = fieldSize;
        _this.outputDepth = outputDepth;
        _this.stride = stride;
        _this.zeroPad = zeroPad;
        return _this;
    }
    Convolution2DNode.prototype.validate = function () {
        util.assert(this.x.shape.length === 3, 'Error adding conv2d op: input must be of rank 3, but got shape: ' +
            (this.x.shape + "."));
        util.assert(this.w.shape.length === 4, 'Error adding conv2d op: weights must be of rank 4, but got shape: ' +
            (this.w.shape + "."));
        util.assert(this.b.shape.length === 1, 'Error adding conv2d op: biases must be of rank 1, but got shape: ' +
            (this.b.shape + "."));
        util.assert(this.x.shape[2] === this.w.shape[2], "Error adding conv2d op: depth of input (" + this.x.shape[2] + ") " +
            ("must match input depth for weights (" + this.w.shape[2] + ")."));
    };
    Convolution2DNode.X = 'x';
    Convolution2DNode.W = 'w';
    Convolution2DNode.B = 'b';
    return Convolution2DNode;
}(Node));
exports.Convolution2DNode = Convolution2DNode;
var MaxPoolNode = (function (_super) {
    __extends(MaxPoolNode, _super);
    function MaxPoolNode(graph, x, fieldSize, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this, graph, 'Max pool', { x: x }, new Tensor(conv_util.computeOutputShape3D(x.shape, fieldSize, x.shape[2], stride, zeroPad))) || this;
        _this.x = x;
        _this.fieldSize = fieldSize;
        _this.stride = stride;
        _this.zeroPad = zeroPad;
        return _this;
    }
    MaxPoolNode.prototype.validate = function () {
        util.assert(this.x.shape.length === 3, 'Error adding maxPool op: input must be of rank 3, but got shape: ' +
            (this.x.shape + "."));
    };
    MaxPoolNode.X = 'x';
    return MaxPoolNode;
}(Node));
exports.MaxPoolNode = MaxPoolNode;
var ReLUNode = (function (_super) {
    __extends(ReLUNode, _super);
    function ReLUNode(graph, x) {
        return _super.call(this, graph, 'ReLU', { x: x }, new Tensor(x.shape)) || this;
    }
    ReLUNode.prototype.validate = function () { };
    ReLUNode.X = 'x';
    return ReLUNode;
}(Node));
exports.ReLUNode = ReLUNode;
var ExpNode = (function (_super) {
    __extends(ExpNode, _super);
    function ExpNode(graph, x) {
        return _super.call(this, graph, 'Exp', { x: x }, new Tensor(x.shape)) || this;
    }
    ExpNode.prototype.validate = function () { };
    ExpNode.X = 'x';
    return ExpNode;
}(Node));
exports.ExpNode = ExpNode;
var LogNode = (function (_super) {
    __extends(LogNode, _super);
    function LogNode(graph, x) {
        return _super.call(this, graph, 'Log', { x: x }, new Tensor(x.shape)) || this;
    }
    LogNode.prototype.validate = function () { };
    LogNode.X = 'x';
    return LogNode;
}(Node));
exports.LogNode = LogNode;
var TanHNode = (function (_super) {
    __extends(TanHNode, _super);
    function TanHNode(graph, x) {
        return _super.call(this, graph, 'TanH', { x: x }, new Tensor(x.shape)) || this;
    }
    TanHNode.prototype.validate = function () { };
    TanHNode.X = 'x';
    return TanHNode;
}(Node));
exports.TanHNode = TanHNode;
var SigmoidNode = (function (_super) {
    __extends(SigmoidNode, _super);
    function SigmoidNode(graph, x) {
        return _super.call(this, graph, 'Sigmoid', { x: x }, new Tensor(x.shape)) || this;
    }
    SigmoidNode.prototype.validate = function () { };
    SigmoidNode.X = 'x';
    return SigmoidNode;
}(Node));
exports.SigmoidNode = SigmoidNode;
var SquareNode = (function (_super) {
    __extends(SquareNode, _super);
    function SquareNode(graph, x) {
        return _super.call(this, graph, 'Square', { x: x }, new Tensor(x.shape)) || this;
    }
    SquareNode.prototype.validate = function () { };
    SquareNode.X = 'x';
    return SquareNode;
}(Node));
exports.SquareNode = SquareNode;
var SoftmaxCrossEntropyCostNode = (function (_super) {
    __extends(SoftmaxCrossEntropyCostNode, _super);
    function SoftmaxCrossEntropyCostNode(graph, x, target) {
        var _this = _super.call(this, graph, 'SoftmaxCrossEntropyCost', { x: x, target: target }, new Tensor([])) || this;
        _this.x = x;
        _this.target = target;
        return _this;
    }
    SoftmaxCrossEntropyCostNode.prototype.validate = function () {
        util.assert(util.arraysEqual(this.x.shape, this.target.shape), "Error adding softmaxCrossEntropyCost op: x shape (" + this.x.shape + ") " +
            ("must match target shape (" + this.target.shape + ")."));
    };
    SoftmaxCrossEntropyCostNode.X = 'x';
    SoftmaxCrossEntropyCostNode.TARGET = 'target';
    return SoftmaxCrossEntropyCostNode;
}(Node));
exports.SoftmaxCrossEntropyCostNode = SoftmaxCrossEntropyCostNode;
var SoftmaxNode = (function (_super) {
    __extends(SoftmaxNode, _super);
    function SoftmaxNode(graph, x) {
        var _this = _super.call(this, graph, 'Softmax', { x: x }, new Tensor(x.shape)) || this;
        _this.x = x;
        return _this;
    }
    SoftmaxNode.prototype.validate = function () {
        util.assert(this.x.shape.length === 1, 'The input to a softmax must be a 1-D tensor');
        util.assert(this.x.shape[0] >= 2, 'The input to a softmax must have at least 2 values');
    };
    SoftmaxNode.X = 'x';
    return SoftmaxNode;
}(Node));
exports.SoftmaxNode = SoftmaxNode;
var MeanSquaredCostNode = (function (_super) {
    __extends(MeanSquaredCostNode, _super);
    function MeanSquaredCostNode(graph, label, prediction) {
        var _this = _super.call(this, graph, 'Mean Squared Cost', { label: label, prediction: prediction }, new Tensor([])) || this;
        _this.label = label;
        _this.prediction = prediction;
        return _this;
    }
    MeanSquaredCostNode.prototype.validate = function () {
        util.assert(util.arraysEqual(this.label.shape, this.prediction.shape), "Error adding meanSquaredCost op: label shape (" + this.label.shape + ") " +
            ("must match prediction shape (" + this.prediction.shape + ")."));
    };
    MeanSquaredCostNode.LABEL = 'label';
    MeanSquaredCostNode.PREDICTION = 'prediction';
    return MeanSquaredCostNode;
}(Node));
exports.MeanSquaredCostNode = MeanSquaredCostNode;
var ArgMaxNode = (function (_super) {
    __extends(ArgMaxNode, _super);
    function ArgMaxNode(graph, x) {
        var _this = _super.call(this, graph, 'ArgMax', { x: x }, new Tensor([1])) || this;
        _this.x = x;
        return _this;
    }
    ArgMaxNode.prototype.validate = function () {
        util.assert(util.sizeFromShape(this.x.shape) > 0, 'Error adding argmax op: input tensor must have at least one entry.');
    };
    ArgMaxNode.X = 'x';
    return ArgMaxNode;
}(Node));
exports.ArgMaxNode = ArgMaxNode;
var ArgMaxEqualsNode = (function (_super) {
    __extends(ArgMaxEqualsNode, _super);
    function ArgMaxEqualsNode(graph, x1, x2) {
        var _this = _super.call(this, graph, 'ArgMaxEquals', { x1: x1, x2: x2 }, new Tensor([1])) || this;
        _this.x1 = x1;
        _this.x2 = x2;
        return _this;
    }
    ArgMaxEqualsNode.prototype.validate = function () {
        util.assert(util.arraysEqual(this.x1.shape, this.x2.shape), "Error adding ArgMaxEquals op: x1 shape (" + this.x1.shape + ") " +
            ("must match x2 shape (" + this.x2.shape + ")."));
    };
    ArgMaxEqualsNode.X1 = 'x1';
    ArgMaxEqualsNode.X2 = 'x2';
    return ArgMaxEqualsNode;
}(Node));
exports.ArgMaxEqualsNode = ArgMaxEqualsNode;

},{"../initializers":52,"../math/concat_util":56,"../math/conv_util":57,"../math/ndarray":63,"../util":95}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graph_1 = require("./graph");
var priority_queue = require("./priority_queue");
var priority_queue_1 = require("./priority_queue");
function getUnorderedEvaluationSet(nodes, terminatingNodes) {
    var terminatingNodeMap = {};
    var seen = {};
    var set = [];
    var visit = nodes.slice();
    terminatingNodes.forEach(function (node) { return terminatingNodeMap[node.id] = node; });
    var _loop_1 = function () {
        var cur = visit.pop();
        if (seen[cur.id] == null) {
            if (terminatingNodeMap[cur.id] == null) {
                Object.keys(cur.inputs)
                    .map(function (inputName) { return cur.inputs[inputName]; })
                    .forEach(function (input) { return visit.push(input.node); });
            }
            set.push(cur);
            seen[cur.id] = cur;
        }
    };
    while (visit.length !== 0) {
        _loop_1();
    }
    return set;
}
exports.getUnorderedEvaluationSet = getUnorderedEvaluationSet;
function getOrderedEvaluationSet(unorderedEvaluationSet) {
    var set = [];
    var nodeIndices = {};
    var pendingDependencies = {};
    var nodeQueue = new priority_queue_1.PriorityQueue(function (a, b) { return priority_queue.defaultCompare(pendingDependencies[a.id], pendingDependencies[b.id]); }, function (node, newIndex) { return nodeIndices[node.id] = newIndex; });
    unorderedEvaluationSet.forEach(function (node) { return pendingDependencies[node.id] = 0; });
    unorderedEvaluationSet.forEach(function (node) { return Object.keys(node.inputs)
        .map(function (key) { return node.inputs[key]; })
        .forEach(function (input) {
        if (unorderedEvaluationSet.indexOf(input.node) !== -1) {
            pendingDependencies[input.node.id]++;
        }
    }); });
    unorderedEvaluationSet.forEach(function (node) { return nodeQueue.enqueue(node); });
    while (!nodeQueue.empty()) {
        set.unshift(nodeQueue.dequeue());
        Object.keys(set[0].inputs).map(function (key) { return set[0].inputs[key]; }).forEach(function (input) {
            if (unorderedEvaluationSet.indexOf(input.node) === -1) {
                return;
            }
            pendingDependencies[input.node.id]--;
            nodeQueue.update(input.node, nodeIndices[input.node.id]);
        });
    }
    return set;
}
exports.getOrderedEvaluationSet = getOrderedEvaluationSet;
function isInputNode(node) {
    return Object.keys(node.inputs).length === 0;
}
exports.isInputNode = isInputNode;
function shouldBackProp(t) {
    return !(t.node instanceof graph_1.ConstantNode);
}
exports.shouldBackProp = shouldBackProp;
function isPassthroughNode(node, map) {
    var keys = Object.keys(node.inputs);
    for (var i = 0; i < keys.length; i++) {
        var input = node.inputs[keys[i]];
        if (map.get(input, true) === map.get(node.output, true)) {
            return true;
        }
    }
    return false;
}
exports.isPassthroughNode = isPassthroughNode;

},{"./graph":16,"./priority_queue":46}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graph_1 = require("./graph");
var graph_util = require("./graph_util");
var add_1 = require("./ops/add");
var argmax_1 = require("./ops/argmax");
var argmaxequals_1 = require("./ops/argmaxequals");
var concat3d_1 = require("./ops/concat3d");
var convolution_1 = require("./ops/convolution");
var divide_1 = require("./ops/divide");
var element_wise_activation_1 = require("./ops/element_wise_activation");
var element_wise_cost_1 = require("./ops/element_wise_cost");
var exp_1 = require("./ops/exp");
var linear_combination_1 = require("./ops/linear_combination");
var log_1 = require("./ops/log");
var matmul_1 = require("./ops/matmul");
var max_pool_1 = require("./ops/max_pool");
var multiply_1 = require("./ops/multiply");
var reduce_sum_1 = require("./ops/reduce_sum");
var reshape_1 = require("./ops/reshape");
var softmax_1 = require("./ops/softmax");
var subtract_1 = require("./ops/subtract");
function emitFromGraphNodes(nodes) {
    var ops = [];
    nodes.forEach(function (node) { return Array.prototype.push.apply(ops, emitOpFromNode(node)); });
    return ops;
}
exports.emitFromGraphNodes = emitFromGraphNodes;
function emitOpFromNode(node) {
    if (node instanceof graph_1.ReshapeNode) {
        return [new reshape_1.Reshape(node.inputs[graph_1.ReshapeNode.X], node.output)];
    }
    else if (node instanceof graph_1.MatMulNode) {
        var x1 = node.inputs[graph_1.MatMulNode.X1];
        var x2 = node.inputs[graph_1.MatMulNode.X2];
        return [new matmul_1.MatMul(x1, x2, node.output)];
    }
    else if (node instanceof graph_1.Convolution2DNode) {
        var w = node.inputs[graph_1.Convolution2DNode.W];
        var x = node.inputs[graph_1.Convolution2DNode.X];
        var b = node.inputs[graph_1.Convolution2DNode.B];
        return [new convolution_1.Convolution2D(w, x, b, node.output, node.fieldSize, node.outputDepth, node.stride, node.zeroPad)];
    }
    else if (node instanceof graph_1.MaxPoolNode) {
        var x = node.inputs[graph_1.MaxPoolNode.X];
        return [new max_pool_1.MaxPool(x, node.output, node.fieldSize, node.stride, node.zeroPad)];
    }
    else if (node instanceof graph_1.ExpNode) {
        return [new exp_1.Exp(node.inputs[graph_1.ExpNode.X], node.output)];
    }
    else if (node instanceof graph_1.LogNode) {
        return [new log_1.Log(node.inputs[graph_1.LogNode.X], node.output)];
    }
    else if (node instanceof graph_1.ReLUNode) {
        return [new element_wise_activation_1.ReLU(node.inputs[graph_1.ReLUNode.X], node.output)];
    }
    else if (node instanceof graph_1.TanHNode) {
        return [new element_wise_activation_1.TanH(node.inputs[graph_1.TanHNode.X], node.output)];
    }
    else if (node instanceof graph_1.SigmoidNode) {
        return [new element_wise_activation_1.Sigmoid(node.inputs[graph_1.SigmoidNode.X], node.output)];
    }
    else if (node instanceof graph_1.SoftmaxCrossEntropyCostNode) {
        var x = node.inputs[graph_1.SoftmaxCrossEntropyCostNode.X];
        var target = node.inputs[graph_1.SoftmaxCrossEntropyCostNode.TARGET];
        return [new softmax_1.SoftmaxCrossEntropyCost(x, target, node.output)];
    }
    else if (node instanceof graph_1.SoftmaxNode) {
        return [new softmax_1.Softmax(node.inputs[graph_1.SoftmaxNode.X], node.output)];
    }
    else if (node instanceof graph_1.MeanSquaredCostNode) {
        var label = node.inputs[graph_1.MeanSquaredCostNode.LABEL];
        var prediction = node.inputs[graph_1.MeanSquaredCostNode.PREDICTION];
        return [new element_wise_cost_1.MeanSquaredCost(label, prediction, node.output)];
    }
    else if (node instanceof graph_1.ArgMaxEqualsNode) {
        return [new argmaxequals_1.ArgMaxEquals(node.inputs[graph_1.ArgMaxEqualsNode.X1], node.inputs[graph_1.ArgMaxEqualsNode.X2], node.output)];
    }
    else if (node instanceof graph_1.ArgMaxNode) {
        return [new argmax_1.ArgMax(node.x, node.output)];
    }
    else if (node instanceof graph_1.FusedLinearCombinationNode) {
        return [new linear_combination_1.LinearCombination(node.inputs[graph_1.FusedLinearCombinationNode.T1], node.inputs[graph_1.FusedLinearCombinationNode.T2], node.inputs[graph_1.FusedLinearCombinationNode.C1], node.inputs[graph_1.FusedLinearCombinationNode.C2], node.output)];
    }
    else if (node instanceof graph_1.Concat3DNode) {
        return [new concat3d_1.Concat3D(node.inputs[graph_1.Concat3DNode.X1], node.inputs[graph_1.Concat3DNode.X2], node.axis, node.output)];
    }
    else if (node instanceof graph_1.SquareNode) {
        return [new element_wise_activation_1.Square(node.inputs[graph_1.SquareNode.X], node.output)];
    }
    else if (node instanceof graph_1.AddNode) {
        return [new add_1.Add(node.inputs[graph_1.AddNode.T1], node.inputs[graph_1.AddNode.T2], node.output)];
    }
    else if (node instanceof graph_1.SubtractNode) {
        return [new subtract_1.Subtract(node.inputs[graph_1.SubtractNode.T1], node.inputs[graph_1.SubtractNode.T2], node.output)];
    }
    else if (node instanceof graph_1.MultiplyNode) {
        return [new multiply_1.Multiply(node.inputs[graph_1.MultiplyNode.T1], node.inputs[graph_1.MultiplyNode.T2], node.output)];
    }
    else if (node instanceof graph_1.DivideNode) {
        return [new divide_1.Divide(node.inputs[graph_1.DivideNode.T1], node.inputs[graph_1.DivideNode.T2], node.output)];
    }
    else if (node instanceof graph_1.ReduceSumNode) {
        return [new reduce_sum_1.ReduceSum(node.inputs[graph_1.ReduceSumNode.X], node.output)];
    }
    else if (graph_util.isInputNode(node)) {
        return [];
    }
    else {
        throw Error("Unsupported node type: " + node.constructor.name);
    }
}

},{"./graph":16,"./graph_util":17,"./ops/add":19,"./ops/argmax":20,"./ops/argmaxequals":21,"./ops/concat3d":22,"./ops/convolution":23,"./ops/divide":24,"./ops/element_wise_activation":25,"./ops/element_wise_cost":26,"./ops/exp":27,"./ops/linear_combination":28,"./ops/log":29,"./ops/matmul":30,"./ops/max_pool":31,"./ops/multiply":32,"./ops/reduce_sum":34,"./ops/reshape":35,"./ops/softmax":36,"./ops/subtract":37}],19:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Add = (function (_super) {
    __extends(Add, _super);
    function Add(x1Tensor, x2Tensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        util.assert(util.sizeFromShape(x1Tensor.shape) === 1 ||
            util.sizeFromShape(x2Tensor.shape) === 1 ||
            util.arraysEqual(x1Tensor.shape, x2Tensor.shape), 'One of t1 or t2 must be a scalar, or t1 and t2 must have ' +
            'the same shape');
        return _this;
    }
    Add.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            var result;
            if (util.isScalarShape(x1.shape)) {
                result = math.scalarPlusArray(x1, x2);
            }
            else if (util.isScalarShape(x2.shape)) {
                result = math.scalarPlusArray(x2, x1);
            }
            else {
                result = math.add(x1, x2);
            }
            inferenceArrays.set(_this.yTensor, keep(result));
        });
    };
    Add.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                if (util.isScalarShape(_this.x1Tensor.shape)) {
                    var sum = math.sum(dy);
                    if (_this.dySizeScalar == null) {
                        _this.dySizeScalar = ndarray_1.Scalar.new(dy.size);
                    }
                    gradientArrays.add(_this.x1Tensor, math.divide(sum, _this.dySizeScalar));
                }
                else {
                    gradientArrays.add(_this.x1Tensor, math.clone(dy));
                }
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                if (util.isScalarShape(_this.x2Tensor.shape)) {
                    var sum = math.sum(dy);
                    if (_this.dySizeScalar == null) {
                        _this.dySizeScalar = ndarray_1.Scalar.new(dy.size);
                    }
                    gradientArrays.add(_this.x2Tensor, math.divide(sum, _this.dySizeScalar));
                }
                else {
                    gradientArrays.add(_this.x2Tensor, math.clone(dy));
                }
            }
        });
    };
    Add.prototype.dispose = function () {
        if (this.dySizeScalar != null) {
            this.dySizeScalar.dispose();
        }
    };
    return Add;
}(op_1.Operation));
exports.Add = Add;

},{"../../math/ndarray":63,"../../util":95,"../graph_util":17,"./op":33}],20:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var op_1 = require("./op");
var ArgMax = (function (_super) {
    __extends(ArgMax, _super);
    function ArgMax(xTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        return _this;
    }
    ArgMax.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.argMax(x)));
        });
    };
    ArgMax.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        throw new Error('ArgMax backprop unimplemented');
    };
    return ArgMax;
}(op_1.Operation));
exports.ArgMax = ArgMax;

},{"./op":33}],21:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var op_1 = require("./op");
var ArgMaxEquals = (function (_super) {
    __extends(ArgMaxEquals, _super);
    function ArgMaxEquals(x1Tensor, x2Tensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        return _this;
    }
    ArgMaxEquals.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.argMaxEquals(x1, x2)));
        });
    };
    ArgMaxEquals.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        throw new Error('ArgMaxEquals backprop unimplemented');
    };
    return ArgMaxEquals;
}(op_1.Operation));
exports.ArgMaxEquals = ArgMaxEquals;

},{"./op":33}],22:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var concat_util = require("../../math/concat_util");
var op_1 = require("./op");
var Concat3D = (function (_super) {
    __extends(Concat3D, _super);
    function Concat3D(x1Tensor, x2Tensor, axis, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.axis = axis;
        _this.yTensor = yTensor;
        concat_util.assertParams(x1Tensor.shape, x2Tensor.shape, axis);
        return _this;
    }
    Concat3D.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            var concatResult = math.concat3D(x1, x2, _this.axis);
            inferenceArrays.set(_this.yTensor, keep(concatResult));
        });
    };
    Concat3D.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        throw new Error('Concat3D backprop not implemented.');
    };
    return Concat3D;
}(op_1.Operation));
exports.Concat3D = Concat3D;

},{"../../math/concat_util":56,"./op":33}],23:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var conv_util = require("../../math/conv_util");
var util = require("../../util");
var op_1 = require("./op");
var Convolution2D = (function (_super) {
    __extends(Convolution2D, _super);
    function Convolution2D(wTensor, xTensor, bTensor, yTensor, fieldSize, outputDepth, stride, zeroPad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this) || this;
        _this.wTensor = wTensor;
        _this.xTensor = xTensor;
        _this.bTensor = bTensor;
        _this.yTensor = yTensor;
        _this.fieldSize = fieldSize;
        _this.outputDepth = outputDepth;
        _this.stride = stride;
        _this.assertWeightsShape(wTensor.shape);
        _this.zeroPad = zeroPad != null ?
            zeroPad :
            conv_util.computeDefaultPad(_this.xTensor.shape, _this.fieldSize, _this.stride);
        util.assert(util.isInt(_this.zeroPad), "The zero padding (" + _this.zeroPad + ") must be an integer. Change the " +
            "stride and/or zero pad parameters");
        return _this;
    }
    Convolution2D.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var weights = inferenceArrays.get(this.wTensor);
        var biases = inferenceArrays.get(this.bTensor);
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.conv2d(x, weights, biases, _this.stride, _this.zeroPad)));
        });
    };
    Convolution2D.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var weights = inferenceArrays.get(this.wTensor);
        var x = inferenceArrays.get(this.xTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            var _a = math.conv2dBackProp(x, dy, weights, _this.stride, _this.zeroPad), dw = _a.dw, db = _a.db, dx = _a.dx;
            gradientArrays.add(_this.wTensor, dw);
            gradientArrays.add(_this.bTensor, db);
            gradientArrays.add(_this.xTensor, dx);
        });
    };
    Convolution2D.prototype.assertWeightsShape = function (weightsShape) {
        util.assert(weightsShape[0] === this.fieldSize &&
            weightsShape[1] === this.fieldSize &&
            weightsShape[2] === this.xTensor.shape[2] &&
            weightsShape[3] === this.outputDepth, "weights must be of shape [" + this.fieldSize + "," + this.fieldSize + "," +
            (this.xTensor.shape[2] + "," + this.outputDepth + "] but they are of") +
            ("shape [" + weightsShape + "]"));
    };
    return Convolution2D;
}(op_1.Operation));
exports.Convolution2D = Convolution2D;

},{"../../math/conv_util":57,"../../util":95,"./op":33}],24:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Divide = (function (_super) {
    __extends(Divide, _super);
    function Divide(x1Tensor, x2Tensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        util.assert(util.sizeFromShape(x1Tensor.shape) === 1 ||
            util.sizeFromShape(x2Tensor.shape) === 1 ||
            util.arraysEqual(x1Tensor.shape, x2Tensor.shape), 'One of t1 or t2 must be a scalar, or t1 and t2 must have ' +
            'the same shape');
        return _this;
    }
    Divide.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var t1 = inferenceArrays.get(this.x1Tensor);
        var t2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            var result;
            if (util.isScalarShape(t1.shape)) {
                result = math.scalarDividedByArray(t1, t2);
            }
            else if (util.isScalarShape(t2.shape)) {
                result = math.arrayDividedByScalar(t1, t2);
            }
            else {
                result = math.divide(t1, t2);
            }
            inferenceArrays.set(_this.yTensor, keep(result));
        });
    };
    Divide.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        var dy = gradientArrays.get(this.yTensor);
        var x1IsScalar = util.isScalarShape(x1.shape);
        var x2IsScalar = util.isScalarShape(x2.shape);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                if (x1IsScalar) {
                    var div = math.divide(dy, x2);
                    gradientArrays.add(_this.x1Tensor, math.sum(div));
                    div.dispose();
                }
                else if (x2IsScalar) {
                    gradientArrays.add(_this.x1Tensor, math.arrayDividedByScalar(dy, x2));
                }
                else {
                    gradientArrays.add(_this.x1Tensor, math.divide(dy, x2));
                }
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                var x2Squared = math.elementWiseMul(x2, x2);
                var x1OverX2Squared = void 0;
                if (x2IsScalar) {
                    x1OverX2Squared = math.arrayDividedByScalar(x1, x2Squared);
                }
                else if (x1IsScalar) {
                    x1OverX2Squared = math.scalarDividedByArray(x1, x2Squared);
                }
                else {
                    x1OverX2Squared = math.divide(x1, x2Squared);
                }
                var dx2 = math.neg(x1OverX2Squared);
                var dyTimesDerivative = math.elementWiseMul(dy, dx2);
                if (x2IsScalar) {
                    gradientArrays.add(_this.x2Tensor, math.sum(dyTimesDerivative));
                }
                else {
                    gradientArrays.add(_this.x2Tensor, dyTimesDerivative);
                }
            }
        });
    };
    return Divide;
}(op_1.Operation));
exports.Divide = Divide;

},{"../../util":95,"../graph_util":17,"./op":33}],25:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var activation_functions_1 = require("../../math/activation_functions");
var op_1 = require("./op");
var ElementWiseActivation = (function (_super) {
    __extends(ElementWiseActivation, _super);
    function ElementWiseActivation(xTensor, yTensor, func) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        _this.func = func;
        return _this;
    }
    ElementWiseActivation.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(_this.func.output(math, x)));
        });
    };
    ElementWiseActivation.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        var y = inferenceArrays.get(this.yTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            var dydx = _this.func.der(math, x, y);
            gradientArrays.add(_this.xTensor, math.elementWiseMul(dy, dydx));
            dydx.dispose();
        });
    };
    return ElementWiseActivation;
}(op_1.Operation));
exports.ElementWiseActivation = ElementWiseActivation;
var ReLU = (function (_super) {
    __extends(ReLU, _super);
    function ReLU(xTensor, yTensor) {
        return _super.call(this, xTensor, yTensor, new activation_functions_1.ReLUFunc()) || this;
    }
    return ReLU;
}(ElementWiseActivation));
exports.ReLU = ReLU;
var TanH = (function (_super) {
    __extends(TanH, _super);
    function TanH(xTensor, yTensor) {
        return _super.call(this, xTensor, yTensor, new activation_functions_1.TanHFunc()) || this;
    }
    return TanH;
}(ElementWiseActivation));
exports.TanH = TanH;
var Sigmoid = (function (_super) {
    __extends(Sigmoid, _super);
    function Sigmoid(xTensor, yTensor) {
        return _super.call(this, xTensor, yTensor, new activation_functions_1.SigmoidFunc()) || this;
    }
    return Sigmoid;
}(ElementWiseActivation));
exports.Sigmoid = Sigmoid;
var Square = (function (_super) {
    __extends(Square, _super);
    function Square(xTensor, yTensor) {
        return _super.call(this, xTensor, yTensor, new activation_functions_1.SquareFunc()) || this;
    }
    return Square;
}(ElementWiseActivation));
exports.Square = Square;

},{"../../math/activation_functions":53,"./op":33}],26:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var cost_functions_1 = require("../../math/cost_functions");
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var ElementWiseCost = (function (_super) {
    __extends(ElementWiseCost, _super);
    function ElementWiseCost(x1Tensor, x2Tensor, yTensor, func) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        _this.func = func;
        _this.oneOverNScalar = ndarray_1.Scalar.new(1 / util.sizeFromShape(x1Tensor.shape));
        return _this;
    }
    ElementWiseCost.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            var elementWiseCost = _this.func.cost(math, x1, x2);
            var sum = math.sum(elementWiseCost);
            var result = math.scalarTimesArray(_this.oneOverNScalar, sum);
            inferenceArrays.set(_this.yTensor, keep(result));
        });
    };
    ElementWiseCost.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                gradientArrays.add(_this.x1Tensor, _this.func.der(math, x1, x2));
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                gradientArrays.add(_this.x2Tensor, _this.func.der(math, x2, x1));
            }
        });
    };
    ElementWiseCost.prototype.dispose = function () {
        this.func.dispose();
        this.oneOverNScalar.dispose();
    };
    return ElementWiseCost;
}(op_1.Operation));
exports.ElementWiseCost = ElementWiseCost;
var MeanSquaredCost = (function (_super) {
    __extends(MeanSquaredCost, _super);
    function MeanSquaredCost(x1Tensor, x2Tensor, yTensor) {
        return _super.call(this, x1Tensor, x2Tensor, yTensor, new cost_functions_1.SquareCostFunc()) || this;
    }
    return MeanSquaredCost;
}(ElementWiseCost));
exports.MeanSquaredCost = MeanSquaredCost;

},{"../../math/cost_functions":59,"../../math/ndarray":63,"../../util":95,"../graph_util":17,"./op":33}],27:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Exp = (function (_super) {
    __extends(Exp, _super);
    function Exp(xTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        return _this;
    }
    Exp.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.exp(x)));
        });
    };
    Exp.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var y = inferenceArrays.get(this.yTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.xTensor)) {
                gradientArrays.add(_this.xTensor, math.elementWiseMul(y, dy));
            }
        });
    };
    return Exp;
}(op_1.Operation));
exports.Exp = Exp;

},{"../graph_util":17,"./op":33}],28:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var graph_util = require("../graph_util");
var op_1 = require("./op");
var LinearCombination = (function (_super) {
    __extends(LinearCombination, _super);
    function LinearCombination(x1Tensor, x2Tensor, c1Tensor, c2Tensor, outTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.c1Tensor = c1Tensor;
        _this.c2Tensor = c2Tensor;
        _this.outTensor = outTensor;
        return _this;
    }
    LinearCombination.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        var c1 = inferenceArrays.get(this.c1Tensor).asScalar();
        var c2 = inferenceArrays.get(this.c2Tensor).asScalar();
        math.scope(function (keep) {
            inferenceArrays.set(_this.outTensor, keep(math.scaledArrayAdd(c1, x1, c2, x2)));
        });
    };
    LinearCombination.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        var c1 = inferenceArrays.get(this.c1Tensor);
        var c2 = inferenceArrays.get(this.c2Tensor);
        var dy = gradientArrays.get(this.outTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                gradientArrays.add(_this.x1Tensor, math.scalarTimesArray(c1, dy));
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                gradientArrays.add(_this.x2Tensor, math.scalarTimesArray(c2, dy));
            }
            if (graph_util.shouldBackProp(_this.c1Tensor)) {
                var dotProduct1 = math.elementWiseMul(x1, dy);
                gradientArrays.add(_this.c1Tensor, math.sum(dotProduct1));
            }
            if (graph_util.shouldBackProp(_this.c2Tensor)) {
                var dotProduct2 = math.elementWiseMul(x2, dy);
                gradientArrays.add(_this.c2Tensor, math.sum(dotProduct2));
            }
        });
    };
    return LinearCombination;
}(op_1.Operation));
exports.LinearCombination = LinearCombination;

},{"../graph_util":17,"./op":33}],29:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Log = (function (_super) {
    __extends(Log, _super);
    function Log(xTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        return _this;
    }
    Log.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.log(x)));
        });
    };
    Log.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.xTensor)) {
                gradientArrays.add(_this.xTensor, math.divide(dy, x));
            }
        });
    };
    return Log;
}(op_1.Operation));
exports.Log = Log;

},{"../graph_util":17,"./op":33}],30:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("../../math/math");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var MatMul = (function (_super) {
    __extends(MatMul, _super);
    function MatMul(x1Tensor, x2Tensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        return _this;
    }
    MatMul.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            if (x1.shape.length === 2 && x2.shape.length === 2) {
                inferenceArrays.set(_this.yTensor, keep(math.matMul(x1, x2)));
            }
            else if (x1.shape.length === 2 && x2.shape.length === 1) {
                inferenceArrays.set(_this.yTensor, keep(math.matrixTimesVector(x1, x2)));
            }
            else if (x1.shape.length === 1 && x2.shape.length === 2) {
                inferenceArrays.set(_this.yTensor, keep(math.vectorTimesMatrix(x1, x2)));
            }
        });
    };
    MatMul.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        var dy = gradientArrays.get(this.yTensor);
        if (x1.shape.length === 1) {
            x1 = x1.reshape([1, x1.size]);
            dy = dy.reshape([1, dy.size]);
        }
        if (x2.shape.length === 1) {
            x2 = x2.reshape([x2.size, 1]);
            dy = dy.reshape([dy.size, 1]);
        }
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                var dx1 = math.matMul(dy, x2, math_1.MatrixOrientation.REGULAR, math_1.MatrixOrientation.TRANSPOSED);
                gradientArrays.add(_this.x1Tensor, _this.x1Tensor.shape.length === 1 ? dx1.as1D() : dx1);
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                var dx2 = math.matMul(x1, dy, math_1.MatrixOrientation.TRANSPOSED, math_1.MatrixOrientation.REGULAR);
                gradientArrays.add(_this.x2Tensor, _this.x2Tensor.shape.length === 1 ? dx2.as1D() : dx2);
            }
        });
    };
    return MatMul;
}(op_1.Operation));
exports.MatMul = MatMul;

},{"../../math/math":60,"../graph_util":17,"./op":33}],31:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var conv_util = require("../../math/conv_util");
var util = require("../../util");
var op_1 = require("./op");
var MaxPool = (function (_super) {
    __extends(MaxPool, _super);
    function MaxPool(xTensor, yTensor, fieldSize, stride, pad) {
        if (stride === void 0) { stride = 1; }
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        _this.fieldSize = fieldSize;
        _this.stride = stride;
        if (pad != null) {
            _this.pad = pad;
        }
        else {
            _this.pad = conv_util.computeDefaultPad(xTensor.shape, _this.fieldSize, _this.stride);
        }
        util.assert(util.isInt(_this.pad), "The zero padding (" + _this.pad + ") must be an integer. Change the " +
            "stride and/or zero pad parameters");
        return _this;
    }
    MaxPool.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(math.maxPool(x, _this.fieldSize, _this.stride, _this.pad)));
        });
    };
    MaxPool.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            gradientArrays.add(_this.xTensor, math.maxPoolBackprop(dy, x, _this.fieldSize, _this.stride, _this.pad));
        });
    };
    return MaxPool;
}(op_1.Operation));
exports.MaxPool = MaxPool;

},{"../../math/conv_util":57,"../../util":95,"./op":33}],32:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Multiply = (function (_super) {
    __extends(Multiply, _super);
    function Multiply(x1Tensor, x2Tensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.x1Tensor = x1Tensor;
        _this.x2Tensor = x2Tensor;
        _this.yTensor = yTensor;
        util.assert(util.sizeFromShape(x1Tensor.shape) === 1 ||
            util.sizeFromShape(x2Tensor.shape) === 1 ||
            util.arraysEqual(x1Tensor.shape, x2Tensor.shape), 'One of t1 or t2 must be a scalar, or t1 and t2 must have ' +
            'the same shape');
        return _this;
    }
    Multiply.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var t1 = inferenceArrays.get(this.x1Tensor);
        var t2 = inferenceArrays.get(this.x2Tensor);
        math.scope(function (keep) {
            var result;
            if (util.isScalarShape(t1.shape)) {
                result = math.scalarTimesArray(t1, t2);
            }
            else if (util.isScalarShape(t2.shape)) {
                result = math.scalarTimesArray(t2, t1);
            }
            else {
                result = math.elementWiseMul(t1, t2);
            }
            inferenceArrays.set(_this.yTensor, keep(result));
        });
    };
    Multiply.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var x1 = inferenceArrays.get(this.x1Tensor);
        var x2 = inferenceArrays.get(this.x2Tensor);
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.x1Tensor)) {
                if (util.isScalarShape(_this.x1Tensor.shape)) {
                    var mul = math.elementWiseMul(dy, x2);
                    gradientArrays.add(_this.x1Tensor, math.sum(mul));
                }
                else if (util.isScalarShape(x2.shape)) {
                    gradientArrays.add(_this.x1Tensor, math.scalarTimesArray(x2, dy));
                }
                else {
                    gradientArrays.add(_this.x1Tensor, math.elementWiseMul(x2, dy));
                }
            }
            if (graph_util.shouldBackProp(_this.x2Tensor)) {
                if (util.isScalarShape(_this.x2Tensor.shape)) {
                    var mul = math.elementWiseMul(dy, x1);
                    gradientArrays.add(_this.x2Tensor, math.sum(mul));
                }
                else if (util.isScalarShape(x1.shape)) {
                    gradientArrays.add(_this.x2Tensor, math.scalarTimesArray(x1, dy));
                }
                else {
                    gradientArrays.add(_this.x2Tensor, math.elementWiseMul(x1, dy));
                }
            }
        });
    };
    return Multiply;
}(op_1.Operation));
exports.Multiply = Multiply;

},{"../../util":95,"../graph_util":17,"./op":33}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operation = (function () {
    function Operation() {
    }
    Operation.prototype.disposeTransientArrays = function (inferenceArrays, gradientArrays) { };
    Operation.prototype.dispose = function () { };
    return Operation;
}());
exports.Operation = Operation;

},{}],34:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var ReduceSum = (function (_super) {
    __extends(ReduceSum, _super);
    function ReduceSum(x, outTensor) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.outTensor = outTensor;
        util.assertShapesMatch(outTensor.shape, []);
        return _this;
    }
    ReduceSum.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.x);
        math.scope(function (keep) {
            inferenceArrays.set(_this.outTensor, keep(math.sum(x)));
        });
    };
    ReduceSum.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        if (!graph_util.shouldBackProp(this.x)) {
            return;
        }
        math.scope(function () {
            var dy = gradientArrays.get(_this.outTensor);
            if (_this.ones == null) {
                var xArray = inferenceArrays.get(_this.x);
                _this.ones = ndarray_1.NDArray.zerosLike(xArray);
                _this.ones.fill(1);
            }
            gradientArrays.add(_this.x, math.scalarTimesArray(dy, _this.ones));
        });
    };
    return ReduceSum;
}(op_1.Operation));
exports.ReduceSum = ReduceSum;

},{"../../math/ndarray":63,"../../util":95,"../graph_util":17,"./op":33}],35:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var op_1 = require("./op");
var Reshape = (function (_super) {
    __extends(Reshape, _super);
    function Reshape(xTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.xTensor = xTensor;
        _this.yTensor = yTensor;
        var xSize = util.sizeFromShape(xTensor.shape);
        var ySize = util.sizeFromShape(yTensor.shape);
        util.assert(xSize === ySize, "The input size (" + xSize + ") and output size (" + ySize + ") must match");
        return _this;
    }
    Reshape.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var x = inferenceArrays.get(this.xTensor);
        math.scope(function (keep) {
            inferenceArrays.set(_this.yTensor, keep(x.reshape(_this.yTensor.shape)));
        });
    };
    Reshape.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var dy = gradientArrays.get(this.yTensor);
        math.scope(function () {
            gradientArrays.add(_this.xTensor, dy.reshape(_this.xTensor.shape));
        });
    };
    return Reshape;
}(op_1.Operation));
exports.Reshape = Reshape;

},{"../../util":95,"./op":33}],36:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_1 = require("../graph");
var op_1 = require("./op");
var Softmax = (function (_super) {
    __extends(Softmax, _super);
    function Softmax(logitsTensor, output) {
        var _this = _super.call(this) || this;
        _this.logitsTensor = logitsTensor;
        _this.output = output;
        return _this;
    }
    Softmax.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var logits = inferenceArrays.get(this.logitsTensor);
        return math.scope(function (keep) {
            inferenceArrays.set(_this.output, keep(math.softmax(logits)));
        });
    };
    Softmax.prototype.backProp = function () {
        throw Error('Softmax backprop is not yet implemented');
    };
    return Softmax;
}(op_1.Operation));
exports.Softmax = Softmax;
var SoftmaxCrossEntropyCost = (function (_super) {
    __extends(SoftmaxCrossEntropyCost, _super);
    function SoftmaxCrossEntropyCost(logitsTensor, labelTensor, yTensor) {
        var _this = _super.call(this) || this;
        _this.logitsTensor = logitsTensor;
        _this.labelTensor = labelTensor;
        _this.yTensor = yTensor;
        _this.epsilon = ndarray_1.Scalar.new(1e-5);
        _this.softmaxTensor = new graph_1.Tensor(logitsTensor.shape);
        return _this;
    }
    SoftmaxCrossEntropyCost.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var logits = inferenceArrays.get(this.logitsTensor);
        var label = inferenceArrays.get(this.labelTensor);
        math.scope(function (keep) {
            var softmaxResult = math.softmax(logits);
            inferenceArrays.set(_this.softmaxTensor, keep(softmaxResult));
            inferenceArrays.set(_this.yTensor, keep(crossEntropyCost(math, softmaxResult, label, _this.epsilon)));
        });
    };
    SoftmaxCrossEntropyCost.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var softmax = inferenceArrays.get(this.softmaxTensor);
        var label = inferenceArrays.get(this.labelTensor);
        math.scope(function () {
            gradientArrays.add(_this.logitsTensor, math.subtract(softmax, label));
        });
    };
    SoftmaxCrossEntropyCost.prototype.disposeTransientArrays = function (inferenceArrays, gradientArrays) {
        inferenceArrays.disposeArray(this.softmaxTensor);
    };
    SoftmaxCrossEntropyCost.prototype.dispose = function () {
        this.epsilon.dispose();
    };
    return SoftmaxCrossEntropyCost;
}(op_1.Operation));
exports.SoftmaxCrossEntropyCost = SoftmaxCrossEntropyCost;
function crossEntropyCost(math, y, target, epsilon) {
    util.assert(y.size === target.size, 'The output and target must be the same size');
    return math.scope(function () {
        var yPlusEps = math.scalarPlusArray(epsilon, y);
        var logOutput = math.log(yPlusEps);
        var tarLogOutput = math.elementWiseMul(target, logOutput);
        var costVector = math.neg(tarLogOutput);
        return math.sum(costVector);
    });
}
exports.crossEntropyCost = crossEntropyCost;

},{"../../math/ndarray":63,"../../util":95,"../graph":16,"./op":33}],37:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var util = require("../../util");
var graph_util = require("../graph_util");
var op_1 = require("./op");
var Subtract = (function (_super) {
    __extends(Subtract, _super);
    function Subtract(t1, t2, outTensor) {
        var _this = _super.call(this) || this;
        _this.t1 = t1;
        _this.t2 = t2;
        _this.outTensor = outTensor;
        util.assert(util.sizeFromShape(t1.shape) === 1 ||
            util.sizeFromShape(t2.shape) === 1 ||
            util.arraysEqual(t1.shape, t2.shape), 'One of t1 or t2 must be a scalar, or t1 and t2 must have ' +
            'the same shape');
        return _this;
    }
    Subtract.prototype.feedForward = function (math, inferenceArrays) {
        var _this = this;
        var t1 = inferenceArrays.get(this.t1);
        var t2 = inferenceArrays.get(this.t2);
        math.scope(function (keep) {
            var result;
            if (util.isScalarShape(t1.shape)) {
                result = math.scalarMinusArray(t1, t2);
            }
            else if (util.isScalarShape(t2.shape)) {
                result = math.arrayMinusScalar(t1, t2);
            }
            else {
                result = math.subtract(t1, t2);
            }
            inferenceArrays.set(_this.outTensor, keep(result));
        });
    };
    Subtract.prototype.backProp = function (math, inferenceArrays, gradientArrays) {
        var _this = this;
        var dy = gradientArrays.get(this.outTensor);
        math.scope(function () {
            if (graph_util.shouldBackProp(_this.t1)) {
                if (util.isScalarShape(_this.t1.shape)) {
                    var sum = math.sum(dy);
                    if (_this.dySizeScalar == null) {
                        _this.dySizeScalar = ndarray_1.Scalar.new(dy.size);
                    }
                    gradientArrays.add(_this.t1, math.divide(sum, _this.dySizeScalar));
                }
                else {
                    gradientArrays.add(_this.t1, math.clone(dy));
                }
            }
            if (graph_util.shouldBackProp(_this.t2)) {
                if (util.isScalarShape(_this.t2.shape)) {
                    var sum = math.sum(dy);
                    var negSum = math.neg(sum);
                    if (_this.dySizeScalar == null) {
                        _this.dySizeScalar = ndarray_1.Scalar.new(dy.size);
                    }
                    gradientArrays.add(_this.t2, math.divide(negSum, _this.dySizeScalar));
                }
                else {
                    gradientArrays.add(_this.t2, math.neg(dy));
                }
            }
        });
    };
    Subtract.prototype.dispose = function () {
        if (this.dySizeScalar != null) {
            this.dySizeScalar.dispose();
        }
    };
    return Subtract;
}(op_1.Operation));
exports.Subtract = Subtract;

},{"../../math/ndarray":63,"../../util":95,"../graph_util":17,"./op":33}],38:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var AdadeltaOptimizer = (function (_super) {
    __extends(AdadeltaOptimizer, _super);
    function AdadeltaOptimizer(learningRate, gamma, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.gamma = gamma;
        _this.accumulatedSquaredGradients = new tensor_array_map_1.TensorArrayMap();
        _this.accumulatedUpdates = new tensor_array_map_1.TensorArrayMap();
        _this.eps = ndarray_1.Scalar.new(1e-6);
        _this.g = ndarray_1.Scalar.new(_this.gamma);
        return _this;
    }
    AdadeltaOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.accumulatedSquaredGradients.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.accumulatedSquaredGradients.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
                _this.accumulatedUpdates.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    AdadeltaOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldCache = _this.accumulatedSquaredGradients.get(node.output);
                var oldUpdates = _this.accumulatedUpdates.get(node.output);
                var gradientSquare = math.multiply(gradient, gradient);
                var cache = math.scaledArrayAdd(_this.g, oldCache, math.subtract(_this.one, _this.g), gradientSquare);
                var updates = math.multiply(math.divide(math.sqrt(math.add(oldUpdates, _this.eps)), math.sqrt(math.add(oldCache, _this.eps))), gradient);
                var variable = math.scaledArrayAdd(_this.c, updates, _this.one, oldVariable);
                var updateSquare = math.multiply(updates, updates);
                var newUpdates = math.scaledArrayAdd(_this.g, oldUpdates, math.subtract(_this.one, _this.g), updateSquare);
                _this.accumulatedSquaredGradients.set(node.output, keep(cache));
                _this.accumulatedUpdates.set(node.output, keep(newUpdates));
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                oldVariable.dispose();
                oldCache.dispose();
                oldUpdates.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    AdadeltaOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.eps.dispose();
        this.g.dispose();
        this.accumulatedSquaredGradients.dispose();
        this.accumulatedUpdates.dispose();
    };
    return AdadeltaOptimizer;
}(optimizer_1.Optimizer));
exports.AdadeltaOptimizer = AdadeltaOptimizer;

},{"../../math/ndarray":63,"../tensor_array_map":49,"./optimizer":43}],39:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var AdagradOptimizer = (function (_super) {
    __extends(AdagradOptimizer, _super);
    function AdagradOptimizer(learningRate, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.accumulatedSquaredGradients = new tensor_array_map_1.TensorArrayMap();
        _this.eps = ndarray_1.Scalar.new(1e-6);
        return _this;
    }
    AdagradOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.accumulatedSquaredGradients.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.accumulatedSquaredGradients.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    AdagradOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldCache = _this.accumulatedSquaredGradients.get(node.output);
                var gradientSquare = math.multiply(gradient, gradient);
                var cache = math.add(oldCache, gradientSquare);
                var variable = math.scaledArrayAdd(_this.c, math.divide(gradient, math.add(math.sqrt(cache), _this.eps)), _this.one, oldVariable);
                _this.accumulatedSquaredGradients.set(node.output, keep(cache));
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                oldVariable.dispose();
                oldCache.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    AdagradOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.eps.dispose();
        this.accumulatedSquaredGradients.dispose();
    };
    return AdagradOptimizer;
}(optimizer_1.Optimizer));
exports.AdagradOptimizer = AdagradOptimizer;

},{"../../math/ndarray":63,"../tensor_array_map":49,"./optimizer":43}],40:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var AdamOptimizer = (function (_super) {
    __extends(AdamOptimizer, _super);
    function AdamOptimizer(learningRate, beta1, beta2, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.beta1 = beta1;
        _this.beta2 = beta2;
        _this.firstMoment = new tensor_array_map_1.TensorArrayMap();
        _this.secondMoment = new tensor_array_map_1.TensorArrayMap();
        _this.eps = ndarray_1.Scalar.new(1e-8);
        _this.b1 = ndarray_1.Scalar.new(_this.beta1);
        _this.b2 = ndarray_1.Scalar.new(_this.beta2);
        _this.accB1 = ndarray_1.Scalar.new(_this.beta1);
        _this.accB2 = ndarray_1.Scalar.new(_this.beta2);
        return _this;
    }
    AdamOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.firstMoment.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.firstMoment.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
        if (this.secondMoment.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.secondMoment.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    AdamOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldFirstMoment = _this.firstMoment.get(node.output);
                var oldSecondMoment = _this.secondMoment.get(node.output);
                var newFirstMoment = math.scaledArrayAdd(_this.b1, oldFirstMoment, math.subtract(_this.one, _this.b1), gradient);
                var gradientSquare = math.multiply(gradient, gradient);
                var newSecondMoment = math.scaledArrayAdd(_this.b2, oldSecondMoment, math.subtract(_this.one, _this.b2), gradientSquare);
                var biasCorrectedFirstMoment = math.divide(newFirstMoment, math.subtract(_this.one, _this.accB1));
                var biasCorrectedSecondMoment = math.divide(newSecondMoment, math.subtract(_this.one, _this.accB2));
                var variable = math.scaledArrayAdd(_this.c, math.divide(biasCorrectedFirstMoment, math.add(math.sqrt(biasCorrectedSecondMoment), _this.eps)), _this.one, oldVariable);
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                _this.firstMoment.set(node.output, keep(newFirstMoment));
                _this.secondMoment.set(node.output, keep(newSecondMoment));
                oldVariable.dispose();
                gradient.dispose();
                oldFirstMoment.dispose();
                oldSecondMoment.dispose();
            });
            _this.accB1 = keep(math.multiply(_this.accB1, _this.b1));
            _this.accB2 = keep(math.multiply(_this.accB2, _this.b2));
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    AdamOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.firstMoment.dispose();
        this.secondMoment.dispose();
        this.eps.dispose();
        this.b1.dispose();
        this.b2.dispose();
        this.accB1.dispose();
        this.accB2.dispose();
    };
    return AdamOptimizer;
}(optimizer_1.Optimizer));
exports.AdamOptimizer = AdamOptimizer;

},{"../../math/ndarray":63,"../tensor_array_map":49,"./optimizer":43}],41:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var AdamaxOptimizer = (function (_super) {
    __extends(AdamaxOptimizer, _super);
    function AdamaxOptimizer(learningRate, beta1, beta2, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.beta1 = beta1;
        _this.beta2 = beta2;
        _this.firstMoment = new tensor_array_map_1.TensorArrayMap();
        _this.weightedInfNorm = new tensor_array_map_1.TensorArrayMap();
        _this.b1 = ndarray_1.Scalar.new(_this.beta1);
        _this.b2 = ndarray_1.Scalar.new(_this.beta2);
        return _this;
    }
    AdamaxOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.firstMoment.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.firstMoment.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
        if (this.weightedInfNorm.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.weightedInfNorm.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    AdamaxOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldFirstMoment = _this.firstMoment.get(node.output);
                var oldWeightedInfNorm = _this.weightedInfNorm.get(node.output);
                var newFirstMoment = math.scaledArrayAdd(_this.b1, oldFirstMoment, math.subtract(_this.one, _this.b1), gradient);
                var ut0 = math.multiply(_this.b2, oldWeightedInfNorm);
                var ut1 = math.abs(gradient);
                var newWeightedInfNorm = math.add(math.relu(math.subtract(ut0, ut1)), ut1);
                var variable = math.scaledArrayAdd(_this.one, oldVariable, math.divide(_this.c, math.subtract(_this.one, _this.b1)), math.divide(newFirstMoment, newWeightedInfNorm));
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                _this.firstMoment.set(node.output, keep(newFirstMoment));
                _this.weightedInfNorm.set(node.output, keep(newWeightedInfNorm));
                oldVariable.dispose();
                gradient.dispose();
                oldFirstMoment.dispose();
                oldWeightedInfNorm.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    AdamaxOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.firstMoment.dispose();
        this.weightedInfNorm.dispose();
        this.eps.dispose();
        this.b1.dispose();
        this.b2.dispose();
    };
    return AdamaxOptimizer;
}(optimizer_1.Optimizer));
exports.AdamaxOptimizer = AdamaxOptimizer;

},{"../../math/ndarray":63,"../tensor_array_map":49,"./optimizer":43}],42:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var tensor_array_map_1 = require("../tensor_array_map");
var sgd_optimizer_1 = require("./sgd_optimizer");
var MomentumOptimizer = (function (_super) {
    __extends(MomentumOptimizer, _super);
    function MomentumOptimizer(learningRate, momentum, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.momentum = momentum;
        _this.variableVelocities = new tensor_array_map_1.TensorArrayMap();
        _this.m = ndarray_1.Scalar.new(_this.momentum);
        return _this;
    }
    MomentumOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.variableVelocities.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.variableVelocities.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    MomentumOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldVelocity = _this.variableVelocities.get(node.output);
                var velocity = math.scaledArrayAdd(_this.m, oldVelocity, _this.one, gradient);
                var variable = math.scaledArrayAdd(_this.c, velocity, _this.one, oldVariable);
                _this.variableVelocities.set(node.output, keep(velocity));
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                oldVariable.dispose();
                oldVelocity.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    MomentumOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.m.dispose();
        this.variableVelocities.dispose();
    };
    MomentumOptimizer.prototype.setMomentum = function (momentum) {
        this.momentum = momentum;
    };
    return MomentumOptimizer;
}(sgd_optimizer_1.SGDOptimizer));
exports.MomentumOptimizer = MomentumOptimizer;

},{"../../math/ndarray":63,"../tensor_array_map":49,"./sgd_optimizer":45}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var session_util = require("../session_util");
var tensor_array_map_1 = require("../tensor_array_map");
var Optimizer = (function () {
    function Optimizer(learningRate, specifiedVariableList) {
        this.learningRate = learningRate;
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
        this.one = ndarray_1.Scalar.new(1);
        if (specifiedVariableList != null) {
            this.specifiedVariableNodes = specifiedVariableList;
        }
    }
    Optimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        this.variableNodes = this.specifiedVariableNodes == null ?
            session_util.getVariableNodesFromEvaluationSet(runtime.nodes) :
            this.specifiedVariableNodes;
        if (batchSize !== this.prevBatchSize) {
            if (this.c != null) {
                this.c.dispose();
            }
            this.prevBatchSize = batchSize;
            this.c = ndarray_1.Scalar.new(-this.learningRate / batchSize);
        }
        this.variableNodes.forEach(function (node) { return _this.variableGradients.set(node.output, ndarray_1.NDArray.zeros(node.output.shape)); });
    };
    Optimizer.prototype.afterExample = function (math, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var gradient = gradientArrayMap.get(node.output);
                var accumulatedGradient = _this.variableGradients.get(node.output);
                _this.variableGradients.set(node.output, keep(math.add(gradient, accumulatedGradient)));
                accumulatedGradient.dispose();
            });
        });
    };
    Optimizer.prototype.dispose = function () {
        if (this.c != null) {
            this.c.dispose();
        }
        this.one.dispose();
    };
    return Optimizer;
}());
exports.Optimizer = Optimizer;

},{"../../math/ndarray":63,"../session_util":48,"../tensor_array_map":49}],44:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../../math/ndarray");
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var RMSPropOptimizer = (function (_super) {
    __extends(RMSPropOptimizer, _super);
    function RMSPropOptimizer(learningRate, gamma, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        _this.gamma = gamma;
        _this.accumulatedSquaredGradients = new tensor_array_map_1.TensorArrayMap();
        _this.eps = ndarray_1.Scalar.new(1e-6);
        _this.g = ndarray_1.Scalar.new(_this.gamma);
        return _this;
    }
    RMSPropOptimizer.prototype.beforeBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        _super.prototype.beforeBatch.call(this, math, batchSize, runtime, activationArrayMap, gradientArrayMap);
        if (this.accumulatedSquaredGradients.size() === 0) {
            this.variableNodes.forEach(function (node) {
                _this.accumulatedSquaredGradients.set(node.output, ndarray_1.NDArray.zeros(node.output.shape));
            });
        }
    };
    RMSPropOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var oldCache = _this.accumulatedSquaredGradients.get(node.output);
                var gradientSquare = math.multiply(gradient, gradient);
                var cache = math.scaledArrayAdd(_this.g, oldCache, math.subtract(_this.one, _this.g), gradientSquare);
                var variable = math.scaledArrayAdd(_this.c, math.divide(gradient, math.add(math.sqrt(cache), _this.eps)), _this.one, oldVariable);
                _this.accumulatedSquaredGradients.set(node.output, keep(cache));
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                oldVariable.dispose();
                oldCache.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    RMSPropOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.eps.dispose();
        this.g.dispose();
        this.accumulatedSquaredGradients.dispose();
    };
    return RMSPropOptimizer;
}(optimizer_1.Optimizer));
exports.RMSPropOptimizer = RMSPropOptimizer;

},{"../../math/ndarray":63,"../tensor_array_map":49,"./optimizer":43}],45:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var tensor_array_map_1 = require("../tensor_array_map");
var optimizer_1 = require("./optimizer");
var SGDOptimizer = (function (_super) {
    __extends(SGDOptimizer, _super);
    function SGDOptimizer(learningRate, specifiedVariableList) {
        var _this = _super.call(this, learningRate, specifiedVariableList) || this;
        _this.learningRate = learningRate;
        return _this;
    }
    SGDOptimizer.prototype.afterBatch = function (math, batchSize, runtime, activationArrayMap, gradientArrayMap) {
        var _this = this;
        math.scope(function (keep) {
            _this.variableNodes.forEach(function (node) {
                var oldVariable = activationArrayMap.get(node.output);
                var gradient = _this.variableGradients.get(node.output);
                var variable = math.scaledArrayAdd(_this.c, gradient, _this.one, oldVariable);
                activationArrayMap.set(node.output, keep(variable));
                node.data = variable;
                oldVariable.dispose();
            });
        });
        this.variableGradients.dispose();
        this.variableGradients = new tensor_array_map_1.TensorArrayMap();
    };
    SGDOptimizer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    SGDOptimizer.prototype.setLearningRate = function (learningRate) {
        this.learningRate = learningRate;
    };
    return SGDOptimizer;
}(optimizer_1.Optimizer));
exports.SGDOptimizer = SGDOptimizer;

},{"../tensor_array_map":49,"./optimizer":43}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defaultCompare(a, b) {
    if (a === b) {
        return 0;
    }
    else if (a < b) {
        return -1;
    }
    else {
        return 1;
    }
}
exports.defaultCompare = defaultCompare;
var PriorityQueue = (function () {
    function PriorityQueue(comparator, indexObserver) {
        this.comparator = comparator;
        this.indexObserver = indexObserver;
        this.heap = [];
    }
    PriorityQueue.prototype.enqueue = function (t) {
        this.heap.push(t);
        this.onIndexChanged(t, this.heap.length - 1);
        this.siftUp(this.heap.length - 1);
    };
    PriorityQueue.prototype.dequeue = function () {
        if (this.empty()) {
            throw new Error('dequeue called on empty priority queue.');
        }
        var t = this.heap[0];
        this.swap(0, this.heap.length - 1);
        this.heap.pop();
        this.siftDown(0);
        return t;
    };
    PriorityQueue.prototype.update = function (newT, index) {
        var last = (index === this.heap.length - 1);
        if (!last) {
            this.swap(index, this.heap.length - 1);
        }
        this.heap.pop();
        if (!last) {
            if (this.siftUpIndex(index) !== -1) {
                this.siftUp(index);
            }
            else if (this.siftDownIndex(index) !== -1) {
                this.siftDown(index);
            }
        }
        this.enqueue(newT);
    };
    PriorityQueue.prototype.empty = function () {
        return this.heap.length === 0;
    };
    PriorityQueue.prototype.onIndexChanged = function (t, newIndex) {
        if (this.indexObserver) {
            this.indexObserver(t, newIndex);
        }
    };
    PriorityQueue.prototype.getParentIndex = function (index) {
        if (index === 0) {
            return -1;
        }
        return Math.floor((index - 1) / 2);
    };
    PriorityQueue.prototype.getLeftChildIndex = function (index) {
        var candidate = index * 2 + 1;
        return candidate < this.heap.length ? candidate : -1;
    };
    PriorityQueue.prototype.getRightChildIndex = function (index) {
        var candidate = index * 2 + 2;
        return candidate < this.heap.length ? candidate : -1;
    };
    PriorityQueue.prototype.siftUpIndex = function (index) {
        var parentIndex = this.getParentIndex(index);
        if (parentIndex === -1) {
            return -1;
        }
        if (this.compare(parentIndex, index) > 0) {
            return parentIndex;
        }
        return -1;
    };
    PriorityQueue.prototype.siftUp = function (index) {
        var siftIndex = this.siftUpIndex(index);
        while (siftIndex !== -1) {
            this.swap(index, siftIndex);
            index = siftIndex;
            siftIndex = this.siftUpIndex(index);
        }
    };
    PriorityQueue.prototype.siftDownIndex = function (index) {
        if (index >= this.heap.length) {
            return -1;
        }
        var largestChildIndex = index;
        var leftChildIndex = this.getLeftChildIndex(index);
        if ((leftChildIndex !== -1) &&
            (this.compare(leftChildIndex, largestChildIndex) < 0)) {
            largestChildIndex = leftChildIndex;
        }
        var rightChildIndex = this.getRightChildIndex(index);
        if ((rightChildIndex !== -1) &&
            (this.compare(rightChildIndex, largestChildIndex) < 0)) {
            largestChildIndex = rightChildIndex;
        }
        return (largestChildIndex === index) ? -1 : largestChildIndex;
    };
    PriorityQueue.prototype.siftDown = function (index) {
        var siftIndex = this.siftDownIndex(index);
        while (siftIndex !== -1) {
            this.swap(index, siftIndex);
            index = siftIndex;
            siftIndex = this.siftDownIndex(index);
        }
    };
    PriorityQueue.prototype.compare = function (aIndex, bIndex) {
        return this.comparator(this.heap[aIndex], this.heap[bIndex]);
    };
    PriorityQueue.prototype.swap = function (a, b) {
        var temp = this.heap[a];
        this.heap[a] = this.heap[b];
        this.heap[b] = temp;
        this.onIndexChanged(this.heap[a], a);
        this.onIndexChanged(this.heap[b], b);
    };
    return PriorityQueue;
}());
exports.PriorityQueue = PriorityQueue;

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var operation_emitter = require("./operation_emitter");
var session_util = require("./session_util");
var tensor_array_map_1 = require("./tensor_array_map");
var FeedDictionary = (function () {
    function FeedDictionary(feedEntries) {
        var _this = this;
        this.dict = {};
        if (feedEntries) {
            feedEntries.forEach(function (entry) { return _this.dict[entry.tensor.id] = entry; });
        }
    }
    return FeedDictionary;
}());
exports.FeedDictionary = FeedDictionary;
var CostReduction;
(function (CostReduction) {
    CostReduction[CostReduction["NONE"] = 0] = "NONE";
    CostReduction[CostReduction["SUM"] = 1] = "SUM";
    CostReduction[CostReduction["MEAN"] = 2] = "MEAN";
})(CostReduction = exports.CostReduction || (exports.CostReduction = {}));
var Session = (function () {
    function Session(graph, math) {
        this.math = math;
        this.activationArrayMap = new tensor_array_map_1.TensorArrayMap();
        this.runtimeCache = {};
        this.oneScalar = ndarray_1.Scalar.new(1);
        this.gradientArrayMap = new tensor_array_map_1.SummedTensorArrayMap(this.math);
    }
    Session.prototype.dispose = function () {
        var _this = this;
        this.activationArrayMap.dispose();
        Object.keys(this.runtimeCache).forEach(function (key) {
            var runtime = _this.runtimeCache[key];
            if (runtime.operations) {
                runtime.operations.forEach(function (op) { return op.dispose(); });
            }
        });
        this.runtimeCache = {};
        if (this.batchSizeScalar != null) {
            this.batchSizeScalar.dispose();
        }
        this.oneScalar.dispose();
    };
    Session.prototype.evalAll = function (tensors, feedEntries) {
        var _this = this;
        return this.math.scope(function () {
            var feed = new FeedDictionary(feedEntries);
            var runtime = _this.getOrCreateRuntime(tensors, feed);
            var activations = _this.activationArrayMap;
            session_util.disposeAndInitializeOperationOutputs(runtime.nodes, activations);
            session_util.disposeTransientOperationArrays(runtime.operations, _this.activationArrayMap, _this.gradientArrayMap);
            session_util.addPersistentArraysToTensorArrayMap(runtime.nodes, activations);
            session_util.loadInputsFromFeedDictionaryToTensorArrayMap(feed, activations, _this.math);
            runtime.operations.forEach(function (op) { return op.feedForward(_this.math, activations); });
            var results = tensors.map(function (x) { return activations.get(x); });
            tensors.forEach(function (x) { return activations.delete(x); });
            session_util.releaseFeedDictionaryInputsFromTensorArrayMap(feed, activations, _this.math);
            return results;
        });
    };
    Session.prototype.eval = function (tensor, feedEntries) {
        return this.evalAll([tensor], feedEntries)[0];
    };
    Session.prototype.train = function (costTensor, feedEntries, batchSize, optimizer, costReduction) {
        var _this = this;
        if (costReduction === void 0) { costReduction = CostReduction.NONE; }
        util.assert(util.isScalarShape(costTensor.shape), 'Cost tensor for training must be a scalar value.');
        if (this.prevBatchSize !== batchSize) {
            this.prevBatchSize = batchSize;
            this.batchSizeScalar = ndarray_1.Scalar.new(batchSize);
        }
        var feed = new FeedDictionary(feedEntries);
        session_util.throwIfFeedDictionaryContainsNDArrays(feed);
        var runtime = this.getOrCreateRuntime([costTensor], feed);
        var inferenceOperations = runtime.operations;
        var backPropOperations = runtime.operations.slice().reverse();
        var activations = this.activationArrayMap;
        var gradients = this.gradientArrayMap;
        gradients.nullify(costTensor);
        gradients.add(costTensor, this.oneScalar);
        session_util.addPersistentArraysToTensorArrayMap(runtime.nodes, activations);
        optimizer.beforeBatch(this.math, batchSize, runtime, activations, gradients);
        return this.math.scope(function (keep, track) {
            var cost = track(ndarray_1.Scalar.new(0));
            for (var i = 0; i < batchSize; ++i) {
                session_util.disposeAndInitializeOperationOutputs(runtime.nodes, activations);
                session_util.disposeAndInitializeOperationInputGradients(runtime.nodes, gradients);
                session_util.disposeTransientOperationArrays(runtime.operations, activations, gradients);
                session_util.loadInputsFromFeedDictionaryToTensorArrayMap(feed, activations, _this.math);
                inferenceOperations.forEach(function (op) { return op.feedForward(_this.math, activations); });
                backPropOperations.forEach(function (op) { return op.backProp(_this.math, activations, gradients); });
                optimizer.afterExample(_this.math, runtime, activations, gradients);
                session_util.releaseFeedDictionaryInputsFromTensorArrayMap(feed, activations, _this.math);
                cost = _this.updateCostForExample(cost, activations.get(costTensor), costReduction);
            }
            optimizer.afterBatch(_this.math, batchSize, runtime, activations, gradients);
            return _this.updateCostForBatch(cost, costReduction);
        });
    };
    Session.prototype.updateCostForExample = function (totalCost, currCost, costReduction) {
        if (costReduction === CostReduction.MEAN ||
            costReduction === CostReduction.SUM) {
            return this.math.add(totalCost, currCost);
        }
        return totalCost;
    };
    Session.prototype.updateCostForBatch = function (totalCost, costReduction) {
        if (costReduction === CostReduction.MEAN) {
            return this.math.divide(totalCost, this.batchSizeScalar);
        }
        return totalCost;
    };
    Session.prototype.getOrCreateRuntime = function (tensors, feed) {
        var key = this.makeRuntimeCacheKey(tensors, feed);
        var runtime = this.runtimeCache[key];
        if (runtime === undefined) {
            var nodes = session_util.getOrderedEvaluationSetFromEvalTensor(tensors, feed);
            session_util.removeFeedDictionaryNodesFromEvaluationSet(feed, nodes);
            session_util.throwErrorIfEvaluationSetContainsPlaceholderNodes(nodes);
            var operations = operation_emitter.emitFromGraphNodes(nodes);
            runtime = { nodes: nodes, operations: operations };
            this.runtimeCache[key] = runtime;
        }
        return runtime;
    };
    Session.prototype.makeRuntimeCacheKey = function (tensors, feed) {
        return tensors.map(function (x) { return x.id; }).sort().join('_') + '__' +
            Object.keys(feed.dict).sort().join('_');
    };
    return Session;
}());
exports.Session = Session;

},{"../math/ndarray":63,"../util":95,"./operation_emitter":18,"./session_util":48,"./tensor_array_map":49}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("../math/ndarray");
var util = require("../util");
var graph_1 = require("./graph");
var graph_util = require("./graph_util");
function getTerminatingNodesFromFeedDictionary(feedDictionary) {
    return Object.keys(feedDictionary.dict)
        .map(function (tensorID) { return feedDictionary.dict[+tensorID].tensor.node; });
}
exports.getTerminatingNodesFromFeedDictionary = getTerminatingNodesFromFeedDictionary;
function getOrderedEvaluationSetFromEvalTensor(evalTensors, feedDictionary) {
    var terminatingNodes = getTerminatingNodesFromFeedDictionary(feedDictionary);
    var evalNodes = evalTensors.map(function (x) { return x.node; });
    var unorderedEvaluationSet = graph_util.getUnorderedEvaluationSet(evalNodes, terminatingNodes);
    var orderedEvaluationSet = graph_util.getOrderedEvaluationSet(unorderedEvaluationSet);
    return orderedEvaluationSet;
}
exports.getOrderedEvaluationSetFromEvalTensor = getOrderedEvaluationSetFromEvalTensor;
function addPersistentArraysToTensorArrayMap(evaluationSet, tensorArrayMap) {
    evaluationSet.forEach(function (node) {
        if (node instanceof graph_1.VariableNode || node instanceof graph_1.ConstantNode) {
            tensorArrayMap.set(node.output, node.data);
        }
    });
}
exports.addPersistentArraysToTensorArrayMap = addPersistentArraysToTensorArrayMap;
function getVariableNodesFromEvaluationSet(evaluationSet) {
    var nodes = [];
    evaluationSet.forEach(function (node) {
        if (node instanceof graph_1.VariableNode) {
            nodes.push(node);
        }
    });
    return nodes;
}
exports.getVariableNodesFromEvaluationSet = getVariableNodesFromEvaluationSet;
function throwIfFeedDictionaryContainsNDArrays(feedDictionary) {
    Object.keys(feedDictionary.dict).forEach(function (tensorID) {
        if (feedDictionary.dict[+tensorID].data instanceof ndarray_1.NDArray) {
            throw new Error('training requires FeedDictionary entries to be InputProviders' +
                'and not NDArrays.');
        }
    });
}
exports.throwIfFeedDictionaryContainsNDArrays = throwIfFeedDictionaryContainsNDArrays;
function loadInputsFromFeedDictionaryToTensorArrayMap(batchFeed, activations, math) {
    Object.keys(batchFeed.dict).forEach(function (tensorID) {
        var feedEntry = batchFeed.dict[+tensorID];
        var data;
        if (feedEntry.data instanceof ndarray_1.NDArray) {
            data = feedEntry.data;
        }
        else {
            var provider = feedEntry.data;
            data = provider.getNextCopy(math);
        }
        util.assert(util.arraysEqual(feedEntry.tensor.shape, data.shape), "Error loading FeedEntry: feeding NDArray of shape " + data.shape + " " +
            ("does not match Tensor (id: " + feedEntry.tensor.id + ") shape: ") +
            (feedEntry.tensor.shape + "."));
        activations.set(feedEntry.tensor, data);
    });
}
exports.loadInputsFromFeedDictionaryToTensorArrayMap = loadInputsFromFeedDictionaryToTensorArrayMap;
function releaseFeedDictionaryInputsFromTensorArrayMap(batchFeed, activations, math) {
    Object.keys(batchFeed.dict).forEach(function (tensorID) {
        var feedEntry = batchFeed.dict[+tensorID];
        if (!(feedEntry.data instanceof ndarray_1.NDArray)) {
            var provider = feedEntry.data;
            var feedEntryArray = activations.get(feedEntry.tensor);
            provider.disposeCopy(math, feedEntryArray);
        }
        activations.delete(feedEntry.tensor);
    });
}
exports.releaseFeedDictionaryInputsFromTensorArrayMap = releaseFeedDictionaryInputsFromTensorArrayMap;
function removeFeedDictionaryNodesFromEvaluationSet(feedDictionary, evaluationSet) {
    var i = 0;
    while (i < evaluationSet.length) {
        var node = evaluationSet[i];
        if (feedDictionary.dict[node.output.id] != null) {
            evaluationSet.splice(i, 1);
        }
        else {
            ++i;
        }
    }
}
exports.removeFeedDictionaryNodesFromEvaluationSet = removeFeedDictionaryNodesFromEvaluationSet;
function disposeAndInitializeOperationOutputs(evaluationSet, tensorArrayMap) {
    evaluationSet.forEach(function (node) {
        if (!graph_util.isInputNode(node)) {
            if (!graph_util.isPassthroughNode(node, tensorArrayMap)) {
                tensorArrayMap.disposeArray(node.output);
            }
            tensorArrayMap.set(node.output, null);
        }
    });
}
exports.disposeAndInitializeOperationOutputs = disposeAndInitializeOperationOutputs;
function disposeAndInitializeOperationInputGradients(evaluationSet, gradients) {
    evaluationSet.forEach(function (node) {
        Object.keys(node.inputs).forEach(function (inputName) {
            var input = node.inputs[inputName];
            if (gradients.get(input, true) !== gradients.get(node.output, true)) {
                gradients.disposeArray(input);
            }
            gradients.nullify(input);
        });
    });
}
exports.disposeAndInitializeOperationInputGradients = disposeAndInitializeOperationInputGradients;
function disposeTransientOperationArrays(operations, activations, gradients) {
    operations.forEach(function (op) { return op.disposeTransientArrays(activations, gradients); });
}
exports.disposeTransientOperationArrays = disposeTransientOperationArrays;
function throwErrorIfEvaluationSetContainsPlaceholderNodes(evaluationSet) {
    evaluationSet.forEach(function (node) {
        if (node instanceof graph_1.PlaceholderNode) {
            var shape = '[' + node.output.shape.join(', ') + ']';
            throw new Error('Placeholder node "' + node.name + '" ' + shape +
                ' not present in feed dictionary.');
        }
    });
}
exports.throwErrorIfEvaluationSetContainsPlaceholderNodes = throwErrorIfEvaluationSetContainsPlaceholderNodes;

},{"../math/ndarray":63,"../util":95,"./graph":16,"./graph_util":17}],49:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var TensorArrayMapBase = (function () {
    function TensorArrayMapBase() {
        this.dict = {};
    }
    TensorArrayMapBase.prototype.get = function (tensor, skipChecks) {
        if (skipChecks === void 0) { skipChecks = false; }
        if (!skipChecks && this.dict[tensor.id] === undefined) {
            throw new Error("tensor " + tensor.id + " not in array map.");
        }
        var nda = this.dict[tensor.id];
        if (!skipChecks && nda === null) {
            throw new Error("tensor " + tensor.id + " has null array.");
        }
        return nda;
    };
    TensorArrayMapBase.prototype.delete = function (tensor) {
        delete this.dict[tensor.id];
    };
    TensorArrayMapBase.prototype.nullify = function (tensor) {
        this.dict[tensor.id] = null;
    };
    TensorArrayMapBase.prototype.disposeArray = function (tensor) {
        if (this.dict[tensor.id] === undefined) {
            return;
        }
        var nda = this.dict[tensor.id];
        if (nda === null) {
            return;
        }
        nda.dispose();
        this.dict[tensor.id] = null;
    };
    TensorArrayMapBase.prototype.size = function () {
        return Object.keys(this.dict).length;
    };
    TensorArrayMapBase.prototype.dispose = function () {
        var _this = this;
        Object.keys(this.dict).forEach(function (tensorID) {
            var nda = _this.dict[+tensorID];
            if (nda) {
                nda.dispose();
            }
        });
        this.dict = {};
    };
    TensorArrayMapBase.prototype.hasNullArray = function (tensor) {
        if (this.dict[tensor.id] === undefined) {
            throw new Error("tensor " + tensor.id + " not in array map.");
        }
        return this.dict[tensor.id] === null;
    };
    return TensorArrayMapBase;
}());
exports.TensorArrayMapBase = TensorArrayMapBase;
var TensorArrayMap = (function (_super) {
    __extends(TensorArrayMap, _super);
    function TensorArrayMap() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TensorArrayMap.prototype.set = function (tensor, array) {
        this.dict[tensor.id] = array;
    };
    return TensorArrayMap;
}(TensorArrayMapBase));
exports.TensorArrayMap = TensorArrayMap;
var SummedTensorArrayMap = (function (_super) {
    __extends(SummedTensorArrayMap, _super);
    function SummedTensorArrayMap(math) {
        var _this = _super.call(this) || this;
        _this.math = math;
        return _this;
    }
    SummedTensorArrayMap.prototype.add = function (tensor, array) {
        if (this.dict[tensor.id] == null) {
            this.dict[tensor.id] = this.math.keep(array);
        }
        else {
            var oldValue = this.get(tensor);
            var newValue = this.math.keep(this.math.addStrict(oldValue, array));
            this.dict[tensor.id] = newValue;
            oldValue.dispose();
        }
    };
    return SummedTensorArrayMap;
}(TensorArrayMapBase));
exports.SummedTensorArrayMap = SummedTensorArrayMap;

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var session_1 = require("./graph/session");
var ndarray_1 = require("./math/ndarray");
var DEFAULT_EVAL_INTERVAL_MS = 1500;
var DEFAULT_COST_INTERVAL_MS = 500;
var DEFAULT_INFERENCE_EXAMPLE_INTERVAL_MS = 3000;
var MetricReduction;
(function (MetricReduction) {
    MetricReduction[MetricReduction["SUM"] = 0] = "SUM";
    MetricReduction[MetricReduction["MEAN"] = 1] = "MEAN";
})(MetricReduction = exports.MetricReduction || (exports.MetricReduction = {}));
var GraphRunner = (function () {
    function GraphRunner(math, session, eventObserver) {
        this.math = math;
        this.session = session;
        this.eventObserver = eventObserver;
        this.lastCostTimestamp = 0;
        this.lastEvalTimestamp = 0;
        this.totalIdleTimeMs = 0;
        this.resetStatistics();
        this.zeroScalar = ndarray_1.Scalar.new(0);
    }
    GraphRunner.prototype.resetStatistics = function () {
        this.totalBatchesTrained = 0;
        this.totalIdleTimeMs = 0;
        this.lastStopTimestamp = null;
    };
    GraphRunner.prototype.train = function (costTensor, trainFeedEntries, batchSize, optimizer, numBatches, metricTensor, metricFeedEntries, metricBatchSize, metricReduction, evalIntervalMs, costIntervalMs) {
        if (metricReduction === void 0) { metricReduction = MetricReduction.MEAN; }
        if (evalIntervalMs === void 0) { evalIntervalMs = DEFAULT_EVAL_INTERVAL_MS; }
        if (costIntervalMs === void 0) { costIntervalMs = DEFAULT_COST_INTERVAL_MS; }
        this.costTensor = costTensor;
        this.trainFeedEntries = trainFeedEntries;
        this.metricTensor = metricTensor;
        this.metricFeedEntries = metricFeedEntries;
        if (metricBatchSize != null && this.metricBatchSize !== metricBatchSize) {
            if (this.metricBatchSizeScalar != null) {
                this.metricBatchSizeScalar.dispose();
            }
            this.metricBatchSizeScalar = ndarray_1.Scalar.new(metricBatchSize);
        }
        this.metricBatchSize = metricBatchSize;
        this.metricReduction = metricReduction;
        this.batchSize = batchSize;
        this.optimizer = optimizer;
        this.metricIntervalMs = evalIntervalMs;
        this.costIntervalMs = costIntervalMs;
        this.currentTrainLoopNumBatches = numBatches;
        this.batchesTrainedThisRun = 0;
        this.isTraining = true;
        this.trainStartTimestamp = performance.now();
        this.trainNetwork();
    };
    GraphRunner.prototype.stopTraining = function () {
        this.isTraining = false;
        this.lastStopTimestamp = performance.now();
    };
    GraphRunner.prototype.resumeTraining = function () {
        this.isTraining = true;
        if (this.lastStopTimestamp != null) {
            this.totalIdleTimeMs += performance.now() - this.lastStopTimestamp;
        }
        this.trainNetwork();
    };
    GraphRunner.prototype.trainNetwork = function () {
        var _this = this;
        if (this.batchesTrainedThisRun === this.currentTrainLoopNumBatches) {
            this.stopTraining();
        }
        if (!this.isTraining) {
            if (this.eventObserver.doneTrainingCallback != null) {
                this.eventObserver.doneTrainingCallback();
            }
            return;
        }
        var start = performance.now();
        var shouldComputeCost = this.eventObserver.avgCostCallback != null &&
            (start - this.lastCostTimestamp > this.costIntervalMs);
        if (shouldComputeCost) {
            this.lastCostTimestamp = start;
        }
        var costReduction = shouldComputeCost ? session_1.CostReduction.MEAN : session_1.CostReduction.NONE;
        this.math.scope(function (keep) {
            var avgCost = _this.session.train(_this.costTensor, _this.trainFeedEntries, _this.batchSize, _this.optimizer, costReduction);
            if (shouldComputeCost) {
                var trainTime = performance.now() - start;
                _this.eventObserver.avgCostCallback(avgCost);
                if (_this.eventObserver.trainExamplesPerSecCallback != null) {
                    var examplesPerSec = (_this.batchSize * 1000 / trainTime);
                    _this.eventObserver.trainExamplesPerSecCallback(examplesPerSec);
                }
            }
            if (_this.eventObserver.metricCallback != null &&
                _this.metricFeedEntries != null &&
                start - _this.lastEvalTimestamp > _this.metricIntervalMs) {
                _this.lastEvalTimestamp = start;
                if (_this.lastComputedMetric != null) {
                    _this.lastComputedMetric.dispose();
                }
                _this.lastComputedMetric = _this.computeMetric();
                _this.eventObserver.metricCallback(_this.lastComputedMetric);
            }
            if (_this.eventObserver.totalTimeCallback != null) {
                _this.eventObserver.totalTimeCallback((start - _this.trainStartTimestamp) / 1000);
            }
            _this.batchesTrainedThisRun++;
            _this.totalBatchesTrained++;
            if (_this.eventObserver.batchesTrainedCallback != null) {
                _this.eventObserver.batchesTrainedCallback(_this.totalBatchesTrained);
            }
        });
        requestAnimationFrame(function () { return _this.trainNetwork(); });
    };
    GraphRunner.prototype.infer = function (inferenceTensor, inferenceFeedEntries, inferenceExampleIntervalMs, inferenceExampleCount, numPasses) {
        var _this = this;
        if (inferenceExampleIntervalMs === void 0) { inferenceExampleIntervalMs = DEFAULT_INFERENCE_EXAMPLE_INTERVAL_MS; }
        if (inferenceExampleCount === void 0) { inferenceExampleCount = 5; }
        if (this.eventObserver.inferenceExamplesCallback == null &&
            this.eventObserver.inferenceExamplesPerSecCallback == null) {
            throw new Error('Cannot start inference loop, no inference example or ' +
                'examples/sec observer provided.');
        }
        for (var i = 0; i < inferenceFeedEntries.length; i++) {
            var feedEntry = inferenceFeedEntries[i];
            if (feedEntry.data instanceof ndarray_1.NDArray) {
                throw new Error('Cannot start inference on the model runner with feed entries of ' +
                    'type NDArray. Please use InputProviders.');
            }
        }
        this.inferenceExampleIntervalMs = inferenceExampleIntervalMs;
        this.inferenceTensor = inferenceTensor;
        this.inferenceFeedEntries = inferenceFeedEntries;
        this.inferenceExampleCount = inferenceExampleCount;
        this.currentInferenceLoopNumPasses = numPasses;
        if (!this.isInferring) {
            this.inferencePassesThisRun = 0;
            requestAnimationFrame(function () { return _this.inferNetwork(); });
        }
        this.isInferring = true;
    };
    GraphRunner.prototype.inferNetwork = function () {
        var _this = this;
        if (!this.isInferring ||
            this.inferencePassesThisRun === this.currentInferenceLoopNumPasses) {
            return;
        }
        this.math.scope(function (keep, track) {
            var feeds = [];
            var inferenceValues = [];
            var start = performance.now();
            for (var i = 0; i < _this.inferenceExampleCount; i++) {
                var ndarrayFeedEntries = [];
                for (var j = 0; j < _this.inferenceFeedEntries.length; j++) {
                    var feedEntry = _this.inferenceFeedEntries[j];
                    ndarrayFeedEntries.push({
                        tensor: feedEntry.tensor,
                        data: track(feedEntry.data.getNextCopy(_this.math))
                    });
                }
                feeds.push(ndarrayFeedEntries);
                inferenceValues.push(_this.session.eval(_this.inferenceTensor, ndarrayFeedEntries));
            }
            if (_this.eventObserver.inferenceExamplesPerSecCallback != null) {
                inferenceValues[inferenceValues.length - 1].getValues();
                var inferenceExamplesPerSecTime = performance.now() - start;
                var examplesPerSec = (_this.inferenceExampleCount * 1000 / inferenceExamplesPerSecTime);
                _this.eventObserver.inferenceExamplesPerSecCallback(examplesPerSec);
            }
            if (_this.eventObserver.inferenceExamplesCallback != null) {
                _this.eventObserver.inferenceExamplesCallback(feeds, inferenceValues);
            }
            _this.inferencePassesThisRun++;
        });
        this.lastInferTimeoutID = window.setTimeout(function () { return _this.inferNetwork(); }, this.inferenceExampleIntervalMs);
    };
    GraphRunner.prototype.stopInferring = function () {
        this.isInferring = false;
        window.clearTimeout(this.lastInferTimeoutID);
    };
    GraphRunner.prototype.isInferenceRunning = function () {
        return this.isInferring;
    };
    GraphRunner.prototype.computeMetric = function () {
        var _this = this;
        if (this.metricFeedEntries == null) {
            throw new Error('Cannot compute metric, no metric FeedEntries provided.');
        }
        var metric = this.zeroScalar;
        return this.math.scope(function (keep) {
            for (var i = 0; i < _this.metricBatchSize; i++) {
                var metricValue = _this.session.eval(_this.metricTensor, _this.metricFeedEntries);
                metric = _this.math.add(metric, metricValue);
            }
            if (_this.metricReduction === MetricReduction.MEAN) {
                metric = _this.math.divide(metric, _this.metricBatchSizeScalar);
            }
            return metric;
        });
    };
    GraphRunner.prototype.getTotalBatchesTrained = function () {
        return this.totalBatchesTrained;
    };
    GraphRunner.prototype.getLastComputedMetric = function () {
        return this.lastComputedMetric;
    };
    GraphRunner.prototype.setMath = function (math) {
        this.math = math;
    };
    GraphRunner.prototype.setSession = function (session) {
        this.session = session;
    };
    GraphRunner.prototype.setInferenceTensor = function (inferenceTensor) {
        this.inferenceTensor = inferenceTensor;
    };
    GraphRunner.prototype.setInferenceExampleCount = function (inferenceExampleCount) {
        this.inferenceExampleCount = inferenceExampleCount;
    };
    return GraphRunner;
}());
exports.GraphRunner = GraphRunner;

},{"./graph/session":47,"./math/ndarray":63}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xhr_dataset = require("./data/xhr-dataset");
exports.xhr_dataset = xhr_dataset;
var environment = require("./environment");
exports.environment = environment;
var conv_util = require("./math/conv_util");
exports.conv_util = conv_util;
var gpgpu_util = require("./math/webgl/gpgpu_util");
exports.gpgpu_util = gpgpu_util;
var render_ndarray_gpu_util = require("./math/webgl/render_ndarray_gpu_util");
exports.render_ndarray_gpu_util = render_ndarray_gpu_util;
var webgl_util = require("./math/webgl/webgl_util");
exports.webgl_util = webgl_util;
var test_util = require("./test_util");
exports.test_util = test_util;
var util = require("./util");
exports.util = util;
var version_1 = require("./version");
exports.version = version_1.version;
var checkpoint_loader_1 = require("./data/checkpoint_loader");
exports.CheckpointLoader = checkpoint_loader_1.CheckpointLoader;
var dataset_1 = require("./data/dataset");
exports.InMemoryDataset = dataset_1.InMemoryDataset;
var input_provider_1 = require("./data/input_provider");
exports.InCPUMemoryShuffledInputProviderBuilder = input_provider_1.InCPUMemoryShuffledInputProviderBuilder;
exports.InGPUMemoryShuffledInputProviderBuilder = input_provider_1.InGPUMemoryShuffledInputProviderBuilder;
var xhr_dataset_1 = require("./data/xhr-dataset");
exports.XhrDataset = xhr_dataset_1.XhrDataset;
var environment_1 = require("./environment");
exports.ENV = environment_1.ENV;
exports.Environment = environment_1.Environment;
var graph_1 = require("./graph/graph");
exports.Graph = graph_1.Graph;
exports.Tensor = graph_1.Tensor;
var adadelta_optimizer_1 = require("./graph/optimizers/adadelta_optimizer");
exports.AdadeltaOptimizer = adadelta_optimizer_1.AdadeltaOptimizer;
var adagrad_optimizer_1 = require("./graph/optimizers/adagrad_optimizer");
exports.AdagradOptimizer = adagrad_optimizer_1.AdagradOptimizer;
var adam_optimizer_1 = require("./graph/optimizers/adam_optimizer");
exports.AdamOptimizer = adam_optimizer_1.AdamOptimizer;
var adamax_optimizer_1 = require("./graph/optimizers/adamax_optimizer");
exports.AdamaxOptimizer = adamax_optimizer_1.AdamaxOptimizer;
var momentum_optimizer_1 = require("./graph/optimizers/momentum_optimizer");
exports.MomentumOptimizer = momentum_optimizer_1.MomentumOptimizer;
var optimizer_1 = require("./graph/optimizers/optimizer");
exports.Optimizer = optimizer_1.Optimizer;
var rmsprop_optimizer_1 = require("./graph/optimizers/rmsprop_optimizer");
exports.RMSPropOptimizer = rmsprop_optimizer_1.RMSPropOptimizer;
var sgd_optimizer_1 = require("./graph/optimizers/sgd_optimizer");
exports.SGDOptimizer = sgd_optimizer_1.SGDOptimizer;
var session_1 = require("./graph/session");
exports.CostReduction = session_1.CostReduction;
exports.Session = session_1.Session;
var graph_runner_1 = require("./graph_runner");
exports.GraphRunner = graph_runner_1.GraphRunner;
exports.MetricReduction = graph_runner_1.MetricReduction;
var initializers_1 = require("./initializers");
exports.ConstantInitializer = initializers_1.ConstantInitializer;
exports.NDArrayInitializer = initializers_1.NDArrayInitializer;
exports.OnesInitializer = initializers_1.OnesInitializer;
exports.RandomNormalInitializer = initializers_1.RandomNormalInitializer;
exports.RandomTruncatedNormalInitializer = initializers_1.RandomTruncatedNormalInitializer;
exports.RandomUniformInitializer = initializers_1.RandomUniformInitializer;
exports.VarianceScalingInitializer = initializers_1.VarianceScalingInitializer;
exports.ZerosInitializer = initializers_1.ZerosInitializer;
var math_1 = require("./math/math");
exports.MatrixOrientation = math_1.MatrixOrientation;
exports.NDArrayMath = math_1.NDArrayMath;
var math_cpu_1 = require("./math/math_cpu");
exports.NDArrayMathCPU = math_cpu_1.NDArrayMathCPU;
var math_gpu_1 = require("./math/math_gpu");
exports.NDArrayMathGPU = math_gpu_1.NDArrayMathGPU;
var ndarray_1 = require("./math/ndarray");
exports.initializeGPU = ndarray_1.initializeGPU;
var ndarray_2 = require("./math/ndarray");
exports.Array1D = ndarray_2.Array1D;
exports.Array2D = ndarray_2.Array2D;
exports.Array3D = ndarray_2.Array3D;
exports.Array4D = ndarray_2.Array4D;
exports.NDArray = ndarray_2.NDArray;
exports.Scalar = ndarray_2.Scalar;
var gpgpu_context_1 = require("./math/webgl/gpgpu_context");
exports.GPGPUContext = gpgpu_context_1.GPGPUContext;
function exportToTopLevel(alias) {
    setTimeout(function () {
        var w = window;
        if (w != null && w.deeplearn != null && w[alias] == null) {
            w[alias] = w.deeplearn;
        }
    });
}
exportToTopLevel('dl');

},{"./data/checkpoint_loader":10,"./data/dataset":11,"./data/input_provider":12,"./data/xhr-dataset":13,"./environment":15,"./graph/graph":16,"./graph/optimizers/adadelta_optimizer":38,"./graph/optimizers/adagrad_optimizer":39,"./graph/optimizers/adam_optimizer":40,"./graph/optimizers/adamax_optimizer":41,"./graph/optimizers/momentum_optimizer":42,"./graph/optimizers/optimizer":43,"./graph/optimizers/rmsprop_optimizer":44,"./graph/optimizers/sgd_optimizer":45,"./graph/session":47,"./graph_runner":50,"./initializers":52,"./math/conv_util":57,"./math/math":60,"./math/math_cpu":61,"./math/math_gpu":62,"./math/ndarray":63,"./math/webgl/gpgpu_context":74,"./math/webgl/gpgpu_util":76,"./math/webgl/render_ndarray_gpu_util":85,"./math/webgl/webgl_util":93,"./test_util":94,"./util":95,"./version":96}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("./math/ndarray");
var VarianceScalingInitializer = (function () {
    function VarianceScalingInitializer(scale, mode, distribution) {
        if (scale === void 0) { scale = 1.0; }
        if (mode === void 0) { mode = 'fan_in'; }
        if (distribution === void 0) { distribution = 'normal'; }
        this.scale = scale;
        this.mode = mode;
        this.distribution = distribution;
    }
    VarianceScalingInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        var n = 0;
        if (this.mode === 'fan_in') {
            n = inputUnits;
        }
        else if (this.mode === 'fan_out') {
            n = outputUnits;
        }
        else if (this.mode === 'fan_avg') {
            n = (inputUnits + outputUnits) / 2;
        }
        else {
            throw new Error("Unexpected mode for variance scaling initializer: " + this.mode);
        }
        if (this.distribution === 'normal') {
            return ndarray_1.NDArray.randTruncatedNormal(weightsShape, 0.0, Math.sqrt(this.scale / n));
        }
        else if (this.distribution === 'uniform') {
            return ndarray_1.NDArray.randUniform(weightsShape, 0.0, Math.sqrt(3 * this.scale / n));
        }
        else {
            throw new Error("Unexpected distribution for variance scaling initializer: " +
                ("" + this.distribution));
        }
    };
    return VarianceScalingInitializer;
}());
exports.VarianceScalingInitializer = VarianceScalingInitializer;
var ZerosInitializer = (function () {
    function ZerosInitializer() {
    }
    ZerosInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.zeros(weightsShape);
    };
    return ZerosInitializer;
}());
exports.ZerosInitializer = ZerosInitializer;
var OnesInitializer = (function () {
    function OnesInitializer() {
    }
    OnesInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        var values = ndarray_1.NDArray.zeros(weightsShape);
        values.fill(1);
        return values;
    };
    return OnesInitializer;
}());
exports.OnesInitializer = OnesInitializer;
var ConstantInitializer = (function () {
    function ConstantInitializer(value) {
        if (value === void 0) { value = 0; }
        this.value = value;
    }
    ConstantInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        var values = ndarray_1.NDArray.zeros(weightsShape);
        values.fill(this.value);
        return values;
    };
    return ConstantInitializer;
}());
exports.ConstantInitializer = ConstantInitializer;
var NDArrayInitializer = (function () {
    function NDArrayInitializer(ndarray) {
        this.ndarray = ndarray;
    }
    NDArrayInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return this.ndarray;
    };
    return NDArrayInitializer;
}());
exports.NDArrayInitializer = NDArrayInitializer;
var RandomNormalInitializer = (function () {
    function RandomNormalInitializer(mean, stdev) {
        if (mean === void 0) { mean = 0; }
        if (stdev === void 0) { stdev = .05; }
        this.mean = mean;
        this.stdev = stdev;
    }
    RandomNormalInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.randNormal(weightsShape, this.mean, this.stdev);
    };
    return RandomNormalInitializer;
}());
exports.RandomNormalInitializer = RandomNormalInitializer;
var RandomTruncatedNormalInitializer = (function () {
    function RandomTruncatedNormalInitializer(mean, stdev) {
        if (mean === void 0) { mean = 0; }
        if (stdev === void 0) { stdev = .05; }
        this.mean = mean;
        this.stdev = stdev;
    }
    RandomTruncatedNormalInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.randTruncatedNormal(weightsShape, this.mean, this.stdev);
    };
    return RandomTruncatedNormalInitializer;
}());
exports.RandomTruncatedNormalInitializer = RandomTruncatedNormalInitializer;
var RandomUniformInitializer = (function () {
    function RandomUniformInitializer(minval, maxval) {
        if (minval === void 0) { minval = -.05; }
        if (maxval === void 0) { maxval = .05; }
        this.minval = minval;
        this.maxval = maxval;
    }
    RandomUniformInitializer.prototype.initialize = function (weightsShape, inputUnits, outputUnits) {
        return ndarray_1.NDArray.randUniform(weightsShape, this.minval, this.maxval);
    };
    return RandomUniformInitializer;
}());
exports.RandomUniformInitializer = RandomUniformInitializer;

},{"./math/ndarray":63}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("./ndarray");
var TanHFunc = (function () {
    function TanHFunc() {
    }
    TanHFunc.prototype.output = function (math, x) {
        return math.scope(function () {
            return math.tanh(x);
        });
    };
    TanHFunc.prototype.der = function (math, x, y) {
        return math.scope(function () {
            var ySquared = math.elementWiseMul(y, y);
            return math.scalarMinusArray(ndarray_1.Scalar.ONE, ySquared);
        });
    };
    return TanHFunc;
}());
exports.TanHFunc = TanHFunc;
var ReLUFunc = (function () {
    function ReLUFunc() {
    }
    ReLUFunc.prototype.output = function (math, x) {
        return math.scope(function () {
            return math.relu(x);
        });
    };
    ReLUFunc.prototype.der = function (math, x, y) {
        return math.scope(function () {
            return math.step(x);
        });
    };
    return ReLUFunc;
}());
exports.ReLUFunc = ReLUFunc;
var SigmoidFunc = (function () {
    function SigmoidFunc() {
    }
    SigmoidFunc.prototype.output = function (math, x) {
        return math.scope(function () {
            return math.sigmoid(x);
        });
    };
    SigmoidFunc.prototype.der = function (math, x, y) {
        return math.scope(function () {
            var ySquared = math.elementWiseMul(y, y);
            return math.subStrict(y, ySquared);
        });
    };
    return SigmoidFunc;
}());
exports.SigmoidFunc = SigmoidFunc;
var SquareFunc = (function () {
    function SquareFunc() {
    }
    SquareFunc.prototype.output = function (math, x) {
        return math.scope(function () {
            return math.elementWiseMul(x, x);
        });
    };
    SquareFunc.prototype.der = function (math, x, y) {
        return math.scope(function () {
            return math.scalarTimesArray(ndarray_1.Scalar.TWO, x);
        });
    };
    return SquareFunc;
}());
exports.SquareFunc = SquareFunc;

},{"./ndarray":63}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function axesAreInnerMostDims(axes, rank) {
    for (var i = 0; i < axes.length; ++i) {
        if (axes[axes.length - i - 1] !== rank - 1 - i) {
            return false;
        }
    }
    return true;
}
exports.axesAreInnerMostDims = axesAreInnerMostDims;
function combineLocations(outputLoc, reduceLoc, axes) {
    var rank = outputLoc.length + reduceLoc.length;
    var loc = [];
    var outIdx = 0;
    var reduceIdx = 0;
    for (var dim = 0; dim < rank; dim++) {
        if (axes.indexOf(dim) === -1) {
            loc.push(outputLoc[outIdx++]);
        }
        else {
            loc.push(reduceLoc[reduceIdx++]);
        }
    }
    return loc;
}
exports.combineLocations = combineLocations;
function computeOutAndReduceShapes(aShape, axes) {
    var outShape = [];
    var rank = aShape.length;
    for (var dim = 0; dim < rank; dim++) {
        if (axes.indexOf(dim) === -1) {
            outShape.push(aShape[dim]);
        }
    }
    var reduceShape = axes.map(function (dim) { return aShape[dim]; });
    return [outShape, reduceShape];
}
exports.computeOutAndReduceShapes = computeOutAndReduceShapes;
function expandShapeToKeepDim(shape, axes) {
    var reduceSubShape = axes.map(function (x) { return 1; });
    return combineLocations(shape, reduceSubShape, axes);
}
exports.expandShapeToKeepDim = expandShapeToKeepDim;
function parseAxisParam(axis, shape) {
    if (axis == null) {
        axis = shape.map(function (s, i) { return i; });
    }
    else if (typeof (axis) === 'number') {
        axis = [axis];
    }
    return axis;
}
exports.parseAxisParam = parseAxisParam;
function assertAxesAreInnerMostDims(msg, axes, rank) {
    if (!axesAreInnerMostDims(axes, rank)) {
        throw new Error(msg + " supports only inner-most axes for now. " +
            ("Got axes " + axes + " and rank-" + rank + " input."));
    }
}
exports.assertAxesAreInnerMostDims = assertAxesAreInnerMostDims;
function getPermutedAxes(axes, rank) {
    if (axesAreInnerMostDims(axes, rank)) {
        return null;
    }
    var result = [];
    for (var i = 0; i < rank; ++i) {
        if (axes.indexOf(i) === -1) {
            result.push(i);
        }
    }
    axes.forEach(function (axis) { return result.push(axis); });
    return result;
}
exports.getPermutedAxes = getPermutedAxes;
function getInnerMostAxes(numAxes, rank) {
    var res = [];
    for (var i = rank - numAxes; i < rank; ++i) {
        res.push(i);
    }
    return res;
}
exports.getInnerMostAxes = getInnerMostAxes;

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBroadcastDims(inShape, outShape) {
    var inRank = inShape.length;
    var dims = [];
    for (var i = 0; i < inRank; i++) {
        var dim = inRank - 1 - i;
        var a = inShape[dim] || 1;
        var b = outShape[outShape.length - 1 - i] || 1;
        if (b > 1 && a === 1) {
            dims.unshift(dim);
        }
    }
    return dims;
}
exports.getBroadcastDims = getBroadcastDims;
function broadcastDimsAreOuter(dims) {
    for (var i = 0; i < dims.length; i++) {
        if (dims[i] !== i) {
            return false;
        }
    }
    return true;
}
exports.broadcastDimsAreOuter = broadcastDimsAreOuter;
function assertAndGetBroadcastShape(shapeA, shapeB) {
    var result = [];
    var errMsg = "Operands could not be broadcast together with shapes " +
        (shapeA + " and " + shapeB + ".");
    var l = Math.max(shapeA.length, shapeB.length);
    for (var i = 0; i < l; i++) {
        var a = shapeA[shapeA.length - i - 1] || 1;
        var b = shapeB[shapeB.length - i - 1] || 1;
        if (a > 1 && b > 1 && a !== b) {
            throw Error(errMsg);
        }
        result.unshift(Math.max(a, b));
    }
    return result;
}
exports.assertAndGetBroadcastShape = assertAndGetBroadcastShape;

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../util");
function assertParams(aShape, bShape, axis) {
    var aRank = aShape.length;
    var bRank = bShape.length;
    util.assert(aShape.length === bShape.length, "Error in concat" + aRank + "D: rank of x1 (" + aRank + ") and x2 (" + bRank + ") " +
        "must be the same.");
    util.assert(axis >= 0 && axis < aRank, "Error in concat" + aRank + "D: axis must be " +
        ("between 0 and " + (aRank - 1) + "."));
    for (var i = 0; i < aRank; i++) {
        util.assert((i === axis) || (aShape[i] === bShape[i]), "Error in concat" + aRank + "D: Shape (" + aShape + ") does not match " +
            ("(" + bShape + ") along the non-concatenated axis " + i + "."));
    }
}
exports.assertParams = assertParams;
function computeOutShape(x1Shape, x2Shape, axis) {
    util.assert(x1Shape.length === x2Shape.length, 'x1 and x2 should have the same rank.');
    var outputShape = x1Shape.slice();
    outputShape[axis] += x2Shape[axis];
    return outputShape;
}
exports.computeOutShape = computeOutShape;

},{"../util":95}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../util");
function computeConvInfo(inShape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad) {
    if (typeof pad === 'number') {
        var outShape_1 = computeOutputShape3D(inShape, filterHeight, outDepth, strideHeight, pad);
        return {
            inShape: inShape,
            outShape: outShape_1,
            padInfo: { top: pad, bottom: pad, left: pad, right: pad },
            strideHeight: strideHeight,
            strideWidth: strideWidth,
            filterHeight: filterHeight,
            filterWidth: filterWidth
        };
    }
    var inHeight = inShape[0];
    var inWidth = inShape[1];
    var outShape;
    var padInfo;
    if (pad === 'same') {
        var outHeight = Math.ceil(inHeight / strideHeight);
        var outWidth = Math.ceil(inWidth / strideWidth);
        outShape = [outHeight, outWidth, outDepth];
        var padAlongHeight = (outHeight - 1) * strideHeight + filterHeight - inHeight;
        var padAlongWidth = (outWidth - 1) * strideWidth + filterWidth - inWidth;
        var top_1 = Math.floor(padAlongHeight / 2);
        var bottom = padAlongHeight - top_1;
        var left = Math.floor(padAlongWidth / 2);
        var right = padAlongWidth - left;
        padInfo = { top: top_1, bottom: bottom, left: left, right: right };
    }
    else if (pad === 'valid') {
        var outHeight = Math.ceil((inHeight - filterHeight + 1) / strideHeight);
        var outWidth = Math.ceil((inWidth - filterWidth + 1) / strideWidth);
        outShape = [outHeight, outWidth, outDepth];
        padInfo = { top: 0, bottom: 0, left: 0, right: 0 };
    }
    else {
        throw Error("Unknown padding parameter: " + pad);
    }
    return {
        inShape: inShape,
        outShape: outShape,
        padInfo: padInfo,
        strideHeight: strideHeight,
        strideWidth: strideWidth,
        filterHeight: filterHeight,
        filterWidth: filterWidth
    };
}
exports.computeConvInfo = computeConvInfo;
function computeOutputShape3D(inShape, fieldSize, outDepth, stride, zeroPad) {
    if (zeroPad == null) {
        zeroPad = computeDefaultPad(inShape, fieldSize, stride);
    }
    var inputRows = inShape[0];
    var inputCols = inShape[1];
    var outputRows = (inputRows - fieldSize + 2 * zeroPad) / stride + 1;
    util.assert(util.isInt(outputRows), "The output # of rows (" + outputRows + ") must be an integer. Change the " +
        "stride and/or zero pad parameters");
    var outputCols = (inputCols - fieldSize + 2 * zeroPad) / stride + 1;
    util.assert(util.isInt(outputCols), "The output # of columns (" + outputCols + ") must be an integer. Change " +
        "the stride and/or zero pad parameters");
    return [outputRows, outputCols, outDepth];
}
exports.computeOutputShape3D = computeOutputShape3D;
function computeDefaultPad(inputShape, fieldSize, stride) {
    return Math.floor((inputShape[0] * (stride - 1) - stride + fieldSize) / 2);
}
exports.computeDefaultPad = computeDefaultPad;
function computeTexShapeFrom3D(shapeRowColDepth) {
    return [shapeRowColDepth[0], shapeRowColDepth[1] * shapeRowColDepth[2]];
}
exports.computeTexShapeFrom3D = computeTexShapeFrom3D;
function computeWeightsShape4D(inputDepth, outputDepth, filterHeight, filterWidth) {
    return [filterHeight, filterWidth, inputDepth, outputDepth];
}
exports.computeWeightsShape4D = computeWeightsShape4D;
function computeDilatedRC(rc, origStride) {
    var rowsDilated = (rc[0] - 1) * origStride + 1;
    var colsDilated = (rc[1] - 1) * origStride + 1;
    return [rowsDilated, colsDilated];
}
exports.computeDilatedRC = computeDilatedRC;

},{"../util":95}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateShapes(sourceSize, destSize) {
    var srcArea = sourceSize[0] * sourceSize[1];
    var dstArea = destSize[0] * destSize[1];
    if (srcArea !== dstArea) {
        var srcStr = "[" + sourceSize[0] + ", " + sourceSize[1] + "]";
        var dstStr = "[" + destSize[0] + ", " + destSize[1] + "]";
        throw new Error("copy2D shapes have different areas:\n  sourceSize " + srcStr +
            (", area " + srcArea + "\n  destSize " + dstStr + ", area " + dstArea));
    }
}
exports.validateShapes = validateShapes;

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ndarray_1 = require("./ndarray");
var SquareCostFunc = (function () {
    function SquareCostFunc() {
        this.halfOne = ndarray_1.Scalar.new(0.5);
    }
    SquareCostFunc.prototype.cost = function (math, x1, x2) {
        var diff = math.subStrict(x1, x2);
        var diffSquared = math.elementWiseMul(diff, diff);
        var result = math.scalarTimesArray(this.halfOne, diffSquared);
        diff.dispose();
        diffSquared.dispose();
        return result;
    };
    SquareCostFunc.prototype.der = function (math, x1, x2) {
        return math.subStrict(x1, x2);
    };
    SquareCostFunc.prototype.dispose = function () {
        this.halfOne.dispose();
    };
    return SquareCostFunc;
}());
exports.SquareCostFunc = SquareCostFunc;

},{"./ndarray":63}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../util");
var axis_util = require("./axis_util");
var broadcast_util = require("./broadcast_util");
var concat_util = require("./concat_util");
var conv_util = require("./conv_util");
var copy2d_util = require("./copy2d_util");
var ndarray_1 = require("./ndarray");
var slice_util = require("./slice_util");
var SumTypesMap;
(function (SumTypesMap) {
    SumTypesMap["float32"] = "float32";
    SumTypesMap["int32"] = "int32";
    SumTypesMap["bool"] = "int32";
})(SumTypesMap = exports.SumTypesMap || (exports.SumTypesMap = {}));
var NDArrayMath = (function () {
    function NDArrayMath(safeMode) {
        this.safeMode = safeMode;
        this.ndarrayScopes = [];
        this.ndarraysToKeep = [];
        this.activeScopeNDArraysToKeep = [];
        this.debugMode = false;
    }
    NDArrayMath.prototype.scope = function (scopeFn) {
        var _this = this;
        this.startScope();
        var keepFn = function (ndarray) { return _this.keep(ndarray); };
        var trackFn = function (ndarray) { return _this.track(ndarray); };
        var result = scopeFn(keepFn, trackFn);
        if (result instanceof Promise) {
            result.then(function (r) { return _this.endScope(r); });
            return result;
        }
        else {
            this.endScope(result);
            return result;
        }
    };
    NDArrayMath.prototype.enableDebugMode = function () {
        this.debugMode = true;
        console.warn('Debugging mode is ON. The output of every math call will ' +
            'be downloaded to CPU and checked for NaNs. ' +
            'This significantly impacts performance.');
    };
    NDArrayMath.prototype.startScope = function () {
        var newScope = [];
        this.ndarrayScopes.push(newScope);
        this.activeScope = newScope;
        var newNDArraysToKeep = [];
        this.ndarraysToKeep.push(newNDArraysToKeep);
        this.activeScopeNDArraysToKeep = newNDArraysToKeep;
    };
    NDArrayMath.prototype.extractNDArraysFromScopeResult = function (result) {
        if (result == null) {
            return [];
        }
        if (result instanceof ndarray_1.NDArray) {
            return [result];
        }
        var list = [];
        var resultObj = result;
        for (var k in resultObj) {
            var val = resultObj[k];
            if (val instanceof ndarray_1.NDArray) {
                list.push(val);
            }
        }
        return list;
    };
    NDArrayMath.prototype.endScope = function (result) {
        var _this = this;
        var arraysToKeep = this.activeScopeNDArraysToKeep;
        var resultArrays = this.extractNDArraysFromScopeResult(result);
        arraysToKeep = arraysToKeep.concat(resultArrays);
        for (var i = 0; i < this.activeScope.length; i++) {
            var ndarray = this.activeScope[i];
            if (this.isNDArrayDataInList(ndarray, arraysToKeep)) {
                continue;
            }
            ndarray.dispose();
        }
        this.ndarrayScopes.pop();
        this.activeScope = this.ndarrayScopes.length === 0 ?
            null :
            this.ndarrayScopes[this.ndarrayScopes.length - 1];
        resultArrays.forEach(function (val) {
            if (!_this.isNDArrayDataInList(val, _this.activeScopeNDArraysToKeep)) {
                _this.track(val);
            }
        });
        this.ndarraysToKeep.pop();
        this.activeScopeNDArraysToKeep = this.ndarraysToKeep.length === 0 ?
            null :
            this.ndarraysToKeep[this.ndarraysToKeep.length - 1];
    };
    NDArrayMath.prototype.isNDArrayDataInList = function (ndarray, ndarrayList) {
        for (var i = 0; i < ndarrayList.length; i++) {
            if (ndarrayList[i].getData() === ndarray.getData()) {
                return true;
            }
        }
        return false;
    };
    NDArrayMath.prototype.keep = function (result) {
        if (this.activeScope == null) {
            if (this.safeMode) {
                throw new Error('You are using math in safe mode. Enclose all ' +
                    'math.method() calls inside a scope: ' +
                    'math.scope(() => {math.method();...}) to avoid memory ' +
                    'leaks.');
            }
            return result;
        }
        this.activeScopeNDArraysToKeep.push(result);
        return result;
    };
    NDArrayMath.prototype.checkForNaN = function (vals, dtype, name) {
        for (var i = 0; i < vals.length; i++) {
            if (util.isValNaN(vals[i], dtype)) {
                throw Error("The result of the last math." + name + " has NaNs.");
            }
        }
    };
    NDArrayMath.prototype.track = function (result) {
        if (this.activeScope == null) {
            if (this.safeMode) {
                throw new Error('You are using math in safe mode. Enclose all ' +
                    'math.method() calls inside a scope: ' +
                    'math.scope(() => {math.method();...}) to avoid memory ' +
                    'leaks.');
            }
            return result;
        }
        this.activeScope.push(result);
        return result;
    };
    NDArrayMath.prototype.dispose = function () { };
    NDArrayMath.prototype.matMul = function (a, b, aOrientation, bOrientation) {
        var _this = this;
        if (aOrientation === void 0) { aOrientation = MatrixOrientation.REGULAR; }
        if (bOrientation === void 0) { bOrientation = MatrixOrientation.REGULAR; }
        var innerShapeA = (aOrientation === MatrixOrientation.REGULAR) ? a.shape[1] : a.shape[0];
        var innerShapeB = (bOrientation === MatrixOrientation.REGULAR) ? b.shape[0] : b.shape[1];
        util.assert(a.rank === 2 && b.rank === 2, "Error in matMul: inputs must be rank 2, got ranks " + a.rank +
            ("and " + b.rank + "."));
        util.assert(innerShapeA === innerShapeB, "Error in matMul: inner shapes (" + innerShapeA + ") and (" +
            (innerShapeB + ") of NDArrays with shapes " + a.shape + " and ") +
            (b.shape + " and orientations " + MatrixOrientation[aOrientation]) +
            (" and " + MatrixOrientation[bOrientation] + " must match."));
        return this.executeOp('matMul', function () { return _this.matMulInternal(a, b, aOrientation, bOrientation); });
    };
    NDArrayMath.prototype.executeOp = function (name, f) {
        var start;
        if (this.debugMode) {
            start = performance.now();
        }
        var result = f();
        if (this.debugMode) {
            var vals = result.getValues();
            var time = util.rightPad(performance.now() - start + "ms", 9);
            var paddedName = util.rightPad(name, 25);
            var rank = result.rank;
            var size = result.size;
            var shape = util.rightPad(result.shape.toString(), 14);
            console.log("%c" + paddedName + "\t%c" + time + "\t%c" + rank + "D " + shape + "\t%c" + size, 'font-weight:bold', 'color:red', 'color:blue', 'color: orange');
            this.checkForNaN(vals, result.dtype, name);
        }
        return this.track(result);
    };
    NDArrayMath.prototype.vectorTimesMatrix = function (v, matrix) {
        util.assert(v.rank === 1, "Error in vectorTimesMatrix: first input must be rank 1, but got " +
            ("rank " + v.rank + "."));
        util.assert(matrix.rank === 2, "Error in vectorTimesMatrix: second input must be rank 2, but got " +
            ("rank " + matrix.rank + "."));
        util.assert(v.size === matrix.shape[0], "Error in vectorTimesMatrix: size of vector (" + v.size + ") " +
            ("must match first dimension of matrix (" + matrix.shape[0] + ")"));
        return this.matMul(v.as2D(1, -1), matrix).as1D();
    };
    NDArrayMath.prototype.matrixTimesVector = function (matrix, v) {
        util.assert(v.rank === 1, "Error in matrixTimesVector: second input must rank 1, but got " +
            ("rank " + v.rank + "."));
        util.assert(matrix.rank === 2, "Error in matrixTimesVector: first input must be a rank 2, but got " +
            ("rank " + matrix.rank + "."));
        util.assert(v.size === matrix.shape[1], "Error in matrixTimesVector: size of first rank 1 input " + v.size + " " +
            "must match inner dimension of second rank 2 input, but got " +
            ("shape " + matrix.shape + "."));
        return this.matMul(matrix, v.as2D(-1, 1)).as1D();
    };
    NDArrayMath.prototype.dotProduct = function (v1, v2) {
        util.assert(v1.rank === 1 && v2.rank === 1, "Error in dotProduct: inputs must be rank 1, but got ranks " +
            (v1.rank + " and " + v2.rank + "."));
        util.assert(v1.size === v2.size, "Error in dotProduct: size of inputs (" + v1.size + ") and (" +
            (v2.size + ") must match."));
        return this.matMul(v1.as2D(1, -1), v2.as2D(-1, 1)).asScalar();
    };
    NDArrayMath.prototype.outerProduct = function (v1, v2) {
        util.assert(v1.rank === 1 && v2.rank === 1, "Error in outerProduct: inputs must be rank 1, but got ranks " +
            (v1.rank + " and " + v2.rank + "."));
        return this.matMul(v1.as2D(-1, 1), v2.as2D(1, -1));
    };
    NDArrayMath.prototype.clone = function (ndarray) {
        var _this = this;
        return this.executeOp('clone', function () { return _this.cloneInternal(ndarray); });
    };
    NDArrayMath.prototype.reshape = function (ndarray, newShape) {
        console.warn('math.reshape() is deprecated. Please call reshape() ' +
            'directly on the ndarray object');
        return ndarray.reshape(newShape);
    };
    NDArrayMath.prototype.slice1D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, [begin], [size]);
        return this.executeOp('slice1D', function () { return _this.slice1DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.slice2D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, begin, size);
        return this.executeOp('slice2D', function () { return _this.slice2DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.slice3D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, begin, size);
        return this.executeOp('slice3D', function () { return _this.slice3DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.slice4D = function (input, begin, size) {
        var _this = this;
        slice_util.assertParamsValid(input, begin, size);
        return this.executeOp('slice4D', function () { return _this.slice4DInternal(input, begin, size); });
    };
    NDArrayMath.prototype.copy2D = function (source, sourceBegin, sourceSize, dest, destBegin, destSize) {
        var _this = this;
        util.assert(sourceBegin[0] + sourceSize[0] <= source.shape[0] &&
            sourceBegin[1] + sourceSize[1] <= source.shape[1], "Error in copy2D: requested source start position " + sourceBegin + " " +
            ("and source size " + sourceSize + " would overflow source NDArray") +
            ("of shape " + source.shape + "."));
        util.assert(destBegin[0] + destSize[0] <= dest.shape[0] &&
            destBegin[1] + destSize[1] <= dest.shape[1], "Error in copy2D: requested dest start position " + destBegin + " " +
            ("and source size " + destSize + " would overflow dest NDArray of") +
            ("shape " + dest.shape + "."));
        copy2d_util.validateShapes(sourceSize, destSize);
        this.executeOp('copy2D', function () {
            _this.copy2DInternal(source, sourceBegin, sourceSize, dest, destBegin, destSize);
            return dest;
        });
    };
    NDArrayMath.prototype.concat1D = function (a, b) {
        var _this = this;
        concat_util.assertParams(a.shape, b.shape, 0);
        return this.executeOp('concat1D', function () { return _this.concat1DInternal(a, b); });
    };
    NDArrayMath.prototype.concat2D = function (a, b, axis) {
        var _this = this;
        concat_util.assertParams(a.shape, b.shape, axis);
        return this.executeOp('concat2D', function () { return _this.concat2DInternal(a, b, axis); });
    };
    NDArrayMath.prototype.concat3D = function (ndarray1, ndarray2, axis) {
        var _this = this;
        concat_util.assertParams(ndarray1.shape, ndarray2.shape, axis);
        return this.executeOp('concat3D', function () { return _this.concat3DInternal(ndarray1, ndarray2, axis); });
    };
    NDArrayMath.prototype.concat4D = function (ndarray1, ndarray2, axis) {
        var _this = this;
        concat_util.assertParams(ndarray1.shape, ndarray2.shape, axis);
        return this.executeOp('concat4D', function () { return _this.concat4DInternal(ndarray1, ndarray2, axis); });
    };
    NDArrayMath.prototype.logSumExp = function (input, axis, keepDims) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        if (keepDims === void 0) { keepDims = false; }
        var axes = axis_util.parseAxisParam(axis, input.shape);
        var permutedAxes = axis_util.getPermutedAxes(axes, input.rank);
        return this.executeOp('logSumExp', function () {
            if (permutedAxes != null) {
                input = _this.transpose(input, permutedAxes);
                axes = axis_util.getInnerMostAxes(axes.length, input.rank);
            }
            var res = _this.logSumExpInternal(input, axes);
            if (keepDims) {
                var newShape = axis_util.expandShapeToKeepDim(res.shape, axes);
                return res.reshape(newShape);
            }
            return res;
        });
    };
    NDArrayMath.prototype.sum = function (input, axis, keepDims) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        if (keepDims === void 0) { keepDims = false; }
        var axes = axis_util.parseAxisParam(axis, input.shape);
        var permutedAxes = axis_util.getPermutedAxes(axes, input.rank);
        return this.executeOp('sum', function () {
            if (permutedAxes != null) {
                input = _this.transpose(input, permutedAxes);
                axes = axis_util.getInnerMostAxes(axes.length, input.rank);
            }
            var res = _this.sumInternal(input, axes);
            if (keepDims) {
                var newShape = axis_util.expandShapeToKeepDim(res.shape, axes);
                return res.reshape(newShape);
            }
            return res;
        });
    };
    NDArrayMath.prototype.mean = function (x, axis, keepDims) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        if (keepDims === void 0) { keepDims = false; }
        var axes = axis_util.parseAxisParam(axis, x.shape);
        var shapes = axis_util.computeOutAndReduceShapes(x.shape, axes);
        var reduceShape = shapes[1];
        var reduceSize = util.sizeFromShape(reduceShape);
        return this.executeOp('mean', function () {
            return _this.scope(function (keep, track) {
                var res = _this.divide(x, track(ndarray_1.Scalar.new(reduceSize)));
                return _this.sum(res, axis, keepDims);
            });
        });
    };
    NDArrayMath.prototype.argMin = function (input, axis) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        var axes = axis_util.parseAxisParam(axis, input.shape);
        var permutedAxes = axis_util.getPermutedAxes(axes, input.rank);
        return this.executeOp('argMin', function () {
            if (permutedAxes != null) {
                input = _this.transpose(input, permutedAxes);
                axes = axis_util.getInnerMostAxes(axes.length, input.rank);
            }
            return _this.argMinInternal(input, axes);
        });
    };
    NDArrayMath.prototype.argMax = function (input, axis) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        var axes = axis_util.parseAxisParam(axis, input.shape);
        var permutedAxes = axis_util.getPermutedAxes(axes, input.rank);
        return this.executeOp('argMax', function () {
            if (permutedAxes != null) {
                input = _this.transpose(input, permutedAxes);
                axes = axis_util.getInnerMostAxes(axes.length, input.rank);
            }
            return _this.argMaxInternal(input, axes);
        });
    };
    NDArrayMath.prototype.argMaxEquals = function (x1, x2) {
        var _this = this;
        util.assertShapesMatch(x1.shape, x2.shape, 'Error in argMaxEquals: ');
        return this.executeOp('argMaxEquals', function () { return _this.scope(function () {
            return _this.equal(_this.argMax(x1), _this.argMax(x2));
        }); });
    };
    NDArrayMath.prototype.equal = function (x, y) {
        var _this = this;
        return this.executeOp('equal', function () { return _this.equalInternal(x, y); });
    };
    NDArrayMath.prototype.equalStrict = function (x, y) {
        util.assertShapesMatch(x.shape, y.shape, 'Error in equalStrict: ');
        return this.equal(x, y);
    };
    NDArrayMath.prototype.topK = function (ndarray, k) {
        var _this = this;
        util.assert(k <= ndarray.size, "Error in topK: k value (" + k + ") must be less than size of input " +
            ("ndarray, got shape " + ndarray.shape + "."));
        var result;
        this.executeOp('topK', function () {
            result = _this.topKInternal(ndarray, k);
            return result.values;
        });
        this.track(result.indices);
        return result;
    };
    NDArrayMath.prototype.min = function (input, axis, keepDims) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        if (keepDims === void 0) { keepDims = false; }
        var axes = axis_util.parseAxisParam(axis, input.shape);
        var permutedAxes = axis_util.getPermutedAxes(axes, input.rank);
        return this.executeOp('min', function () {
            if (permutedAxes != null) {
                input = _this.transpose(input, permutedAxes);
                axes = axis_util.getInnerMostAxes(axes.length, input.rank);
            }
            var res = _this.minInternal(input, axes);
            if (keepDims) {
                var newShape = axis_util.expandShapeToKeepDim(res.shape, axes);
                return res.reshape(newShape);
            }
            return res;
        });
    };
    NDArrayMath.prototype.max = function (input, axis, keepDims) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        if (keepDims === void 0) { keepDims = false; }
        var axes = axis_util.parseAxisParam(axis, input.shape);
        var permutedAxes = axis_util.getPermutedAxes(axes, input.rank);
        return this.executeOp('max', function () {
            if (permutedAxes != null) {
                input = _this.transpose(input, permutedAxes);
                axes = axis_util.getInnerMostAxes(axes.length, input.rank);
            }
            var res = _this.maxInternal(input, axes);
            if (keepDims) {
                var newShape = axis_util.expandShapeToKeepDim(res.shape, axes);
                return res.reshape(newShape);
            }
            return res;
        });
    };
    NDArrayMath.prototype.softmax = function (logits, dim) {
        var _this = this;
        if (dim === void 0) { dim = -1; }
        if (dim === -1) {
            dim = logits.rank - 1;
        }
        if (dim !== logits.rank - 1) {
            throw Error('Softmax along a non-last dimension is not yet supported. ' +
                ("Logits was rank " + logits.rank + " and dim was " + dim));
        }
        return this.executeOp('softmax', function () {
            return _this.scope(function () {
                var lse = _this.logSumExp(logits, [dim], true);
                var logResult = _this.subtract(logits, lse);
                return _this.exp(logResult);
            });
        });
    };
    NDArrayMath.prototype.switchDim = function (a, newDim) {
        return this.transpose(a, newDim);
    };
    NDArrayMath.prototype.transpose = function (a, perm) {
        var _this = this;
        if (perm == null) {
            perm = a.shape.map(function (s, i) { return i; }).reverse();
        }
        util.assert(a.rank === perm.length, "Error in transpose: rank of input " + a.rank + " " +
            ("must match length of perm " + perm + "."));
        return this.executeOp('transpose', function () { return _this.transposeInternal(a, perm); });
    };
    NDArrayMath.prototype.scalarPlusArray = function (c, a) {
        util.assert(c.size === 1, "Error in scalarPlusArray: first argument must be rank 0, but got " +
            ("rank " + c.rank + "."));
        return this.add(c, a);
    };
    NDArrayMath.prototype.scalarMinusArray = function (c, a) {
        util.assert(c.size === 1, "Error in scalarMinusArray: first argument must be rank 0, but got " +
            ("rank " + c.rank + "."));
        return this.subtract(c, a);
    };
    NDArrayMath.prototype.arrayMinusScalar = function (a, c) {
        util.assert(c.size === 1, "Error in arrayMinusScalar: second argument must be rank 0, but " +
            ("got rank " + c.rank + "."));
        return this.subtract(a, c);
    };
    NDArrayMath.prototype.neg = function (a) {
        var _this = this;
        return this.executeOp('neg', function () { return _this.negInternal(a); });
    };
    NDArrayMath.prototype.add = function (a, b) {
        var _this = this;
        broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        return this.executeOp('add', function () { return _this.addInternal(a, b); });
    };
    NDArrayMath.prototype.addStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in addStrict: ');
        return this.add(a, b);
    };
    NDArrayMath.prototype.subtract = function (a, b) {
        var _this = this;
        broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        return this.executeOp('subtract', function () { return _this.subtractInternal(a, b); });
    };
    NDArrayMath.prototype.sub = function (a, b) {
        return this.subtract(a, b);
    };
    NDArrayMath.prototype.subStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in subStrict: ');
        return this.subtract(a, b);
    };
    NDArrayMath.prototype.multiply = function (a, b) {
        var _this = this;
        broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        return this.executeOp('multiply', function () { return _this.multiplyInternal(a, b); });
    };
    NDArrayMath.prototype.elementWiseMul = function (a, b) {
        return this.multiplyStrict(a, b);
    };
    NDArrayMath.prototype.multiplyStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in multiplyStrict: ');
        return this.multiply(a, b);
    };
    NDArrayMath.prototype.divide = function (a, b) {
        var _this = this;
        broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        return this.executeOp('divide', function () { return _this.divideInternal(a, b); });
    };
    NDArrayMath.prototype.divideStrict = function (a, b) {
        util.assertShapesMatch(a.shape, b.shape, 'Error in divideStrict: ');
        return this.divide(a, b);
    };
    NDArrayMath.prototype.scalarDividedByArray = function (c, a) {
        util.assert(c.size === 1, "Error in scalarDividedByArray: first argument must be rank 0, but " +
            ("got NDArray of rank " + c.rank + "."));
        return this.divide(c, a);
    };
    NDArrayMath.prototype.arrayDividedByScalar = function (a, c) {
        util.assert(c.size === 1, "Error in arrayDividedByScalar: second argument must be rank 0, " +
            ("but got NDArray of rank " + c.rank + "."));
        return this.divide(a, c);
    };
    NDArrayMath.prototype.ceil = function (ndarray) {
        var _this = this;
        return this.executeOp('ceil', function () { return _this.ceilInternal(ndarray); });
    };
    NDArrayMath.prototype.floor = function (ndarray) {
        var _this = this;
        return this.executeOp('floor', function () { return _this.floorInternal(ndarray); });
    };
    NDArrayMath.prototype.exp = function (ndarray) {
        var _this = this;
        return this.executeOp('exp', function () { return _this.expInternal(ndarray); });
    };
    NDArrayMath.prototype.log = function (ndarray) {
        var _this = this;
        return this.executeOp('log', function () { return _this.logInternal(ndarray); });
    };
    NDArrayMath.prototype.sqrt = function (ndarray) {
        var _this = this;
        return this.executeOp('sqrt', function () { return _this.sqrtInternal(ndarray); });
    };
    NDArrayMath.prototype.square = function (x) {
        var _this = this;
        return this.executeOp('square', function () { return _this.squareInternal(x); });
    };
    NDArrayMath.prototype.abs = function (ndarray) {
        var _this = this;
        return this.executeOp('abs', function () { return _this.absInternal(ndarray); });
    };
    NDArrayMath.prototype.clip = function (ndarray, min, max) {
        var _this = this;
        util.assert((min <= max), "Error in clip: min (" + min + ") must be" +
            ("less than or equal to max (" + max + ")."));
        return this.executeOp('clip', function () { return _this.clipInternal(ndarray, min, max); });
    };
    NDArrayMath.prototype.relu = function (ndarray) {
        var _this = this;
        return this.executeOp('relu', function () { return _this.reluInternal(ndarray); });
    };
    NDArrayMath.prototype.elu = function (ndarray) {
        var _this = this;
        return this.executeOp('elu', function () { return _this.eluInternal(ndarray); });
    };
    NDArrayMath.prototype.leakyRelu = function (ndarray, alpha) {
        var _this = this;
        if (alpha === void 0) { alpha = 0.2; }
        return this.executeOp('leakyRelu', function () { return _this.leakyReluInternal(ndarray, alpha); });
    };
    NDArrayMath.prototype.sigmoid = function (ndarray) {
        var _this = this;
        return this.executeOp('sigmoid', function () { return _this.sigmoidInternal(ndarray); });
    };
    NDArrayMath.prototype.sin = function (ndarray) {
        var _this = this;
        return this.executeOp('sin', function () { return _this.sinInternal(ndarray); });
    };
    NDArrayMath.prototype.cos = function (ndarray) {
        var _this = this;
        return this.executeOp('cos', function () { return _this.cosInternal(ndarray); });
    };
    NDArrayMath.prototype.tan = function (ndarray) {
        var _this = this;
        return this.executeOp('tan', function () { return _this.tanInternal(ndarray); });
    };
    NDArrayMath.prototype.asin = function (ndarray) {
        var _this = this;
        return this.executeOp('asin', function () { return _this.asinInternal(ndarray); });
    };
    NDArrayMath.prototype.acos = function (ndarray) {
        var _this = this;
        return this.executeOp('acos', function () { return _this.acosInternal(ndarray); });
    };
    NDArrayMath.prototype.atan = function (ndarray) {
        var _this = this;
        return this.executeOp('atan', function () { return _this.atanInternal(ndarray); });
    };
    NDArrayMath.prototype.sinh = function (ndarray) {
        var _this = this;
        return this.executeOp('sinh', function () { return _this.sinhInternal(ndarray); });
    };
    NDArrayMath.prototype.cosh = function (ndarray) {
        var _this = this;
        return this.executeOp('cosh', function () { return _this.coshInternal(ndarray); });
    };
    NDArrayMath.prototype.tanh = function (ndarray) {
        var _this = this;
        return this.executeOp('tanh', function () { return _this.tanhInternal(ndarray); });
    };
    NDArrayMath.prototype.step = function (ndarray) {
        var _this = this;
        return this.executeOp('step', function () { return _this.stepInternal(ndarray); });
    };
    NDArrayMath.prototype.scaledArrayAdd = function (c1, a, c2, b) {
        var _this = this;
        util.assert(c1.size === 1, "Error in scaledArrayAdd: first argument must rank 0, but got " +
            (" rank " + c1.rank + "."));
        util.assert(c2.size === 1, "Error in scaledArrayAdd: third argument must be rank 0, but got " +
            ("NDArray of rank " + c2.rank + "."));
        util.assertShapesMatch(a.shape, b.shape, 'Error in scaledArrayAdd: ');
        return this.executeOp('scaledArrayAdd', function () { return _this.scaledArrayAddInternal(c1, a, c2, b); });
    };
    NDArrayMath.prototype.scalarTimesArray = function (c, a) {
        util.assert(c.size === 1, "Error in arrayDividedByScalar: first argument must be rank 0, but " +
            ("got rank " + c.rank + "."));
        return this.multiply(c, a);
    };
    NDArrayMath.prototype.elementWiseMulBroadcast = function (a, b) {
        util.assert(a.rank === 2, "Error in elementWiseMulBroadcast: first argument must be " +
            ("rank 2, but got rank " + a.rank + "."));
        util.assert(b.rank === 2, "Error in elementWiseMulBroadcast: second argument must be " +
            ("rank 2, but got rank " + b.rank + "."));
        return this.multiply(a, b);
    };
    NDArrayMath.prototype.conv2d = function (x, filter, bias, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in conv2d: x must be rank 3, but got rank " + x.rank + ".");
        util.assert(filter.rank === 4, "Error in conv2d: filter must be rank 4, but got rank " +
            (filter.rank + "."));
        if (bias != null) {
            util.assert(bias.rank === 1, "Error in conv2d: bias must be rank 1, but got rank " +
                (bias.rank + "."));
        }
        util.assert(x.shape[2] === filter.shape[2], "Error in conv2d: depth of input (" + x.shape[2] + ") must match  " +
            ("input depth for filter " + filter.shape[2] + "."));
        var filterHeight = filter.shape[0];
        var filterWidth = filter.shape[1];
        var outDepth = filter.shape[3];
        var _a = parseTupleParam(strides), strideHeight = _a[0], strideWidth = _a[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('conv2d', function () { return _this.conv2dInternal(x, filter, bias, convInfo); });
    };
    NDArrayMath.prototype.conv2dBackProp = function (x, dy, filter, strides, pad) {
        var dw = this.conv2dDerFilter(x, dy, filter.shape, strides, pad);
        var db = this.conv2dDerBias(dy);
        var dx = this.conv2dDerInput(x.shape, dy, filter, strides, pad);
        return { db: db, dw: dw, dx: dx };
    };
    NDArrayMath.prototype.conv2dDerInput = function (inShape, dy, filter, strides, pad) {
        var _this = this;
        var inDepth = inShape[2];
        var outDepth = dy.shape[2];
        util.assert(inShape.length === 3, "Error in conv2dDerInput: x must be rank 3, but got rank " +
            (inShape.length + "."));
        util.assert(dy.rank === 3, "Error in conv2dDerInput: dy must be rank 3, but got " +
            ("rank " + dy.rank));
        util.assert(filter.rank === 4, "Error in conv2dDerInput: filter must be rank 4, but got " +
            ("rank " + filter.rank));
        util.assert(inDepth === filter.shape[2], "Error in conv2dDerInput: depth of input (" + inDepth + ") must " +
            ("match input depth for filter " + filter.shape[2] + "."));
        util.assert(outDepth === filter.shape[3], "Error in conv2dDerInput: depth of output (" + outDepth + ") must" +
            ("match output depth for filter " + filter.shape[3] + "."));
        var filterHeight = filter.shape[0];
        var filterWidth = filter.shape[1];
        var _a = parseTupleParam(strides), strideHeight = _a[0], strideWidth = _a[1];
        var convInfo = conv_util.computeConvInfo(inShape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('conv2dDerInput', function () { return _this.conv2dDerInputInternal(dy, filter, convInfo); });
    };
    NDArrayMath.prototype.conv2dDerBias = function (dy) {
        return this.track(this.conv2dDerBiasInternal(dy));
    };
    NDArrayMath.prototype.conv2dDerFilter = function (x, dy, filterSize, strides, pad) {
        util.assert(x.rank === 3, "Error in conv2dDerFilter: x must be rank 3, but got shape " +
            (x.shape + "."));
        util.assert(dy.rank === 3, "Error in conv2dDerFilter: dy must be rank 3, but got shape " +
            (dy.shape + "."));
        util.assert(filterSize.length === 4, "Error in conv2dDerFilter: filterSize must be length 4, but got " +
            (filterSize + "."));
        util.assert(x.shape[2] === filterSize[2], "Error in conv2dDerFilter: depth of x " + x.shape[2] + ") must " +
            ("match input depth in filter (" + filterSize[2] + "."));
        util.assert(dy.shape[2] === filterSize[3], "Error in conv2dDerFilter: depth of dy (" + dy.shape[2] + ") must " +
            ("match output depth for filter (" + filterSize[3] + ")."));
        var filterHeight = filterSize[0];
        var filterWidth = filterSize[1];
        var outDepth = filterSize[3];
        var _a = parseTupleParam(strides), strideHeight = _a[0], strideWidth = _a[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.track(this.conv2dDerFilterInternal(x, dy, convInfo));
    };
    NDArrayMath.prototype.conv2dTranspose = function (x, filter, outputShape, strides, pad) {
        return this.conv2dDerInput(outputShape, x, filter, strides, pad);
    };
    NDArrayMath.prototype.maxPool = function (x, filterSize, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in maxPool: x must be rank 3 but got rank " + x.rank + ".");
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('maxPool', function () { return _this.maxPoolInternal(x, convInfo); });
    };
    NDArrayMath.prototype.maxPoolBackprop = function (dy, x, filterSize, strides, pad) {
        var _this = this;
        util.assert(dy.rank === 3, "Error in maxPoolBackprop: dy must be rank 3 but got rank " +
            (dy.rank + "."));
        util.assert(x.rank === 3, "Error in maxPoolBackprop: x must be rank 3 but got rank " +
            (x.rank + "."));
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('maxPoolBackprop', function () { return _this.maxPoolBackpropInternal(dy, x, convInfo); });
    };
    NDArrayMath.prototype.minPool = function (x, filterSize, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in minPool: x must be rank 3 but got rank " + x.rank + ".");
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('minPool', function () { return _this.minPoolInternal(x, convInfo); });
    };
    NDArrayMath.prototype.avgPool = function (x, filterSize, strides, pad) {
        var _this = this;
        util.assert(x.rank === 3, "Error in avgPool: x must be rank 3 but got rank " + x.rank + ".");
        var _a = parseTupleParam(filterSize), filterHeight = _a[0], filterWidth = _a[1];
        var outDepth = x.shape[2];
        var _b = parseTupleParam(strides), strideHeight = _b[0], strideWidth = _b[1];
        var convInfo = conv_util.computeConvInfo(x.shape, filterHeight, filterWidth, outDepth, strideHeight, strideWidth, pad);
        return this.executeOp('avgPool', function () { return _this.avgPoolInternal(x, convInfo); });
    };
    NDArrayMath.prototype.resizeBilinear3D = function (x, newShape2D, alignCorners) {
        var _this = this;
        if (alignCorners === void 0) { alignCorners = false; }
        util.assert(x.rank === 3, "Error in resizeBilinear3D: x must be rank 3 but got rank " + x.rank + ".");
        util.assert(newShape2D.length === 2, "Error in resizeBilinear3D: new shape must 2D, but got shape " +
            (newShape2D + "."));
        return this.executeOp('resizeBilinear3D', function () { return _this.resizeBilinear3DInternal(x, newShape2D, alignCorners); });
    };
    NDArrayMath.prototype.batchNormalization3D = function (x, mean, variance, varianceEpsilon, scale, offset) {
        var _this = this;
        if (varianceEpsilon === void 0) { varianceEpsilon = .001; }
        util.assert(x.rank === 3, "Error in batchNormalization3D: x must be rank 3 but got rank " +
            (x.rank + "."));
        util.assert(mean.rank === 3 || mean.rank === 1, "Error in batchNormalization3D: mean must be rank 3 or rank 1 but " +
            ("got rank " + mean.rank + "."));
        util.assert(variance.rank === 3 || variance.rank === 1, "Error in batchNormalization3D: variance must be rank 3 or rank 1 " +
            ("but got rank " + variance.rank + "."));
        if (scale != null) {
            util.assert(scale.rank === 3 || scale.rank === 1, "Error in batchNormalization3D: scale must be rank 3 or rank 1 " +
                ("but got rank " + scale.rank + "."));
        }
        if (offset != null) {
            util.assert(offset.rank === 3 || offset.rank === 1, "Error in batchNormalization3D: offset must be rank 3 or rank 1 " +
                ("but got rank " + offset.rank + "."));
        }
        return this.executeOp('batchNorm3D', function () { return _this.batchNormalization3DInternal(x, mean, variance, varianceEpsilon, scale, offset); });
    };
    NDArrayMath.prototype.multiRNNCell = function (lstmCells, data, c, h) {
        var res = this.scope(function () {
            var input = data;
            var newStates = [];
            for (var i = 0; i < lstmCells.length; i++) {
                var output = lstmCells[i](input, c[i], h[i]);
                newStates.push(output[0]);
                newStates.push(output[1]);
                input = output[1];
            }
            return newStates;
        });
        var newC = [];
        var newH = [];
        for (var i = 0; i < res.length; i += 2) {
            newC.push(res[i]);
            newH.push(res[i + 1]);
        }
        return [newC, newH];
    };
    NDArrayMath.prototype.basicLSTMCell = function (forgetBias, lstmKernel, lstmBias, data, c, h) {
        var _this = this;
        var res = this.scope(function () {
            var combined = _this.concat2D(data, h, 1);
            var weighted = _this.matMul(combined, lstmKernel);
            var res = _this.add(weighted, lstmBias);
            var batchSize = res.shape[0];
            var sliceCols = res.shape[1] / 4;
            var sliceSize = [batchSize, sliceCols];
            var i = _this.slice2D(res, [0, 0], sliceSize);
            var j = _this.slice2D(res, [0, sliceCols], sliceSize);
            var f = _this.slice2D(res, [0, sliceCols * 2], sliceSize);
            var o = _this.slice2D(res, [0, sliceCols * 3], sliceSize);
            var newC = _this.addStrict(_this.multiplyStrict(c, _this.sigmoid(_this.scalarPlusArray(forgetBias, f))), _this.multiplyStrict(_this.sigmoid(i), _this.tanh(j)));
            var newH = _this.multiplyStrict(_this.tanh(newC), _this.sigmoid(o));
            return [newC, newH];
        });
        return [res[0], res[1]];
    };
    NDArrayMath.prototype.multinomial = function (probabilities, numSamples, seed) {
        var _this = this;
        var numOutcomes = probabilities.size;
        if (numOutcomes < 2) {
            throw new Error("Error in multinomial: you need at least 2 outcomes, but got " +
                (numOutcomes + "."));
        }
        if (probabilities.rank > 2) {
            throw new Error("Rank of probabilities must be 1 or 2, but is " + probabilities.rank);
        }
        seed = seed || Math.random();
        var origRank = probabilities.rank;
        if (probabilities.rank === 1) {
            probabilities = probabilities.as2D(1, -1);
        }
        return this.executeOp('multinomial', function () {
            var res = _this.multinomialInternal(probabilities, numSamples, seed);
            if (origRank === 1) {
                return res.as1D();
            }
            return res;
        });
    };
    NDArrayMath.prototype.oneHot = function (indices, depth, onValue, offValue) {
        var _this = this;
        if (onValue === void 0) { onValue = 1; }
        if (offValue === void 0) { offValue = 0; }
        if (depth < 2) {
            throw new Error("Error in oneHot: depth must be >=2, but it is " + depth);
        }
        return this.executeOp('oneHot', function () { return _this.oneHotInternal(indices, depth, onValue, offValue); });
    };
    NDArrayMath.prototype.moments = function (x, axis, keepDims) {
        var _this = this;
        if (axis === void 0) { axis = null; }
        if (keepDims === void 0) { keepDims = false; }
        var axes = axis_util.parseAxisParam(axis, x.shape);
        var result = this.scope(function () {
            var mean = _this.mean(x, axes, keepDims);
            var keepDimsShape = mean.shape;
            if (!keepDims) {
                keepDimsShape = axis_util.expandShapeToKeepDim(mean.shape, axes);
            }
            var devSquared = _this.square(_this.subtract(x, mean.reshape(keepDimsShape)));
            var variance = _this.mean(devSquared, axes, keepDims);
            return { mean: mean, variance: variance };
        });
        return result;
    };
    return NDArrayMath;
}());
exports.NDArrayMath = NDArrayMath;
var MatrixOrientation;
(function (MatrixOrientation) {
    MatrixOrientation[MatrixOrientation["REGULAR"] = 0] = "REGULAR";
    MatrixOrientation[MatrixOrientation["TRANSPOSED"] = 1] = "TRANSPOSED";
})(MatrixOrientation = exports.MatrixOrientation || (exports.MatrixOrientation = {}));
function parseTupleParam(param) {
    return typeof param === 'number' ? [param, param] : param;
}

},{"../util":95,"./axis_util":54,"./broadcast_util":55,"./concat_util":56,"./conv_util":57,"./copy2d_util":58,"./ndarray":63,"./slice_util":64}],61:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var seedrandom = require("seedrandom");
var util = require("../util");
var axis_util = require("./axis_util");
var broadcast_util = require("./broadcast_util");
var concat_util = require("./concat_util");
var conv_util = require("./conv_util");
var copy2D_util = require("./copy2d_util");
var math_1 = require("./math");
var ndarray_1 = require("./ndarray");
var NDArrayMathCPU = (function (_super) {
    __extends(NDArrayMathCPU, _super);
    function NDArrayMathCPU(safeMode) {
        if (safeMode === void 0) { safeMode = false; }
        return _super.call(this, safeMode) || this;
    }
    NDArrayMathCPU.prototype.cloneInternal = function (ndarray) {
        return ndarray_1.NDArray.make(ndarray.shape, { values: new Float32Array(ndarray.getValues()) });
    };
    NDArrayMathCPU.prototype.slice1DInternal = function (input, begin, size) {
        var newVals = input.getValues().slice(begin, begin + size);
        return ndarray_1.Array1D.new(newVals);
    };
    NDArrayMathCPU.prototype.slice2DInternal = function (input, begin, size) {
        var result = ndarray_1.Array2D.zeros(size);
        var startI = begin[0], startJ = begin[1];
        for (var i = 0; i < size[0]; ++i) {
            for (var j = 0; j < size[1]; ++j) {
                var val = input.get(i + startI, j + startJ);
                result.set(val, i, j);
            }
        }
        return result;
    };
    NDArrayMathCPU.prototype.slice3DInternal = function (input, begin, size) {
        var result = ndarray_1.Array3D.zeros(size);
        var startI = begin[0], startJ = begin[1], startK = begin[2];
        for (var i = 0; i < size[0]; ++i) {
            for (var j = 0; j < size[1]; ++j) {
                for (var k = 0; k < size[2]; ++k) {
                    var val = input.get(i + startI, j + startJ, k + startK);
                    result.set(val, i, j, k);
                }
            }
        }
        return result;
    };
    NDArrayMathCPU.prototype.slice4DInternal = function (input, begin, size) {
        var result = ndarray_1.Array4D.zeros(size);
        var startI = begin[0], startJ = begin[1], startK = begin[2], startL = begin[3];
        for (var i = 0; i < size[0]; ++i) {
            for (var j = 0; j < size[1]; ++j) {
                for (var k = 0; k < size[2]; ++k) {
                    for (var l = 0; l < size[3]; ++l) {
                        var val = input.get(i + startI, j + startJ, k + startK, l + startL);
                        result.set(val, i, j, k, l);
                    }
                }
            }
        }
        return result;
    };
    NDArrayMathCPU.prototype.copy2DInternal = function (source, sourceBeginRowCol, sourceSizeRowCol, dest, destBeginRowCol, destSizeRowCol) {
        copy2D_util.validateShapes(sourceSizeRowCol, destSizeRowCol);
        var srcValues = source.getValues();
        var dstValues = dest.getValues();
        var n = sourceSizeRowCol[0] * sourceSizeRowCol[1];
        for (var i = 0; i < n; ++i) {
            var srcRow = sourceBeginRowCol[0] + Math.floor(i / sourceSizeRowCol[1]);
            var srcCol = sourceBeginRowCol[1] + (i % sourceSizeRowCol[1]);
            var srcOff = srcRow * source.shape[1] + srcCol;
            var dstRow = destBeginRowCol[0] + Math.floor(i / destSizeRowCol[1]);
            var dstCol = destBeginRowCol[1] + (i % destSizeRowCol[1]);
            var dstOff = dstRow * dest.shape[1] + dstCol;
            dstValues[dstOff] = srcValues[srcOff];
        }
    };
    NDArrayMathCPU.prototype.concat1DInternal = function (a, b) {
        var outShape = concat_util.computeOutShape(a.shape, b.shape, 0);
        var result = ndarray_1.Array1D.zeros(outShape);
        var aVals = a.getValues();
        var bVals = b.getValues();
        var vals = result.getValues();
        vals.set(aVals, 0);
        vals.set(bVals, a.size);
        return result;
    };
    NDArrayMathCPU.prototype.concat2DInternal = function (a, b, axis) {
        var outShape = concat_util.computeOutShape(a.shape, b.shape, axis);
        var result = ndarray_1.Array2D.zeros(outShape);
        if (axis === 0) {
            var aVals = a.getValues();
            var bVals = b.getValues();
            var vals = result.getValues();
            vals.set(aVals, 0);
            vals.set(bVals, a.size);
            return result;
        }
        for (var i = 0; i < outShape[0]; ++i) {
            for (var j = 0; j < outShape[1]; ++j) {
                var index = [i, j];
                var value = void 0;
                if (index[axis] < a.shape[axis]) {
                    value = a.get(i, j);
                }
                else {
                    index[axis] -= a.shape[axis];
                    var i2 = index[0], j2 = index[1];
                    value = b.get(i2, j2);
                }
                result.set(value, i, j);
            }
        }
        return result;
    };
    NDArrayMathCPU.prototype.concat3DInternal = function (a, b, axis) {
        var outShape = concat_util.computeOutShape(a.shape, b.shape, axis);
        var result = ndarray_1.Array3D.zeros(outShape);
        if (axis === 0) {
            var aVals = a.getValues();
            var bVals = b.getValues();
            var vals = result.getValues();
            vals.set(aVals, 0);
            vals.set(bVals, a.size);
            return result;
        }
        for (var i = 0; i < outShape[0]; ++i) {
            for (var j = 0; j < outShape[1]; ++j) {
                for (var k = 0; k < outShape[2]; ++k) {
                    var index = [i, j, k];
                    var value = void 0;
                    if (index[axis] < a.shape[axis]) {
                        value = a.get(i, j, k);
                    }
                    else {
                        index[axis] -= a.shape[axis];
                        var i2 = index[0], j2 = index[1], k2 = index[2];
                        value = b.get(i2, j2, k2);
                    }
                    result.set(value, i, j, k);
                }
            }
        }
        return result;
    };
    NDArrayMathCPU.prototype.concat4DInternal = function (a, b, axis) {
        var outShape = concat_util.computeOutShape(a.shape, b.shape, axis);
        var result = ndarray_1.Array4D.zeros(outShape);
        if (axis === 0) {
            var aVals = a.getValues();
            var bVals = b.getValues();
            var vals = result.getValues();
            vals.set(aVals, 0);
            vals.set(bVals, a.size);
            return result;
        }
        for (var i = 0; i < outShape[0]; ++i) {
            for (var j = 0; j < outShape[1]; ++j) {
                for (var k = 0; k < outShape[2]; ++k) {
                    for (var l = 0; l < outShape[3]; ++l) {
                        var index = [i, j, k, l];
                        var value = void 0;
                        if (index[axis] < a.shape[axis]) {
                            value = a.get(i, j, k, l);
                        }
                        else {
                            index[axis] -= a.shape[axis];
                            var i2 = index[0], j2 = index[1], k2 = index[2], l2 = index[3];
                            value = b.get(i2, j2, k2, l2);
                        }
                        result.set(value, i, j, k, l);
                    }
                }
            }
        }
        return result;
    };
    NDArrayMathCPU.prototype.scaledArrayAddInternal = function (c1, a, c2, b) {
        var c1Val = c1.get();
        var c2Val = c2.get();
        return this.broadcastedBinaryOp(a, b, 'float32', function (aVal, bVal) {
            return c1Val * aVal + c2Val * bVal;
        });
    };
    NDArrayMathCPU.prototype.negInternal = function (a) {
        return this.scalarTimesArray(ndarray_1.Scalar.NEG_ONE, a);
    };
    NDArrayMathCPU.prototype.addInternal = function (a, b) {
        return this.scaledArrayAddInternal(ndarray_1.Scalar.ONE, a, ndarray_1.Scalar.ONE, b);
    };
    NDArrayMathCPU.prototype.subtractInternal = function (a, b) {
        return this.scaledArrayAddInternal(ndarray_1.Scalar.ONE, a, ndarray_1.Scalar.NEG_ONE, b);
    };
    NDArrayMathCPU.prototype.matMulInternal = function (a, b, aOrientation, bOrientation) {
        if (aOrientation === void 0) { aOrientation = math_1.MatrixOrientation.REGULAR; }
        if (bOrientation === void 0) { bOrientation = math_1.MatrixOrientation.REGULAR; }
        var sharedDim = (aOrientation === math_1.MatrixOrientation.REGULAR) ? a.shape[1] : a.shape[0];
        var leftDim = (aOrientation === math_1.MatrixOrientation.REGULAR) ? a.shape[0] : a.shape[1];
        var rightDim = (bOrientation === math_1.MatrixOrientation.REGULAR) ? b.shape[1] : b.shape[0];
        var normalGetter = function (matrix, i, j) {
            return matrix.get(i, j);
        };
        var transposedGetter = function (matrix, i, j) {
            return matrix.get(j, i);
        };
        var aGetter = (aOrientation === math_1.MatrixOrientation.REGULAR) ?
            normalGetter :
            transposedGetter;
        var bGetter = (bOrientation === math_1.MatrixOrientation.REGULAR) ?
            normalGetter :
            transposedGetter;
        var values = new Float32Array(leftDim * rightDim);
        var index = 0;
        for (var i = 0; i < leftDim; ++i) {
            for (var j = 0; j < rightDim; ++j) {
                var sum = 0;
                for (var k = 0; k < sharedDim; ++k) {
                    sum += aGetter(a, i, k) * bGetter(b, k, j);
                }
                values[index++] = sum;
            }
        }
        return ndarray_1.Array2D.new([leftDim, rightDim], values);
    };
    NDArrayMathCPU.prototype.multiplyInternal = function (a, b) {
        var newShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        var newValues = new Float32Array(util.sizeFromShape(newShape));
        var aValues = a.getValues();
        var bValues = b.getValues();
        for (var i = 0; i < newValues.length; ++i) {
            newValues[i] = aValues[i % a.size] * bValues[i % b.size];
        }
        return ndarray_1.NDArray.make(newShape, { values: newValues });
    };
    NDArrayMathCPU.prototype.divideInternal = function (a, b) {
        var newShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        var newValues = new Float32Array(util.sizeFromShape(newShape));
        var aValues = a.getValues();
        var bValues = b.getValues();
        for (var i = 0; i < newValues.length; ++i) {
            newValues[i] = aValues[i % a.size] / bValues[i % b.size];
        }
        return ndarray_1.NDArray.make(newShape, { values: newValues }, 'float32');
    };
    NDArrayMathCPU.prototype.sumInternal = function (input, axes) {
        axis_util.assertAxesAreInnerMostDims('sum', axes, input.rank);
        var _a = axis_util.computeOutAndReduceShapes(input.shape, axes), outShape = _a[0], reduceShape = _a[1];
        var resultDtype = math_1.SumTypesMap[input.dtype];
        var result = ndarray_1.NDArray.zeros(outShape, resultDtype);
        var reduceSize = util.sizeFromShape(reduceShape);
        var vals = result.getValues();
        var aVals = input.getValues();
        for (var i = 0; i < vals.length; ++i) {
            var offset = i * reduceSize;
            var sum = 0;
            for (var j = 0; j < reduceSize; ++j) {
                sum += aVals[offset + j];
            }
            vals[i] = sum;
        }
        return result;
    };
    NDArrayMathCPU.prototype.argMinInternal = function (input, axes) {
        axis_util.assertAxesAreInnerMostDims('argMax', axes, input.rank);
        var _a = axis_util.computeOutAndReduceShapes(input.shape, axes), outShape = _a[0], reduceShape = _a[1];
        var result = ndarray_1.NDArray.zeros(outShape, 'int32');
        var reduceSize = util.sizeFromShape(reduceShape);
        var vals = result.getValues();
        var aVals = input.getValues();
        for (var i = 0; i < vals.length; ++i) {
            var offset = i * reduceSize;
            var min = aVals[offset];
            var minIndex = 0;
            for (var j = 0; j < reduceSize; ++j) {
                var value = aVals[offset + j];
                if (isNaN(value)) {
                    minIndex = util.NAN_INT32;
                    break;
                }
                if (value < min) {
                    min = value;
                    minIndex = j;
                }
            }
            vals[i] = minIndex;
        }
        return result;
    };
    NDArrayMathCPU.prototype.argMaxInternal = function (input, axes) {
        axis_util.assertAxesAreInnerMostDims('argMax', axes, input.rank);
        var _a = axis_util.computeOutAndReduceShapes(input.shape, axes), outShape = _a[0], reduceShape = _a[1];
        var result = ndarray_1.NDArray.zeros(outShape, 'int32');
        var reduceSize = util.sizeFromShape(reduceShape);
        var vals = result.getValues();
        var aVals = input.getValues();
        for (var i = 0; i < vals.length; ++i) {
            var offset = i * reduceSize;
            var max = aVals[offset];
            var maxIndex = 0;
            for (var j = 0; j < reduceSize; ++j) {
                var value = aVals[offset + j];
                if (isNaN(value)) {
                    maxIndex = util.NAN_INT32;
                    break;
                }
                if (value > max) {
                    max = value;
                    maxIndex = j;
                }
            }
            vals[i] = maxIndex;
        }
        return result;
    };
    NDArrayMathCPU.prototype.equalInternal = function (a, b) {
        return this.broadcastedBinaryOp(a, b, 'bool', function (aVal, bVal) {
            if (util.isValNaN(aVal, a.dtype) || util.isValNaN(bVal, b.dtype)) {
                return util.getNaN('bool');
            }
            else {
                return (aVal === bVal) ? 1 : 0;
            }
        });
    };
    NDArrayMathCPU.prototype.topKInternal = function (ndarray, k) {
        var values = ndarray.getValues();
        var valuesAndIndices = [];
        for (var i = 0; i < values.length; i++) {
            valuesAndIndices.push({ value: values[i], index: i });
        }
        valuesAndIndices.sort(function (a, b) {
            return b.value - a.value;
        });
        var topkValues = new Float32Array(k);
        var topkIndices = new Float32Array(k);
        for (var i = 0; i < k; i++) {
            topkValues[i] = valuesAndIndices[i].value;
            topkIndices[i] = valuesAndIndices[i].index;
        }
        return { values: ndarray_1.Array1D.new(topkValues), indices: ndarray_1.Array1D.new(topkIndices) };
    };
    NDArrayMathCPU.prototype.minInternal = function (input, axes) {
        axis_util.assertAxesAreInnerMostDims('min', axes, input.rank);
        var _a = axis_util.computeOutAndReduceShapes(input.shape, axes), outShape = _a[0], reduceShape = _a[1];
        var result = ndarray_1.NDArray.zeros(outShape, input.dtype);
        var reduceSize = util.sizeFromShape(reduceShape);
        var vals = result.getValues();
        var aVals = input.getValues();
        for (var i = 0; i < vals.length; ++i) {
            var offset = i * reduceSize;
            var min = aVals[0];
            for (var j = 0; j < reduceSize; ++j) {
                var value = aVals[offset + j];
                if (isNaN(value)) {
                    min = Number.NaN;
                    break;
                }
                if (value < min) {
                    min = value;
                }
            }
            vals[i] = min;
        }
        return result;
    };
    NDArrayMathCPU.prototype.maxInternal = function (input, axes) {
        axis_util.assertAxesAreInnerMostDims('max', axes, input.rank);
        var _a = axis_util.computeOutAndReduceShapes(input.shape, axes), outShape = _a[0], reduceShape = _a[1];
        var result = ndarray_1.NDArray.zeros(outShape, input.dtype);
        var reduceSize = util.sizeFromShape(reduceShape);
        var vals = result.getValues();
        var aVals = input.getValues();
        for (var i = 0; i < vals.length; ++i) {
            var offset = i * reduceSize;
            var max = aVals[offset];
            for (var j = 0; j < reduceSize; ++j) {
                var value = aVals[offset + j];
                if (isNaN(value)) {
                    max = Number.NaN;
                    break;
                }
                if (value > max) {
                    max = value;
                }
            }
            vals[i] = max;
        }
        return result;
    };
    NDArrayMathCPU.prototype.ceilInternal = function (ndarray) {
        var values = ndarray.getValues();
        var newValues = new Float32Array(values.length);
        for (var i = 0; i < values.length; ++i) {
            newValues[i] = Math.ceil(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: newValues });
    };
    NDArrayMathCPU.prototype.floorInternal = function (ndarray) {
        var values = ndarray.getValues();
        var newValues = new Float32Array(values.length);
        for (var i = 0; i < values.length; ++i) {
            newValues[i] = Math.floor(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: newValues });
    };
    NDArrayMathCPU.prototype.expInternal = function (ndarray) {
        var values = ndarray.getValues();
        var newValues = new Float32Array(values.length);
        for (var i = 0; i < values.length; ++i) {
            newValues[i] = Math.exp(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: newValues });
    };
    NDArrayMathCPU.prototype.logInternal = function (ndarray) {
        var values = ndarray.getValues();
        var newValues = new Float32Array(values.length);
        for (var i = 0; i < values.length; ++i) {
            var value = values[i];
            newValues[i] = Math.log(value);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: newValues });
    };
    NDArrayMathCPU.prototype.sqrtInternal = function (ndarray) {
        var values = ndarray.getValues();
        var newValues = new Float32Array(values.length);
        for (var i = 0; i < values.length; ++i) {
            var value = values[i];
            newValues[i] = Math.sqrt(value);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: newValues });
    };
    NDArrayMathCPU.prototype.squareInternal = function (x) {
        var values = x.getValues();
        var newValues = new Float32Array(values.length);
        for (var i = 0; i < values.length; ++i) {
            var value = values[i];
            newValues[i] = value * value;
        }
        return ndarray_1.NDArray.make(x.shape, { values: newValues });
    };
    NDArrayMathCPU.prototype.logSumExpInternal = function (input, axes) {
        axis_util.assertAxesAreInnerMostDims('logSumExp', axes, input.rank);
        var xMax = this.max(input, axes, true);
        var a = this.subtract(input, xMax);
        var b = this.exp(a);
        var c = this.sum(b, axes);
        var d = this.log(c);
        var result = this.add(xMax.reshape(d.shape), d);
        return result;
    };
    NDArrayMathCPU.prototype.reluInternal = function (input) {
        var res = ndarray_1.NDArray.zeros(input.shape, input.dtype);
        var resVals = res.getValues();
        var inVals = input.getValues();
        for (var i = 0; i < inVals.length; ++i) {
            var val = inVals[i];
            if (util.isValNaN(val, input.dtype)) {
                resVals[i] = util.getNaN(res.dtype);
            }
            else {
                resVals[i] = Math.max(0, inVals[i]);
            }
        }
        return res;
    };
    NDArrayMathCPU.prototype.eluInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.dataSync();
        for (var i = 0; i < values.length; ++i) {
            var v = values[i];
            if (v >= 0) {
                resultValues[i] = v;
            }
            else {
                resultValues[i] = (Math.exp(v) - 1);
            }
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.leakyReluInternal = function (ndarray, alpha) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.dataSync();
        for (var i = 0; i < values.length; i++) {
            var v = values[i];
            if (v >= 0) {
                resultValues[i] = v;
            }
            else {
                resultValues[i] = alpha * v;
            }
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.clipInternal = function (ndarray, min, max) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.min(max, Math.max(min, values[i]));
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.absInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.abs(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.sigmoidInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = 1 / (1 + Math.exp(-values[i]));
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.sinInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.sin(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.cosInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.cos(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.tanInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.tan(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.asinInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.asin(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.acosInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.acos(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.atanInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.atan(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.sinhInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.sinh(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.coshInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = Math.cosh(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.tanhInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            resultValues[i] = util.tanh(values[i]);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.stepInternal = function (ndarray) {
        var resultValues = new Float32Array(ndarray.size);
        var values = ndarray.getValues();
        for (var i = 0; i < values.length; ++i) {
            var value = values[i];
            resultValues[i] = value > 0 ? 1 : (value < 0 ? 0 : value);
        }
        return ndarray_1.NDArray.make(ndarray.shape, { values: resultValues });
    };
    NDArrayMathCPU.prototype.conv2dInternal = function (x, filter, bias, convInfo) {
        var _a = x.shape, xRows = _a[0], xCols = _a[1], inputDepth = _a[2];
        var filterHeight = filter.shape[0];
        var filterWidth = filter.shape[1];
        var outDepth = filter.shape[3];
        var padLeft = convInfo.padInfo.left;
        var padTop = convInfo.padInfo.top;
        var y = ndarray_1.Array3D.zeros(convInfo.outShape);
        for (var d2 = 0; d2 < outDepth; ++d2) {
            for (var yR = 0; yR < y.shape[0]; ++yR) {
                var xRCorner = yR * convInfo.strideHeight - padLeft;
                var xRMin = Math.max(0, xRCorner);
                var xRMax = Math.min(xRows, filterHeight + xRCorner);
                for (var yC = 0; yC < y.shape[1]; ++yC) {
                    var xCCorner = yC * convInfo.strideWidth - padTop;
                    var xCMin = Math.max(0, xCCorner);
                    var xCMax = Math.min(xCols, filterWidth + xCCorner);
                    var dotProd = 0;
                    for (var xR = xRMin; xR < xRMax; ++xR) {
                        var wR = xR - xRCorner;
                        for (var xC = xCMin; xC < xCMax; ++xC) {
                            var wC = xC - xCCorner;
                            for (var d1 = 0; d1 < inputDepth; ++d1) {
                                var pixel = x.get(xR, xC, d1);
                                var weight = filter.get(wR, wC, d1, d2);
                                dotProd += pixel * weight;
                            }
                        }
                    }
                    var biasVal = (bias != null) ? bias.get(d2) : 0;
                    y.set(dotProd + biasVal, yR, yC, d2);
                }
            }
        }
        return y;
    };
    NDArrayMathCPU.prototype.conv2dDerInputInternal = function (dy, filter, convInfo) {
        var inDepth = filter.shape[2];
        var outDepth = filter.shape[3];
        var yRows = dy.shape[0];
        var yCols = dy.shape[1];
        var filterHeight = filter.shape[0];
        var filterWidth = filter.shape[1];
        var topPad = filterHeight - 1 - convInfo.padInfo.top;
        var leftPad = filterWidth - 1 - convInfo.padInfo.left;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var dx = ndarray_1.Array3D.zeros(convInfo.inShape);
        for (var d1 = 0; d1 < inDepth; ++d1) {
            for (var xR = 0; xR < dx.shape[0]; ++xR) {
                var xRCorner = xR - leftPad;
                var xRMin = Math.max(0, Math.ceil(xRCorner / strideHeight));
                var yRMax = Math.min(yRows, (filterHeight + xRCorner) / strideHeight);
                for (var xC = 0; xC < dx.shape[1]; ++xC) {
                    var xCCorner = xC - topPad;
                    var xCMin = Math.max(0, Math.ceil(xCCorner / strideWidth));
                    var yCMax = Math.min(yCols, (filterWidth + xCCorner) / strideWidth);
                    var dotProd = 0;
                    for (var yR = xRMin; yR < yRMax; ++yR) {
                        var wR = yR * strideHeight - xRCorner;
                        for (var yC = xCMin; yC < yCMax; ++yC) {
                            var wC = yC * strideWidth - xCCorner;
                            for (var d2 = 0; d2 < outDepth; ++d2) {
                                var pixel = dy.get(yR, yC, d2);
                                var weight = filter.get(filterHeight - 1 - wR, filterWidth - 1 - wC, d1, d2);
                                dotProd += pixel * weight;
                            }
                        }
                    }
                    dx.set(dotProd, xR, xC, d1);
                }
            }
        }
        return dx;
    };
    NDArrayMathCPU.prototype.conv2dDerFilterInternal = function (x, dY, convInfo) {
        var inputDepth = x.shape[2];
        var outputDepth = dY.shape[2];
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var weightsShape = conv_util.computeWeightsShape4D(inputDepth, outputDepth, filterHeight, filterWidth);
        var dW = ndarray_1.Array4D.zeros(weightsShape);
        var yNumRows = dY.shape[0];
        var yNumCols = dY.shape[1];
        var xNumRows = x.shape[0];
        var xNumCols = x.shape[1];
        var leftPad = convInfo.padInfo.left;
        var topPad = convInfo.padInfo.top;
        for (var wR = 0; wR < filterHeight; ++wR) {
            var yRMin = Math.max(0, Math.ceil((topPad - wR) / strideHeight));
            var yRMax = Math.min(yNumRows, (xNumRows + topPad - wR) / strideHeight);
            for (var wC = 0; wC < filterWidth; ++wC) {
                var yCMin = Math.max(0, Math.ceil((leftPad - wC) / strideWidth));
                var yCMax = Math.min(yNumCols, (xNumCols + leftPad - wC) / strideWidth);
                for (var d1 = 0; d1 < inputDepth; ++d1) {
                    for (var d2 = 0; d2 < outputDepth; ++d2) {
                        var dotProd = 0;
                        for (var yR = yRMin; yR < yRMax; ++yR) {
                            var xR = wR + yR * strideHeight - topPad;
                            for (var yC = yCMin; yC < yCMax; ++yC) {
                                var xC = wC + yC * strideWidth - leftPad;
                                dotProd += x.get(xR, xC, d1) * dY.get(yR, yC, d2);
                            }
                        }
                        dW.set(dotProd, wR, wC, d1, d2);
                    }
                }
            }
        }
        return dW;
    };
    NDArrayMathCPU.prototype.conv2dDerBiasInternal = function (dY) {
        var outputDepth = dY.shape[2];
        var numRows = dY.shape[0];
        var numCols = dY.shape[1];
        var values = new Float32Array(outputDepth);
        for (var d2 = 0; d2 < outputDepth; ++d2) {
            var sum = 0;
            for (var r = 0; r < numRows; ++r) {
                for (var c = 0; c < numCols; ++c) {
                    sum += dY.get(r, c, d2);
                }
            }
            values[d2] = sum;
        }
        return ndarray_1.Array1D.new(values);
    };
    NDArrayMathCPU.prototype.transposeInternal = function (a, perm) {
        var newShape = new Array(a.rank);
        for (var i = 0; i < newShape.length; i++) {
            newShape[i] = a.shape[perm[i]];
        }
        var resultValues = new Float32Array(a.size);
        var values = a.getValues();
        var result = ndarray_1.NDArray.make(newShape, { values: resultValues });
        for (var i = 0; i < a.size; ++i) {
            var loc = a.indexToLoc(i);
            var newLoc = new Array(loc.length);
            for (var i_1 = 0; i_1 < newLoc.length; i_1++) {
                newLoc[i_1] = loc[perm[i_1]];
            }
            var newIndex = result.locToIndex(newLoc);
            resultValues[newIndex] = values[i];
        }
        return result;
    };
    NDArrayMathCPU.prototype.pool = function (x, convInfo, poolType) {
        var _a = x.shape, xRows = _a[0], xCols = _a[1], depth = _a[2];
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var y = ndarray_1.Array3D.zeros(convInfo.outShape);
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        for (var d = 0; d < depth; ++d) {
            for (var yR = 0; yR < y.shape[0]; ++yR) {
                var xRCorner = yR * strideHeight - padTop;
                var xRMin = Math.max(0, xRCorner);
                var xRMax = Math.min(xRows, filterHeight + xRCorner);
                for (var yC = 0; yC < y.shape[1]; ++yC) {
                    var xCCorner = yC * strideWidth - padLeft;
                    var xCMin = Math.max(0, xCCorner);
                    var xCMax = Math.min(xCols, filterWidth + xCCorner);
                    var minMaxValue = (poolType === 'max' ? Number.NEGATIVE_INFINITY :
                        Number.POSITIVE_INFINITY);
                    var avgValue = 0;
                    for (var xR = xRMin; xR < xRMax; ++xR) {
                        for (var xC = xCMin; xC < xCMax; ++xC) {
                            var pixel = x.get(xR, xC, d);
                            if (isNaN(pixel)) {
                                minMaxValue = NaN;
                                avgValue = NaN;
                                break;
                            }
                            if ((poolType === 'max' && pixel > minMaxValue) ||
                                (poolType === 'min' && pixel < minMaxValue)) {
                                minMaxValue = pixel;
                            }
                            else if (poolType === 'avg') {
                                avgValue += pixel / (filterHeight * filterWidth);
                            }
                        }
                        if (isNaN(minMaxValue)) {
                            break;
                        }
                    }
                    y.set(poolType === 'avg' ? avgValue : minMaxValue, yR, yC, d);
                }
            }
        }
        return y;
    };
    NDArrayMathCPU.prototype.maxPoolInternal = function (x, convInfo) {
        return this.pool(x, convInfo, 'max');
    };
    NDArrayMathCPU.prototype.maxPoolPositions = function (x, convInfo) {
        var _a = x.shape, xRows = _a[0], xCols = _a[1], depth = _a[2];
        var outputShape = convInfo.outShape;
        var maxPositions = ndarray_1.Array3D.zeros(outputShape);
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        for (var d = 0; d < depth; ++d) {
            for (var yR = 0; yR < outputShape[0]; ++yR) {
                var xRCorner = yR * strideHeight - padTop;
                var xRMin = Math.max(0, xRCorner);
                var xRMax = Math.min(xRows, filterHeight + xRCorner);
                for (var yC = 0; yC < outputShape[1]; ++yC) {
                    var xCCorner = yC * strideWidth - padLeft;
                    var xCMin = Math.max(0, xCCorner);
                    var xCMax = Math.min(xCols, filterWidth + xCCorner);
                    var maxValue = Number.NEGATIVE_INFINITY;
                    var maxPosition = -1;
                    for (var xR = xRMin; xR < xRMax; ++xR) {
                        var wR = xR - xRCorner;
                        for (var xC = xCMin; xC < xCMax; ++xC) {
                            var wC = xC - xCCorner;
                            var pixel = x.get(xR, xC, d);
                            if (pixel > maxValue) {
                                maxValue = pixel;
                                maxPosition = wR * filterWidth + wC;
                            }
                        }
                    }
                    maxPositions.set(maxPosition, yR, yC, d);
                }
            }
        }
        return maxPositions;
    };
    NDArrayMathCPU.prototype.maxPoolBackpropInternal = function (dy, x, convInfo) {
        var maxPositions = this.maxPoolPositions(x, convInfo);
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var padLeft = filterWidth - 1 - convInfo.padInfo.left;
        var padTop = filterHeight - 1 - convInfo.padInfo.top;
        var _a = dy.shape, dyRows = _a[0], dyCols = _a[1], depth = _a[2];
        var dx = ndarray_1.Array3D.zeros(x.shape);
        for (var d = 0; d < depth; ++d) {
            for (var dxR = 0; dxR < dx.shape[0]; ++dxR) {
                for (var dxC = 0; dxC < dx.shape[1]; ++dxC) {
                    var dyRCorner = dxR - padTop;
                    var dyCCorner = dxC - padLeft;
                    var dotProd = 0;
                    for (var wR = 0; wR < filterHeight; ++wR) {
                        var dyR = (dyRCorner + wR) / strideHeight;
                        if (dyR < 0 || dyR >= dyRows || Math.floor(dyR) !== dyR) {
                            continue;
                        }
                        for (var wC = 0; wC < filterWidth; ++wC) {
                            var dyC = (dyCCorner + wC) / strideWidth;
                            if (dyC < 0 || dyC >= dyCols || Math.floor(dyC) !== dyC) {
                                continue;
                            }
                            var maxPos = filterHeight * filterWidth - 1 -
                                maxPositions.get(dyR, dyC, d);
                            var curPos = wR * filterWidth + wC;
                            var mask = maxPos === curPos ? 1 : 0;
                            if (mask === 0) {
                                continue;
                            }
                            var pixel = dy.get(dyR, dyC, d);
                            dotProd += pixel * mask;
                        }
                    }
                    dx.set(dotProd, dxR, dxC, d);
                }
            }
        }
        return dx;
    };
    NDArrayMathCPU.prototype.minPoolInternal = function (x, convInfo) {
        return this.pool(x, convInfo, 'min');
    };
    NDArrayMathCPU.prototype.avgPoolInternal = function (x, convInfo) {
        return this.pool(x, convInfo, 'avg');
    };
    NDArrayMathCPU.prototype.resizeBilinear3DInternal = function (x, newShape2D, alignCorners) {
        var output = ndarray_1.Array3D.zeros([newShape2D[0], newShape2D[1], x.shape[2]]);
        var effectiveInputSize = alignCorners ? [x.shape[0] - 1, x.shape[1] - 1, x.shape[2]] : x.shape;
        var effectiveOutputSize = alignCorners ?
            [output.shape[0] - 1, output.shape[1] - 1, output.shape[2]] :
            output.shape;
        for (var r = 0; r < output.shape[0]; r++) {
            for (var c = 0; c < output.shape[1]; c++) {
                for (var d = 0; d < output.shape[2]; d++) {
                    var sourceFracRow = (effectiveInputSize[0]) * r / (effectiveOutputSize[0]);
                    var sourceFracCol = (effectiveInputSize[1]) * c / (effectiveOutputSize[1]);
                    var sourceRowFloor = Math.floor(sourceFracRow);
                    var sourceRowCeil = Math.min(x.shape[0] - 1, Math.ceil(sourceFracRow));
                    var sourceColFloor = Math.floor(sourceFracCol);
                    var sourceColCeil = Math.min(x.shape[1] - 1, Math.ceil(sourceFracCol));
                    var topLeft = x.get(sourceRowFloor, sourceColFloor, d);
                    var bottomLeft = x.get(sourceRowCeil, sourceColFloor, d);
                    var topRight = x.get(sourceRowFloor, sourceColCeil, d);
                    var bottomRight = x.get(sourceRowCeil, sourceColCeil, d);
                    var rowFrac = sourceFracRow - sourceRowFloor;
                    var colFrac = sourceFracCol - sourceColFloor;
                    var top_1 = topLeft + (topRight - topLeft) * colFrac;
                    var bottom = bottomLeft + (bottomRight - bottomLeft) * colFrac;
                    var newValue = top_1 + (bottom - top_1) * rowFrac;
                    output.set(newValue, r, c, d);
                }
            }
        }
        return output;
    };
    NDArrayMathCPU.prototype.batchNormalization3DInternal = function (x, mean, variance, varianceEpsilon, scale, offset) {
        if (varianceEpsilon === void 0) { varianceEpsilon = .001; }
        var xValues = x.getValues();
        var meanValues = mean.getValues();
        var varianceValues = variance.getValues();
        var scaleValues = scale ? scale.getValues() : new Float32Array([1]);
        var offsetValues = offset ? offset.getValues() : new Float32Array([0]);
        var outValues = new Float32Array(xValues.length);
        for (var i = 0; i < xValues.length; i++) {
            outValues[i] = offsetValues[i % offsetValues.length] +
                (xValues[i] - meanValues[i % meanValues.length]) *
                    scaleValues[i % scaleValues.length] /
                    Math.sqrt(varianceValues[i % varianceValues.length] + varianceEpsilon);
        }
        return ndarray_1.Array3D.new(x.shape, outValues);
    };
    NDArrayMathCPU.prototype.multinomialInternal = function (probabilities, numSamples, seed) {
        var batchSize = probabilities.shape[0];
        var numEvents = probabilities.shape[1];
        var res = ndarray_1.Array2D.zeros([batchSize, numSamples], 'int32');
        var resVals = res.getValues();
        var probVals = probabilities.getValues();
        for (var b = 0; b < batchSize; ++b) {
            var offset = b * numEvents;
            var cdf = new Float32Array(numEvents - 1);
            cdf[0] = probVals[offset];
            for (var event_1 = 1; event_1 < cdf.length; ++event_1) {
                cdf[event_1] = cdf[event_1 - 1] + probVals[offset + event_1];
            }
            var random = seedrandom.alea(seed.toString());
            var outOffset = b * numSamples;
            for (var sampleId = 0; sampleId < numSamples; ++sampleId) {
                var r = random();
                resVals[outOffset + sampleId] = cdf.length;
                for (var event_2 = 0; event_2 < cdf.length; event_2++) {
                    if (r < cdf[event_2]) {
                        resVals[outOffset + sampleId] = event_2;
                        break;
                    }
                }
            }
        }
        return res;
    };
    NDArrayMathCPU.prototype.oneHotInternal = function (indices, depth, onValue, offValue) {
        var res = new Float32Array(indices.size * depth);
        res.fill(offValue);
        for (var event_3 = 0; event_3 < indices.size; ++event_3) {
            res[event_3 * depth + indices.get(event_3)] = onValue;
        }
        return ndarray_1.Array2D.new([indices.size, depth], res);
    };
    NDArrayMathCPU.prototype.broadcastedBinaryOp = function (a, b, dtype, op) {
        var newShape = broadcast_util.assertAndGetBroadcastShape(a.shape, b.shape);
        var result = ndarray_1.NDArray.zeros(newShape, dtype);
        var newValues = result.getValues();
        var aValues = a.getValues();
        var bValues = b.getValues();
        var aBroadcastDims = broadcast_util.getBroadcastDims(a.shape, newShape);
        var bBroadcastDims = broadcast_util.getBroadcastDims(b.shape, newShape);
        var _loop_1 = function (i) {
            var loc = result.indexToLoc(i);
            var aLoc = loc.slice(-a.rank);
            aBroadcastDims.forEach(function (d) { return aLoc[d] = 0; });
            var aIndex = a.locToIndex(aLoc);
            var bLoc = loc.slice(-b.rank);
            bBroadcastDims.forEach(function (d) { return bLoc[d] = 0; });
            var bIndex = b.locToIndex(bLoc);
            newValues[i] = op(aValues[aIndex], bValues[bIndex]);
        };
        for (var i = 0; i < newValues.length; ++i) {
            _loop_1(i);
        }
        return result;
    };
    return NDArrayMathCPU;
}(math_1.NDArrayMath));
exports.NDArrayMathCPU = NDArrayMathCPU;

},{"../util":95,"./axis_util":54,"./broadcast_util":55,"./concat_util":56,"./conv_util":57,"./copy2d_util":58,"./math":60,"./ndarray":63,"seedrandom":2}],62:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("./math");
var ndarray = require("./ndarray");
var ndarray_1 = require("./ndarray");
var addscaledmat_gpu_1 = require("./webgl/addscaledmat_gpu");
var argminmax_gpu_1 = require("./webgl/argminmax_gpu");
var batchnorm_gpu_1 = require("./webgl/batchnorm_gpu");
var binaryop_gpu = require("./webgl/binaryop_gpu");
var binaryop_gpu_1 = require("./webgl/binaryop_gpu");
var clip_gpu_1 = require("./webgl/clip_gpu");
var concat_gpu_1 = require("./webgl/concat_gpu");
var conv_backprop_gpu_1 = require("./webgl/conv_backprop_gpu");
var conv_gpu_1 = require("./webgl/conv_gpu");
var copy_gpu_1 = require("./webgl/copy_gpu");
var gpgpu_context_1 = require("./webgl/gpgpu_context");
var gpgpu_math = require("./webgl/gpgpu_math");
var gpgpu_util = require("./webgl/gpgpu_util");
var logsumexp_gpu_1 = require("./webgl/logsumexp_gpu");
var max_pool_backprop_gpu_1 = require("./webgl/max_pool_backprop_gpu");
var minmax_gpu_1 = require("./webgl/minmax_gpu");
var mulmat_gpu_1 = require("./webgl/mulmat_gpu");
var multinomial_gpu_1 = require("./webgl/multinomial_gpu");
var onehot_gpu_1 = require("./webgl/onehot_gpu");
var pool_gpu_1 = require("./webgl/pool_gpu");
var reducesum_gpu_1 = require("./webgl/reducesum_gpu");
var resize_bilinear_gpu_1 = require("./webgl/resize_bilinear_gpu");
var slice_gpu_1 = require("./webgl/slice_gpu");
var texture_manager_1 = require("./webgl/texture_manager");
var transpose_gpu_1 = require("./webgl/transpose_gpu");
var unary_op = require("./webgl/unaryop_gpu");
var unaryop_gpu_1 = require("./webgl/unaryop_gpu");
var webgl_util = require("./webgl/webgl_util");
var NDArrayMathGPU = (function (_super) {
    __extends(NDArrayMathGPU, _super);
    function NDArrayMathGPU(gpgpu, safeMode) {
        if (safeMode === void 0) { safeMode = false; }
        var _this = _super.call(this, safeMode) || this;
        _this.binaryCache = {};
        if (gpgpu == null) {
            var gl = gpgpu_util.createWebGLContext();
            _this.gpgpu = new gpgpu_context_1.GPGPUContext(gl);
            _this.gpgpuCreatedLocally = true;
        }
        else {
            _this.gpgpu = gpgpu;
            _this.gpgpuCreatedLocally = false;
        }
        _this.textureManager = new texture_manager_1.TextureManager(_this.gpgpu);
        ndarray.initializeGPU(_this.gpgpu, _this.textureManager);
        return _this;
    }
    NDArrayMathGPU.prototype.getGPGPUContext = function () {
        return this.gpgpu;
    };
    NDArrayMathGPU.prototype.cloneInternal = function (a) {
        var texShape = a.getTextureShapeRC();
        var source = a.as2D(texShape[0], texShape[1]);
        var output = this.makeOutputArray(texShape, a.dtype);
        this.copy2D(source, [0, 0], texShape, output, [0, 0], texShape);
        return output.reshape(a.shape);
    };
    NDArrayMathGPU.prototype.slice1DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram([size]);
        var customSetup = program.getCustomSetupFunc([begin]);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.slice2DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram(size);
        var customSetup = program.getCustomSetupFunc(begin);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.slice3DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram(size);
        var customSetup = program.getCustomSetupFunc(begin);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.slice4DInternal = function (input, begin, size) {
        var program = new slice_gpu_1.SliceProgram(size);
        var customSetup = program.getCustomSetupFunc(begin);
        return this.compileAndRun(program, [input], null, customSetup);
    };
    NDArrayMathGPU.prototype.copy2DInternal = function (source, sourceBeginRowCol, sourceSizeRowCol, dest, destBeginRowCol, destSizeRowCol) {
        var program = new copy_gpu_1.Copy2DProgram(sourceSizeRowCol[1], destSizeRowCol[1]);
        var customSetup = program.getCustomSetupFunc(sourceBeginRowCol, destBeginRowCol, destSizeRowCol);
        this.compileAndRun(program, [source], dest, customSetup);
    };
    NDArrayMathGPU.prototype.concat1DInternal = function (a, b) {
        var program = new concat_gpu_1.ConcatProgram(a.shape, b.shape, 0);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.concat2DInternal = function (a, b, axis) {
        var program = new concat_gpu_1.ConcatProgram(a.shape, b.shape, axis);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.concat3DInternal = function (x1, x2, axis) {
        var program = new concat_gpu_1.ConcatProgram(x1.shape, x2.shape, axis);
        return this.compileAndRun(program, [x1, x2]);
    };
    NDArrayMathGPU.prototype.concat4DInternal = function (x1, x2, axis) {
        var program = new concat_gpu_1.ConcatProgram(x1.shape, x2.shape, axis);
        return this.compileAndRun(program, [x1, x2]);
    };
    NDArrayMathGPU.prototype.scaledArrayAddInternal = function (c1, a, c2, b) {
        var program = new addscaledmat_gpu_1.AddScaledMatProgram(a.shape, b.shape);
        return this.compileAndRun(program, [a, b, c1, c2]);
    };
    NDArrayMathGPU.prototype.negInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.NEG);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.makeOutputArray = function (shape, dtype) {
        var textureShapeRC = webgl_util.getTextureShapeFromLogicalShape(this.gpgpu.gl, shape);
        var texture = this.textureManager.acquireTexture(textureShapeRC);
        return ndarray_1.NDArray.make(shape, { texture: texture, textureShapeRC: textureShapeRC }, dtype);
    };
    NDArrayMathGPU.prototype.compileAndRun = function (program, inputs, output, customSetup) {
        var _this = this;
        if (output == null) {
            output = this.makeOutputArray(program.outputShape, inputs[0].dtype);
        }
        var key = gpgpu_math.makeShaderKey(program, inputs, output);
        var binary = this.getAndSaveBinary(key, function () {
            return gpgpu_math.compileProgram(_this.gpgpu, program, inputs, output);
        });
        gpgpu_math.runProgram(binary, inputs, output, customSetup);
        return output;
    };
    NDArrayMathGPU.prototype.matMulInternal = function (a, b, aOrientation, bOrientation) {
        var program = new mulmat_gpu_1.MatMulProgram(a.shape, b.shape, aOrientation, bOrientation);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.multiplyInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.MUL, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.batchNormalization3DInternal = function (x, mean, variance, varianceEpsilon, scale, offset) {
        var inputs = [x, mean, variance];
        if (varianceEpsilon == null) {
            varianceEpsilon = 0.000001;
        }
        var offsetShape = null;
        if (offset != null) {
            offsetShape = offset.shape;
            inputs.push(offset);
        }
        var scaleShape = null;
        if (scale != null) {
            scaleShape = scale.shape;
            inputs.push(scale);
        }
        var program = new batchnorm_gpu_1.BatchNormProgram(x.shape, mean.shape, variance.shape, offsetShape, scaleShape, varianceEpsilon);
        return this.compileAndRun(program, inputs);
    };
    NDArrayMathGPU.prototype.transposeInternal = function (a, perm) {
        var program = new transpose_gpu_1.TransposeProgram(a.shape, perm);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sumInternal = function (a, axes) {
        var program = new reducesum_gpu_1.ReduceSumProgram(a.shape, axes);
        var output = this.makeOutputArray(program.outputShape, math_1.SumTypesMap[a.dtype]);
        return this.compileAndRun(program, [a], output);
    };
    NDArrayMathGPU.prototype.argMinInternal = function (a, axes) {
        var program = new argminmax_gpu_1.ArgMinMaxProgram(a.shape, axes, 'min');
        var output = this.makeOutputArray(program.outputShape, 'int32');
        return this.compileAndRun(program, [a], output);
    };
    NDArrayMathGPU.prototype.argMaxInternal = function (a, axes) {
        var program = new argminmax_gpu_1.ArgMinMaxProgram(a.shape, axes, 'max');
        var output = this.makeOutputArray(program.outputShape, 'int32');
        return this.compileAndRun(program, [a], output);
    };
    NDArrayMathGPU.prototype.equalInternal = function (x, y) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.EQUAL, x.shape, y.shape);
        var output = this.makeOutputArray(program.outputShape, 'bool');
        return this.compileAndRun(program, [x, y], output);
    };
    NDArrayMathGPU.prototype.topKInternal = function (ndarray, k) {
        throw new Error('topK GPU not yet implemented!');
    };
    NDArrayMathGPU.prototype.minInternal = function (a, axes) {
        var program = new minmax_gpu_1.MinMaxProgram(a.shape, axes, 'min');
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.maxInternal = function (a, axes) {
        var program = new minmax_gpu_1.MinMaxProgram(a.shape, axes, 'max');
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.divideInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.DIV, a.shape, b.shape);
        var output = this.makeOutputArray(program.outputShape, 'float32');
        return this.compileAndRun(program, [a, b], output);
    };
    NDArrayMathGPU.prototype.addInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.ADD, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.subtractInternal = function (a, b) {
        var program = new binaryop_gpu_1.BinaryOpProgram(binaryop_gpu.SUB, a.shape, b.shape);
        return this.compileAndRun(program, [a, b]);
    };
    NDArrayMathGPU.prototype.logSumExpInternal = function (a, axes) {
        var program = new logsumexp_gpu_1.LogSumExpProgram(a.shape, axes);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.ceilInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.CEIL);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.floorInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.FLOOR);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.expInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.EXP);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.logInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.LOG);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sqrtInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SQRT);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.squareInternal = function (x) {
        var program = new unaryop_gpu_1.UnaryOpProgram(x.shape, unary_op.SQUARE);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.reluInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.RELU);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.eluInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ELU);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.leakyReluInternal = function (a, alpha) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.LEAKY_RELU(alpha));
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.clipInternal = function (a, min, max) {
        var program = new clip_gpu_1.ClipProgram(a.shape, min, max);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.absInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ABS);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sigmoidInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SIGMOID);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sinInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SIN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.cosInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.COS);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.tanInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.TAN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.asinInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ASIN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.acosInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ACOS);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.atanInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.ATAN);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.sinhInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.SINH);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.coshInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.COSH);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.tanhInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.TANH);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.stepInternal = function (a) {
        var program = new unaryop_gpu_1.UnaryOpProgram(a.shape, unary_op.STEP);
        return this.compileAndRun(program, [a]);
    };
    NDArrayMathGPU.prototype.conv2dInternal = function (x, filter, bias, convInfo) {
        var program = new conv_gpu_1.Conv2DProgram(convInfo, bias != null);
        var inputs = bias != null ? [x, filter, bias] : [x, filter];
        return this.compileAndRun(program, inputs);
    };
    NDArrayMathGPU.prototype.conv2dDerInputInternal = function (dy, filter, convInfo) {
        var program = new conv_backprop_gpu_1.Conv2DDerInputProgram(convInfo);
        return this.compileAndRun(program, [dy, filter]);
    };
    NDArrayMathGPU.prototype.conv2dDerFilterInternal = function (x, dY, convInfo) {
        var program = new conv_backprop_gpu_1.Conv2DDerWeightsProgram(convInfo);
        return this.compileAndRun(program, [x, dY]);
    };
    NDArrayMathGPU.prototype.conv2dDerBiasInternal = function (dY) {
        var program = new conv_backprop_gpu_1.Conv2DDerBiasProgram(dY.shape);
        return this.compileAndRun(program, [dY]);
    };
    NDArrayMathGPU.prototype.maxPoolInternal = function (x, convInfo) {
        var program = new pool_gpu_1.Pool2DProgram(convInfo, 'max', false);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.minPoolInternal = function (x, convInfo) {
        var program = new pool_gpu_1.Pool2DProgram(convInfo, 'min', false);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.avgPoolInternal = function (x, convInfo) {
        var program = new pool_gpu_1.Pool2DProgram(convInfo, 'avg', false);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.maxPoolBackpropInternal = function (dy, x, convInfo) {
        var getPositions = true;
        var maxPoolPositionsProgram = new pool_gpu_1.Pool2DProgram(convInfo, 'max', getPositions);
        var maxPoolPositions = this.compileAndRun(maxPoolPositionsProgram, [x]);
        var maxPoolBackPropProgram = new max_pool_backprop_gpu_1.MaxPool2DBackpropProgram(convInfo);
        var result = this.compileAndRun(maxPoolBackPropProgram, [dy, maxPoolPositions]);
        maxPoolPositions.dispose();
        return result;
    };
    NDArrayMathGPU.prototype.resizeBilinear3DInternal = function (x, newShape2D, alignCorners) {
        var program = new resize_bilinear_gpu_1.ResizeBilinear3DProgram(x.shape, newShape2D, alignCorners);
        return this.compileAndRun(program, [x]);
    };
    NDArrayMathGPU.prototype.multinomialInternal = function (probs, numSamples, seed) {
        var batchSize = probs.shape[0];
        var numOutcomes = probs.shape[1];
        var program = new multinomial_gpu_1.MultinomialProgram(batchSize, numOutcomes, numSamples);
        var output = this.makeOutputArray(program.outputShape, 'int32');
        var customSetup = program.getCustomSetupFunc(seed);
        return this.compileAndRun(program, [probs], output, customSetup);
    };
    NDArrayMathGPU.prototype.oneHotInternal = function (indices, depth, onValue, offValue) {
        var program = new onehot_gpu_1.OneHotProgram(indices.size, depth, onValue, offValue);
        return this.compileAndRun(program, [indices]);
    };
    NDArrayMathGPU.prototype.getAndSaveBinary = function (key, getBinary) {
        if (!(key in this.binaryCache)) {
            this.binaryCache[key] = getBinary();
        }
        return this.binaryCache[key];
    };
    NDArrayMathGPU.prototype.getTextureManager = function () {
        return this.textureManager;
    };
    NDArrayMathGPU.prototype.dispose = function () {
        for (var key in this.binaryCache) {
            this.gpgpu.deleteProgram(this.binaryCache[key].webGLProgram);
        }
        this.textureManager.dispose();
        if (this.gpgpuCreatedLocally) {
            this.gpgpu.dispose();
        }
    };
    return NDArrayMathGPU;
}(math_1.NDArrayMath));
exports.NDArrayMathGPU = NDArrayMathGPU;

},{"./math":60,"./ndarray":63,"./webgl/addscaledmat_gpu":65,"./webgl/argminmax_gpu":66,"./webgl/batchnorm_gpu":67,"./webgl/binaryop_gpu":68,"./webgl/clip_gpu":69,"./webgl/concat_gpu":70,"./webgl/conv_backprop_gpu":71,"./webgl/conv_gpu":72,"./webgl/copy_gpu":73,"./webgl/gpgpu_context":74,"./webgl/gpgpu_math":75,"./webgl/gpgpu_util":76,"./webgl/logsumexp_gpu":77,"./webgl/max_pool_backprop_gpu":78,"./webgl/minmax_gpu":79,"./webgl/mulmat_gpu":80,"./webgl/multinomial_gpu":81,"./webgl/onehot_gpu":82,"./webgl/pool_gpu":83,"./webgl/reducesum_gpu":84,"./webgl/resize_bilinear_gpu":86,"./webgl/slice_gpu":88,"./webgl/texture_manager":90,"./webgl/transpose_gpu":91,"./webgl/unaryop_gpu":92,"./webgl/webgl_util":93}],63:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../environment");
var util = require("../util");
var tex_util_1 = require("./webgl/tex_util");
var webgl_util = require("./webgl/webgl_util");
exports.GPGPU = null;
exports.TEXTURE_MANAGER = null;
var DType;
(function (DType) {
    DType["float32"] = "float32";
    DType["int32"] = "int32";
    DType["bool"] = "bool";
})(DType = exports.DType || (exports.DType = {}));
function initializeGPU(gpgpu, textureManager) {
    exports.GPGPU = gpgpu;
    exports.TEXTURE_MANAGER = textureManager;
}
exports.initializeGPU = initializeGPU;
function throwIfGPUNotInitialized() {
    if (exports.GPGPU == null || exports.TEXTURE_MANAGER == null) {
        throw new Error('GPU not intialized.');
    }
}
var NDArray = (function () {
    function NDArray(shape, data, dtype) {
        util.assert(data.values != null || data.texture != null, 'Either `values` or `texture` must be defined');
        util.assert(data.texture == null || (data.textureShapeRC != null), '`textureShape` must be defined when `texture` is defined');
        this.size = util.sizeFromShape(shape);
        if (data.values != null) {
            util.assert(this.size === data.values.length, "Constructing ndarray of shape (" + this.size + ") should match the " +
                ("length of values (" + data.values.length + ")"));
        }
        this.shape = shape;
        if (data.textureType == null) {
            data.textureType = tex_util_1.TextureType.DEFAULT;
        }
        this.ndarrayData = data;
        this.dtype = dtype || 'float32';
        var dim = this.shape.length;
        if (dim < 2) {
            this.strides = [];
        }
        else {
            this.strides = new Array(dim - 1);
            this.strides[dim - 2] = this.shape[dim - 1];
            for (var i = dim - 3; i >= 0; --i) {
                this.strides[i] = this.strides[i + 1] * this.shape[i + 1];
            }
        }
    }
    NDArray.zeros = function (shape, dtype) {
        var values = makeZerosTypedArray(util.sizeFromShape(shape), dtype);
        return NDArray.make(shape, { values: values }, dtype);
    };
    NDArray.zerosLike = function (another) {
        return NDArray.zeros(another.shape, another.dtype);
    };
    NDArray.like = function (another) {
        var newValues = copyTypedArray(another.getValues(), another.dtype);
        return NDArray.make(another.shape, { values: newValues }, another.dtype);
    };
    NDArray.make = function (shape, data, dtype) {
        switch (shape.length) {
            case 0:
                return new Scalar(data, dtype);
            case 1:
                return new Array1D(data, dtype);
            case 2:
                return new Array2D(shape, data, dtype);
            case 3:
                return new Array3D(shape, data, dtype);
            case 4:
                return new Array4D(shape, data, dtype);
            default:
                return new NDArray(shape, data, dtype);
        }
    };
    NDArray.fromPixels = function (pixels, numChannels) {
        if (numChannels === void 0) { numChannels = 3; }
        if (numChannels > 4) {
            throw new Error('Cannot construct NDArray with more than 4 channels from pixels.');
        }
        var shape = [pixels.height, pixels.width, numChannels];
        var textureShapeRC = [shape[0], shape[1]];
        var texture = exports.TEXTURE_MANAGER.acquireTexture(textureShapeRC);
        var textureType = tex_util_1.TextureType.RGBA_COLOR;
        exports.GPGPU.uploadPixelDataToTexture(texture, pixels);
        return Array3D.make(shape, { texture: texture, textureShapeRC: textureShapeRC, textureType: textureType });
    };
    NDArray.prototype.reshape = function (newShape) {
        newShape = util.inferFromImplicitShape(newShape, this.size);
        if (util.arraysEqual(this.shape, newShape)) {
            return this;
        }
        util.assert(this.size === util.sizeFromShape(newShape), 'new shape and old shape must have the same number of elements.');
        return NDArray.make(newShape, this.ndarrayData, this.dtype);
    };
    NDArray.prototype.flatten = function () {
        if (this instanceof Array1D) {
            return this;
        }
        return this.as1D();
    };
    NDArray.prototype.asScalar = function () {
        util.assert(this.size === 1, 'The array must have only 1 element.');
        return this.reshape([]);
    };
    NDArray.prototype.as1D = function () {
        return this.reshape([this.size]);
    };
    NDArray.prototype.as2D = function (rows, columns) {
        return this.reshape([rows, columns]);
    };
    NDArray.prototype.as3D = function (rows, columns, depth) {
        return this.reshape([rows, columns, depth]);
    };
    NDArray.prototype.as4D = function (rows, columns, depth, depth2) {
        return this.reshape([rows, columns, depth, depth2]);
    };
    NDArray.prototype.asType = function (dtype) {
        var newData = this.getData();
        if (newData.values != null) {
            newData = { values: toTypedArray(newData.values, dtype) };
        }
        return NDArray.make(this.shape, newData, dtype);
    };
    Object.defineProperty(NDArray.prototype, "rank", {
        get: function () {
            return this.shape.length;
        },
        enumerable: true,
        configurable: true
    });
    NDArray.prototype.get = function () {
        var locs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            locs[_i] = arguments[_i];
        }
        var index = locs[locs.length - 1];
        for (var i = 0; i < locs.length - 1; ++i) {
            index += this.strides[i] * locs[i];
        }
        return this.getValues()[index];
    };
    NDArray.prototype.add = function (value) {
        var locs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            locs[_i - 1] = arguments[_i];
        }
        this.set.apply(this, [this.get.apply(this, locs) + value].concat(locs));
    };
    NDArray.prototype.set = function (value) {
        var locs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            locs[_i - 1] = arguments[_i];
        }
        var index = locs[locs.length - 1];
        for (var i = 0; i < locs.length - 1; ++i) {
            index += this.strides[i] * locs[i];
        }
        this.getValues()[index] = value;
    };
    NDArray.prototype.val = function () {
        var locs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            locs[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.data()];
                    case 1:
                        _a.sent();
                        return [2, this.get.apply(this, locs)];
                }
            });
        });
    };
    NDArray.prototype.locToIndex = function (locs) {
        var index = locs[locs.length - 1];
        for (var i = 0; i < locs.length - 1; ++i) {
            index += this.strides[i] * locs[i];
        }
        return index;
    };
    NDArray.prototype.indexToLoc = function (index) {
        var locs = new Array(this.shape.length);
        for (var i = 0; i < locs.length - 1; ++i) {
            locs[i] = Math.floor(index / this.strides[i]);
            index -= locs[i] * this.strides[i];
        }
        locs[locs.length - 1] = index;
        return locs;
    };
    NDArray.prototype.fill = function (value) {
        this.getValues().fill(value);
    };
    NDArray.prototype.getData = function () {
        return this.ndarrayData;
    };
    NDArray.prototype.getValues = function () {
        return this.dataSync();
    };
    NDArray.prototype.getValuesAsync = function () {
        return this.data();
    };
    NDArray.prototype.data = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, queryFn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.ndarrayData.values != null) {
                            return [2, this.ndarrayData.values];
                        }
                        if (!(environment_1.ENV.get('WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED') &&
                            this.ndarrayData.textureType === tex_util_1.TextureType.DEFAULT)) return [3, 2];
                        _a = this.ndarrayData;
                        return [4, exports.GPGPU.downloadMatrixFromTextureAsync(this.ndarrayData.texture, this.ndarrayData.textureShapeRC[0], this.ndarrayData.textureShapeRC[1])];
                    case 1:
                        _a.values = _b.sent();
                        return [2, this.ndarrayData.values];
                    case 2:
                        if (!!environment_1.ENV.get('WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_ENABLED')) return [3, 4];
                        return [4, this.dataSync()];
                    case 3: return [2, _b.sent()];
                    case 4:
                        queryFn = function () { };
                        return [4, exports.GPGPU.runQuery(queryFn)];
                    case 5:
                        _b.sent();
                        return [2, this.dataSync()];
                }
            });
        });
    };
    NDArray.prototype.dataSync = function () {
        if (this.ndarrayData.values == null) {
            throwIfGPUNotInitialized();
            var values = void 0;
            if (this.ndarrayData.textureType === tex_util_1.TextureType.DEFAULT) {
                values = exports.GPGPU.downloadMatrixFromTexture(this.ndarrayData.texture, this.ndarrayData.textureShapeRC[0], this.ndarrayData.textureShapeRC[1]);
            }
            else {
                values = exports.GPGPU.downloadMatrixFromRGBAColorTexture(this.ndarrayData.texture, this.ndarrayData.textureShapeRC[0], this.ndarrayData.textureShapeRC[1], this.shape[2]);
            }
            this.ndarrayData.values = float32ToTypedArray(values, this.dtype);
            this.disposeTexture();
        }
        return this.ndarrayData.values;
    };
    NDArray.prototype.uploadToGPU = function (preferredTexShape) {
        throwIfGPUNotInitialized();
        this.ndarrayData.textureShapeRC =
            webgl_util.getTextureShapeFromLogicalShape(exports.GPGPU.gl, this.shape, preferredTexShape);
        this.ndarrayData.texture =
            exports.TEXTURE_MANAGER.acquireTexture(this.ndarrayData.textureShapeRC);
        this.ndarrayData.textureType = tex_util_1.TextureType.DEFAULT;
        exports.GPGPU.uploadMatrixToTexture(this.ndarrayData.texture, this.ndarrayData.textureShapeRC[0], this.ndarrayData.textureShapeRC[1], typedArrayToFloat32(this.ndarrayData.values, this.dtype));
        this.ndarrayData.values = null;
    };
    NDArray.prototype.getTexture = function (preferredShapeRC) {
        if (this.ndarrayData.texture == null) {
            this.uploadToGPU(preferredShapeRC);
        }
        return this.ndarrayData.texture;
    };
    NDArray.prototype.getTextureShapeRC = function (preferredShapeRC) {
        if (this.ndarrayData.textureShapeRC == null) {
            this.uploadToGPU(preferredShapeRC);
        }
        return this.ndarrayData.textureShapeRC;
    };
    NDArray.prototype.dispose = function () {
        this.ndarrayData.values = null;
        this.shape = null;
        if (this.ndarrayData.texture != null) {
            this.disposeTexture();
        }
    };
    NDArray.prototype.disposeTexture = function () {
        throwIfGPUNotInitialized();
        exports.TEXTURE_MANAGER.releaseTexture(this.ndarrayData.texture, this.ndarrayData.textureShapeRC);
        this.ndarrayData.texture = null;
        this.ndarrayData.textureShapeRC = null;
        this.ndarrayData.textureType = null;
    };
    NDArray.prototype.inGPU = function () {
        return this.ndarrayData.texture != null;
    };
    NDArray.prototype.equals = function (t) {
        return this.dtype === t.dtype && util.arraysEqual(this.shape, t.shape) &&
            util.arraysEqual(this.getValues(), t.getValues());
    };
    NDArray.rand = function (shape, randFunction) {
        var size = util.sizeFromShape(shape);
        var values = new Float32Array(size);
        for (var i = 0; i < size; i++) {
            values[i] = randFunction();
        }
        return NDArray.make(shape, { values: values });
    };
    NDArray.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    NDArray.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    NDArray.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    return NDArray;
}());
exports.NDArray = NDArray;
var Scalar = (function (_super) {
    __extends(Scalar, _super);
    function Scalar(data, dtype) {
        var _this = this;
        if (data.texture != null) {
            data.textureShapeRC = [1, 1];
        }
        _this = _super.call(this, [], data, dtype) || this;
        return _this;
    }
    Scalar.new = function (value, dtype) {
        var values = [value];
        return new Scalar({ values: toTypedArray(values, dtype) }, dtype);
    };
    Scalar.prototype.get = function () {
        return this.getValues()[0];
    };
    Scalar.prototype.val = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.data()];
                    case 1:
                        _a.sent();
                        return [2, this.get()];
                }
            });
        });
    };
    Scalar.prototype.set = function (value) {
        this.getValues()[0] = value;
    };
    Scalar.prototype.add = function (value) {
        this.getValues()[0] += value;
    };
    Scalar.prototype.asType = function (dtype) {
        return _super.prototype.asType.call(this, dtype);
    };
    Scalar.prototype.locToIndex = function (loc) {
        return 0;
    };
    Scalar.prototype.indexToLoc = function (index) {
        return [];
    };
    Scalar.ZERO = Scalar.new(0);
    Scalar.ONE = Scalar.new(1);
    Scalar.TWO = Scalar.new(2);
    Scalar.NEG_ONE = Scalar.new(-1);
    return Scalar;
}(NDArray));
exports.Scalar = Scalar;
var Array1D = (function (_super) {
    __extends(Array1D, _super);
    function Array1D(data, dtype) {
        var _this = this;
        var shape = (data.values != null) ?
            [data.values.length] :
            [util.sizeFromShape(data.textureShapeRC)];
        _this = _super.call(this, shape, data, dtype) || this;
        return _this;
    }
    Array1D.new = function (values, dtype) {
        if (!instanceofTypedArray(values)) {
            var inferredShape = util.inferShape(values);
            util.assert(inferredShape.length === 1, "Error constructing Array1D. Shape of values " + inferredShape + " is " +
                "not 1 dimensional.");
        }
        return new Array1D({ values: toTypedArray(values, dtype) }, dtype);
    };
    Array1D.prototype.get = function (i) {
        return this.getValues()[i];
    };
    Array1D.prototype.set = function (value, i) {
        this.getValues()[i] = value;
    };
    Array1D.prototype.val = function (i) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.data()];
                    case 1:
                        _a.sent();
                        return [2, this.get(i)];
                }
            });
        });
    };
    Array1D.prototype.add = function (value, i) {
        this.getValues()[i] += value;
    };
    Array1D.prototype.locToIndex = function (loc) {
        return loc[0];
    };
    Array1D.prototype.indexToLoc = function (index) {
        return [index];
    };
    Array1D.prototype.asType = function (dtype) {
        return _super.prototype.asType.call(this, dtype);
    };
    Array1D.zeros = function (shape, dtype) {
        return NDArray.zeros(shape, dtype);
    };
    Array1D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array1D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array1D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    return Array1D;
}(NDArray));
exports.Array1D = Array1D;
var Array2D = (function (_super) {
    __extends(Array2D, _super);
    function Array2D(shape, data, dtype) {
        var _this = this;
        util.assert(shape.length === 2, 'Shape should be of length 2');
        _this = _super.call(this, shape, data, dtype) || this;
        _this.stride0 = _this.strides[0];
        return _this;
    }
    Array2D.new = function (shape, values, dtype) {
        if (!instanceofTypedArray(values)) {
            var inferredShape = util.inferShape(values);
            if (inferredShape.length > 1) {
                util.assertShapesMatch(shape, inferredShape, "Error when constructing Array2D. Shape of values " +
                    (inferredShape + " does not match the provided shape ") +
                    (shape + ". "));
            }
        }
        return new Array2D(shape, { values: toTypedArray(values, dtype) }, dtype);
    };
    Array2D.prototype.get = function (i, j) {
        return this.getValues()[this.stride0 * i + j];
    };
    Array2D.prototype.set = function (value, i, j) {
        this.getValues()[this.stride0 * i + j] = value;
    };
    Array2D.prototype.add = function (value, i, j) {
        this.getValues()[this.stride0 * i + j] += value;
    };
    Array2D.prototype.val = function (i, j) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.data()];
                    case 1:
                        _a.sent();
                        return [2, this.get(i, j)];
                }
            });
        });
    };
    Array2D.prototype.locToIndex = function (locs) {
        return this.stride0 * locs[0] + locs[1];
    };
    Array2D.prototype.indexToLoc = function (index) {
        return [Math.floor(index / this.stride0), index % this.stride0];
    };
    Array2D.prototype.asType = function (dtype) {
        return _super.prototype.asType.call(this, dtype);
    };
    Array2D.zeros = function (shape, dtype) {
        return NDArray.zeros(shape, dtype);
    };
    Array2D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array2D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array2D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    return Array2D;
}(NDArray));
exports.Array2D = Array2D;
var Array3D = (function (_super) {
    __extends(Array3D, _super);
    function Array3D(shape, data, dtype) {
        var _this = this;
        util.assert(shape.length === 3, 'Shape should be of length 3');
        _this = _super.call(this, shape, data, dtype) || this;
        _this.stride0 = _this.strides[0];
        _this.stride1 = _this.strides[1];
        return _this;
    }
    Array3D.new = function (shape, values, dtype) {
        if (!instanceofTypedArray(values)) {
            var inferredShape = util.inferShape(values);
            if (inferredShape.length > 1) {
                util.assertShapesMatch(shape, inferredShape, "Error when constructing Array3D. Shape of values " +
                    (inferredShape + " does not match the provided shape ") +
                    (shape + ". "));
            }
        }
        return new Array3D(shape, { values: toTypedArray(values, dtype) }, dtype);
    };
    Array3D.prototype.get = function (i, j, k) {
        return this.getValues()[this.stride0 * i + this.stride1 * j + k];
    };
    Array3D.prototype.set = function (value, i, j, k) {
        this.getValues()[this.stride0 * i + this.stride1 * j + k] = value;
    };
    Array3D.prototype.val = function (i, j, k) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.data()];
                    case 1:
                        _a.sent();
                        return [2, this.get(i, j, k)];
                }
            });
        });
    };
    Array3D.prototype.add = function (value, i, j, k) {
        this.getValues()[this.stride0 * i + this.stride1 * j + k] += value;
    };
    Array3D.prototype.locToIndex = function (locs) {
        return this.stride0 * locs[0] + this.stride1 * locs[1] + locs[2];
    };
    Array3D.prototype.indexToLoc = function (index) {
        var i = Math.floor(index / this.stride0);
        index -= i * this.stride0;
        return [i, Math.floor(index / this.stride1), index % this.stride1];
    };
    Array3D.prototype.asType = function (dtype) {
        return _super.prototype.asType.call(this, dtype);
    };
    Array3D.zeros = function (shape, dtype) {
        return NDArray.zeros(shape, dtype);
    };
    Array3D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array3D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array3D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    return Array3D;
}(NDArray));
exports.Array3D = Array3D;
var Array4D = (function (_super) {
    __extends(Array4D, _super);
    function Array4D(shape, data, dtype) {
        var _this = this;
        util.assert(shape.length === 4, 'Shape should be of length 4');
        _this = _super.call(this, shape, data, dtype) || this;
        _this.stride0 = _this.strides[0];
        _this.stride1 = _this.strides[1];
        _this.stride2 = _this.strides[2];
        return _this;
    }
    Array4D.new = function (shape, values, dtype) {
        if (!instanceofTypedArray(values)) {
            var inferredShape = util.inferShape(values);
            if (inferredShape.length > 1) {
                util.assertShapesMatch(shape, inferredShape, "Error when constructing Array4D. Shape of values " +
                    (inferredShape + " does not match the provided shape ") +
                    (shape + ". "));
            }
        }
        return new Array4D(shape, { values: toTypedArray(values, dtype) }, dtype);
    };
    Array4D.prototype.get = function (i, j, k, l) {
        return this.getValues()[this.stride0 * i + this.stride1 * j + this.stride2 * k + l];
    };
    Array4D.prototype.set = function (value, i, j, k, l) {
        this.getValues()[this.stride0 * i + this.stride1 * j + this.stride2 * k + l] = value;
    };
    Array4D.prototype.val = function (i, j, k, l) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.data()];
                    case 1:
                        _a.sent();
                        return [2, this.get(i, j, k, l)];
                }
            });
        });
    };
    Array4D.prototype.add = function (value, i, j, k, l) {
        this.getValues()[this.stride0 * i + this.stride1 * j + this.stride2 * k + l] += value;
    };
    Array4D.prototype.locToIndex = function (locs) {
        return this.stride0 * locs[0] + this.stride1 * locs[1] +
            this.stride2 * locs[2] + locs[3];
    };
    Array4D.prototype.indexToLoc = function (index) {
        var i = Math.floor(index / this.stride0);
        index -= i * this.stride0;
        var j = Math.floor(index / this.stride1);
        index -= j * this.stride1;
        return [i, j, Math.floor(index / this.stride2), index % this.stride2];
    };
    Array4D.prototype.asType = function (dtype) {
        return _super.prototype.asType.call(this, dtype);
    };
    Array4D.zeros = function (shape, dtype) {
        return NDArray.zeros(shape, dtype);
    };
    Array4D.randNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev); });
    };
    Array4D.randTruncatedNormal = function (shape, mean, stdDev) {
        if (mean === void 0) { mean = 0; }
        if (stdDev === void 0) { stdDev = 1; }
        return NDArray.rand(shape, function () { return util.randGauss(mean, stdDev, true); });
    };
    Array4D.randUniform = function (shape, a, b) {
        return NDArray.rand(shape, function () { return util.randUniform(a, b); });
    };
    return Array4D;
}(NDArray));
exports.Array4D = Array4D;
function copyTypedArray(array, dtype) {
    if (dtype == null || dtype === 'float32') {
        return new Float32Array(array);
    }
    else if (dtype === 'int32') {
        return new Int32Array(array);
    }
    else if (dtype === 'bool') {
        var bool = new Uint8Array(array.length);
        for (var i = 0; i < bool.length; ++i) {
            var val = array[i];
            if (util.isValNaN(val, 'bool')) {
                bool[i] = util.getNaN('bool');
            }
            else if (val) {
                bool[i] = 1;
            }
        }
        return bool;
    }
    else {
        throw new Error("Unknown data type " + dtype);
    }
}
function instanceofTypedArray(a) {
    return a instanceof Float32Array || a instanceof Int32Array ||
        a instanceof Uint8Array;
}
function noConversionNeeded(a, dtype) {
    return (a instanceof Float32Array && dtype === 'float32') ||
        (a instanceof Int32Array && dtype === 'int32') ||
        (a instanceof Uint8Array && dtype === 'bool');
}
function toTypedArray(a, dtype) {
    if (noConversionNeeded(a, dtype)) {
        return a;
    }
    if (Array.isArray(a)) {
        a = util.flatten(a);
    }
    return copyTypedArray(a, dtype);
}
function makeZerosTypedArray(size, dtype) {
    if (dtype == null || dtype === 'float32') {
        return new Float32Array(size);
    }
    else if (dtype === 'int32') {
        return new Int32Array(size);
    }
    else if (dtype === 'bool') {
        return new Uint8Array(size);
    }
    else {
        throw new Error("Unknown data type " + dtype);
    }
}
function typedArrayToFloat32(a, dtype) {
    if (a instanceof Float32Array) {
        return a;
    }
    else {
        var res = new Float32Array(a.length);
        for (var i = 0; i < res.length; i++) {
            var val = a[i];
            res[i] = util.isValNaN(val, dtype) ? NaN : val;
        }
        return res;
    }
}
function float32ToTypedArray(a, dtype) {
    if (dtype === 'float32') {
        return a;
    }
    else if (dtype === 'int32' || dtype === 'bool') {
        var result = (dtype === 'int32') ? new Int32Array(a.length) :
            new Uint8Array(a.length);
        for (var i = 0; i < result.length; ++i) {
            var val = a[i];
            val = isNaN(val) ? util.getNaN(dtype) : Math.round(val);
            result[i] = val;
        }
        return result;
    }
    else {
        throw new Error("Unknown dtype " + dtype);
    }
}

},{"../environment":15,"../util":95,"./webgl/tex_util":89,"./webgl/webgl_util":93}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../util");
function assertParamsValid(input, begin, size) {
    util.assert(input.rank === begin.length, "Error in slice" + input.rank + "D: Length of begin " + begin + " must " +
        ("match the rank of the array (" + input.rank + ")."));
    util.assert(input.rank === size.length, "Error in slice" + input.rank + "D: Length of size " + size + " must " +
        ("match the rank of the array (" + input.rank + ")."));
    for (var i = 0; i < input.rank; ++i) {
        util.assert(begin[i] + size[i] <= input.shape[i], "Error in slice" + input.rank + "D: begin[" + i + "] + size[" + i + "] " +
            ("(" + (begin[i] + size[i]) + ") would overflow input.shape[" + i + "] (" + input.shape[i] + ")"));
    }
}
exports.assertParamsValid = assertParamsValid;

},{"../util":95}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var broadcast_util = require("../broadcast_util");
var AddScaledMatProgram = (function () {
    function AddScaledMatProgram(aShape, bShape) {
        this.variableNames = ['A', 'B', 'c1', 'c2'];
        this.supportsBroadcasting = true;
        this.outputShape =
            broadcast_util.assertAndGetBroadcastShape(aShape, bShape);
        this.userCode = "\n      void main() {\n        float a = getAAtOutCoords();\n        float b = getBAtOutCoords();\n        float c1 = getC1();\n        float c2 = getC2();\n        setOutput(dot(vec2(c1, c2), vec2(a, b)));\n      }\n    ";
    }
    return AddScaledMatProgram;
}());
exports.AddScaledMatProgram = AddScaledMatProgram;

},{"../broadcast_util":55}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var axis_util = require("../axis_util");
function getArgMinMaxSnippet(op, texName, size) {
    var compOp = (op === 'min') ? '<' : '>';
    return "\n    float getArgMinMax" + texName + "() {\n      int bestIndex = 0;\n      float bestValue = get" + texName + "Flat(0);\n\n      for (int i = 0; i < " + size + "; i++) {\n        float candidate = get" + texName + "Flat(i);\n        if (isNaN(candidate)) {\n          return candidate;\n        }\n        if (candidate " + compOp + " bestValue) {\n          bestValue = candidate;\n          bestIndex = i;\n        }\n      }\n      return float(bestIndex);\n    }\n  ";
}
exports.getArgMinMaxSnippet = getArgMinMaxSnippet;
var ArgMinMaxProgram = (function () {
    function ArgMinMaxProgram(shape, axes, opType) {
        this.variableNames = ['A'];
        var _a = axis_util.computeOutAndReduceShapes(shape, axes), outShape = _a[0], reduceShape = _a[1];
        this.outputShape = outShape;
        this.numBatchDims = outShape.length;
        var size = util.sizeFromShape(reduceShape);
        var aSnippet = getArgMinMaxSnippet(opType, 'A', size);
        this.userCode = "\n      " + aSnippet + "\n\n      void main() {\n        setOutput(getArgMinMaxA());\n      }\n    ";
    }
    return ArgMinMaxProgram;
}());
exports.ArgMinMaxProgram = ArgMinMaxProgram;

},{"../../util":95,"../axis_util":54}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var broadcast_util = require("../broadcast_util");
var BatchNormProgram = (function () {
    function BatchNormProgram(xShape, meanShape, varianceShape, offsetShape, scaleShape, varianceEpsilon) {
        this.outputShape = [];
        this.supportsBroadcasting = true;
        this.variableNames = ['x', 'mean', 'variance'];
        broadcast_util.assertAndGetBroadcastShape(xShape, meanShape);
        broadcast_util.assertAndGetBroadcastShape(xShape, varianceShape);
        var offsetSnippet = '0.0';
        if (offsetShape != null) {
            broadcast_util.assertAndGetBroadcastShape(xShape, offsetShape);
            this.variableNames.push('offset');
            offsetSnippet = 'getOffsetAtOutCoords()';
        }
        var scaleSnippet = '1.0';
        if (scaleShape != null) {
            broadcast_util.assertAndGetBroadcastShape(xShape, scaleShape);
            this.variableNames.push('scale');
            scaleSnippet = 'getScaleAtOutCoords()';
        }
        this.outputShape = xShape;
        this.userCode = "\n      void main() {\n        float x = getXAtOutCoords();\n        float mean = getMeanAtOutCoords();\n        float variance = getVarianceAtOutCoords();\n        float offset = " + offsetSnippet + ";\n        float scale = " + scaleSnippet + ";\n        float inv = scale / sqrt(variance + float(" + varianceEpsilon + "));\n        setOutput((x - mean) * inv + offset);\n      }\n    ";
    }
    return BatchNormProgram;
}());
exports.BatchNormProgram = BatchNormProgram;

},{"../broadcast_util":55}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var broadcast_util = require("../broadcast_util");
exports.ADD = 'return a + b;';
exports.SUB = 'return a - b;';
exports.MUL = 'return a * b;';
exports.DIV = 'return a / b;';
exports.EQUAL = "\n  if (isNaN(a)) return a;\n  if (isNaN(b)) return b;\n  return float(a == b);\n";
var BinaryOpProgram = (function () {
    function BinaryOpProgram(op, aShape, bShape) {
        this.variableNames = ['A', 'B'];
        this.supportsBroadcasting = true;
        this.outputShape =
            broadcast_util.assertAndGetBroadcastShape(aShape, bShape);
        this.userCode = "\n      float binaryOperation(float a, float b) {\n        " + op + "\n      }\n\n      void main() {\n        float a = getAAtOutCoords();\n        float b = getBAtOutCoords();\n        setOutput(binaryOperation(a, b));\n      }\n    ";
    }
    return BinaryOpProgram;
}());
exports.BinaryOpProgram = BinaryOpProgram;

},{"../broadcast_util":55}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClipProgram = (function () {
    function ClipProgram(aShape, min, max) {
        this.variableNames = ['A'];
        this.outputShape = aShape;
        var minFixed = min.toFixed(20);
        var maxFixed = max.toFixed(20);
        this.userCode = "\n      void main() {\n        float value = getAAtOutCoords();\n        if (isNaN(value)) {\n          setOutput(value);\n          return;\n        }\n\n        setOutput(clamp(value, " + minFixed + ", " + maxFixed + "));\n      }\n    ";
    }
    return ClipProgram;
}());
exports.ClipProgram = ClipProgram;

},{}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concat_util = require("../concat_util");
var ConcatProgram = (function () {
    function ConcatProgram(aShape, bShape, axis) {
        this.variableNames = ['A', 'B'];
        this.outputShape = [];
        var yAxes = ['yR', 'yC', 'yD', 'yW'];
        var concatAxis = yAxes[axis];
        this.outputShape = concat_util.computeOutShape(aShape, bShape, axis);
        var dType = getDataType(aShape.length);
        var unpackSnippet = getUnpack(aShape.length);
        var sampleCoords = getSampleCoords(aShape.length);
        this.userCode = "\n      void main() {\n        " + dType + " coords = getOutputCoords();\n        " + unpackSnippet + "\n\n        float value = 0.0;\n        if (" + concatAxis + " < " + aShape[axis] + ") {\n          value = getA(" + sampleCoords + ");\n        } else {\n          " + concatAxis + " -= " + aShape[axis] + ";\n          value = getB(" + sampleCoords + ");\n        }\n\n        setOutput(value);\n      }\n    ";
    }
    return ConcatProgram;
}());
exports.ConcatProgram = ConcatProgram;
function getSampleCoords(rank) {
    if (rank === 1) {
        return 'yR';
    }
    else if (rank === 2) {
        return 'yR, yC';
    }
    else if (rank === 3) {
        return 'yR, yC, yD';
    }
    else if (rank === 4) {
        return 'yR, yC, yD, yW';
    }
    else {
        throw Error("Concat for rank " + rank + " is not yet supported");
    }
}
function getUnpack(rank) {
    var res = rank === 1 ? 'int yR = coords;' : 'int yR = coords.x;';
    if (rank > 1) {
        res += '\nint yC = coords.y;';
    }
    if (rank > 2) {
        res += '\nint yD = coords.z;';
    }
    if (rank > 3) {
        res += '\nint yW = coords.w;';
    }
    if (rank > 4) {
        throw Error("Concat for rank " + rank + " is not yet supported");
    }
    return res;
}
function getDataType(rank) {
    if (rank === 1) {
        return 'int';
    }
    else if (rank === 2) {
        return 'ivec2';
    }
    else if (rank === 3) {
        return 'ivec3';
    }
    else if (rank === 4) {
        return 'ivec4';
    }
    else {
        throw Error("Concat for rank " + rank + " is not yet supported");
    }
}

},{"../concat_util":56}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var conv_util = require("../conv_util");
var Conv2DDerWeightsProgram = (function () {
    function Conv2DDerWeightsProgram(convInfo) {
        this.variableNames = ['x', 'dy'];
        var _a = convInfo.outShape, yNumRows = _a[0], yNumCols = _a[1], outDepth = _a[2];
        var _b = convInfo.inShape, xNumRows = _b[0], xNumCols = _b[1], inDepth = _b[2];
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        this.outputShape = conv_util.computeWeightsShape4D(inDepth, outDepth, convInfo.filterHeight, convInfo.filterWidth);
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        this.userCode = "\n      void main() {\n        ivec4 coords = getOutputCoords();\n        int wR = coords.x;\n        int wC = coords.y;\n        int d1 = coords.z;\n        int d2 = coords.w;\n\n        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int yR = 0; yR < " + yNumRows + "; yR++) {\n          int xR = wR + yR * " + strideHeight + " - " + padTop + ";\n\n          if (xR < 0 || xR >= " + xNumRows + ") {\n            continue;\n          }\n\n          for (int yC = 0; yC < " + yNumCols + "; yC++) {\n            int xC = wC + yC * " + strideWidth + " - " + padLeft + ";\n\n            if (xC < 0 || xC >= " + xNumCols + ") {\n              continue;\n            }\n\n            float dyValue = getDy(yR, yC, d2);\n            float xValue = getX(xR, xC, d1);\n            dotProd += (xValue * dyValue);\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
    }
    return Conv2DDerWeightsProgram;
}());
exports.Conv2DDerWeightsProgram = Conv2DDerWeightsProgram;
var Conv2DDerInputProgram = (function () {
    function Conv2DDerInputProgram(convInfo) {
        this.variableNames = ['dy', 'W'];
        var _a = convInfo.outShape, yRows = _a[0], yCols = _a[1], outDepth = _a[2];
        this.outputShape = convInfo.inShape;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var padTop = filterHeight - 1 - convInfo.padInfo.top;
        var padLeft = filterWidth - 1 - convInfo.padInfo.left;
        this.userCode = "\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int d1 = coords.z;\n\n        ivec2 dyCorner = coords.xy - pads;\n        int dyRCorner = dyCorner.x;\n        int dyCCorner = dyCorner.y;\n\n        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          float dyR = float(dyRCorner + wR) / " + strideHeight + ".0;\n\n          if (dyR < 0.0 || dyR >= " + yRows + ".0 || fract(dyR) > 0.0) {\n            continue;\n          }\n          int idyR = int(dyR);\n\n          int wRPerm = " + filterHeight + " - 1 - wR;\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            float dyC = float(dyCCorner + wC) / " + strideWidth + ".0;\n\n            if (dyC < 0.0 || dyC >= " + yCols + ".0 || fract(dyC) > 0.0) {\n              continue;\n            }\n            int idyC = int(dyC);\n\n            int wCPerm = " + filterWidth + " - 1 - wC;\n\n            for (int d2 = 0; d2 < " + outDepth + "; d2++) {\n              float xValue = getDy(idyR, idyC, d2);\n              float wValue = getW(wRPerm, wCPerm, d1, d2);\n              dotProd += xValue * wValue;\n            }\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
    }
    return Conv2DDerInputProgram;
}());
exports.Conv2DDerInputProgram = Conv2DDerInputProgram;
var Conv2DDerBiasProgram = (function () {
    function Conv2DDerBiasProgram(yShape) {
        this.variableNames = ['dy'];
        var yNumRows = yShape[0], yNumCols = yShape[1], outputDepth = yShape[2];
        this.outputShape = [outputDepth];
        this.userCode = "\n      void main() {\n        int d2 = getOutputCoords();\n\n        float derBias = 0.0;\n        for (int yR = 0; yR < " + yNumRows + "; yR++) {\n          for (int yC = 0; yC < " + yNumCols + "; yC++) {\n            derBias += getDy(yR, yC, d2);\n          }\n        }\n        setOutput(derBias);\n      }\n    ";
    }
    return Conv2DDerBiasProgram;
}());
exports.Conv2DDerBiasProgram = Conv2DDerBiasProgram;

},{"../conv_util":57}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Conv2DProgram = (function () {
    function Conv2DProgram(convInfo, hasBias) {
        this.variableNames = ['x', 'W'];
        if (hasBias) {
            this.variableNames.push('bias');
        }
        this.outputShape = convInfo.outShape;
        var biasSnippet = hasBias ? 'dotProd += getBias(d2);' : '';
        var _a = convInfo.inShape, xNumRows = _a[0], xNumCols = _a[1], inputDepth = _a[2];
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var inputDepthNearestVec4 = Math.floor(inputDepth / 4) * 4;
        var inputDepthVec4Remainder = inputDepth % 4;
        this.userCode = "\n      const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int d2 = coords.z;\n\n        ivec2 xRCCorner = coords.xy * strides - pads;\n        int xRCorner = xRCCorner.x;\n        int xCCorner = xRCCorner.y;\n\n        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          int xR = xRCorner + wR;\n\n          if (xR < 0 || xR >= " + xNumRows + ") {\n            continue;\n          }\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            int xC = xCCorner + wC;\n\n            if (xC < 0 || xC >= " + xNumCols + ") {\n              continue;\n            }\n\n            for (int d1 = 0; d1 < " + inputDepthNearestVec4 + "; d1 += 4) {\n              vec4 xValues = vec4(\n                getX(xR, xC, d1),\n                getX(xR, xC, d1 + 1),\n                getX(xR, xC, d1 + 2),\n                getX(xR, xC, d1 + 3)\n              );\n              vec4 wValues = vec4(\n                getW(wR, wC, d1, d2),\n                getW(wR, wC, d1 + 1, d2),\n                getW(wR, wC, d1 + 2, d2),\n                getW(wR, wC, d1 + 3, d2)\n              );\n\n              dotProd += dot(xValues, wValues);\n            }\n\n            if (" + (inputDepthVec4Remainder === 1) + ") {\n              dotProd +=\n                getX(xR, xC, " + inputDepthNearestVec4 + ") *\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2);\n            } else if (" + (inputDepthVec4Remainder === 2) + ") {\n              vec2 xValues = vec2(\n                getX(xR, xC, " + inputDepthNearestVec4 + "),\n                getX(xR, xC, " + inputDepthNearestVec4 + " + 1)\n              );\n              vec2 wValues = vec2(\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 1, d2)\n              );\n              dotProd += dot(xValues, wValues);\n            } else if (" + (inputDepthVec4Remainder === 3) + ") {\n              vec3 xValues = vec3(\n                getX(xR, xC, " + inputDepthNearestVec4 + "),\n                getX(xR, xC, " + inputDepthNearestVec4 + " + 1),\n                getX(xR, xC, " + inputDepthNearestVec4 + " + 2)\n              );\n              vec3 wValues = vec3(\n                getW(wR, wC, " + inputDepthNearestVec4 + ", d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 1, d2),\n                getW(wR, wC, " + inputDepthNearestVec4 + " + 2, d2)\n              );\n              dotProd += dot(xValues, wValues);\n            }\n          }\n        }\n        " + biasSnippet + "\n        setOutput(dotProd);\n      }\n    ";
    }
    return Conv2DProgram;
}());
exports.Conv2DProgram = Conv2DProgram;

},{}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Copy2DProgram = (function () {
    function Copy2DProgram(srcNumCols, destNumCols) {
        this.variableNames = ['source'];
        this.outputShape = null;
        this.userCode = "\n      uniform ivec2 sourceStart;\n      uniform ivec2 destStart;\n\n      void main() {\n        ivec2 destCoords = getOutputCoords() - destStart;\n        int index = destCoords.x * " + destNumCols + " + destCoords.y;\n        int r = index / " + srcNumCols + ";\n        ivec2 sourceCoords = sourceStart + ivec2(r, index - r * " + srcNumCols + ");\n        setOutput(getSource(sourceCoords.x, sourceCoords.y));\n      }\n    ";
    }
    Copy2DProgram.prototype.getCustomSetupFunc = function (sourceStart, destStart, destSize) {
        return function (gpgpu, webGLProgram) {
            gpgpu.setOutputMatrixWriteRegion(destStart[0], destSize[0], destStart[1], destSize[1]);
            var sourceStartCRLoc = gpgpu.getUniformLocation(webGLProgram, 'sourceStart');
            gpgpu.gl.uniform2i(sourceStartCRLoc, sourceStart[0], sourceStart[1]);
            var destStartCRLoc = gpgpu.getUniformLocation(webGLProgram, 'destStart');
            gpgpu.gl.uniform2i(destStartCRLoc, destStart[0], destStart[1]);
        };
    };
    return Copy2DProgram;
}());
exports.Copy2DProgram = Copy2DProgram;

},{}],74:[function(require,module,exports){
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
var environment_1 = require("../../environment");
var util = require("../../util");
var gpgpu_util = require("./gpgpu_util");
var tex_util = require("./tex_util");
var webgl_util = require("./webgl_util");
var GPGPUContext = (function () {
    function GPGPUContext(gl) {
        this.outputTexture = null;
        this.program = null;
        this.disposed = false;
        this.autoDebugValidate = false;
        if (gl != null) {
            this.gl = gl;
        }
        else {
            this.gl = gpgpu_util.createWebGLContext();
        }
        if (environment_1.ENV.get('WEBGL_VERSION') === 1) {
            this.textureFloatExtension =
                webgl_util.getExtensionOrThrow(this.gl, 'OES_texture_float');
            this.colorBufferFloatExtension =
                this.gl.getExtension('WEBGL_color_buffer_float');
        }
        else {
            this.colorBufferFloatExtension =
                webgl_util.getExtensionOrThrow(this.gl, 'EXT_color_buffer_float');
        }
        this.loseContextExtension =
            webgl_util.getExtensionOrThrow(this.gl, 'WEBGL_lose_context');
        if (environment_1.ENV.get('WEBGL_GET_BUFFER_SUB_DATA_ASYNC_EXTENSION_ENABLED')) {
            this.getBufferSubDataAsyncExtension =
                this.gl.getExtension('WEBGL_get_buffer_sub_data_async');
        }
        this.vertexBuffer = gpgpu_util.createVertexBuffer(this.gl);
        this.indexBuffer = gpgpu_util.createIndexBuffer(this.gl);
        this.framebuffer = webgl_util.createFramebuffer(this.gl);
    }
    GPGPUContext.prototype.dispose = function () {
        var _this = this;
        this.throwIfDisposed();
        if (this.program != null) {
            console.warn('Disposing a GPGPUContext that still has a bound WebGLProgram.' +
                ' This is probably a resource leak, delete the program with ' +
                'GPGPUContext.deleteProgram before disposing.');
        }
        if (this.outputTexture != null) {
            console.warn('Disposing a GPGPUContext that still has a bound output matrix ' +
                'texture.  This is probably a resource leak, delete the output ' +
                'matrix texture with GPGPUContext.deleteMatrixTexture before ' +
                'disposing.');
        }
        var gl = this.gl;
        webgl_util.callAndCheck(gl, function () { return gl.finish(); });
        webgl_util.callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, null); });
        webgl_util.callAndCheck(gl, function () { return gl.deleteFramebuffer(_this.framebuffer); });
        webgl_util.callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, null); });
        webgl_util.callAndCheck(gl, function () { return gl.deleteBuffer(_this.vertexBuffer); });
        webgl_util.callAndCheck(gl, function () { return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); });
        webgl_util.callAndCheck(gl, function () { return gl.deleteBuffer(_this.indexBuffer); });
        this.loseContextExtension.loseContext();
        this.disposed = true;
    };
    GPGPUContext.prototype.enableAutomaticDebugValidation = function (enabled) {
        this.autoDebugValidate = enabled;
        webgl_util.enableDebugWebGLErrorChecking(enabled);
    };
    GPGPUContext.prototype.createMatrixTexture = function (rows, columns) {
        this.throwIfDisposed();
        return gpgpu_util.createMatrixTexture(this.gl, rows, columns);
    };
    GPGPUContext.prototype.uploadPixelDataToTexture = function (texture, pixels) {
        this.throwIfDisposed();
        gpgpu_util.uploadPixelDataToTexture(this.gl, texture, pixels);
    };
    GPGPUContext.prototype.createPackedMatrixTexture = function (rows, columns) {
        this.throwIfDisposed();
        return gpgpu_util.createPackedMatrixTexture(this.gl, rows, columns);
    };
    GPGPUContext.prototype.deleteMatrixTexture = function (texture) {
        var _this = this;
        this.throwIfDisposed();
        if (this.outputTexture === texture) {
            webgl_util.unbindColorTextureFromFramebuffer(this.gl, this.framebuffer);
            this.outputTexture = null;
        }
        webgl_util.callAndCheck(this.gl, function () { return _this.gl.deleteTexture(texture); });
    };
    GPGPUContext.prototype.uploadMatrixToTexture = function (texture, rows, columns, matrix) {
        this.throwIfDisposed();
        var numChannels = 1;
        return gpgpu_util.uploadMatrixToTexture(this.gl, texture, rows, columns, matrix, numChannels);
    };
    GPGPUContext.prototype.uploadMatrixToPackedTexture = function (texture, rows, columns, matrix) {
        this.throwIfDisposed();
        return gpgpu_util.uploadMatrixToPackedTexture(this.gl, texture, rows, columns, matrix);
    };
    GPGPUContext.prototype.downloadMatrixFromTexture = function (texture, rows, columns) {
        var _this = this;
        return this.downloadMatrixDriver(texture, function () {
            return gpgpu_util.downloadMatrixFromOutputTexture(_this.gl, rows, columns);
        });
    };
    GPGPUContext.prototype.downloadMatrixFromTextureAsync = function (texture, rows, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.getBufferSubDataAsyncExtension == null) {
                    throw new Error("Cannot download matrix from output texture asynchronously, " +
                        "WEBGL_get_buffer_sub_data_async is not enabled.");
                }
                return [2, this.downloadMatrixDriverAsync(texture, function () { return gpgpu_util.downloadMatrixFromOutputTextureAsync(_this.gl, _this.getBufferSubDataAsyncExtension, rows, columns); })];
            });
        });
    };
    GPGPUContext.prototype.downloadMatrixFromRGBAColorTexture = function (texture, rows, columns, channels) {
        var _this = this;
        return this.downloadMatrixDriver(texture, function () { return gpgpu_util.downloadMatrixFromRGBAColorTexture(_this.gl, rows, columns, channels); });
    };
    GPGPUContext.prototype.downloadMatrixFromPackedTexture = function (texture, rows, columns) {
        var _this = this;
        return this.downloadMatrixDriver(texture, function () { return gpgpu_util.downloadMatrixFromPackedOutputTexture(_this.gl, rows, columns); });
    };
    GPGPUContext.prototype.createProgram = function (fragmentShaderSource) {
        this.throwIfDisposed();
        var gl = this.gl;
        var fragmentShader = webgl_util.createFragmentShader(gl, fragmentShaderSource);
        var vertexShader = gpgpu_util.createVertexShader(gl);
        var program = webgl_util.createProgram(gl);
        webgl_util.callAndCheck(gl, function () { return gl.attachShader(program, vertexShader); });
        webgl_util.callAndCheck(gl, function () { return gl.attachShader(program, fragmentShader); });
        webgl_util.linkProgram(gl, program);
        if (this.autoDebugValidate) {
            webgl_util.validateProgram(gl, program);
        }
        return program;
    };
    GPGPUContext.prototype.deleteProgram = function (program) {
        var _this = this;
        this.throwIfDisposed();
        if (program === this.program) {
            this.program = null;
        }
        if (program != null) {
            webgl_util.callAndCheck(this.gl, function () { return _this.gl.deleteProgram(program); });
        }
    };
    GPGPUContext.prototype.setProgram = function (program) {
        var _this = this;
        this.throwIfDisposed();
        this.program = program;
        if ((this.program != null) && this.autoDebugValidate) {
            webgl_util.validateProgram(this.gl, this.program);
        }
        webgl_util.callAndCheck(this.gl, function () { return _this.gl.useProgram(program); });
    };
    GPGPUContext.prototype.getUniformLocation = function (program, uniformName) {
        this.throwIfDisposed();
        return webgl_util.getProgramUniformLocationOrThrow(this.gl, program, uniformName);
    };
    GPGPUContext.prototype.getAttributeLocation = function (program, attribute) {
        var _this = this;
        this.throwIfDisposed();
        return webgl_util.callAndCheck(this.gl, function () { return _this.gl.getAttribLocation(program, attribute); });
    };
    GPGPUContext.prototype.getUniformLocationNoThrow = function (program, uniformName) {
        this.throwIfDisposed();
        return this.gl.getUniformLocation(program, uniformName);
    };
    GPGPUContext.prototype.setInputMatrixTexture = function (inputMatrixTexture, uniformLocation, textureUnit) {
        this.throwIfDisposed();
        this.throwIfNoProgram();
        webgl_util.bindTextureToProgramUniformSampler(this.gl, this.program, inputMatrixTexture, uniformLocation, textureUnit);
    };
    GPGPUContext.prototype.setOutputMatrixTexture = function (outputMatrixTexture, rows, columns) {
        this.setOutputMatrixTextureDriver(outputMatrixTexture, columns, rows);
    };
    GPGPUContext.prototype.setOutputPackedMatrixTexture = function (outputPackedMatrixTexture, rows, columns) {
        this.throwIfDisposed();
        var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
        this.setOutputMatrixTextureDriver(outputPackedMatrixTexture, width, height);
    };
    GPGPUContext.prototype.setOutputMatrixWriteRegion = function (startRow, numRows, startColumn, numColumns) {
        this.setOutputMatrixWriteRegionDriver(startColumn, startRow, numColumns, numRows);
    };
    GPGPUContext.prototype.setOutputPackedMatrixWriteRegion = function (startRow, numRows, startColumn, numColumns) {
        throw new Error('setOutputPackedMatrixWriteRegion not implemented.');
    };
    GPGPUContext.prototype.debugValidate = function () {
        if (this.program != null) {
            webgl_util.validateProgram(this.gl, this.program);
        }
        webgl_util.validateFramebuffer(this.gl);
    };
    GPGPUContext.prototype.executeProgram = function (attribLocations) {
        this.throwIfDisposed();
        this.throwIfNoProgram();
        var gl = this.gl;
        gpgpu_util.bindVertexProgramAttributeStreams(gl, this.program, this.vertexBuffer, attribLocations);
        if (this.autoDebugValidate) {
            this.debugValidate();
        }
        webgl_util.callAndCheck(gl, function () { return gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); });
    };
    GPGPUContext.prototype.blockUntilAllProgramsCompleted = function () {
        var _this = this;
        this.throwIfDisposed();
        webgl_util.callAndCheck(this.gl, function () { return _this.gl.finish(); });
    };
    GPGPUContext.prototype.runQuery = function (queryFn) {
        if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
            return this.runQueryWebGL2(queryFn);
        }
        return this.runQueryWebGL1(queryFn);
    };
    GPGPUContext.prototype.runQueryWebGL2 = function (benchmark) {
        var _this = this;
        var ext = webgl_util.getExtensionOrThrow(this.gl, 'EXT_disjoint_timer_query_webgl2');
        var query = this.gl.createQuery();
        this.gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
        benchmark();
        this.gl.endQuery(ext.TIME_ELAPSED_EXT);
        return new Promise(function (resolve, reject) {
            var queryGPU = function () {
                var available = _this.gl
                    .getQueryParameter(query, _this.gl.QUERY_RESULT_AVAILABLE);
                var disjoint = _this.gl.getParameter(ext.GPU_DISJOINT_EXT);
                return available && !disjoint;
            };
            var getTimeElapsed = function () {
                var timeElapsedNanos = _this.gl
                    .getQueryParameter(query, _this.gl.QUERY_RESULT);
                resolve(timeElapsedNanos / 1000000);
            };
            var resolveWithWarning = function () {
                console.warn('Disjoint query timer never available.');
                resolve(-1);
            };
            util.repeatedTry(queryGPU).then(getTimeElapsed).catch(resolveWithWarning);
        });
    };
    GPGPUContext.prototype.runQueryWebGL1 = function (benchmark) {
        var _this = this;
        var ext = webgl_util.getExtensionOrThrow(this.gl, 'EXT_disjoint_timer_query');
        var query = ext.createQueryEXT();
        ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, query);
        benchmark();
        ext.endQueryEXT(ext.TIME_ELAPSED_EXT);
        return new Promise(function (resolve, reject) {
            var queryGPU = function () {
                var available = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_AVAILABLE_EXT);
                var disjoint = _this.gl.getParameter(ext.GPU_DISJOINT_EXT);
                return available && !disjoint;
            };
            var getTimeElapsed = function () {
                var timeElapsedNanos = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_EXT);
                resolve(timeElapsedNanos / 1000000);
            };
            var resolveWithWarning = function () {
                console.warn('Disjoint query timer never available.');
                resolve(-1);
            };
            util.repeatedTry(queryGPU).then(getTimeElapsed).catch(resolveWithWarning);
        });
    };
    GPGPUContext.prototype.downloadMatrixDriverSetup = function (texture) {
        this.throwIfDisposed();
        webgl_util.bindColorTextureToFramebuffer(this.gl, texture, this.framebuffer);
        if (this.autoDebugValidate) {
            webgl_util.validateFramebuffer(this.gl);
        }
    };
    GPGPUContext.prototype.downloadMatrixDriverTeardown = function () {
        if (this.outputTexture != null) {
            webgl_util.bindColorTextureToFramebuffer(this.gl, this.outputTexture, this.framebuffer);
            if (this.autoDebugValidate) {
                webgl_util.validateFramebuffer(this.gl);
            }
        }
        else {
            webgl_util.unbindColorTextureFromFramebuffer(this.gl, this.framebuffer);
        }
    };
    GPGPUContext.prototype.downloadMatrixDriver = function (texture, downloadAndDecode) {
        this.downloadMatrixDriverSetup(texture);
        var result = downloadAndDecode();
        this.downloadMatrixDriverTeardown();
        return result;
    };
    GPGPUContext.prototype.downloadMatrixDriverAsync = function (texture, downloadAndDecode) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.downloadMatrixDriverSetup(texture);
                        return [4, downloadAndDecode()];
                    case 1:
                        result = _a.sent();
                        this.downloadMatrixDriverTeardown();
                        return [2, result];
                }
            });
        });
    };
    GPGPUContext.prototype.setOutputMatrixTextureDriver = function (outputMatrixTextureMaybePacked, width, height) {
        this.throwIfDisposed();
        var gl = this.gl;
        webgl_util.bindColorTextureToFramebuffer(gl, outputMatrixTextureMaybePacked, this.framebuffer);
        if (this.autoDebugValidate) {
            webgl_util.validateFramebuffer(gl);
        }
        this.outputTexture = outputMatrixTextureMaybePacked;
        webgl_util.callAndCheck(gl, function () { return gl.viewport(0, 0, width, height); });
        webgl_util.callAndCheck(gl, function () { return gl.scissor(0, 0, width, height); });
    };
    GPGPUContext.prototype.setOutputMatrixWriteRegionDriver = function (x, y, width, height) {
        var _this = this;
        this.throwIfDisposed();
        webgl_util.callAndCheck(this.gl, function () { return _this.gl.scissor(x, y, width, height); });
    };
    GPGPUContext.prototype.throwIfDisposed = function () {
        if (this.disposed) {
            throw new Error('Attempted to use disposed GPGPUContext.');
        }
    };
    GPGPUContext.prototype.throwIfNoProgram = function () {
        if (this.program == null) {
            throw new Error('No GPU program is currently set.');
        }
    };
    return GPGPUContext;
}());
exports.GPGPUContext = GPGPUContext;

},{"../../environment":15,"../../util":95,"./gpgpu_util":76,"./tex_util":89,"./webgl_util":93}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var util = require("../../util");
var shader_compiler = require("./shader_compiler");
var ATTRIBUTE_NAMES = ['uv', 'clipSpacePos'];
var NAN_UNIFORM_NAME = 'NaN';
function shouldUploadNaNUniform() {
    return !environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
}
function compileProgram(gpgpu, program, inputs, output) {
    var userCode = program.userCode;
    var inputInfos = inputs.map(function (input, i) {
        var shapeInfo = {
            logicalShape: input.shape,
            texShape: input.getTextureShapeRC(),
            textureType: input.getData().textureType
        };
        return { name: program.variableNames[i], shapeInfo: shapeInfo };
    });
    var inShapeInfos = inputInfos.map(function (x) { return x.shapeInfo; });
    var outShapeInfo = {
        logicalShape: output.shape,
        texShape: output.getTextureShapeRC(),
        textureType: output.getData().textureType
    };
    var source = shader_compiler.makeShader(inputInfos, outShapeInfo, userCode, program.supportsBroadcasting === true, program.numBatchDims);
    var webGLProgram = gpgpu.createProgram(source);
    var uniformLocations = {};
    for (var i = 0; i < program.variableNames.length; i++) {
        var uniformName = program.variableNames[i];
        uniformLocations[uniformName] =
            gpgpu.getUniformLocation(webGLProgram, uniformName);
    }
    var attributeLocations = {};
    ATTRIBUTE_NAMES.forEach(function (attribute) {
        attributeLocations[attribute] =
            gpgpu.getAttributeLocation(webGLProgram, attribute);
    });
    if (shouldUploadNaNUniform()) {
        uniformLocations[NAN_UNIFORM_NAME] =
            gpgpu.getUniformLocation(webGLProgram, NAN_UNIFORM_NAME);
    }
    return {
        program: program,
        source: source,
        webGLProgram: webGLProgram,
        uniformLocations: uniformLocations,
        attributeLocations: attributeLocations,
        gpgpu: gpgpu,
        inShapeInfos: inShapeInfos,
        outShapeInfo: outShapeInfo
    };
}
exports.compileProgram = compileProgram;
function validateBinaryAndProgram(shapeInfos, inputs, numBatchDims) {
    if (shapeInfos.length !== inputs.length) {
        throw Error("Binary was compiled with " + shapeInfos.length + " inputs, but " +
            ("was executed with " + inputs.length + " inputs"));
    }
    shapeInfos.forEach(function (s, i) {
        var shapeA = s.logicalShape;
        var texShapeA = s.texShape;
        var shapeB = inputs[i].shape;
        var texShapeB = inputs[i].getTextureShapeRC();
        if (!numBatchDims && !util.arraysEqual(shapeA, shapeB)) {
            throw Error("Binary was compiled with different shapes than " +
                ("the current args. Shapes " + shapeA + " and " + shapeB + " must match"));
        }
        if (!numBatchDims && !util.arraysEqual(texShapeA, texShapeB)) {
            throw Error("Binary was compiled with different texture shapes than the" +
                (" current args. Shape " + texShapeA + " and " + texShapeB + " must match"));
        }
    });
}
function runProgram(binary, inputs, output, customSetup) {
    validateBinaryAndProgram(binary.inShapeInfos, inputs, binary.program.numBatchDims);
    validateBinaryAndProgram([binary.outShapeInfo], [output], binary.program.numBatchDims);
    var outTex = output.getTexture();
    var outTexShape = output.getTextureShapeRC();
    var gpgpu = binary.gpgpu;
    gpgpu.setOutputMatrixTexture(outTex, outTexShape[0], outTexShape[1]);
    gpgpu.setProgram(binary.webGLProgram);
    inputs.forEach(function (input, i) {
        var tex = input.getTexture();
        var variableName = binary.program.variableNames[i];
        var variableUniformLocation = binary.uniformLocations[variableName];
        gpgpu.setInputMatrixTexture(tex, variableUniformLocation, i);
    });
    if (shouldUploadNaNUniform()) {
        gpgpu.gl.uniform1f(binary.uniformLocations[NAN_UNIFORM_NAME], NaN);
    }
    if (customSetup != null) {
        customSetup(gpgpu, binary.webGLProgram);
    }
    gpgpu.executeProgram(binary.attributeLocations);
}
exports.runProgram = runProgram;
function makeShaderKey(program, inputs, output) {
    var keyInputs = '';
    inputs.concat(output).forEach(function (x) {
        keyInputs += x.shape + "_" + x.getTextureShapeRC();
    });
    var keyUserCode = program.userCode;
    var keyBroadcast = (program.supportsBroadcasting === true).toString();
    var key = program.constructor.name;
    key += '_' + keyBroadcast + '_' + keyInputs + '_' + keyUserCode;
    return key;
}
exports.makeShaderKey = makeShaderKey;

},{"../../environment":15,"../../util":95,"./shader_compiler":87}],76:[function(require,module,exports){
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
var environment_1 = require("../../environment");
var tex_util = require("./tex_util");
var webgl_util = require("./webgl_util");
function getWebGLContextAttributes() {
    return {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        depth: false,
        stencil: false,
        failIfMajorPerformanceCaveat: true
    };
}
exports.getWebGLContextAttributes = getWebGLContextAttributes;
function createWebGLContext(canvas) {
    var attributes = getWebGLContextAttributes();
    var gl;
    if (canvas != null) {
        gl = webgl_util.createWebGLRenderingContextFromCanvas(canvas, attributes);
    }
    else {
        gl = webgl_util.createWebGLRenderingContext(attributes);
    }
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.DEPTH_TEST); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.STENCIL_TEST); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.BLEND); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.DITHER); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.POLYGON_OFFSET_FILL); });
    webgl_util.callAndCheck(gl, function () { return gl.disable(gl.SAMPLE_COVERAGE); });
    webgl_util.callAndCheck(gl, function () { return gl.enable(gl.SCISSOR_TEST); });
    webgl_util.callAndCheck(gl, function () { return gl.enable(gl.CULL_FACE); });
    webgl_util.callAndCheck(gl, function () { return gl.cullFace(gl.BACK); });
    return gl;
}
exports.createWebGLContext = createWebGLContext;
function createVertexShader(gl) {
    var vertexShaderSource = "\n    precision highp float;\n    attribute vec3 clipSpacePos;\n    attribute vec2 uv;\n    varying vec2 resultUV;\n\n    void main() {\n      gl_Position = vec4(clipSpacePos, 1);\n      resultUV = uv;\n    }";
    return webgl_util.createVertexShader(gl, vertexShaderSource);
}
exports.createVertexShader = createVertexShader;
function createVertexBuffer(gl) {
    var vertexArray = new Float32Array([-1, 1, 0, 0, 1, -1, -1, 0, 0, 0, 1, 1, 0, 1, 1, 1, -1, 0, 1, 0]);
    return webgl_util.createStaticVertexBuffer(gl, vertexArray);
}
exports.createVertexBuffer = createVertexBuffer;
function createIndexBuffer(gl) {
    var triangleVertexIndices = new Uint16Array([0, 1, 2, 2, 1, 3]);
    return webgl_util.createStaticIndexBuffer(gl, triangleVertexIndices);
}
exports.createIndexBuffer = createIndexBuffer;
function getTextureInternalFormat(gl, numChannels) {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return gl.RGBA;
    }
    if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
        if (numChannels === 4) {
            return gl.RGBA32F;
        }
        return gl.R32F;
    }
    return gl.RGBA;
}
function getTextureFormat(gl, numChannels) {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return gl.RGBA;
    }
    if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
        if (numChannels === 4) {
            return gl.RGBA;
        }
        return gl.RED;
    }
    return gl.RGBA;
}
function getTextureType(gl) {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return gl.UNSIGNED_BYTE;
    }
    return gl.FLOAT;
}
function createAndConfigureTexture(gl, width, height, numChannels) {
    webgl_util.validateTextureSize(gl, width, height);
    var texture = webgl_util.createTexture(gl);
    var tex2d = gl.TEXTURE_2D;
    var internalFormat = getTextureInternalFormat(gl, numChannels);
    var format = getTextureFormat(gl, numChannels);
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(tex2d, texture); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST); });
    webgl_util.callAndCheck(gl, function () { return gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST); });
    webgl_util.callAndCheck(gl, function () { return gl.texImage2D(tex2d, 0, internalFormat, width, height, 0, format, getTextureType(gl), null); });
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
    return texture;
}
function createMatrixTexture(gl, rows, columns) {
    var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
    var numChannels = 1;
    return createAndConfigureTexture(gl, width, height, numChannels);
}
exports.createMatrixTexture = createMatrixTexture;
function createColorMatrixTexture(gl, rows, columns) {
    var _a = tex_util.getColorMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
    var numChannels = 4;
    return createAndConfigureTexture(gl, width, height, numChannels);
}
exports.createColorMatrixTexture = createColorMatrixTexture;
function createPackedMatrixTexture(gl, rows, columns) {
    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), width = _a[0], height = _a[1];
    var numChannels = 4;
    return createAndConfigureTexture(gl, width, height, numChannels);
}
exports.createPackedMatrixTexture = createPackedMatrixTexture;
function bindVertexProgramAttributeStreams(gl, program, vertexBuffer, attribLocations) {
    var posOffset = 0;
    var uvOffset = 3 * 4;
    var stride = (3 * 4) + (2 * 4);
    webgl_util.callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); });
    webgl_util.bindVertexBufferToProgramAttribute(gl, program, 'clipSpacePos', vertexBuffer, 3, stride, posOffset, attribLocations);
    webgl_util.bindVertexBufferToProgramAttribute(gl, program, 'uv', vertexBuffer, 2, stride, uvOffset, attribLocations);
}
exports.bindVertexProgramAttributeStreams = bindVertexProgramAttributeStreams;
function uploadPixelDataToTexture(gl, texture, pixels) {
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, texture); });
    webgl_util.callAndCheck(gl, function () { return gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels); });
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
}
exports.uploadPixelDataToTexture = uploadPixelDataToTexture;
function uploadDataToTexture(gl, texture, width, height, data, numChannels) {
    var textureFormat = getTextureFormat(gl, numChannels);
    webgl_util.validateTextureSize(gl, width, height);
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, texture); });
    webgl_util.callAndCheck(gl, function () { return gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, textureFormat, getTextureType(gl), data); });
    webgl_util.callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
}
function uploadMatrixToTexture(gl, texture, rows, columns, matrix, numChannels) {
    var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var unpackedArray;
    if (environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        var channelsPerTexture = numChannels === 1 ? webgl_util.getChannelsPerTexture() : numChannels;
        if (channelsPerTexture === 1) {
            unpackedArray = matrix;
        }
        else {
            unpackedArray =
                new Float32Array(tex_util.getUnpackedArraySizeFromMatrixSize(matrix.length, channelsPerTexture));
            tex_util.encodeMatrixToUnpackedArray(matrix, unpackedArray, channelsPerTexture);
        }
    }
    else {
        unpackedArray = tex_util.encodeFloatArray(matrix);
    }
    uploadDataToTexture(gl, texture, w, h, unpackedArray, numChannels);
}
exports.uploadMatrixToTexture = uploadMatrixToTexture;
function uploadMatrixToPackedTexture(gl, texture, rows, columns, matrix) {
    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var packedRGBA = new Float32Array(tex_util.getPackedRGBAArraySizeFromMatrixShape(rows, columns));
    tex_util.encodeMatrixToPackedRGBA(matrix, rows, columns, packedRGBA);
    var numChannels = 4;
    uploadDataToTexture(gl, texture, w, h, packedRGBA, numChannels);
}
exports.uploadMatrixToPackedTexture = uploadMatrixToPackedTexture;
function getDownloadTargetArrayBuffer(rows, columns, channelsPerTexture) {
    var isFloatTexture = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
    var downloadTarget;
    if (isFloatTexture) {
        downloadTarget =
            new Float32Array(tex_util.getUnpackedArraySizeFromMatrixSize(rows * columns, channelsPerTexture));
    }
    else {
        downloadTarget = new Uint8Array(rows * columns * channelsPerTexture);
    }
    return downloadTarget;
}
function decodeDownloadTargetArrayBuffer(downloadTarget, rows, columns, channelsPerPixel) {
    var isFloatTexture = environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED');
    if (isFloatTexture) {
        var matrix = new Float32Array(rows * columns);
        tex_util.decodeMatrixFromUnpackedArray(downloadTarget, matrix, channelsPerPixel);
        return matrix;
    }
    else {
        return tex_util.decodeToFloatArray(downloadTarget);
    }
}
function downloadMatrixFromOutputTextureAsync(gl, getBufferSubDataAsyncExtension, rows, columns) {
    return __awaiter(this, void 0, void 0, function () {
        var gl2, channelsPerPixel, downloadTarget, bufferSizeBytes, buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gl2 = gl;
                    channelsPerPixel = 4;
                    downloadTarget = getDownloadTargetArrayBuffer(rows, columns, channelsPerPixel);
                    bufferSizeBytes = downloadTarget instanceof Float32Array ?
                        downloadTarget.length * 4 :
                        downloadTarget;
                    buffer = gl.createBuffer();
                    webgl_util.callAndCheck(gl, function () { return gl.bindBuffer(gl2.PIXEL_PACK_BUFFER, buffer); });
                    webgl_util.callAndCheck(gl, function () { return gl.bufferData(gl2.PIXEL_PACK_BUFFER, bufferSizeBytes, gl.STATIC_DRAW); });
                    webgl_util.callAndCheck(gl, function () {
                        return gl2.readPixels(0, 0, columns, rows, gl.RGBA, getTextureType(gl), 0);
                    });
                    return [4, getBufferSubDataAsyncExtension.getBufferSubDataAsync(gl2.PIXEL_PACK_BUFFER, 0, downloadTarget)];
                case 1:
                    _a.sent();
                    return [2, decodeDownloadTargetArrayBuffer(downloadTarget, rows, columns, channelsPerPixel)];
            }
        });
    });
}
exports.downloadMatrixFromOutputTextureAsync = downloadMatrixFromOutputTextureAsync;
function downloadMatrixFromOutputTexture(gl, rows, columns) {
    var _a = tex_util.getUnpackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var channelsPerPixel = 4;
    var downloadTarget = getDownloadTargetArrayBuffer(rows, columns, channelsPerPixel);
    webgl_util.callAndCheck(gl, function () { return gl.readPixels(0, 0, w, h, gl.RGBA, getTextureType(gl), downloadTarget); });
    return decodeDownloadTargetArrayBuffer(downloadTarget, rows, columns, channelsPerPixel);
}
exports.downloadMatrixFromOutputTexture = downloadMatrixFromOutputTexture;
function downloadMatrixFromRGBAColorTexture(gl, rows, columns, channels) {
    var size = rows * columns * 4;
    var downloadTarget = new Uint8Array(size);
    webgl_util.callAndCheck(gl, function () { return gl.readPixels(0, 0, columns, rows, gl.RGBA, gl.UNSIGNED_BYTE, downloadTarget); });
    var packedRGBA = new Float32Array(size);
    for (var i = 0; i < downloadTarget.length; i++) {
        packedRGBA[i] = downloadTarget[i];
    }
    var matrix = new Float32Array(rows * columns * channels);
    tex_util.decodeMatrixFromUnpackedColorRGBAArray(packedRGBA, matrix, channels);
    return matrix;
}
exports.downloadMatrixFromRGBAColorTexture = downloadMatrixFromRGBAColorTexture;
function downloadMatrixFromPackedOutputTexture(gl, rows, columns) {
    var _a = tex_util.getPackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    var packedRGBA = new Float32Array(tex_util.getPackedRGBAArraySizeFromMatrixShape(rows, columns));
    webgl_util.callAndCheck(gl, function () { return gl.readPixels(0, 0, w, h, gl.RGBA, getTextureType(gl), packedRGBA); });
    var matrix = new Float32Array(rows * columns);
    return tex_util.decodeMatrixFromPackedRGBA(packedRGBA, rows, columns, matrix);
}
exports.downloadMatrixFromPackedOutputTexture = downloadMatrixFromPackedOutputTexture;

},{"../../environment":15,"./tex_util":89,"./webgl_util":93}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var axis_util = require("../axis_util");
var LogSumExpProgram = (function () {
    function LogSumExpProgram(shape, axes) {
        this.variableNames = ['A'];
        var _a = axis_util.computeOutAndReduceShapes(shape, axes), outShape = _a[0], reduceShape = _a[1];
        this.outputShape = outShape;
        this.numBatchDims = outShape.length;
        var size = util.sizeFromShape(reduceShape);
        var sizeNearestVec4 = Math.floor(size / 4) * 4;
        var sizeVec4Remainder = size % 4;
        var r1 = sizeNearestVec4;
        var r2 = sizeNearestVec4 + 1;
        var r3 = sizeNearestVec4 + 2;
        this.userCode = "\n      const vec2 ones2 = vec2(1, 1);\n      const vec3 ones3 = vec3(1, 1, 1);\n      const vec4 ones4 = vec4(1, 1, 1, 1);\n\n      void main() {\n        vec4 maxVec = vec4(getAFlat(0));\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          maxVec = max(maxVec, aVec);\n        }\n        if (" + (sizeVec4Remainder === 1) + ") {\n          maxVec = max(maxVec, vec4(maxVec.xyz, getAFlat(" + r1 + ")));\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          vec2 aVec = vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + "));\n          maxVec = max(maxVec, vec4(maxVec.xy, aVec));\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          vec3 aVec = vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + "));\n          maxVec = max(maxVec, vec4(maxVec.x, aVec));\n        }\n        float finalMax = max(maxVec.x, max(maxVec.y, max(maxVec.z, maxVec.w)));\n\n        float expSum = 0.0;\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          expSum += dot(ones4, exp(aVec - finalMax));\n        }\n        if (" + (sizeVec4Remainder === 1) + ") {\n          expSum += exp(getAFlat(" + r1 + ") - finalMax);\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          vec2 aVec = vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + "));\n          expSum += dot(ones2, exp(aVec - finalMax));\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          vec3 aVec = vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + "));\n          expSum += dot(ones3, exp(aVec - finalMax));\n        }\n\n        setOutput(finalMax + log(expSum));\n      }\n    ";
    }
    return LogSumExpProgram;
}());
exports.LogSumExpProgram = LogSumExpProgram;

},{"../../util":95,"../axis_util":54}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MaxPool2DBackpropProgram = (function () {
    function MaxPool2DBackpropProgram(convInfo) {
        this.variableNames = ['dy', 'maxPos'];
        this.outputShape = convInfo.inShape;
        var dyRows = convInfo.outShape[0];
        var dyCols = convInfo.outShape[1];
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var padTop = filterHeight - 1 - convInfo.padInfo.top;
        var padLeft = filterWidth - 1 - convInfo.padInfo.left;
        var lastIndex = filterHeight * filterWidth - 1;
        this.userCode = "\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int d = coords.z;\n\n        ivec2 dyRCCorner = coords.xy - pads;\n        int dyRCorner = dyRCCorner.x;\n        int dyCCorner = dyRCCorner.y;\n\n        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).\n        // ? = to be determined. : = across all values in that axis.\n        float dotProd = 0.0;\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          float dyR = float(dyRCorner + wR) / " + strideHeight + ".0;\n\n          if (dyR < 0.0 || dyR >= " + dyRows + ".0 || fract(dyR) > 0.0) {\n            continue;\n          }\n          int idyR = int(dyR);\n\n          for (int wC = 0; wC < " + filterWidth + "; wC++) {\n            float dyC = float(dyCCorner + wC) / " + strideWidth + ".0;\n\n            if (dyC < 0.0 || dyC >= " + dyCols + ".0 || fract(dyC) > 0.0) {\n              continue;\n            }\n            int idyC = int(dyC);\n\n            float dyValue = getDy(idyR, idyC, d);\n            int maxPosValue = " + lastIndex + " - int(getMaxPos(idyR, idyC, d));\n\n            // Get the current value, check it against the value from the\n            // position matrix.\n            int curPosValue = wR * " + filterWidth + " + wC;\n            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);\n\n            dotProd += dyValue * mask;\n          }\n        }\n        setOutput(dotProd);\n      }\n    ";
    }
    return MaxPool2DBackpropProgram;
}());
exports.MaxPool2DBackpropProgram = MaxPool2DBackpropProgram;

},{}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var axis_util = require("../axis_util");
var MinMaxProgram = (function () {
    function MinMaxProgram(shape, axes, op) {
        this.variableNames = ['A'];
        var _a = axis_util.computeOutAndReduceShapes(shape, axes), outShape = _a[0], reduceShape = _a[1];
        this.outputShape = outShape;
        this.numBatchDims = outShape.length;
        var size = util.sizeFromShape(reduceShape);
        var sizeNearestVec4 = Math.floor(size / 4) * 4;
        var sizeVec4Remainder = size % 4;
        var r1 = sizeNearestVec4;
        var r2 = sizeNearestVec4 + 1;
        var r3 = sizeNearestVec4 + 2;
        this.userCode = "\n      void main() {\n        vec4 bestVec = vec4(getAFlat(0));\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          if (hasNaN(aVec)) {\n            setOutput(getNaN(aVec));\n            return;\n          }\n          bestVec = " + op + "(bestVec, aVec);\n        }\n        vec4 aVec;\n        if (" + (sizeVec4Remainder === 1) + ") {\n          aVec = vec4(bestVec.xyz, getAFlat(" + r1 + "));\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          aVec = vec4(bestVec.xy, vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + ")));\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          aVec = vec4(bestVec.x,\n                      vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + ")));\n        }\n        if (" + (sizeVec4Remainder > 0) + ") {\n          if (hasNaN(aVec)) {\n            setOutput(getNaN(aVec));\n            return;\n          }\n          bestVec = " + op + "(bestVec, aVec);\n        }\n\n        float final = " + op + "(bestVec.x, " + op + "(bestVec.y,\n                      " + op + "(bestVec.z, bestVec.w)));\n        setOutput(final);\n      }\n    ";
    }
    return MinMaxProgram;
}());
exports.MinMaxProgram = MinMaxProgram;

},{"../../util":95,"../axis_util":54}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("../math");
var MatMulProgram = (function () {
    function MatMulProgram(aShape, bShape, aOrient, bOrient) {
        if (aOrient === void 0) { aOrient = math_1.MatrixOrientation.REGULAR; }
        if (bOrient === void 0) { bOrient = math_1.MatrixOrientation.REGULAR; }
        this.variableNames = ['matrixA', 'matrixB'];
        var outerShapeA = (aOrient === math_1.MatrixOrientation.REGULAR) ? aShape[0] : aShape[1];
        var outerShapeB = (bOrient === math_1.MatrixOrientation.REGULAR) ? bShape[1] : bShape[0];
        this.outputShape = [outerShapeA, outerShapeB];
        var sharedDim = (aOrient === math_1.MatrixOrientation.REGULAR ? aShape[1] : aShape[0]);
        var aSnippetFromOffset = function (vec4Offset, indexVar) {
            return (aOrient === math_1.MatrixOrientation.REGULAR) ?
                "aRow, " + indexVar + " + " + vec4Offset :
                indexVar + " + " + vec4Offset + ", aRow";
        };
        var bSnippetFromOffset = function (vec4Offset, indexVar) {
            return (bOrient === math_1.MatrixOrientation.REGULAR) ?
                indexVar + " + " + vec4Offset + ", bCol" :
                "bCol, " + indexVar + " + " + vec4Offset;
        };
        var sharedDimNearestVec4 = Math.floor(sharedDim / 4) * 4;
        var sharedDimVec4Remainder = sharedDim % 4;
        this.userCode = " float dotARowBCol(int aRow, int bCol) {\n      float result = 0.0;\n      for (int i = 0; i < " + sharedDimNearestVec4 + "; i += 4) {\n        vec4 a = vec4(\n          getMatrixA(" + aSnippetFromOffset(0, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(1, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(2, 'i') + "),\n          getMatrixA(" + aSnippetFromOffset(3, 'i') + ")\n        );\n        vec4 b = vec4(\n          getMatrixB(" + bSnippetFromOffset(0, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(1, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(2, 'i') + "),\n          getMatrixB(" + bSnippetFromOffset(3, 'i') + ")\n        );\n\n        result += dot(a, b);\n      }\n\n      if (" + (sharedDimVec4Remainder === 1) + ") {\n        result += getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + ") *\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + ");\n      } else if (" + (sharedDimVec4Remainder === 2) + ") {\n        vec2 a = vec2(\n          getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(1, sharedDimNearestVec4) + ")\n        );\n        vec2 b = vec2(\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(1, sharedDimNearestVec4) + ")\n        );\n        result += dot(a, b);\n      } else if (" + (sharedDimVec4Remainder === 3) + ") {\n        vec3 a = vec3(\n          getMatrixA(" + aSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(1, sharedDimNearestVec4) + "),\n          getMatrixA(" + aSnippetFromOffset(2, sharedDimNearestVec4) + ")\n        );\n        vec3 b = vec3(\n          getMatrixB(" + bSnippetFromOffset(0, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(1, sharedDimNearestVec4) + "),\n          getMatrixB(" + bSnippetFromOffset(2, sharedDimNearestVec4) + ")\n        );\n        result += dot(a, b);\n      }\n\n      return result;\n    }\n\n    void main() {\n      ivec2 resRC = getOutputCoords();\n      setOutput(dotARowBCol(resRC.x, resRC.y));\n    }\n    ";
    }
    return MatMulProgram;
}());
exports.MatMulProgram = MatMulProgram;

},{"../math":60}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MultinomialProgram = (function () {
    function MultinomialProgram(batchSize, numOutcomes, numSamples) {
        this.variableNames = ['probs'];
        this.outputShape = [batchSize, numSamples];
        this.numBatchDims = 1;
        this.userCode = "\n      uniform float seed;\n\n      void main() {\n        float r = random(seed);\n        float cdf = 0.0;\n\n        for (int i = 0; i < " + (numOutcomes - 1) + "; i++) {\n          cdf += getProbs(i);\n\n          if (r < cdf) {\n            setOutput(float(i));\n            return;\n          }\n        }\n\n        // If no other event happened, last event happened.\n        setOutput(float(" + (numOutcomes - 1) + "));\n      }\n    ";
    }
    MultinomialProgram.prototype.getCustomSetupFunc = function (seed) {
        var _this = this;
        return function (gpgpu, webGLProgram) {
            if (_this.seedLoc == null) {
                _this.seedLoc = gpgpu.getUniformLocation(webGLProgram, 'seed');
            }
            gpgpu.gl.uniform1f(_this.seedLoc, seed);
        };
    };
    return MultinomialProgram;
}());
exports.MultinomialProgram = MultinomialProgram;

},{}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OneHotProgram = (function () {
    function OneHotProgram(numIndices, depth, onValue, offValue) {
        this.variableNames = ['indices'];
        this.outputShape = [numIndices, depth];
        this.userCode = "\n      void main() {\n        ivec2 coords = getOutputCoords();\n        int index = round(getIndices(coords.x));\n        setOutput(mix(float(" + offValue + "), float(" + onValue + "),\n                      float(index == coords.y)));\n      }\n    ";
    }
    OneHotProgram.prototype.getCustomSetupFunc = function (seed) {
        var _this = this;
        return function (gpgpu, webGLProgram) {
            if (_this.seedLoc == null) {
                _this.seedLoc = gpgpu.getUniformLocation(webGLProgram, 'seed');
            }
            gpgpu.gl.uniform1f(_this.seedLoc, seed);
        };
    };
    return OneHotProgram;
}());
exports.OneHotProgram = OneHotProgram;

},{}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pool2DProgram = (function () {
    function Pool2DProgram(convInfo, poolType, computePositions) {
        this.variableNames = ['x'];
        if (poolType === 'avg' && computePositions) {
            throw new Error('Cannot compute positions for average pool.');
        }
        var filterHeight = convInfo.filterHeight;
        var filterWidth = convInfo.filterWidth;
        var strideHeight = convInfo.strideHeight;
        var strideWidth = convInfo.strideWidth;
        var xNumRows = convInfo.inShape[0];
        var xNumCols = convInfo.inShape[1];
        var padTop = convInfo.padInfo.top;
        var padLeft = convInfo.padInfo.left;
        this.outputShape = convInfo.outShape;
        var isAvgPool = poolType === 'avg';
        var initializationValue = '0.0';
        if (!isAvgPool) {
            if (poolType === 'min') {
                initializationValue = '1.0 / 0.0';
            }
            else {
                initializationValue = '-1.0 / 0.0';
            }
        }
        if (computePositions) {
            var compareOp_1 = poolType === 'min' ? '<=' : '>=';
            this.userCode = "\n        const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n        const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n\n        void main() {\n          ivec3 coords = getOutputCoords();\n          int d = coords.z;\n\n          ivec2 xRCCorner = coords.xy * strides - pads;\n          int xRCorner = xRCCorner.x;\n          int xCCorner = xRCCorner.y;\n\n          // max/min x(?, ?, d) to get y(yR, yC, d).\n          // ? = to be determined\n          float minMaxValue = 0.0;\n          float minMaxValueFound = 0.0;\n          int minMaxPosition = 0;\n          float avgValue = 0.0;\n\n          for (int wR = 0; wR < " + filterHeight + "; wR++) {\n            int xR = xRCorner + wR;\n\n            if (xR < 0 || xR >= " + xNumRows + ") {\n              continue;\n            }\n\n            for (int wC = 0; wC < " + filterWidth + "; wC++) {\n              int xC = xCCorner + wC;\n\n              if (xC < 0 || xC >= " + xNumCols + ") {\n                continue;\n              }\n\n              float value = getX(xR, xC, d);\n\n              if (isNaN(value)) {\n                setOutput(value);\n                return;\n              }\n\n              // If a min / max value has already been found, use it. If not,\n              // use the current value.\n              float currMinMaxValue = mix(\n                  value, minMaxValue, minMaxValueFound);\n              if (value " + compareOp_1 + " currMinMaxValue) {\n                minMaxValue = value;\n                minMaxValueFound = 1.0;\n                minMaxPosition = wR * " + filterWidth + " + wC;\n              }\n            }\n          }\n          setOutput(float(minMaxPosition));\n        }\n      ";
            return;
        }
        var compareOp = poolType === 'min' ? 'min' : 'max';
        var returnValue = poolType + "(" + poolType + "(" + poolType + "(" +
            'minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])';
        if (poolType === 'avg') {
            returnValue = "avgValue / " + filterHeight * filterWidth + ".0";
        }
        var filterWidthNearestVec4 = Math.floor(filterWidth / 4) * 4;
        var filterWidthVec4Remainder = filterWidth % 4;
        var updateSnippet = "\n      if (hasNaN(values)) {\n        setOutput(getNaN(values));\n        return;\n      }\n      if (" + isAvgPool + ") {\n        avgValue += dot(values, ones);\n      } else {\n        minMaxValue = " + compareOp + "(values, minMaxValue);\n      }\n    ";
        this.userCode = "\n      const ivec2 strides = ivec2(" + strideHeight + ", " + strideWidth + ");\n      const ivec2 pads = ivec2(" + padTop + ", " + padLeft + ");\n      const float initializationValue = " + initializationValue + ";\n      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);\n\n      float getValue(int xR, int xC, int d) {\n        if (xC < 0 || xC >= " + xNumCols + ") {\n          return initializationValue;\n        }\n        return getX(xR, xC, d);\n      }\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        int d = coords.z;\n\n        ivec2 xRCCorner = coords.xy * strides - pads;\n        int xRCorner = xRCCorner.x;\n        int xCCorner = xRCCorner.y;\n\n        // max/min x(?, ?, d) to get y(yR, yC, d).\n        // ? = to be determined\n        vec4 minMaxValue = vec4(" + initializationValue + ");\n        float avgValue = 0.0;\n\n        for (int wR = 0; wR < " + filterHeight + "; wR++) {\n          int xR = xRCorner + wR;\n\n          if (xR < 0 || xR >= " + xNumRows + ") {\n            continue;\n          }\n\n          for (int wC = 0; wC < " + filterWidthNearestVec4 + "; wC += 4) {\n            int xC = xCCorner + wC;\n\n            vec4 values = vec4(\n              getValue(xR, xC, d),\n              getValue(xR, xC + 1, d),\n              getValue(xR, xC + 2, d),\n              getValue(xR, xC + 3, d)\n            );\n\n            " + updateSnippet + "\n          }\n\n          int xC = xCCorner + " + filterWidthNearestVec4 + ";\n          if (" + (filterWidthVec4Remainder === 1) + ") {\n            vec4 values = vec4(\n              getValue(xR, xC, d),\n              initializationValue,\n              initializationValue,\n              initializationValue\n            );\n            " + updateSnippet + "\n          } else if (" + (filterWidthVec4Remainder === 2) + ") {\n            vec4 values = vec4(\n              getValue(xR, xC, d),\n              getValue(xR, xC + 1, d),\n              initializationValue,\n              initializationValue\n            );\n\n            " + updateSnippet + "\n          } else if (" + (filterWidthVec4Remainder === 3) + ") {\n            vec4 values = vec4(\n              getValue(xR, xC, d),\n              getValue(xR, xC + 1, d),\n              getValue(xR, xC + 2, d),\n              initializationValue\n            );\n\n            " + updateSnippet + "\n          }\n        }\n        setOutput(" + returnValue + ");\n      }\n    ";
    }
    return Pool2DProgram;
}());
exports.Pool2DProgram = Pool2DProgram;

},{}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("../../util");
var axis_util = require("../axis_util");
var ReduceSumProgram = (function () {
    function ReduceSumProgram(shape, axes) {
        this.variableNames = ['A'];
        var _a = axis_util.computeOutAndReduceShapes(shape, axes), outShape = _a[0], reduceShape = _a[1];
        this.outputShape = outShape;
        this.numBatchDims = outShape.length;
        var size = util.sizeFromShape(reduceShape);
        var sizeNearestVec4 = Math.floor(size / 4) * 4;
        var sizeVec4Remainder = size % 4;
        var r1 = sizeNearestVec4;
        var r2 = sizeNearestVec4 + 1;
        var r3 = sizeNearestVec4 + 2;
        this.userCode = "\n      void main() {\n        const vec2 ones2 = vec2(1);\n        const vec3 ones3 = vec3(1);\n        const vec4 ones4 = vec4(1);\n\n        float sum = 0.0;\n        for (int i = 0; i < " + sizeNearestVec4 + "; i += 4) {\n          vec4 aVec = vec4(getAFlat(i), getAFlat(i+1),\n                           getAFlat(i+2), getAFlat(i+3));\n          sum += dot(ones4, aVec);\n        }\n\n        if (" + (sizeVec4Remainder === 1) + ") {\n          sum += getAFlat(" + r1 + ");\n        } else if (" + (sizeVec4Remainder === 2) + ") {\n          vec2 aVec = vec2(getAFlat(" + r1 + "), getAFlat(" + r2 + "));\n          sum += dot(ones2, aVec);\n        } else if (" + (sizeVec4Remainder === 3) + ") {\n          vec3 aVec = vec3(getAFlat(" + r1 + "), getAFlat(" + r2 + "), getAFlat(" + r3 + "));\n          sum += dot(ones3, aVec);\n        }\n\n        setOutput(sum);\n      }\n    ";
    }
    return ReduceSumProgram;
}());
exports.ReduceSumProgram = ReduceSumProgram;

},{"../../util":95,"../axis_util":54}],85:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webgl_util = require("./webgl_util");
function getRenderRGBShader(gpgpu, destinationWidth) {
    var fragmentShaderSource = "\n    precision highp float;\n    uniform sampler2D source;\n    varying vec2 resultUV;\n\n    const float destinationWidth = " + destinationWidth + ".0;\n    const float a = 1.0;\n\n    void main() {\n      float xr = floor(resultUV.s * destinationWidth) * 3.0;\n      vec3 x = xr + vec3(0, 1, 2);\n\n      float sourceWidth = destinationWidth * 3.0;\n      vec3 u = (x + 0.5) / sourceWidth;\n      float v = 1.0 - resultUV.t;\n\n      float r = texture2D(source, vec2(u[0], v)).r;\n      float g = texture2D(source, vec2(u[1], v)).r;\n      float b = texture2D(source, vec2(u[2], v)).r;\n\n      gl_FragColor = vec4(r, g, b, a);\n    }";
    return gpgpu.createProgram(fragmentShaderSource);
}
exports.getRenderRGBShader = getRenderRGBShader;
function renderToCanvas(gpgpu, renderShader, sourceTex) {
    webgl_util.bindCanvasToFramebuffer(gpgpu.gl);
    renderToFramebuffer(gpgpu, renderShader, sourceTex);
}
exports.renderToCanvas = renderToCanvas;
function renderToFramebuffer(gpgpu, renderShader, sourceTex) {
    gpgpu.setProgram(renderShader);
    var sourceSamplerLocation = webgl_util.getProgramUniformLocationOrThrow(gpgpu.gl, renderShader, 'source');
    gpgpu.setInputMatrixTexture(sourceTex, sourceSamplerLocation, 0);
    gpgpu.executeProgram();
}
exports.renderToFramebuffer = renderToFramebuffer;

},{"./webgl_util":93}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResizeBilinear3DProgram = (function () {
    function ResizeBilinear3DProgram(inputShape, outputDimensionsRowCol, alignCorners) {
        this.variableNames = ['A'];
        this.outputShape = [];
        var depth = inputShape[2];
        this.outputShape =
            [outputDimensionsRowCol[0], outputDimensionsRowCol[1], depth];
        var effectiveInputShape = alignCorners ?
            [inputShape[0] - 1, inputShape[1] - 1, depth] :
            inputShape;
        var effectiveOutputShape = alignCorners ?
            [this.outputShape[0] - 1, this.outputShape[1] - 1, depth] :
            this.outputShape;
        this.userCode = "\n      const vec2 effectiveInputOverOutputRatioRC = vec2(\n          " + effectiveInputShape[0] / effectiveOutputShape[0] + ",\n          " + effectiveInputShape[1] / effectiveOutputShape[1] + ");\n      const vec2 inputShapeRC = vec2(" + inputShape[0] + ".0, " + inputShape[1] + ".0);\n\n      void main() {\n        ivec3 coords = getOutputCoords();\n        ivec2 yRC = coords.xy;\n        int d = coords.z;\n\n        // Fractional source index.\n        vec2 sourceFracIndexRC = vec2(yRC) * effectiveInputOverOutputRatioRC;\n\n        // Compute the four integer indices.\n        ivec2 sourceFloorRC = ivec2(sourceFracIndexRC);\n        ivec2 sourceCeilRC = ivec2(\n          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));\n\n        float topLeft = getA(sourceFloorRC.x, sourceFloorRC.y, d);\n        float bottomLeft = getA(sourceCeilRC.x, sourceFloorRC.y, d);\n        float topRight = getA(sourceFloorRC.x, sourceCeilRC.y, d);\n        float bottomRight = getA(sourceCeilRC.x, sourceCeilRC.y, d);\n\n        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);\n\n        float top = topLeft + (topRight - topLeft) * fracRC.y;\n        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;\n        float newValue = top + (bottom - top) * fracRC.x;\n\n        setOutput(newValue);\n      }\n    ";
    }
    return ResizeBilinear3DProgram;
}());
exports.ResizeBilinear3DProgram = ResizeBilinear3DProgram;

},{}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var util = require("../../util");
var broadcast_util = require("../broadcast_util");
var tex_util = require("./tex_util");
var tex_util_1 = require("./tex_util");
function updateBatchedShapeInfo(info, numBatchDims) {
    info.logicalShape = info.logicalShape.slice(numBatchDims);
}
function makeShader(inputsInfo, outputShape, userCode, broadcast, numBatchDims) {
    var batchSnippet = '';
    if (numBatchDims) {
        if (inputsInfo.length !== 1) {
            throw new Error("Batching for 2 or more inputs is not yet supported. " +
                ("Got " + inputsInfo.length + " inputs."));
        }
        updateBatchedShapeInfo(inputsInfo[0].shapeInfo, numBatchDims);
        updateBatchedShapeInfo(outputShape, numBatchDims);
        var inputSize = util.sizeFromShape(inputsInfo[0].shapeInfo.logicalShape);
        var outputSize = util.sizeFromShape(outputShape.logicalShape);
        batchSnippet = getBatchSnippet(inputSize, outputSize, outputShape.texShape);
    }
    var sampleSnippet = getSampleSnippet();
    var setOutputSnippet = getSetOutputSnippet();
    var inputPrefixSnippet = inputsInfo.map(function (x) { return "uniform sampler2D " + x.name + ";"; }).join('\n');
    var inputSamplingSnippet = inputsInfo
        .map(function (x) { return getInputSamplingSnippet(x, outputShape, broadcast, numBatchDims); })
        .join('\n');
    var outTexShape = outputShape.texShape;
    var outputSamplingSnippet = getOutputSamplingSnippet(outputShape.logicalShape, outTexShape);
    var source = [
        SHADER_PREFIX, batchSnippet, sampleSnippet, setOutputSnippet,
        inputPrefixSnippet, outputSamplingSnippet, inputSamplingSnippet, userCode
    ].join('\n');
    return source;
}
exports.makeShader = makeShader;
function getSampleSnippet() {
    return environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ?
        FLOAT_TEXTURE_SAMPLE_SNIPPET :
        UNSIGNED_BYTE_TEXTURE_SAMPLE_SNIPPET;
}
function getSetOutputSnippet() {
    return environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED') ?
        FLOAT_TEXTURE_SETOUTPUT_SNIPPET :
        UNSIGNED_BYTE_TEXTURE_SETOUTPUT_SNIPPET;
}
function getInputSamplingSnippet(inInfo, outShapeInfo, broadcast, numBatchDims) {
    var shape = inInfo.shapeInfo.logicalShape;
    var res = getSamplerFlat(inInfo, numBatchDims);
    switch (shape.length) {
        case 0:
            res += getSamplerScalar(inInfo);
            break;
        case 1:
            res += getSampler1D(inInfo);
            break;
        case 2:
            res += getSampler2D(inInfo);
            break;
        case 3:
            res += getSampler3D(inInfo);
            break;
        case 4:
            res += getSampler4D(inInfo);
            break;
        default:
            throw new Error(shape.length + "-D input sampling" +
                " is not yet supported");
    }
    if (broadcast ||
        util.arraysEqual(inInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape)) {
        res += getSamplerAtOutputCoords(inInfo, outShapeInfo, broadcast);
    }
    return res;
}
function getBatchSnippet(inputSize, outputSize, texShape) {
    return "\n    int getBatchOffset() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n          vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int b = index / " + outputSize + ";\n      return b * " + inputSize + ";\n    }\n  ";
}
function getOutputSamplingSnippet(outShape, outTexShape) {
    switch (outShape.length) {
        case 0:
            return getOutputScalarCoords();
        case 1:
            return getOutput1DCoords(outShape, outTexShape);
        case 2:
            return getOutput2DCoords(outShape, outTexShape);
        case 3:
            return getOutput3DCoords(outShape, outTexShape);
        case 4:
            return getOutput4DCoords(outShape, outTexShape);
        default:
            throw new Error(outShape.length + "-D output sampling is not yet supported");
    }
}
var SAMPLE_1D_SNIPPET = "\nvec2 UVfrom1D(int texNumR, int texNumC, int index) {\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var SAMPLE_2D_SNIPPET = "\nvec2 UVfrom2D(int texNumR, int texNumC, int numC, int row, int col) {\n  int index = row * numC + col;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var SAMPLE_3D_SNIPPET = "\nvec2 UVfrom3D(int texNumR, int texNumC, int stride0,\n    int stride1, int row, int col, int depth) {\n  // Explicitly use integer operations as dot() only works on floats.\n  int index = row * stride0 + col * stride1 + depth;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var SAMPLE_4D_SNIPPET = "\nvec2 UVfrom4D(int texNumR, int texNumC, int stride0,\n    int stride1, int stride2, int row, int col, int depth,\n    int depth2) {\n  // Explicitly use integer operations as dot() only works on floats.\n  int index = row * stride0 + col * stride1 + depth * stride2 + depth2;\n  int texR = index / texNumC;\n  int texC = index - texR * texNumC;\n  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);\n}\n";
var UNSIGNED_BYTE_TEXTURE_SAMPLE_SNIPPET = "\n  uniform float NaN;\n\n  const vec4 floatDeltas = vec4(\n      1.0,\n      1.0 / 255.0,\n      1.0 / (255.0 * 255.0),\n      1.0 / (255.0 * 255.0 * 255.0)\n  );\n  const float minValue = " + tex_util.FLOAT_MIN + ".0;\n  const float maxValue = " + tex_util.FLOAT_MAX + ".0;\n  const float range = (maxValue - minValue) / 255.0;\n  const vec2 dotRange = vec2(1.0, range);\n\n  float sample(sampler2D texture, vec2 uv) {\n    vec4 sampleValue = texture2D(texture, uv);\n    if (all(equal(sampleValue, vec4(" + tex_util.BYTE_NAN_VALUE + ")))) {\n      return NaN;\n    }\n\n    vec4 encValue = floor(sampleValue * 255.0 + 0.5);\n    float decodedValue = dot(encValue, floatDeltas);\n    return dot(vec2(minValue, decodedValue), dotRange);\n  }\n";
var UNSIGNED_BYTE_TEXTURE_SETOUTPUT_SNIPPET = "\n  const vec4 floatPowers = vec4(\n    1.0,\n    255.0,\n    255.0 * 255.0,\n    255.0 * 255.0 * 255.0\n  );\n  const vec2 recipRange = vec2(1.0/range);\n  const vec2 recipRange255 = vec2(1.0/(maxValue - minValue));\n\n  void setOutput(float decodedValue) {\n    if (isNaN(decodedValue)) {\n      gl_FragColor = vec4(" + tex_util.BYTE_NAN_VALUE + ");\n      return;\n    }\n\n    float a = dot(vec2(decodedValue, -minValue), recipRange);\n    float b = fract(a) * 255.0;\n    float c = fract(b) * 255.0;\n    float d = fract(c) * 255.0;\n    gl_FragColor = floor(vec4(a, b, c, d)) / 255.0;\n\n    // TODO(dsmilkov): Version above gets better accuracy but probably slower\n    // than the version below. Benchmark to determine if the accuracy is worth\n    // the cost.\n\n    // float normValue = dot(vec2(decodedValue, -minValue), recipRange255);\n    // vec4 f = normValue * floatPowers;\n    // gl_FragColor = floor(fract(f) * 255.0) / 255.0;\n  }\n";
var FLOAT_TEXTURE_SAMPLE_SNIPPET = "\n  float sample(sampler2D texture, vec2 uv) {\n    return texture2D(texture, uv).r;\n  }\n";
var FLOAT_TEXTURE_SETOUTPUT_SNIPPET = "\n  void setOutput(float val) {\n    gl_FragColor = vec4(val, 0, 0, 0);\n  }\n";
var SHADER_PREFIX = "\n  precision highp float;\n  precision highp int;\n  varying vec2 resultUV;\n  const vec2 halfCR = vec2(0.5, 0.5);\n\n  bool isNaN(float val) {\n    return val == val ? false : true;\n  }\n\n  bool hasNaN(vec4 values) {\n    return any(notEqual(values, values));\n  }\n\n  float getNaN(vec4 values) {\n    return dot(vec4(1), values);\n  }\n\n  int round(float value) {\n    return int(floor(value + 0.5));\n  }\n\n  int imod(int x, int y) {\n    return x - y * (x / y);\n  }\n\n  const vec2 randomConst = vec2(\n    23.14069263277926, // e^pi (Gelfond's constant)\n     2.665144142690225 // 2^sqrt(2) (Gelfond\u2013Schneider constant)\n  );\n\n  float random(float seed) {\n      return fract(cos(dot(resultUV * seed, randomConst)) * 12345.6789);\n  }\n\n  float sampleUVAndDepth(sampler2D texture, vec2 uv, int depth) {\n    float value;\n    if (depth == 0) {\n      value = texture2D(texture, uv).r;\n    } else if (depth == 1) {\n      value = texture2D(texture, uv).g;\n    } else if (depth == 2) {\n      value = texture2D(texture, uv).b;\n    } else if (depth == 3) {\n      value = texture2D(texture, uv).a;\n    }\n    return floor(value * 255.0 + 0.5);\n  }\n\n  " + SAMPLE_1D_SNIPPET + "\n  " + SAMPLE_2D_SNIPPET + "\n  " + SAMPLE_3D_SNIPPET + "\n  " + SAMPLE_4D_SNIPPET + "\n";
function getOutputScalarCoords() {
    return "\n    int getOutputCoords() {\n      return 0;\n    }\n  ";
}
function getOutput1DCoords(shape, texShape) {
    if (texShape[0] === 1) {
        return "\n      int getOutputCoords() {\n        return int(resultUV.x * " + texShape[1] + ".0);\n      }\n    ";
    }
    if (texShape[1] === 1) {
        return "\n      int getOutputCoords() {\n        return int(resultUV.y * " + texShape[0] + ".0);\n      }\n    ";
    }
    return "\n    int getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      return resTexRC.x * " + texShape[1] + " + resTexRC.y;\n    }\n  ";
}
function getOutput3DCoords(shape, texShape) {
    var stride0 = shape[1] * shape[2];
    var stride1 = shape[2];
    return "\n    ivec3 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int r = index / " + stride0 + ";\n      index -= r * " + stride0 + ";\n      int c = index / " + stride1 + ";\n      int d = index - c * " + stride1 + ";\n      return ivec3(r, c, d);\n    }\n  ";
}
function getOutput4DCoords(shape, texShape) {
    var stride2 = shape[3];
    var stride1 = shape[2] * stride2;
    var stride0 = shape[1] * stride1;
    return "\n    ivec4 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n        vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n\n      int r = index / " + stride0 + ";\n      index -= r * " + stride0 + ";\n\n      int c = index / " + stride1 + ";\n      index -= c * " + stride1 + ";\n\n      int d = index / " + stride2 + ";\n      int d2 = index - d * " + stride2 + ";\n\n      return ivec4(r, c, d, d2);\n    }\n  ";
}
function getOutput2DCoords(shape, texShape) {
    if (util.arraysEqual(shape, texShape)) {
        return "\n      ivec2 getOutputCoords() {\n        return ivec2(resultUV.yx * vec2(" + texShape[0] + ", " + texShape[1] + "));\n      }\n    ";
    }
    if (shape[1] === 1) {
        return "\n      ivec2 getOutputCoords() {\n        ivec2 resTexRC = ivec2(resultUV.yx *\n                               vec2(" + texShape[0] + ", " + texShape[1] + "));\n        int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n        return ivec2(index, 0);\n      }\n    ";
    }
    if (shape[0] === 1) {
        return "\n      ivec2 getOutputCoords() {\n        ivec2 resTexRC = ivec2(resultUV.yx *\n                               vec2(" + texShape[0] + ", " + texShape[1] + "));\n        int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n        return ivec2(0, index);\n      }\n    ";
    }
    return "\n    ivec2 getOutputCoords() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + texShape[0] + ", " + texShape[1] + "));\n      int index = resTexRC.x * " + texShape[1] + " + resTexRC.y;\n      int r = index / " + shape[1] + ";\n      int c = index - r * " + shape[1] + ";\n      return ivec2(r, c);\n    }\n  ";
}
function getSamplerScalar(inputInfo) {
    var texName = inputInfo.name;
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    return "\n    float " + funcName + "() {\n      return sample(" + texName + ", halfCR);\n    }\n  ";
}
function getSampler1D(inputInfo) {
    var texName = inputInfo.name;
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    return "\n    float " + funcName + "(int index) {\n      return " + funcName + "Flat(index);\n    }\n  ";
}
function getSampler2D(inputInfo) {
    var shape = inputInfo.shapeInfo.logicalShape;
    var texShape = inputInfo.shapeInfo.texShape;
    var texName = inputInfo.name;
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    if (util.arraysEqual(shape, texShape)) {
        return "\n    float " + funcName + "(int row, int col) {\n      vec2 uv = (vec2(col, row) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
    }
    if (tC === 1) {
        if (shape[0] === 1) {
            return "\n      float " + funcName + "(int row, int col) {\n        vec2 uv = vec2(0.5, (float(col) + 0.5) / " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
        }
        if (shape[1] === 1) {
            return "\n      float " + funcName + "(int row, int col) {\n        vec2 uv = vec2(0.5, (float(row) + 0.5) / " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
        }
        return "\n    float " + funcName + "(int row, int col) {\n      int index = row * " + shape[1] + " + col;\n      vec2 uv = vec2(0.5, (float(index) + 0.5) / " + tR + ".0);\n      return sample(" + texName + ", uv);\n    }\n  ";
    }
    if (tR === 1) {
        return "\n    float " + funcName + "(int row, int col) {\n      int index = row * " + shape[1] + " + col;\n      vec2 uv = vec2((float(index) + 0.5) / " + tC + ".0, 0.5);\n      return sample(" + texName + ", uv);\n    }\n  ";
    }
    return "\n  float " + funcName + "(int row, int col) {\n    vec2 uv = UVfrom2D(" + tR + ", " + tC + ", " + shape[1] + ", row, col);\n    return sample(" + texName + ", uv);\n  }\n";
}
function getSampler3D(inputInfo) {
    var texShape = inputInfo.shapeInfo.texShape;
    var shape = inputInfo.shapeInfo.logicalShape;
    var texName = inputInfo.name;
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    var stride0 = shape[1] * shape[2];
    var stride1 = shape[2];
    if (tC === stride0) {
        if (inputInfo.shapeInfo.textureType === tex_util_1.TextureType.DEFAULT) {
            return "\n        float " + funcName + "(int row, int col, int depth) {\n          int texR = row;\n          int texC = col * " + stride1 + " + depth;\n          vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n          return sample(" + texName + ", uv);\n        }\n      ";
        }
        else if (inputInfo.shapeInfo.textureType === tex_util_1.TextureType.RGBA_COLOR) {
            return "\n        float " + funcName + "(int row, int col, int depth) {\n          vec2 uv = (vec2(col, row) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n          return sampleUVAndDepth(" + texName + ", uv, depth);\n        }\n      ";
        }
        else {
            throw new Error("Unknown TextureType " + inputInfo.shapeInfo.textureType + ".");
        }
    }
    if (inputInfo.shapeInfo.textureType === tex_util_1.TextureType.DEFAULT) {
        return "\n      float " + funcName + "(int row, int col, int depth) {\n        vec2 uv = UVfrom3D(\n            " + tR + ", " + tC + ", " + stride0 + ", " + stride1 + ", row, col, depth);\n        return sample(" + texName + ", uv);\n      }\n  ";
    }
    else if (inputInfo.shapeInfo.textureType === tex_util_1.TextureType.RGBA_COLOR) {
        return "\n      float " + funcName + "(int row, int col, int depth) {\n        vec2 uv = UVfrom2D(" + tR + ", " + tC + ", " + shape[1] + ", row, col);\n        return sampleUVAndDepth(" + texName + ", uv, depth);\n      }\n    ";
    }
    else {
        throw new Error("Unknown TextureType " + inputInfo.shapeInfo.textureType + ".");
    }
}
function getSampler4D(inputInfo) {
    var shape = inputInfo.shapeInfo.logicalShape;
    var texShape = inputInfo.shapeInfo.texShape;
    var texName = inputInfo.name;
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1);
    var tR = texShape[0];
    var tC = texShape[1];
    var stride2 = shape[3];
    var stride1 = shape[2] * stride2;
    var stride0 = shape[1] * stride1;
    if (tC === stride0) {
        return "\n      float " + funcName + "(int row, int col, int depth, int depth2) {\n        int texR = row;\n        int texC = col * " + stride1 + " + depth * " + stride2 + " + depth2;\n        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(" + tC + ".0, " + tR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int row, int col, int depth, int depth2) {\n      vec2 uv = UVfrom4D(" + tR + ", " + tC + ", " + stride0 + ", " + stride1 + ", " + stride2 + ",\n          row, col, depth, depth2);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getSamplerFlat(inputInfo, numBatchDims) {
    var texName = inputInfo.name;
    var texShape = inputInfo.shapeInfo.texShape;
    var funcName = 'get' + texName.charAt(0).toUpperCase() + texName.slice(1) + 'Flat';
    var tNumR = texShape[0];
    var tNumC = texShape[1];
    var batchSnippet = '';
    if (numBatchDims) {
        batchSnippet = 'index += getBatchOffset();';
    }
    if (tNumC === 1 && tNumR === 1) {
        return "\n      float " + funcName + "(int index) {\n        " + batchSnippet + "\n        return sample(" + texName + ", halfCR);\n      }\n    ";
    }
    if (tNumC === 1) {
        return "\n      float " + funcName + "(int index) {\n        " + batchSnippet + "\n        vec2 uv = vec2(0.5, (float(index) + 0.5) / " + tNumR + ".0);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    if (tNumR === 1) {
        return "\n      float " + funcName + "(int index) {\n        " + batchSnippet + "\n        vec2 uv = vec2((float(index) + 0.5) / " + tNumC + ".0, 0.5);\n        return sample(" + texName + ", uv);\n      }\n    ";
    }
    return "\n    float " + funcName + "(int index) {\n      " + batchSnippet + "\n      vec2 uv = UVfrom1D(" + tNumR + ", " + tNumC + ", index);\n      return sample(" + texName + ", uv);\n    }\n  ";
}
function getBroadcastOutputCoordsSampler(inputInfo, outShapeInfo, texFuncSnippet, funcName) {
    var inRank = inputInfo.shapeInfo.logicalShape.length;
    var outRank = outShapeInfo.logicalShape.length;
    var type = 'int';
    if (outRank === 2) {
        type = 'ivec2';
    }
    else if (outRank === 3) {
        type = 'ivec3';
    }
    else if (outRank === 4) {
        type = 'ivec4';
    }
    var broadcastDims = broadcast_util.getBroadcastDims(inputInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape);
    var rankDiff = outRank - inRank;
    var coordsSnippet;
    if (inRank === 0) {
        coordsSnippet = '';
    }
    else if (outRank < 2 && broadcastDims.length >= 1) {
        coordsSnippet = 'coords = 0;';
    }
    else {
        coordsSnippet =
            broadcastDims.map(function (d) { return "coords[" + (d + rankDiff) + "] = 0;"; }).join('\n');
    }
    var unpackedCoordsSnippet = '';
    if (outRank < 2 && inRank > 0) {
        unpackedCoordsSnippet = 'coords';
    }
    else {
        unpackedCoordsSnippet = inputInfo.shapeInfo.logicalShape
            .map(function (s, i) { return "coords[" + (i + rankDiff) + "]"; })
            .join(', ');
    }
    return "\n    float " + funcName + "() {\n      " + type + " coords = getOutputCoords();\n      " + coordsSnippet + "\n      return get" + texFuncSnippet + "(" + unpackedCoordsSnippet + ");\n    }\n  ";
}
function getSamplerAtOutputCoords(inputInfo, outShapeInfo, supportsBroadcasting) {
    var inTexShape = inputInfo.shapeInfo.texShape;
    var texName = inputInfo.name;
    var isRGBAColorTexture = inputInfo.shapeInfo.textureType === tex_util_1.TextureType.RGBA_COLOR;
    var texFuncSnippet = texName.charAt(0).toUpperCase() + texName.slice(1);
    var funcName = 'get' + texFuncSnippet + 'AtOutCoords';
    var broadcastDims = broadcast_util.getBroadcastDims(inputInfo.shapeInfo.logicalShape, outShapeInfo.logicalShape);
    var inRank = inputInfo.shapeInfo.logicalShape.length;
    var outRank = outShapeInfo.logicalShape.length;
    var doBroadcast = supportsBroadcasting && ((outRank > inRank) || broadcastDims.length > 0);
    var broadcastOverOuter = broadcast_util.broadcastDimsAreOuter(broadcastDims);
    if (doBroadcast && !broadcastOverOuter) {
        return getBroadcastOutputCoordsSampler(inputInfo, outShapeInfo, texFuncSnippet, funcName);
    }
    var outTexShape = outShapeInfo.texShape;
    if (util.arraysEqual(inTexShape, outTexShape) && !isRGBAColorTexture) {
        return "\n      float " + funcName + "() {\n        return sample(" + texName + ", resultUV);\n      }\n    ";
    }
    var inTexExpandedShape = isRGBAColorTexture ?
        [inTexShape[0], inTexShape[1] * inputInfo.shapeInfo.logicalShape[2]] :
        inTexShape;
    var sampleSnippet = "return sample(" + texName + ", uv);";
    var rgbaColorSnippet = '';
    if (isRGBAColorTexture) {
        rgbaColorSnippet = "\n      int col = texC / " + inputInfo.shapeInfo.logicalShape[2] + ";\n      int texD = texC - col * " + inputInfo.shapeInfo.logicalShape[2] + ";\n      texC = col;\n    ";
        sampleSnippet = "return sampleUVAndDepth(" + texName + ", uv, texD);";
    }
    var inSize = util.sizeFromShape(inTexExpandedShape);
    var broadcastSnippet = '';
    if (doBroadcast && broadcastOverOuter) {
        broadcastSnippet = "\n        int mainPart = index / " + inSize + ";\n        index -= mainPart * " + inSize + ";\n      ";
    }
    return "\n    float " + funcName + "() {\n      ivec2 resTexRC = ivec2(resultUV.yx *\n                             vec2(" + outTexShape[0] + ", " + outTexShape[1] + "));\n      int index = resTexRC.x * " + outTexShape[1] + " + resTexRC.y;\n      " + broadcastSnippet + "\n      int texR = index / " + inTexExpandedShape[1] + ";\n      int texC = index - texR * " + inTexExpandedShape[1] + ";\n\n      " + rgbaColorSnippet + "\n\n      vec2 uv = (vec2(texC, texR) + halfCR) /\n                 vec2(" + inTexShape[1] + ".0, " + inTexShape[0] + ".0);\n\n      " + sampleSnippet + "\n    }\n  ";
}

},{"../../environment":15,"../../util":95,"../broadcast_util":55,"./tex_util":89}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SliceProgram = (function () {
    function SliceProgram(destSize) {
        this.variableNames = ['source'];
        this.outputShape = destSize;
        this.rank = destSize.length;
        var dtype = getDataType(this.rank);
        var sourceCoords = getCoords(this.rank);
        this.userCode = "\n      uniform " + dtype + " start;\n\n      void main() {\n        " + dtype + " sourceLoc = start + getOutputCoords();\n        setOutput(getSource(" + sourceCoords + "));\n      }\n    ";
    }
    SliceProgram.prototype.getCustomSetupFunc = function (start) {
        var _this = this;
        if (start.length !== this.rank) {
            throw Error("The rank (" + this.rank + ") of the program must match the " +
                ("length of start (" + start.length + ")"));
        }
        return function (gpgpu, webGLProgram) {
            if (_this.startLoc == null) {
                _this.startLoc = gpgpu.getUniformLocationNoThrow(webGLProgram, 'start');
                if (_this.startLoc == null) {
                    return;
                }
            }
            if (_this.rank === 1) {
                gpgpu.gl.uniform1i(_this.startLoc, start[0]);
            }
            else if (_this.rank === 2) {
                gpgpu.gl.uniform2i(_this.startLoc, start[0], start[1]);
            }
            else if (_this.rank === 3) {
                gpgpu.gl.uniform3i(_this.startLoc, start[0], start[1], start[2]);
            }
            else if (_this.rank === 4) {
                gpgpu.gl.uniform4i(_this.startLoc, start[0], start[1], start[2], start[3]);
            }
            else {
                throw Error("Slicing for rank " + _this.rank + " is not yet supported");
            }
        };
    };
    return SliceProgram;
}());
exports.SliceProgram = SliceProgram;
function getCoords(rank) {
    if (rank === 1) {
        return 'sourceLoc';
    }
    else if (rank === 2) {
        return 'sourceLoc.x, sourceLoc.y';
    }
    else if (rank === 3) {
        return 'sourceLoc.x, sourceLoc.y, sourceLoc.z';
    }
    else if (rank === 4) {
        return 'sourceLoc.x, sourceLoc.y, sourceLoc.z, sourceLoc.w';
    }
    else {
        throw Error("Slicing for rank " + rank + " is not yet supported");
    }
}
function getDataType(rank) {
    if (rank === 1) {
        return 'int';
    }
    else if (rank === 2) {
        return 'ivec2';
    }
    else if (rank === 3) {
        return 'ivec3';
    }
    else if (rank === 4) {
        return 'ivec4';
    }
    else {
        throw Error("Slicing for rank " + rank + " is not yet supported");
    }
}

},{}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextureType;
(function (TextureType) {
    TextureType[TextureType["DEFAULT"] = 0] = "DEFAULT";
    TextureType[TextureType["RGBA_COLOR"] = 1] = "RGBA_COLOR";
})(TextureType = exports.TextureType || (exports.TextureType = {}));
function getUnpackedMatrixTextureShapeWidthHeight(rows, columns) {
    return [columns, rows];
}
exports.getUnpackedMatrixTextureShapeWidthHeight = getUnpackedMatrixTextureShapeWidthHeight;
function getUnpackedArraySizeFromMatrixSize(matrixSize, channelsPerTexture) {
    return matrixSize * channelsPerTexture;
}
exports.getUnpackedArraySizeFromMatrixSize = getUnpackedArraySizeFromMatrixSize;
function getColorMatrixTextureShapeWidthHeight(rows, columns) {
    return [columns * 4, rows];
}
exports.getColorMatrixTextureShapeWidthHeight = getColorMatrixTextureShapeWidthHeight;
function getMatrixSizeFromUnpackedArraySize(unpackedSize, channelsPerTexture) {
    if (unpackedSize % channelsPerTexture !== 0) {
        throw new Error("unpackedSize (" + unpackedSize + ") must be a multiple of " +
            ("" + channelsPerTexture));
    }
    return unpackedSize / channelsPerTexture;
}
exports.getMatrixSizeFromUnpackedArraySize = getMatrixSizeFromUnpackedArraySize;
function encodeMatrixToUnpackedArray(matrix, unpackedArray, channelsPerTexture) {
    var requiredSize = getUnpackedArraySizeFromMatrixSize(matrix.length, channelsPerTexture);
    if (unpackedArray.length < requiredSize) {
        throw new Error("unpackedArray length (" + unpackedArray.length + ") must be >= " +
            ("" + requiredSize));
    }
    var dst = 0;
    for (var src = 0; src < matrix.length; ++src) {
        unpackedArray[dst] = matrix[src];
        dst += channelsPerTexture;
    }
}
exports.encodeMatrixToUnpackedArray = encodeMatrixToUnpackedArray;
exports.FLOAT_MAX = 20000;
exports.FLOAT_MIN = -exports.FLOAT_MAX;
var FLOAT_RANGE = (exports.FLOAT_MAX - exports.FLOAT_MIN) / 255;
var FLOAT_DELTAS = [1, 1 / 255, 1 / (255 * 255), 1 / (255 * 255 * 255)];
var FLOAT_POWERS = [1, 255, 255 * 255];
exports.BYTE_NAN_VALUE = 0;
function encodeFloatArray(floatArray) {
    var uintArray = new Uint8Array(floatArray.length * 4);
    var _loop_1 = function (i) {
        var value = floatArray[i / 4];
        if (isNaN(value)) {
            uintArray[i] = exports.BYTE_NAN_VALUE;
            uintArray[i + 1] = exports.BYTE_NAN_VALUE;
            uintArray[i + 2] = exports.BYTE_NAN_VALUE;
            uintArray[i + 3] = exports.BYTE_NAN_VALUE;
            return "continue";
        }
        var normalizedValue = (value - exports.FLOAT_MIN) / FLOAT_RANGE;
        var enc = FLOAT_POWERS.map(function (pow) { return pow * normalizedValue; });
        var buckets = enc.map(function (value) { return Math.floor((value % 1) * 255); });
        uintArray[i] = Math.floor(normalizedValue);
        uintArray[i + 1] = buckets[0];
        uintArray[i + 2] = buckets[1];
        uintArray[i + 3] = buckets[2];
    };
    for (var i = 0; i < uintArray.length; i += 4) {
        _loop_1(i);
    }
    return uintArray;
}
exports.encodeFloatArray = encodeFloatArray;
function decodeToFloatArray(uintArray) {
    var floatArray = new Float32Array(uintArray.length / 4);
    var _loop_2 = function (i) {
        if (uintArray[i] === exports.BYTE_NAN_VALUE &&
            uintArray[i + 1] === exports.BYTE_NAN_VALUE &&
            uintArray[i + 2] === exports.BYTE_NAN_VALUE &&
            uintArray[i + 3] === exports.BYTE_NAN_VALUE) {
            floatArray[i / 4] = NaN;
            return "continue";
        }
        var dot = 0;
        FLOAT_DELTAS.forEach(function (delta, j) {
            dot += delta * uintArray[i + j];
        });
        var value = dot * FLOAT_RANGE + exports.FLOAT_MIN;
        floatArray[i / 4] = value;
    };
    for (var i = 0; i < uintArray.length; i += 4) {
        _loop_2(i);
    }
    return floatArray;
}
exports.decodeToFloatArray = decodeToFloatArray;
function decodeMatrixFromUnpackedArray(unpackedArray, matrix, channelsPerTexture) {
    var requiredSize = getMatrixSizeFromUnpackedArraySize(unpackedArray.length, channelsPerTexture);
    if (matrix.length < requiredSize) {
        throw new Error("matrix length (" + matrix.length + ") must be >= " + requiredSize);
    }
    var dst = 0;
    for (var src = 0; src < unpackedArray.length; src += channelsPerTexture) {
        matrix[dst++] = unpackedArray[src];
    }
}
exports.decodeMatrixFromUnpackedArray = decodeMatrixFromUnpackedArray;
function decodeMatrixFromUnpackedColorRGBAArray(unpackedArray, matrix, channels) {
    var requiredSize = unpackedArray.length * channels / 4;
    if (matrix.length < requiredSize) {
        throw new Error("matrix length (" + matrix.length + ") must be >= " + requiredSize);
    }
    var dst = 0;
    for (var src = 0; src < unpackedArray.length; src += 4) {
        for (var c = 0; c < channels; c++) {
            matrix[dst++] = unpackedArray[src + c];
        }
    }
}
exports.decodeMatrixFromUnpackedColorRGBAArray = decodeMatrixFromUnpackedColorRGBAArray;
function getPackedMatrixTextureShapeWidthHeight(rows, columns) {
    return [Math.ceil(columns / 2), Math.ceil(rows / 2)];
}
exports.getPackedMatrixTextureShapeWidthHeight = getPackedMatrixTextureShapeWidthHeight;
function getPackedRGBAArraySizeFromMatrixShape(rows, columns) {
    var _a = getPackedMatrixTextureShapeWidthHeight(rows, columns), w = _a[0], h = _a[1];
    return w * h * 4;
}
exports.getPackedRGBAArraySizeFromMatrixShape = getPackedRGBAArraySizeFromMatrixShape;
function encodeMatrixToPackedRGBA(matrix, rows, columns, packedRGBA) {
    var requiredSize = getPackedRGBAArraySizeFromMatrixShape(rows, columns);
    if (packedRGBA.length < requiredSize) {
        throw new Error("packedRGBA length (" + packedRGBA.length + ") must be >= " + requiredSize);
    }
    var _a = getPackedMatrixTextureShapeWidthHeight(rows, columns), textureWidth = _a[0], textureHeight = _a[1];
    var oddWidth = (columns % 2) === 1;
    var oddHeight = (rows % 2) === 1;
    var widthInFullBlocks = Math.floor(columns / 2);
    var heightInFullBlocks = Math.floor(rows / 2);
    {
        var dstStride = (oddWidth ? 4 : 0);
        var oneRow = columns;
        var dst = 0;
        for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
            var matrixSrcRow = (blockY * 2 * columns);
            for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
                var matrixSrcCol = blockX * 2;
                var src = matrixSrcRow + matrixSrcCol;
                packedRGBA[dst] = matrix[src];
                packedRGBA[dst + 1] = matrix[src + 1];
                packedRGBA[dst + 2] = matrix[src + oneRow];
                packedRGBA[dst + 3] = matrix[src + oneRow + 1];
                dst += 4;
            }
            dst += dstStride;
        }
    }
    if (oddWidth) {
        var src = columns - 1;
        var dst = (textureWidth - 1) * 4;
        var srcStride = 2 * columns;
        var dstStride = textureWidth * 4;
        for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
            packedRGBA[dst] = matrix[src];
            packedRGBA[dst + 2] = matrix[src + columns];
            src += srcStride;
            dst += dstStride;
        }
    }
    if (oddHeight) {
        var src = (rows - 1) * columns;
        var dst = (textureHeight - 1) * textureWidth * 4;
        for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
            packedRGBA[dst++] = matrix[src++];
            packedRGBA[dst++] = matrix[src++];
            dst += 2;
        }
    }
    if (oddWidth && oddHeight) {
        packedRGBA[packedRGBA.length - 4] = matrix[matrix.length - 1];
    }
    return packedRGBA;
}
exports.encodeMatrixToPackedRGBA = encodeMatrixToPackedRGBA;
function decodeMatrixFromPackedRGBA(packedRGBA, rows, columns, matrix) {
    var requiredSize = rows * columns;
    if (requiredSize < matrix.length) {
        throw new Error("matrix length (" + matrix.length + ") must be >= " + requiredSize);
    }
    var oddWidth = (columns % 2) === 1;
    var oddHeight = (rows % 2) === 1;
    var widthInFullBlocks = Math.floor(columns / 2);
    var heightInFullBlocks = Math.floor(rows / 2);
    var _a = getPackedMatrixTextureShapeWidthHeight(rows, columns), textureWidth = _a[0], textureHeight = _a[1];
    {
        var srcStride = oddWidth ? 4 : 0;
        var dstStride = columns + (oddWidth ? 1 : 0);
        var src = 0;
        var dstRow1 = 0;
        var dstRow2 = columns;
        for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
            for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
                matrix[dstRow1++] = packedRGBA[src++];
                matrix[dstRow1++] = packedRGBA[src++];
                matrix[dstRow2++] = packedRGBA[src++];
                matrix[dstRow2++] = packedRGBA[src++];
            }
            src += srcStride;
            dstRow1 += dstStride;
            dstRow2 += dstStride;
        }
    }
    if (oddWidth) {
        var src = (textureWidth - 1) * 4;
        var dst = columns - 1;
        var srcStride = textureWidth * 4;
        var dstStride = 2 * columns;
        for (var blockY = 0; blockY < heightInFullBlocks; ++blockY) {
            matrix[dst] = packedRGBA[src];
            matrix[dst + columns] = packedRGBA[src + 2];
            src += srcStride;
            dst += dstStride;
        }
    }
    if (oddHeight) {
        var src = (textureHeight - 1) * textureWidth * 4;
        var dst = (rows - 1) * columns;
        for (var blockX = 0; blockX < widthInFullBlocks; ++blockX) {
            matrix[dst++] = packedRGBA[src++];
            matrix[dst++] = packedRGBA[src++];
            src += 2;
        }
    }
    if (oddWidth && oddHeight) {
        matrix[matrix.length - 1] = packedRGBA[packedRGBA.length - 4];
    }
    return matrix;
}
exports.decodeMatrixFromPackedRGBA = decodeMatrixFromPackedRGBA;

},{}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TextureManager = (function () {
    function TextureManager(gpgpu) {
        this.gpgpu = gpgpu;
        this.numUsedTextures = 0;
        this.numFreeTextures = 0;
        this.freeTextures = {};
        this.logEnabled = false;
        this.usedTextureCount = {};
    }
    TextureManager.prototype.acquireTexture = function (shapeRC) {
        var shapeKey = getKeyFromTextureShape(shapeRC);
        if (!(shapeKey in this.freeTextures)) {
            this.freeTextures[shapeKey] = [];
        }
        if (!(shapeKey in this.usedTextureCount)) {
            this.usedTextureCount[shapeKey] = 0;
        }
        this.usedTextureCount[shapeKey]++;
        if (this.freeTextures[shapeKey].length > 0) {
            this.numFreeTextures--;
            this.numUsedTextures++;
            this.log();
            return this.freeTextures[shapeKey].shift();
        }
        this.numUsedTextures++;
        this.log();
        return this.gpgpu.createMatrixTexture(shapeRC[0], shapeRC[1]);
    };
    TextureManager.prototype.releaseTexture = function (texture, shape) {
        var shapeKey = getKeyFromTextureShape(shape);
        if (!(shapeKey in this.freeTextures)) {
            this.freeTextures[shapeKey] = [];
        }
        this.freeTextures[shapeKey].push(texture);
        this.numFreeTextures++;
        this.numUsedTextures--;
        this.usedTextureCount[shapeKey]--;
        this.log();
    };
    TextureManager.prototype.log = function () {
        if (!this.logEnabled) {
            return;
        }
        var total = this.numFreeTextures + this.numUsedTextures;
        console.log('Free/Used', this.numFreeTextures + " / " + this.numUsedTextures, "(" + total + ")");
    };
    TextureManager.prototype.getNumUsedTextures = function () {
        return this.numUsedTextures;
    };
    TextureManager.prototype.getNumFreeTextures = function () {
        return this.numFreeTextures;
    };
    TextureManager.prototype.dispose = function () {
        for (var shape in this.freeTextures) {
            if (this.freeTextures.hasOwnProperty(shape)) {
                for (var i = 0; i < this.freeTextures[shape].length; i++) {
                    this.gpgpu.deleteMatrixTexture(this.freeTextures[shape][i]);
                }
            }
        }
    };
    return TextureManager;
}());
exports.TextureManager = TextureManager;
function getKeyFromTextureShape(shapeRowsCol) {
    return shapeRowsCol[0] + "_" + shapeRowsCol[1];
}

},{}],91:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TransposeProgram = (function () {
    function TransposeProgram(aShape, newDim) {
        this.variableNames = ['A'];
        var outputShape = new Array(aShape.length);
        for (var i = 0; i < outputShape.length; i++) {
            outputShape[i] = aShape[newDim[i]];
        }
        this.outputShape = outputShape;
        this.rank = outputShape.length;
        var dtype = getDataType(this.rank);
        var switched = getSwitchedCoords(newDim);
        this.userCode = "\n    void main() {\n      " + dtype + " resRC = getOutputCoords();\n      setOutput(getA(" + switched + "));\n    }\n    ";
    }
    return TransposeProgram;
}());
exports.TransposeProgram = TransposeProgram;
function getSwitchedCoords(newDim) {
    var rank = newDim.length;
    if (rank > 4) {
        throw Error("Transpose for rank " + rank + " is not yet supported");
    }
    var originalOrder = ['resRC.x', 'resRC.y', 'resRC.z', 'resRC.w'];
    var switchedCoords = new Array(rank);
    for (var i = 0; i < newDim.length; i++) {
        switchedCoords[newDim[i]] = originalOrder[i];
    }
    return switchedCoords.join();
}
function getDataType(rank) {
    if (rank === 1) {
        return 'int';
    }
    else if (rank === 2) {
        return 'ivec2';
    }
    else if (rank === 3) {
        return 'ivec3';
    }
    else if (rank === 4) {
        return 'ivec4';
    }
    else {
        throw Error("Transpose for rank " + rank + " is not yet supported");
    }
}

},{}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnaryOpProgram = (function () {
    function UnaryOpProgram(aShape, opSnippet) {
        this.variableNames = ['A'];
        this.outputShape = aShape;
        this.userCode = "\n      float unaryOperation(float x) {\n        " + opSnippet + "\n      }\n\n      void main() {\n        float x = getAAtOutCoords();\n        float y = unaryOperation(x);\n\n        setOutput(y);\n      }\n    ";
    }
    return UnaryOpProgram;
}());
exports.UnaryOpProgram = UnaryOpProgram;
exports.CHECK_NAN_SNIPPET = "\n  if (isNaN(x)) {\n    return x;\n  }\n";
exports.ABS = "\n  return abs(x);\n";
exports.RELU = "\n  return (x < 0.0) ? 0.0 : x;\n";
exports.ELU = "\n  return (x >= 0.0) ? x : (exp(x) - 1.0);\n";
function LEAKY_RELU(alpha) {
    return "\n  return (x >= 0.0) ? x : " + alpha + " * x;\n  ";
}
exports.LEAKY_RELU = LEAKY_RELU;
exports.STEP = "\n  return (x == x) ? (x > 0.0 ? 1.0 : 0.0) : x;\n";
exports.NEG = "\n  return -x;\n";
exports.CEIL = "\n  return ceil(x);\n";
exports.FLOOR = "\n  return floor(x);\n";
exports.EXP = "\n  return exp(x);\n";
exports.LOG = "\n  return log(x);\n";
exports.SQRT = exports.CHECK_NAN_SNIPPET + "\n  return sqrt(x);\n";
exports.SIGMOID = "\n  return 1.0 / (1.0 + exp(-1.0 * x));\n";
exports.SIN = exports.CHECK_NAN_SNIPPET + "\n  return sin(x);\n";
exports.COS = exports.CHECK_NAN_SNIPPET + "\n  return cos(x);\n";
exports.TAN = "\n  return tan(x);\n";
exports.ASIN = exports.CHECK_NAN_SNIPPET + "\n  return asin(x);\n";
exports.ACOS = exports.CHECK_NAN_SNIPPET + "\n  return acos(x);\n";
exports.ATAN = exports.CHECK_NAN_SNIPPET + "\n  return atan(x);\n";
exports.SINH = "\n  float e2x = exp(x);\n  return (e2x - 1.0 / e2x) / 2.0;\n";
exports.COSH = "\n  float e2x = exp(-x);\n  return (e2x + 1.0 / e2x) / 2.0;\n";
exports.TANH = "\n  float e2x = exp(-2.0 * abs(x));\n  return sign(x) * (1.0 - e2x) / (1.0 + e2x);\n";
exports.SQUARE = "\n  return x * x;\n";

},{}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MAX_TEXTURE_SIZE = null;
var util = require("../../util");
var environment_1 = require("../../environment");
function createWebGLRenderingContext(attributes) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return createWebGLRenderingContextFromCanvas(canvas, attributes);
}
exports.createWebGLRenderingContext = createWebGLRenderingContext;
function createWebGLRenderingContextFromCanvas(canvas, attributes) {
    var gl;
    var webglVersion = environment_1.ENV.get('WEBGL_VERSION');
    if (webglVersion === 2) {
        gl = canvas.getContext('webgl2', attributes);
    }
    else if (webglVersion === 1) {
        gl = (canvas.getContext('webgl', attributes) ||
            canvas.getContext('experimental-webgl', attributes));
    }
    if (webglVersion === 0 || gl == null) {
        throw new Error('This browser does not support WebGL.');
    }
    return gl;
}
exports.createWebGLRenderingContextFromCanvas = createWebGLRenderingContextFromCanvas;
function callAndCheck(gl, func) {
    var returnValue = func();
    checkWebGLError(gl);
    return returnValue;
}
exports.callAndCheck = callAndCheck;
var webGLDebugErrorCheckingEnabled = false;
function enableDebugWebGLErrorChecking(enabled) {
    webGLDebugErrorCheckingEnabled = enabled;
}
exports.enableDebugWebGLErrorChecking = enableDebugWebGLErrorChecking;
function checkWebGLError(gl) {
    if (webGLDebugErrorCheckingEnabled) {
        var error = gl.getError();
        if (error !== gl.NO_ERROR) {
            throw new Error('WebGL Error: ' + getWebGLErrorMessage(gl, error));
        }
    }
}
exports.checkWebGLError = checkWebGLError;
function getWebGLErrorMessage(gl, status) {
    switch (status) {
        case gl.NO_ERROR:
            return 'NO_ERROR';
        case gl.INVALID_ENUM:
            return 'INVALID_ENUM';
        case gl.INVALID_VALUE:
            return 'INVALID_VALUE';
        case gl.INVALID_OPERATION:
            return 'INVALID_OPERATION';
        case gl.INVALID_FRAMEBUFFER_OPERATION:
            return 'INVALID_FRAMEBUFFER_OPERATION';
        case gl.OUT_OF_MEMORY:
            return 'OUT_OF_MEMORY';
        case gl.CONTEXT_LOST_WEBGL:
            return 'CONTEXT_LOST_WEBGL';
        default:
            return "Unknown error code " + status;
    }
}
exports.getWebGLErrorMessage = getWebGLErrorMessage;
function getExtensionOrThrow(gl, extensionName) {
    return throwIfNull(gl, function () { return gl.getExtension(extensionName); }, 'Extension "' + extensionName + '" not supported on this browser.');
}
exports.getExtensionOrThrow = getExtensionOrThrow;
function createVertexShader(gl, vertexShaderSource) {
    var vertexShader = throwIfNull(gl, function () { return gl.createShader(gl.VERTEX_SHADER); }, 'Unable to create vertex WebGLShader.');
    callAndCheck(gl, function () { return gl.shaderSource(vertexShader, vertexShaderSource); });
    callAndCheck(gl, function () { return gl.compileShader(vertexShader); });
    if (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) === false) {
        console.log(gl.getShaderInfoLog(vertexShader));
        throw new Error('Failed to compile vertex shader.');
    }
    return vertexShader;
}
exports.createVertexShader = createVertexShader;
function createFragmentShader(gl, fragmentShaderSource) {
    var fragmentShader = throwIfNull(gl, function () { return gl.createShader(gl.FRAGMENT_SHADER); }, 'Unable to create fragment WebGLShader.');
    callAndCheck(gl, function () { return gl.shaderSource(fragmentShader, fragmentShaderSource); });
    callAndCheck(gl, function () { return gl.compileShader(fragmentShader); });
    if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) === false) {
        logShaderSourceAndInfoLog(fragmentShaderSource, gl.getShaderInfoLog(fragmentShader));
        throw new Error('Failed to compile fragment shader.');
    }
    return fragmentShader;
}
exports.createFragmentShader = createFragmentShader;
var lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;
function logShaderSourceAndInfoLog(shaderSource, shaderInfoLog) {
    var lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
    if (lineNumberRegexResult == null) {
        console.log("Couldn't parse line number in error: " + shaderInfoLog);
        console.log(shaderSource);
        return;
    }
    var lineNumber = +lineNumberRegexResult[1];
    var shaderLines = shaderSource.split('\n');
    var pad = shaderLines.length.toString().length + 2;
    var linesWithLineNumbers = shaderLines.map(function (line, lineNumber) {
        return util.rightPad((lineNumber + 1).toString(), pad) + line;
    });
    var maxLineLength = 0;
    for (var i = 0; i < linesWithLineNumbers.length; i++) {
        maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
    }
    var beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
    var errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
    var afterErrorLines = linesWithLineNumbers.slice(lineNumber);
    console.log(beforeErrorLines.join('\n'));
    console.log(shaderInfoLog.split('\n')[0]);
    console.log("%c " + util.rightPad(errorLine[0], maxLineLength), 'border:1px solid red; background-color:#e3d2d2; color:#a61717');
    console.log(afterErrorLines.join('\n'));
}
function createProgram(gl) {
    return throwIfNull(gl, function () { return gl.createProgram(); }, 'Unable to create WebGLProgram.');
}
exports.createProgram = createProgram;
function linkProgram(gl, program) {
    callAndCheck(gl, function () { return gl.linkProgram(program); });
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
        console.log(gl.getProgramInfoLog(program));
        throw new Error('Failed to link vertex and fragment shaders.');
    }
}
exports.linkProgram = linkProgram;
function validateProgram(gl, program) {
    callAndCheck(gl, function () { return gl.validateProgram(program); });
    if (gl.getProgramParameter(program, gl.VALIDATE_STATUS) === false) {
        console.log(gl.getProgramInfoLog(program));
        throw new Error('Shader program validation failed.');
    }
}
exports.validateProgram = validateProgram;
function createStaticVertexBuffer(gl, data) {
    var buffer = throwIfNull(gl, function () { return gl.createBuffer(); }, 'Unable to create WebGLBuffer');
    callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, buffer); });
    callAndCheck(gl, function () { return gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); });
    return buffer;
}
exports.createStaticVertexBuffer = createStaticVertexBuffer;
function createStaticIndexBuffer(gl, data) {
    var buffer = throwIfNull(gl, function () { return gl.createBuffer(); }, 'Unable to create WebGLBuffer');
    callAndCheck(gl, function () { return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer); });
    callAndCheck(gl, function () { return gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW); });
    return buffer;
}
exports.createStaticIndexBuffer = createStaticIndexBuffer;
function queryMaxTextureSize(gl) {
    if (MAX_TEXTURE_SIZE != null) {
        return MAX_TEXTURE_SIZE;
    }
    MAX_TEXTURE_SIZE =
        callAndCheck(gl, function () { return gl.getParameter(gl.MAX_TEXTURE_SIZE); });
    return MAX_TEXTURE_SIZE;
}
exports.queryMaxTextureSize = queryMaxTextureSize;
function getChannelsPerTexture() {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return 4;
    }
    if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
        return 1;
    }
    return 4;
}
exports.getChannelsPerTexture = getChannelsPerTexture;
function createTexture(gl) {
    return throwIfNull(gl, function () { return gl.createTexture(); }, 'Unable to create WebGLTexture.');
}
exports.createTexture = createTexture;
function validateTextureSize(gl, width, height) {
    var maxTextureSize = queryMaxTextureSize(gl);
    if ((width <= 0) || (height <= 0)) {
        var requested = "[" + width + "x" + height + "]";
        throw new Error('Requested texture size ' + requested + ' is invalid.');
    }
    if ((width > maxTextureSize) || (height > maxTextureSize)) {
        var requested = "[" + width + "x" + height + "]";
        var max = "[" + maxTextureSize + "x" + maxTextureSize + "]";
        throw new Error('Requested texture size ' + requested +
            ' greater than WebGL maximum on this browser / GPU ' + max + '.');
    }
}
exports.validateTextureSize = validateTextureSize;
function createFramebuffer(gl) {
    return throwIfNull(gl, function () { return gl.createFramebuffer(); }, 'Unable to create WebGLFramebuffer.');
}
exports.createFramebuffer = createFramebuffer;
function bindVertexBufferToProgramAttribute(gl, program, attribute, buffer, arrayEntriesPerItem, itemStrideInBytes, itemOffsetInBytes, attribLocations) {
    var loc = -1;
    if ((attribLocations != null) && (attribute in attribLocations)) {
        loc = attribLocations[attribute];
    }
    else {
        loc = gl.getAttribLocation(program, attribute);
    }
    if (loc === -1) {
        return;
    }
    callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, buffer); });
    callAndCheck(gl, function () { return gl.vertexAttribPointer(loc, arrayEntriesPerItem, gl.FLOAT, false, itemStrideInBytes, itemOffsetInBytes); });
    callAndCheck(gl, function () { return gl.enableVertexAttribArray(loc); });
}
exports.bindVertexBufferToProgramAttribute = bindVertexBufferToProgramAttribute;
function bindTextureUnit(gl, texture, textureUnit) {
    validateTextureUnit(gl, textureUnit);
    callAndCheck(gl, function () { return gl.activeTexture(gl.TEXTURE0 + textureUnit); });
    callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, texture); });
}
exports.bindTextureUnit = bindTextureUnit;
function unbindTextureUnit(gl, textureUnit) {
    validateTextureUnit(gl, textureUnit);
    callAndCheck(gl, function () { return gl.activeTexture(gl.TEXTURE0 + textureUnit); });
    callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
}
exports.unbindTextureUnit = unbindTextureUnit;
function getProgramUniformLocationOrThrow(gl, program, uniformName) {
    return throwIfNull(gl, function () { return gl.getUniformLocation(program, uniformName); }, 'uniform "' + uniformName + '" not present in program.');
}
exports.getProgramUniformLocationOrThrow = getProgramUniformLocationOrThrow;
function bindTextureToProgramUniformSampler(gl, program, texture, uniformSamplerLocation, textureUnit) {
    callAndCheck(gl, function () { return bindTextureUnit(gl, texture, textureUnit); });
    callAndCheck(gl, function () { return gl.uniform1i(uniformSamplerLocation, textureUnit); });
}
exports.bindTextureToProgramUniformSampler = bindTextureToProgramUniformSampler;
function bindCanvasToFramebuffer(gl) {
    callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, null); });
    callAndCheck(gl, function () { return gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); });
    callAndCheck(gl, function () { return gl.scissor(0, 0, gl.canvas.width, gl.canvas.height); });
}
exports.bindCanvasToFramebuffer = bindCanvasToFramebuffer;
function bindColorTextureToFramebuffer(gl, texture, framebuffer) {
    callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); });
    callAndCheck(gl, function () { return gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0); });
}
exports.bindColorTextureToFramebuffer = bindColorTextureToFramebuffer;
function unbindColorTextureFromFramebuffer(gl, framebuffer) {
    callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); });
    callAndCheck(gl, function () { return gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0); });
}
exports.unbindColorTextureFromFramebuffer = unbindColorTextureFromFramebuffer;
function validateFramebuffer(gl) {
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error('Error binding framebuffer: ' + getFramebufferErrorMessage(gl, status));
    }
}
exports.validateFramebuffer = validateFramebuffer;
function getFramebufferErrorMessage(gl, status) {
    switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
        case gl.FRAMEBUFFER_UNSUPPORTED:
            return 'FRAMEBUFFER_UNSUPPORTED';
        default:
            return "unknown error " + status;
    }
}
exports.getFramebufferErrorMessage = getFramebufferErrorMessage;
function throwIfNull(gl, returnTOrNull, failureMessage) {
    var tOrNull = callAndCheck(gl, function () { return returnTOrNull(); });
    if (tOrNull == null) {
        throw new Error(failureMessage);
    }
    return tOrNull;
}
function validateTextureUnit(gl, textureUnit) {
    var maxTextureUnit = gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS - 1;
    var glTextureUnit = textureUnit + gl.TEXTURE0;
    if (glTextureUnit < gl.TEXTURE0 || glTextureUnit > maxTextureUnit) {
        var textureUnitRange = "[gl.TEXTURE0, gl.TEXTURE" + maxTextureUnit + "]";
        throw new Error("textureUnit must be in " + textureUnitRange + ".");
    }
}
function getTextureShapeFromLogicalShape(gl, logShape, preferredTexShape) {
    var maxTexSize = queryMaxTextureSize(gl);
    var size = util.sizeFromShape(logShape);
    if (preferredTexShape != null) {
        var sizePreferred = util.sizeFromShape(preferredTexShape);
        util.assert(size === sizePreferred, "Size of shape (" + size + ") must match size of " +
            ("preferredShape (" + sizePreferred + ")"));
        if (preferredTexShape[0] <= maxTexSize &&
            preferredTexShape[1] <= maxTexSize) {
            return preferredTexShape;
        }
    }
    if (logShape.length <= 1 && size <= maxTexSize) {
        return [size, 1];
    }
    else if (logShape.length === 2 && logShape[0] <= maxTexSize &&
        logShape[1] <= maxTexSize) {
        return logShape;
    }
    else if (logShape.length === 3 && logShape[0] <= maxTexSize &&
        logShape[1] * logShape[2] <= maxTexSize) {
        return [logShape[0], logShape[1] * logShape[2]];
    }
    else if (logShape.length === 4 && logShape[0] <= maxTexSize &&
        logShape[1] * logShape[2] * logShape[3] <= maxTexSize) {
        return [logShape[0], logShape[1] * logShape[2] * logShape[3]];
    }
    else {
        return util.sizeToSquarishShape(size);
    }
}
exports.getTextureShapeFromLogicalShape = getTextureShapeFromLogicalShape;

},{"../../environment":15,"../../util":95}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment = require("./environment");
var environment_1 = require("./environment");
var math_cpu_1 = require("./math/math_cpu");
var math_gpu_1 = require("./math/math_gpu");
var util = require("./util");
exports.TEST_EPSILON = 1e-2;
function expectArraysClose(actual, expected, epsilon) {
    if (epsilon === void 0) { epsilon = exports.TEST_EPSILON; }
    var aType = actual.constructor.name;
    var bType = expected.constructor.name;
    if (aType !== bType) {
        throw new Error("Arrays are of different type " + aType + " vs " + bType);
    }
    if (actual.length !== expected.length) {
        throw new Error("Matrices have different lengths (" + actual.length + " vs " +
            (expected.length + ")."));
    }
    for (var i = 0; i < expected.length; ++i) {
        var a = actual[i];
        var e = expected[i];
        if (!areClose(a, e, epsilon)) {
            var actualStr = "actual[" + i + "] === " + a;
            var expectedStr = "expected[" + i + "] === " + e;
            throw new Error('Arrays differ: ' + actualStr + ', ' + expectedStr);
        }
    }
}
exports.expectArraysClose = expectArraysClose;
function expectNumbersClose(a, e, epsilon) {
    if (epsilon === void 0) { epsilon = exports.TEST_EPSILON; }
    if (!areClose(a, e, epsilon)) {
        throw new Error("Numbers differ: actual === " + a + ", expected === " + e);
    }
}
exports.expectNumbersClose = expectNumbersClose;
function areClose(a, e, epsilon) {
    if (isNaN(a) && isNaN(e)) {
        return true;
    }
    if (isNaN(a) || isNaN(e) || Math.abs(a - e) > epsilon) {
        return false;
    }
    return true;
}
function randomArrayInRange(n, minValue, maxValue) {
    var v = new Float32Array(n);
    var range = maxValue - minValue;
    for (var i = 0; i < n; ++i) {
        v[i] = (Math.random() * range) + minValue;
    }
    return v;
}
exports.randomArrayInRange = randomArrayInRange;
function makeIdentity(n) {
    var i = new Float32Array(n * n);
    for (var j = 0; j < n; ++j) {
        i[(j * n) + j] = 1;
    }
    return i;
}
exports.makeIdentity = makeIdentity;
function cpuMultiplyMatrix(a, aRow, aCol, b, bRow, bCol) {
    var result = new Float32Array(aRow * bCol);
    for (var r = 0; r < aRow; ++r) {
        var aOffset = (r * aCol);
        var cOffset = (r * bCol);
        for (var c = 0; c < bCol; ++c) {
            var d = 0;
            for (var k = 0; k < aCol; ++k) {
                d += a[aOffset + k] * b[(k * bCol) + c];
            }
            result[cOffset + c] = d;
        }
    }
    return result;
}
exports.cpuMultiplyMatrix = cpuMultiplyMatrix;
function cpuDotProduct(a, b) {
    if (a.length !== b.length) {
        throw new Error('cpuDotProduct: incompatible vectors.');
    }
    var d = 0;
    for (var i = 0; i < a.length; ++i) {
        d += a[i] * b[i];
    }
    return d;
}
exports.cpuDotProduct = cpuDotProduct;
function describeMathCPU(name, tests, featuresList) {
    var testNameBase = 'math_cpu.' + name;
    describeWithFeaturesAndExecutor(testNameBase, tests, function (testName, tests, features) { return executeMathTests(testName, tests, function () { return new math_cpu_1.NDArrayMathCPU(); }, features); }, featuresList);
}
exports.describeMathCPU = describeMathCPU;
function describeMathGPU(name, tests, featuresList) {
    var testNameBase = 'math_gpu.' + name;
    describeWithFeaturesAndExecutor(testNameBase, tests, function (testName, tests, features) { return executeMathTests(testName, tests, function () { return new math_gpu_1.NDArrayMathGPU(); }, features); }, featuresList);
}
exports.describeMathGPU = describeMathGPU;
function describeCustom(name, tests, featuresList, customBeforeEach, customAfterEach) {
    describeWithFeaturesAndExecutor(name, [tests], function (testName, tests, features) { return executeTests(testName, tests, features, customBeforeEach, customAfterEach); }, featuresList);
}
exports.describeCustom = describeCustom;
function describeWithFeaturesAndExecutor(testNameBase, tests, executor, featuresList) {
    if (featuresList != null) {
        featuresList.forEach(function (features) {
            var testName = testNameBase + ' ' + JSON.stringify(features);
            executor(testName, tests, features);
        });
    }
    else {
        executor(testNameBase, tests);
    }
}
var PROMISE_IT = function (name, testFunc) {
    it(name, function (done) {
        var result = testFunc();
        if (result instanceof Promise) {
            result.then(done, function (e) {
                fail(e);
                done();
            });
        }
        else {
            done();
        }
    });
};
function executeMathTests(testName, tests, mathFactory, features) {
    var math;
    var customBeforeEach = function () {
        math = mathFactory();
        math.startScope();
    };
    var customAfterEach = function () {
        math.endScope(null);
        math.dispose();
    };
    var customIt = function (name, testFunc) {
        PROMISE_IT(name, function () { return testFunc(math); });
    };
    executeTests(testName, tests, features, customBeforeEach, customAfterEach, customIt);
}
exports.executeMathTests = executeMathTests;
function executeTests(testName, tests, features, customBeforeEach, customAfterEach, customIt) {
    if (customIt === void 0) { customIt = PROMISE_IT; }
    describe(testName, function () {
        beforeEach(function () {
            if (features != null) {
                environment.setEnvironment(new environment_1.Environment(features));
            }
            if (customBeforeEach != null) {
                customBeforeEach();
            }
        });
        afterEach(function () {
            if (customAfterEach != null) {
                customAfterEach();
            }
            if (features != null) {
                environment.setEnvironment(new environment_1.Environment());
            }
        });
        tests.forEach(function (test) { return test(customIt); });
    });
}
exports.executeTests = executeTests;
function assertIsNan(val, dtype) {
    if (!util.isValNaN(val, dtype)) {
        throw new Error("Value " + val + " does not represent NaN for dtype " + dtype);
    }
}
exports.assertIsNan = assertIsNan;

},{"./environment":15,"./math/math_cpu":61,"./math/math_gpu":62,"./util":95}],95:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shuffle(array) {
    var counter = array.length;
    var temp = 0;
    var index = 0;
    while (counter > 0) {
        index = (Math.random() * counter) | 0;
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
}
exports.shuffle = shuffle;
function clamp(min, x, max) {
    return Math.max(min, Math.min(x, max));
}
exports.clamp = clamp;
function randUniform(a, b) {
    return Math.random() * (b - a) + a;
}
exports.randUniform = randUniform;
function randGauss(mean, stdDev, truncated) {
    if (mean === void 0) { mean = 0; }
    if (stdDev === void 0) { stdDev = 1; }
    if (truncated === void 0) { truncated = false; }
    var v1, v2, s;
    do {
        v1 = 2 * Math.random() - 1;
        v2 = 2 * Math.random() - 1;
        s = v1 * v1 + v2 * v2;
    } while (s > 1);
    var result = Math.sqrt(-2 * Math.log(s) / s) * v1;
    if (truncated && Math.abs(result) > 2) {
        return randGauss(mean, stdDev, true);
    }
    return mean + stdDev * result;
}
exports.randGauss = randGauss;
function distSquared(a, b) {
    var result = 0;
    for (var i = 0; i < a.length; i++) {
        var diff = Number(a[i]) - Number(b[i]);
        result += diff * diff;
    }
    return result;
}
exports.distSquared = distSquared;
function assert(expr, msg) {
    if (!expr) {
        throw new Error(msg);
    }
}
exports.assert = assert;
function assertShapesMatch(shapeA, shapeB, errorMessagePrefix) {
    if (errorMessagePrefix === void 0) { errorMessagePrefix = ''; }
    assert(arraysEqual(shapeA, shapeB), errorMessagePrefix + ("Shapes " + shapeA + " and " + shapeB + " must match"));
}
exports.assertShapesMatch = assertShapesMatch;
function flatten(arr, ret) {
    if (ret === void 0) { ret = []; }
    if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; ++i) {
            flatten(arr[i], ret);
        }
    }
    else {
        ret.push(arr);
    }
    return ret;
}
exports.flatten = flatten;
function inferShape(arr) {
    var shape = [];
    while (arr instanceof Array) {
        shape.push(arr.length);
        arr = arr[0];
    }
    return shape;
}
exports.inferShape = inferShape;
function sizeFromShape(shape) {
    if (shape.length === 0) {
        return 1;
    }
    var size = shape[0];
    for (var i = 1; i < shape.length; i++) {
        size *= shape[i];
    }
    return size;
}
exports.sizeFromShape = sizeFromShape;
function isScalarShape(shape) {
    return shape.length === 0;
}
exports.isScalarShape = isScalarShape;
function arraysEqual(n1, n2) {
    if (n1.length !== n2.length) {
        return false;
    }
    for (var i = 0; i < n1.length; i++) {
        if (n1[i] !== n2[i]) {
            return false;
        }
    }
    return true;
}
exports.arraysEqual = arraysEqual;
function isInt(a) {
    return a % 1 === 0;
}
exports.isInt = isInt;
function tanh(x) {
    if (Math.tanh != null) {
        return Math.tanh(x);
    }
    if (x === Infinity) {
        return 1;
    }
    else if (x === -Infinity) {
        return -1;
    }
    else {
        var e2x = Math.exp(2 * x);
        return (e2x - 1) / (e2x + 1);
    }
}
exports.tanh = tanh;
function sizeToSquarishShape(size) {
    for (var a = Math.floor(Math.sqrt(size)); a > 1; --a) {
        if (size % a === 0) {
            return [a, size / a];
        }
    }
    return [1, size];
}
exports.sizeToSquarishShape = sizeToSquarishShape;
function createShuffledIndices(n) {
    var shuffledIndices = new Uint32Array(n);
    for (var i = 0; i < n; ++i) {
        shuffledIndices[i] = i;
    }
    shuffle(shuffledIndices);
    return shuffledIndices;
}
exports.createShuffledIndices = createShuffledIndices;
function rightPad(a, size) {
    if (size <= a.length) {
        return a;
    }
    return a + ' '.repeat(size - a.length);
}
exports.rightPad = rightPad;
function repeatedTry(checkFn, delayFn, maxCounter) {
    if (delayFn === void 0) { delayFn = function (counter) { return 0; }; }
    return new Promise(function (resolve, reject) {
        var tryCount = 0;
        var tryFn = function () {
            if (checkFn()) {
                resolve();
                return;
            }
            tryCount++;
            var nextBackoff = delayFn(tryCount);
            if (maxCounter != null && tryCount >= maxCounter) {
                reject();
                return;
            }
            setTimeout(tryFn, nextBackoff);
        };
        setTimeout(tryFn, 0);
    });
}
exports.repeatedTry = repeatedTry;
function getQueryParams(queryString) {
    var params = {};
    queryString.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g, function (s) {
        var t = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            t[_i - 1] = arguments[_i];
        }
        decodeParam(params, t[0], t[1]);
        return t.join('=');
    });
    return params;
}
exports.getQueryParams = getQueryParams;
function decodeParam(params, name, value) {
    params[decodeURIComponent(name)] = decodeURIComponent(value || '');
}
function inferFromImplicitShape(shape, size) {
    var shapeProd = 1;
    var implicitIdx = -1;
    for (var i = 0; i < shape.length; ++i) {
        if (shape[i] > 0) {
            shapeProd *= shape[i];
        }
        else if (shape[i] === -1) {
            if (implicitIdx !== -1) {
                throw Error("Shapes can only have 1 implicit size. " +
                    ("Found -1 at dim " + implicitIdx + " and dim " + i));
            }
            implicitIdx = i;
        }
        else if (shape[i] <= 0) {
            throw Error("Shapes can not be <= 0. Found " + shape[i] + " at dim " + i);
        }
    }
    if (implicitIdx === -1) {
        if (size > 0 && size !== shapeProd) {
            throw Error("Size (" + size + ") must match the product of shape " + shape);
        }
        return shape;
    }
    if (size % shapeProd !== 0) {
        throw Error("The implicit shape can't be a fractional number. " +
            ("Got " + size + " / " + shapeProd));
    }
    var newShape = shape.slice();
    newShape[implicitIdx] = size / shapeProd;
    return newShape;
}
exports.inferFromImplicitShape = inferFromImplicitShape;
exports.NAN_INT32 = 1 << 31;
exports.NAN_BOOL = 255;
exports.NAN_FLOAT32 = NaN;
function getNaN(dtype) {
    if (dtype === 'float32') {
        return exports.NAN_FLOAT32;
    }
    else if (dtype === 'int32') {
        return exports.NAN_INT32;
    }
    else if (dtype === 'bool') {
        return exports.NAN_BOOL;
    }
    else {
        throw new Error("Unknown dtype " + dtype);
    }
}
exports.getNaN = getNaN;
function isValNaN(val, dtype) {
    if (dtype === 'float32') {
        return isNaN(val);
    }
    else if (dtype === 'int32') {
        return val === exports.NAN_INT32;
    }
    else if (dtype === 'bool') {
        return val === exports.NAN_BOOL;
    }
    else {
        throw new Error("Unknown dtype " + dtype);
    }
}
exports.isValNaN = isValNaN;

},{}],96:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var version = '0.3.7';
exports.version = version;

},{}]},{},[51])(51)
});