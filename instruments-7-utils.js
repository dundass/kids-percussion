var TwinklGame = TwinklGame || {};

(function (tw) {

    "use strict";

    // polyfills

    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());   // window.requestAnimationFrame for IE9 (IE11's emulator fails tho...)

    if (typeof Object.create !== "function") {
        Object.create = function (proto, propertiesObject) {
            if (typeof proto !== 'object' && typeof proto !== 'function') {
                throw new TypeError('Object prototype may only be an Object: ' + proto);
            } else if (proto === null) {
                throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
            }

            if (typeof propertiesObject !== 'undefined') {
                throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");
            }

            function F() {}
            F.prototype = proto;

            return new F();
        };
    }

    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }

    if (!Object.entries) {
        Object.entries = function( obj ){
            var ownProps = Object.keys( obj ),
                i = ownProps.length,
                resArray = new Array(i); // preallocate the Array
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]];

            return resArray;
        };
    }

    Object.values = Object.values ? Object.values : function(obj) {
        var allowedTypes = ["[object String]", "[object Object]", "[object Array]", "[object Function]"];
        var objType = Object.prototype.toString.call(obj);

        if(obj === null || typeof obj === "undefined") {
            throw new TypeError("Cannot convert undefined or null to object");
        } else if(!~allowedTypes.indexOf(objType)) {
            return [];
        } else {
            // if ES6 is supported
            if (Object.keys) {
                return Object.keys(obj).map(function (key) {
                    return obj[key];
                });
            }

            var result = [];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    result.push(obj[prop]);
                }
            }

            return result;
        }
    };

    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            'use strict';
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }

    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: function(searchElement, fromIndex) {

                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                // 1. Let O be ? ToObject(this value).
                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If len is 0, return false.
                if (len === 0) {
                    return false;
                }

                // 4. Let n be ? ToInteger(fromIndex).
                //    (If fromIndex is undefined, this step produces the value 0.)
                var n = fromIndex | 0;

                // 5. If n ≥ 0, then
                //  a. Let k be n.
                // 6. Else n < 0,
                //  a. Let k be len + n.
                //  b. If k < 0, let k be 0.
                var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

                function sameValueZero(x, y) {
                    return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
                }

                // 7. Repeat, while k < len
                while (k < len) {
                    // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                    // b. If SameValueZero(searchElement, elementK) is true, return true.
                    if (sameValueZero(o[k], searchElement)) {
                        return true;
                    }
                    // c. Increase k by 1.
                    k++;
                }

                // 8. Return false
                return false;
            }
        });
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function (func, thisArg) {
            'use strict';
            if (!((typeof func === 'Function' || typeof func === 'function') && this))
                throw new TypeError();

            var len = this.length >>> 0,
                res = new Array(len), // preallocate array
                t = this, c = 0, i = -1;
            if (thisArg === undefined)
                while (++i !== len)
                    // checks to see if the key was set
                    if (i in this)
                        if (func(t[i], i, t))
                            res[c++] = t[i];
                        else
                            while (++i !== len)
                                // checks to see if the key was set
                                if (i in this)
                                    if (func.call(thisArg, t[i], i, t))
                                        res[c++] = t[i];

            res.length = c; // shrink down array to proper size
            return res;
        };
    }

    if (!Array.prototype.fill) {
        Object.defineProperty(Array.prototype, 'fill', {
            value: function(value) {

                // Steps 1-2.
                if (this == null) {
                    throw new TypeError('this is null or not defined');
                }

                var O = Object(this);

                // Steps 3-5.
                var len = O.length >>> 0;

                // Steps 6-7.
                var start = arguments[1];
                var relativeStart = start >> 0;

                // Step 8.
                var k = relativeStart < 0 ?
                    Math.max(len + relativeStart, 0) :
                    Math.min(relativeStart, len);

                // Steps 9-10.
                var end = arguments[2];
                var relativeEnd = end === undefined ?
                    len : end >> 0;

                // Step 11.
                var final = relativeEnd < 0 ?
                    Math.max(len + relativeEnd, 0) :
                    Math.min(relativeEnd, len);

                // Step 12.
                while (k < final) {
                    O[k] = value;
                    k++;
                }

                // Step 13.
                return O;
            }
        });
    }

    if (!Array.from) {
        Array.from = (function () {
            var toStr = Object.prototype.toString;
            var isCallable = function (fn) {
                return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
            };
            var toInteger = function (value) {
                var number = Number(value);
                if (isNaN(number)) { return 0; }
                if (number === 0 || !isFinite(number)) { return number; }
                return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
            };
            var maxSafeInteger = Math.pow(2, 53) - 1;
            var toLength = function (value) {
                var len = toInteger(value);
                return Math.min(Math.max(len, 0), maxSafeInteger);
            };

            // The length property of the from method is 1.
            return function from(arrayLike/*, mapFn, thisArg */) {
                // 1. Let C be the this value.
                var C = this;

                // 2. Let items be ToObject(arrayLike).
                var items = Object(arrayLike);

                // 3. ReturnIfAbrupt(items).
                if (arrayLike == null) {
                    throw new TypeError('Array.from requires an array-like object - not null or undefined');
                }

                // 4. If mapfn is undefined, then let mapping be false.
                var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
                var T;
                if (typeof mapFn !== 'undefined') {
                    // 5. else
                    // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                    if (!isCallable(mapFn)) {
                        throw new TypeError('Array.from: when provided, the second argument must be a function');
                    }

                    // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    if (arguments.length > 2) {
                        T = arguments[2];
                    }
                }

                // 10. Let lenValue be Get(items, "length").
                // 11. Let len be ToLength(lenValue).
                var len = toLength(items.length);

                // 13. If IsConstructor(C) is true, then
                // 13. a. Let A be the result of calling the [[Construct]] internal method
                // of C with an argument list containing the single item len.
                // 14. a. Else, Let A be ArrayCreate(len).
                var A = isCallable(C) ? Object(new C(len)) : new Array(len);

                // 16. Let k be 0.
                var k = 0;
                // 17. Repeat, while k < len… (also steps a - h)
                var kValue;
                while (k < len) {
                    kValue = items[k];
                    if (mapFn) {
                        A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                    } else {
                        A[k] = kValue;
                    }
                    k += 1;
                }
                // 18. Let putStatus be Put(A, "length", len, true).
                A.length = len;
                // 20. Return A.
                return A;
            };
        }());
    }

    Number.isInteger = Number.isInteger || function(value) {
        return typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value;
    };

    if (!Array.prototype.flat) {
        Object.defineProperty(Array.prototype, 'flat', {
            configurable: true,
            value: function flat () {
                var depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);

                return depth ? Array.prototype.reduce.call(this, function (acc, cur) {
                    if (Array.isArray(cur)) {
                        acc.push.apply(acc, flat.call(cur, depth - 1));
                    } else {
                        acc.push(cur);
                    }

                    return acc;
                }, []) : Array.prototype.slice.call(this);
            },
            writable: true
        });
    }

    if (!Array.prototype.flatMap) {
        Object.defineProperty(Array.prototype, 'flatMap', {
            configurable: true,
            value: function flatMap (callback) {
                return Array.prototype.map.apply(this, arguments).flat();
            },
            writable: true
        });
    }

    // utils

    var noOp = function () {};

    var pipe = function pipe() {
        for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
            fns[_key] = arguments[_key];
        }

        return function (x) {
            return fns.reduce(function (y, f) {
                return f(y);
            }, x);
        };
    };

    var extend = function (subclass, superclass) {
        subclass.prototype = Object.create(superclass.prototype);
        subclass.prototype.constructor = subclass;
    };

    var getObjectFromArray = function (id, array) {
        return array.filter(function (item) {
            return item.hasOwnProperty('id') && item.id === id;
        })[0];
    };

    var getParamNames = function (func) {
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var ARGUMENT_NAMES = /([^\s,]+)/g;
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if(result === null)
            result = [];
        return result;
    };

    var hasClass = function (el, className) {
        if (el.classList) return el.classList.contains(className);
        else return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    };

    var addClass = function (el, className) {
        if (el.classList) el.classList.add(className);
        else el.className += ' ' + className;
    };

    var removeClass = function (el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    };

    var toggleClass = function (el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0) classes.splice(existingIndex, 1);
            else classes.push(className);

            el.className = classes.join(' ');
        }
    };

    var compareArrays = function (a, b) {
        // TODO: optimize + expose ?
        return JSON.stringify(a) === JSON.stringify(b);
    };

    // svg

    var loadSvgIntoElementFromURL = function(elem, url, callback) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.send();
        req.onload = function (ev) {
            elem.innerHTML = req.responseText;
            if(callback && typeof callback === 'function') callback();
        }
    };

    var svgToCanvas = function(sourceSVG, targetCanvas, onloadCallback) {
        onloadCallback = onloadCallback || function() {
            // after this, Canvas’ origin-clean is DIRTY
            ctx.drawImage(img, 0, 0);
        };

        // https://developer.mozilla.org/en/XMLSerializer
        var svg_xml = (new XMLSerializer()).serializeToString(sourceSVG);
        var ctx = targetCanvas.getContext('2d');

        // this is just a JavaScript (HTML) image
        var img = new Image();
        // http://en.wikipedia.org/wiki/SVG#Native_support
        // https://developer.mozilla.org/en/DOM/window.btoa

        img.src = "data:image/svg+xml;base64," + btoa(svg_xml);

        img.onload = onloadCallback;
    };

    var svgToPoints = function(path, limit) {
        var arr = [];
        var len = path.getTotalLength();
        var p;

        for (var i = 0; i < len; i++) {
            p = path.getPointAtLength(i);
            arr.push([parseFloat(p.x), parseFloat(p.y)]);
        }

        limit = limit || arr.length;
        var factor = arr.length / limit | 0;

        return arr.filter(function(x, i) { return i % factor === 0 });
    };

    // fullscreen

    var supportFullScreen = function () {
        var doc = document.documentElement;

        return ('requestFullscreen' in doc) ||
            ('mozRequestFullScreen' in doc && document.mozFullScreenEnabled) ||
            ('webkitRequestFullScreen' in doc);
    };

    var makeFullScreen = function (element) {

        if(typeof element === 'undefined')
            element = (document.querySelector('.go-resource-wrapper') || document.getElementById('wrapper') || document.getElementById('container') || document.getElementById('animation_container') || document.documentElement);

        // potentially hide the 'help' pink icon (esp for iOS fake)

        if(supportFullScreen() && !isIOSDevice()) {
        // if(supportFullScreen()) {

            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            } else if(element.requestFullScreen) {
                element.requestFullScreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }

        } else {

            // fake the funk
            var el = document.querySelector('.go-resource-wrapper')
                || document.querySelector('.go-resource-viewer')
                || document.getElementById('wrapper')
                || document.getElementById('container');

            if(el) el.classList.add('fake-fullscreen');

        }

        // android phones - lock orientation to landscape
        if(document.body.className.includes('is-mobile-device'))
            screen.orientation.lock('landscape-primary');

        track(eventNames.fullscreen, 1);
    };

    var leaveFullScreen = function () {

        if(supportFullScreen() && !isIOSDevice()) {

            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

        } else {

            // unfake the funk
            var el = document.querySelector('.go-resource-wrapper')
                || document.querySelector('.go-resource-viewer')
                || document.getElementById('wrapper')
                || document.getElementById('container');

            if(el) el.classList.remove('fake-fullscreen');
        }

        // android phones - release orientation lock
        if(document.body.className.includes('is-mobile-device'))
            screen.orientation.unlock();

        track(eventNames.fullscreen, 0);
    };

    var addFullscreenCallback = function (callback) {

        if(typeof $ === 'undefined') {
            console.warn('cant add callback to fullscreenchange - have u added jQuery ?');
        }
        else {
            $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', callback);
        }

    };

    // positional

    var clientWidth = function () {
        return Math.max(window.innerWidth, document.documentElement.clientWidth);
    };
    var clientHeight = function () {
        return Math.max(window.innerHeight, document.documentElement.clientHeight);
    };

    var getMouseOnCanvas = function (canvas, ev) {
        var rect = canvas.getBoundingClientRect(),
            scaleX = canvas.width / rect.width,
            scaleY = canvas.height / rect.height;

        return {
            x: (ev.clientX - rect.left) * scaleX,
            y: (ev.clientY - rect.top) * scaleY
        }
    };

    var getMouseOnElement = function (el, ev) {
        var rect = el.getBoundingClientRect(),
            scaleX = parseFloat(getComputedStyle(el).width) / rect.width,
            scaleY = parseFloat(getComputedStyle(el).height) / rect.height;

        return {
            x: (ev.clientX - rect.left) * scaleX,
            y: (ev.clientY - rect.top) * scaleY
        }
    };

    // touch

    var touchBlocker = function (e) {
        if(e.target.tagName !== 'SELECT') e.preventDefault();
    };

    var copyTouch = function (touch) {
        return {
            identifier: touch.identifier,
            clientX: touch.clientX,
            clientY: touch.clientY
        }
    };

    var getTouchIndexById = function(idToFind, ongoingTouches) {
        var id;
        for (var i = 0; i < ongoingTouches.length; i++) {
            id = ongoingTouches[i].identifier;
            if (id === idToFind) {
                return i;
            }
        }
        return -1;    // not found
    };

    // numerical

    var sign = function (x) {
        return ((x > 0) - (x < 0)) || +x;
    };

    var dist = function (x, y, x2, y2) {
        return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    };

    var hexToRGB = function (hex) {
        hex = hex.replace('#', '').match(/.{2}/g);
        return hex.map(function (hx) {
            return parseInt(hx, 16);
        });
    };

    var rgbToHex = function (rgb) {
        return '#'+('0'+rgb[0].toString(16)).slice(-2)+''+('0'+rgb[1].toString(16)).slice(-2)+''+('0'+rgb[2].toString(16)).slice(-2);
    };

    var randomInt = function (a, b) {
        return Math.floor(Math.random()*(b-a)+a);
    };

    // text

    var ordinalSuffix = function (i) {
        var j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    };

    var mmss = function (seconds) {
        var m = ("00" + Math.floor((seconds % 3600) / 60)).slice(-2);
        var s = ("00" + (seconds % 3600) % 60).slice(-2);
        return m + ":" + s;
    };

    var capitalise = function (s) {
        return (s.charAt(0).toUpperCase() + s.slice(1));
    };

    var fitText = function (el, startSize) {
        var tries = 0;
        if(el.length === 0) {
            console.warn('no elements found for selector ' + el.selector + ', cannot fitText');
            return;
        }
        // console.info('trying fitText for ' + el.selector)
        el.css( "font-size", startSize + ("px"));
        var size = el.css('font-size'); //GETS FONT SIZE
        size = parseInt(size, 10); //REMOVE PX
        for(; el.get(0).offsetHeight < el.get(0).scrollHeight || el.get(0).offsetWidth < el.get(0).scrollWidth;) {
            el.css("font-size","-=1");
            tries++;
            if(tries > 100) {
                console.warn('fitText failed for ' + el.selector);
                el.css("font-size", size + "px");
                return;
            }
        }
        // console.info('fitText completed for ' + el.selector)
    };

    // array

    var randomFromArray = function (array) {
        return array[randomInt(0, array.length)];
    };

    var filledArray = function (leng) {
        return new Array(leng).fill(0).map(function (x,i) { return i });
    };

    var removeFromArray = function (array, element) {
        var index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
    };

    var removeDuplicates = function (arr) {
        var seen = {};
        var out = [];
        var len = arr.length;
        var j = 0;
        for(var i = 0; i < len; i++) {
            var item = arr[i];
            if(seen[item] !== 1) {
                seen[item] = 1;
                out[j++] = item;
            }
        }
        return out;
    };

    var shuffleArray = function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };

    var getAverage = function (arr, type) {
        type = type || 'mean';  // or 'mode'
        if(type === 'mean') {
            var sum = arr.reduce(function(a, x) {
                return a + x;
            }, 0);
            return sum / arr.length;
        } else if(type === 'mode') {
            var freq = {};
            for(var i = 0 ; i < arr.length; i++) {
                if(freq[arr[i]]) freq[arr[i]]++;
                else freq[arr[i]] = 1;
            }
            var highestFreq = -1, highestElem = '';
            for(var el in freq) {
                if(freq.hasOwnProperty(el) && freq[el] > highestFreq) {
                    highestFreq = freq[el];
                    highestElem = el;
                }
            }
            return highestElem;
        }
    };

    // image manipulation

    var swatch = {
        'Black': [28,28,28],
        'Grey': [109,109,109],  // this was commented ?
        'Mid Grey': [184,184,184],
        'White': [255,255,255],
        'Violet': [101,60,143],
        'Purple': [140,54,140],
        'Orchid': [203,71,147],
        'Pink': [230,0,126],
        'Light Pink': [238,188,216],
        'Magenta': [229,0,80],
        // 'Rose Red': [216,34,51],
        'Red': [229,39,33],
        'Orange': [240,130,26],
        'Gold': [249,176,0],
        'Yellow': [255,224,0],
        'Light Green': [134,189,52],
        'Green': [0,150,64],
        'Dark Green': [0,116,58],
        'Teal': [0,147,134],
        'Blue': [0,167,231],
        'Light Blue': [145,200,229],
        'Dark Blue': [0,100,156],
        // 'EYFS Purple': [91,42,134],
        // 'EYFS Pink': [222,35,92],
        // 'EYFS Orange': [240,125,27],
        'EYFS Yellow': [244,203,76],
        // 'EYFS Green': [149,194,56],
        // 'EYFS Teal': [0,174,151],
        // 'EYFS Blue': [71,160,217],
        'Sand': [254,235,192],
        'Brown': [158,104,59],
        // 'Skin 1': [254,235,192],
        // 'Skin 2': [255,231,193],
        // 'Skin 3': [253,215,168],
        // 'Skin 4': [236,188,136],
        // 'Skin 5': [208,170,125],
        // 'Skin 6': [201,144,89],
        // 'Skin 7': [158,104,59],
        // 'Skin 8': [113,81,38],
        // 'Hair 1': [224,123,44],
        // 'Hair 2': [246,162,81],
        // 'Hair 3': [244,203,76],
        // 'Hair 4': [240,223,156],
        // 'Hair 5': [198,153,83],
        // 'Hair 6': [139,101,58],
        // 'Hair 7': [107,74,61],
        // 'Hair 8': [52,40,39]
    };

    var tintImage = function (img, colhex) {
        var rgb = colhex.replace('#', '').match(/.{1,2}/g).map(function (value) {
            return parseInt(value, 16);
        });
        var rgbnorm = rgb.map(function (x) {
            return x / 255.0;
        });
        var c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        var cx = c.getContext('2d');
        cx.drawImage(img, 0, 0);
        var imgdata = cx.getImageData(0, 0, c.width, c.height);
        for(var i = 0; i < imgdata.data.length; i++) {
            if(i % 4 === 0) imgdata.data[i] = Math.min(imgdata.data[i] * rgbnorm[0], 255);
            else if(i % 4 === 1) imgdata.data[i] = Math.min(imgdata.data[i] * rgbnorm[1], 255);
            else if(i % 4 === 2) imgdata.data[i] = Math.min(imgdata.data[i] * rgbnorm[2], 255);
        }
        cx.putImageData(imgdata, 0, 0);
        var newimg = new Image();
        newimg.src = c.toDataURL();
        return newimg;
    };

    var downsampleImage = function (image, x, y) {
        var c = document.createElement('canvas'),
            cx = c.getContext('2d');
        c.width = x;
        c.height = y;
        cx.imageSmoothingEnabled = false;
        cx.drawImage(image, 0, 0, c.width, c.height);
        return c;
    };

    var getAllHues = function (canvas) {
        var cx = canvas.getContext('2d');
        cx.imageSmoothingEnabled = false;

        var imageData = cx.getImageData(0, 0, canvas.width, canvas.height);
        var allHues = [];
        for (var i = 0; i < imageData.data.length; i += 4)
            if(imageData.data[i + 3] > 0) allHues.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
        return allHues;
    };

    var twinklifyHues = function (hues) {
        return hues.map(function (hue) {
            var distances = {};
            for(var swatchHue in swatch) {
                if(swatch.hasOwnProperty(swatchHue))
                    distances[swatchHue] = Math.sqrt(Math.pow(swatch[swatchHue][0] - hue[0], 2) + Math.pow(swatch[swatchHue][1] - hue[1], 2) + Math.pow(swatch[swatchHue][2] - hue[2], 2));
            }
            var closestHueName = Object.keys(distances).sort(function (a, b) {
                return (distances[a] - distances[b]);
            })[0];
            return closestHueName;
        });
    };

    var getUniqueHues = function (hues) {
        return hues.reduce(function (a, x) {
            if(a.hasOwnProperty(x+'')) {
                a[x]++;
                return a;
            } else {
                a[x] = 1;
                return a;
            }
        }, {});
    };

    var getUniqueHuesAndSort = function (hues) {
        var uniqueHues = getUniqueHues(hues);
        return Object.keys(uniqueHues).sort(function (a, b) {
            return (uniqueHues[a] - uniqueHues[b]) * -1;
        });
    };

    var replaceHuesWithClosest = function (canvas, hues) {
        var cx = canvas.getContext('2d');
        var imageData = cx.getImageData(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < imageData.data.length; i += 4) {

            var distances = {};
            for(var j = 0; j < hues.length; j++)
                distances[hues[j]] = Math.sqrt(Math.pow(swatch[hues[j]][0] - imageData.data[i], 2) + Math.pow(swatch[hues[j]][1] - imageData.data[i+1], 2) + Math.pow(swatch[hues[j]][2] - imageData.data[i+2], 2));

            var closestHueName = Object.keys(distances).sort(function (a, b) {
                return (distances[a] - distances[b]);
            })[0];
            var closestHue = swatch[closestHueName];

            imageData.data[i] = closestHue[0];
            imageData.data[i+1] = closestHue[1];
            imageData.data[i+2] = closestHue[2];
            imageData.data[i+3] = imageData.data[i+3] < 128 ? 0 : 255;
        }
        cx.imageSmoothingEnabled = false;
        cx.putImageData(imageData, 0, 0);
        return canvas;
    };

    var getTwinklyPalette = function (canvas, numberOfHues) {
        var allHues = getAllHues(canvas),
            twinklifiedHues = twinklifyHues(allHues),
            uniqueHues = getUniqueHuesAndSort(twinklifiedHues),
            reducedHues = uniqueHues.slice(0, numberOfHues);

        return replaceHuesWithClosest(canvas, reducedHues);
    };

    var getAverageHue = function (imageDataArr, type) {
        type = type || 'mean';

        if(type === 'mean') {
            var arrR = imageDataArr.filter(function (x, i) { return i % 4 === 0 }),
                arrG = imageDataArr.filter(function (x, i) { return i % 4 === 1 }),
                arrB = imageDataArr.filter(function (x, i) { return i % 4 === 2 });
                return [getAverage(arrR, type), getAverage(arrG, type), getAverage(arrB, type)];
        } else if(type === 'mode') {
            var hexarr = [];
            for(var i = 0 ; i < imageDataArr.length; i+=4) {
                hexarr.push(rgbToHex(imageDataArr.slice(i, i+3)));
            }
            return hexToRGB(getAverage(hexarr, 'mode'));
        }
    };

    var getClosestHueName = function (hueName, swatchList) {
        var distances = {}, newSwatch = Object.assign({}, swatch);
        delete newSwatch[hueName];
        swatchList = swatchList || Object.keys(newSwatch);
        swatchList.forEach(function (hue) {
            distances[hue] = Math.sqrt(Math.pow(swatch[hueName][0] - newSwatch[hue][0], 2) + Math.pow(swatch[hueName][1] - newSwatch[hue][1], 2) + Math.pow(swatch[hueName][2] - newSwatch[hue][2], 2));
        });

        var closestHueName = Object.keys(distances).sort(function (a, b) {
            return (distances[a] - distances[b]);
        })[0];
        return closestHueName;
    };

    // animate

    var getAnimateComposition = function (AdobeAn, idx) {
        idx = idx || (AdobeAn.bootcompsLoaded.length);
        // console.log(idx, Object.keys(AdobeAn.compositions)[idx])
        // idx = 0;
        return AdobeAn.compositions[Object.keys(AdobeAn.compositions)[idx]];
    };

    var loadAnimateClip = function (animationName, canvas, parentContainer, autoStart) {

        var autoStart = typeof autoStart === 'undefined' ? true : autoStart;

        if(createjs && AdobeAn) {

            var comp = tw.Utils.getAnimateComposition(AdobeAn);
            // console.log(comp.getLibrary())
            createjs.MotionGuidePlugin.install();
            var lib = comp.getLibrary();
            var animation;

            try {
                animation = new lib[animationName]();
            } catch (e) {
                console.error('no animation found for name ' + animationName);
                return;
            }

            var stage;

            if(canvas instanceof createjs.Stage) {
                // passed in an externally-created stage
                stage = canvas;
            } else {
                // passed in a canvas
                stage = new lib.Stage(canvas);
            }

            stage.addChild(animation);

            AdobeAn.compositionLoaded(lib.properties.id);

            if(autoStart) {
                var startAnimation = function () {
                    createjs.Ticker.framerate = lib.properties.fps;
                    createjs.Ticker.addEventListener('tick', stage);
                };
                startAnimation();
            }

            if(parentContainer && parentContainer instanceof HTMLElement) {
                var resizeHandler = function () {
                    var parentStyle = getComputedStyle(parentContainer);
                    var sizeRatio = parseFloat(parentStyle.width) / 1280;
                    canvas.width = parseFloat(parentStyle.width);
                    canvas.height = parseFloat(parentStyle.height);
                    stage.children[0].setTransform(0, 0, sizeRatio, sizeRatio);
                };
                window.addEventListener('resize', resizeHandler);
                resizeHandler();
            }

            return animation;

        } else {
            console.error('make sure you add createjs and the Animate-exported js to your html <head> !');
            return null;
        }

    };

    var loadAnimateLibrary = function () {

        var lib = {};

        if(createjs && AdobeAn) {

            Object.keys(AdobeAn.compositions).forEach(function (id) {

                var partialLib = AdobeAn.compositions[id].getLibrary();
                lib = Object.assign({}, lib, partialLib);

            });

        } else {
            console.error('make sure you include createjs and the Animate-exported js !');
            return null;
        }

        return lib;

    };

    var loadAnimateClips = function (animationNames, stage, lib) {

        if(createjs && AdobeAn) {

            var animations = {};

            lib = typeof lib === 'undefined' ? loadAnimateLibrary() : lib;

            // console.log(lib);

            animationNames.forEach(function (name) {

                try {
                    animations[name] = new lib[name]();
                } catch (e) {
                    console.error('could not find animation called ' + name);
                }

            });

            // console.log(animationNames.length, Object.keys(AdobeAn.compositions).length, Object.keys(animations).length)

            if(typeof stage !== 'undefined') {

                var _stage;

                if(stage instanceof createjs.Stage) {
                    // passed in an externally-created stage
                    _stage = stage;
                } else if(stage instanceof HTMLCanvasElement) {
                    // passed in a canvas
                    _stage = new lib.Stage(stage);
                }

                for(var animation in animations) _stage.addChild(animation);
            }

            return animations;

        } else {
            console.error('make sure you include createjs and the Animate-exported js !');
            return null;
        }

    };

    var pauseAnimateClip = function (animation) {

        if(createjs) {

            createjs.Ticker.removeEventListener('tick', animation.parent);

        } else {
            console.error('make sure you add createjs to your html <head> !');
        }

    };

    var resumeAnimateClip = function (animation) {

        if(createjs) {

            createjs.Ticker.addEventListener('tick', animation.parent);

        } else {
            console.error('make sure you add createjs to your html <head> !');
        }

    };

    var playAnimateLabel = function (label, clip) {
        var labelNames = clip.labels.map(function (label) {
            return label.label;
        });
        var idx = labelNames.indexOf(label);
        if(idx > -1) clip.gotoAndStop(labelNames[idx]);
    };

    var loadAnimateSVG = function (src, element, callback, opts) {

        opts = opts || {};
        var viewWidth = opts.viewWidth || 1280;
        var viewHeight = opts.viewHeight || 720;

        if(SVGAnim) {

            if(src.hasOwnProperty('DOMDocument')) {

                // ** should be ** JSON in a JS variable

                var comp = new SVGAnim(src, viewWidth, viewHeight, 25);
                comp.s.node.removeAttribute('width');
                comp.s.node.removeAttribute('height');
                if(callback) callback(comp);    // try callback(new comp.MovieClip()) ?
                element.appendChild(comp.s.node);

            }
            else {

                // ** should be ** a URL

                var ajax = new XMLHttpRequest(), comp;
                ajax.open('GET', src, true);
                ajax.setRequestHeader('Content-type', 'application/json');
                ajax.onload = function (ev) {
                    var json = JSON.parse(ajax.responseText);
                    comp = new SVGAnim(json, viewWidth, viewHeight, 25);
                    comp.s.node.removeAttribute('width');
                    comp.s.node.removeAttribute('height');
                    if(callback) callback(comp);    // try callback(new comp.MovieClip()) ?
                    element.appendChild(comp.s.node);
                    // console.log(comp)
                };
                ajax.send();
            }

        } else {
            console.error('make sure you add snap.svg.js and SnapSVGAnimator.js to your html <head> !');
        }

    };

    // preloader

    var listenForAnimationFramesReady = function (preloaderId) {
        preloaderId = preloaderId || 'preload-div';
        var removePreloader = function () {
            var el = document.getElementById(preloaderId);
            if(el) {
                if(hasClass(el, 'loading')) removeClass(el, 'loading');
                else el.style.display = 'none';
            }
        };
        var checkAnimationFrames = function () {
            if(typeof TwinklGame.templateCount !== "undefined") {
                if(TwinklGame.templatesLoaded === TwinklGame.templateCount || TwinklGame.templateCount === 0) { // === 0 patch for web dev being c r a p
                    removePreloader();
                }
            } else {
                removePreloader();  // unsure of this ... will game always be injected after animation layers ?
            }
        };
        window.addEventListener('template_loaded', checkAnimationFrames);
        checkAnimationFrames(); // do it once in rare case that frames have loaded before game template
    };

    // language

    var translate = function (lang) {
        var translatables = document.querySelectorAll('[data-lang]');
        for(var i = 0; i < translatables.length; i++) {
            var langKey = translatables[i].getAttribute('data-lang');
            if(lang.hasOwnProperty(langKey)) {
                translatables[i].innerHTML = lang[langKey];
            }
        }
    };

    // dataLayer

    var getResourceId = function () {
        var el = (document.getElementById('wrapper') || document.getElementById('container') || document.getElementById('animation_container'));
        return (el ? parseInt(el.parentElement.getAttribute('data-resource')) : null);
    };

    // config

    var getInitialConfig = function (defaults) {
        if(typeof window.TwinklGame !== 'undefined') {
            if(window.TwinklGame.hasOwnProperty('config')) {
                try {
                    var merged = Object.assign({}, defaults);
                    Object.keys(window.TwinklGame.config).forEach(function (key) {
                        if(window.TwinklGame.config[key] !== null)
                            merged[key] = window.TwinklGame.config[key];
                    });
                    return merged;
                } catch (e) {
                    error('load-config', 'could not load config for resource ' + getResourceId() + ', got: ' + e.message); // internally calls Go.error
                    console.error(e.message);
                    console.error('could not load config, loading defaults ...');
                    return defaults;
                }
            } else {
                return defaults;
            }
        }
    };

    var setConfig = function (config) {

        var scope = this;

        Object.keys(config).forEach(function (key) {
            scope[key] = config[key];
        });

        if(scope.hasOwnProperty('reset') && typeof scope.reset === 'function') scope.reset();
        else console.error('could not reset resource - no reset func found on game object');

        window.TwinklGame.config = config;

    };

    var getConfig = function () {

        if(typeof window.TwinklGame !== 'undefined') {
            if(typeof window.TwinklGame.config !== 'undefined') {
                return window.TwinklGame.config;
            }
        }

        return {};

    };

    var getAssetUrl = function (key, fromObject) {

        fromObject = fromObject || TwinklGame.config || {};

        // console.log(fromObject)

        // prioritise config object, else manifest, else ''
        if(fromObject[key]) return fromObject[key].assetUrl;
        if(lib.manifest[key]) return lib.manifest[key].src;
        return '';

    };

    var getConfigAssetUrl = function (assetObject) {    // TODO - fall back to manifest, then '' as last resort
        if(typeof assetObject === 'undefined') {
            console.error('no asset object supplied !');
            return '';
        }

        var hash = '', assetUrl = '';
        if(assetObject.constructor === String) {
            // assetObject is hash
            hash = assetObject;
        }
        else {
            // assetObject is { hash: '', assetUrl: '', ... }
            hash = assetObject.hash;
            assetUrl = assetObject.assetUrl;
        }

        var src = '';
        if(window.lib) {
            if(window.lib.manifest) {
                if(window.lib.manifest[hash]) src = window.lib.manifest[hash].src;
                else if(assetObject.constructor !== String) src = assetUrl; // fallback to assetUrl if available
                else console.warn('couldnt load asset from manifest for hash ' + hash);
            }
        }
        return src;
    };

    var configFallback = function (val, fallback) {
        if(val) {
            if(typeof val === 'string' && val.length > 0) return val;
            if(typeof val === 'number') return val;
        }
        return fallback;
    };

    // tracking

    var track = function (eventName, eventData, url) {
        if(typeof window.Go !== 'undefined') {
            if(typeof window.Go.track !== 'undefined') {
                var id = getResourceId();
                Go.track(eventName, id, eventData, url);
            }
        } else {
            // 'Go' not on window, so am likely in dev so log the track event instead
            console.log('tracked:', eventName, eventData);
        }
    };

    var error = function (name, message) {
        if(typeof window.Go !== 'undefined') {
            if(typeof window.Go.error !== 'undefined') {
                var id = getResourceId();
                // $.post("/go/track/lesson", {event: name, resource_id: id, data: (typeof message === 'undefined' ? null : message)});
                Go.error(name, id, message);
            }
        } else {
            console.log('error:', name, message);
        }
    };

    var eventNames = {
        questionCorrect: 'question-correct',
        questionIncorrect: 'question-incorrect',
        questionAttempt: 'question-attempt',
        score: 'score',
        startGame: 'start',
        finishGame: 'finish',
        close: 'close',
        fullscreen: 'fullscreen',
        mute: 'mute',
        characterSelected: 'character-selected',
        levelSelected: 'level-selected',
        difficultySelected: 'difficulty',
        operationSelected: 'maths-operation-selected',
        phonemeSelected: 'phoneme-selected',
        phaseSelected: 'phonics-phase-selected',
        questionSkipped: 'question-skipped',
        questionPaused: 'question-paused',
        gamePaused: 'game-paused',
        gameOver: 'game-over',
        roundStart: 'round-start',
        roundWon: 'round-won',
        roundLost: 'round-lost',
        levelComplete: 'level-complete',
        complexData: 'complex'
    };

    // platform

    var siteInDev = function () {
        // return typeof window.Go === 'undefined';    // or check url string for 'local.games.it' or 'localhost'
        var domains = ['local.games.it', 'localhost', '127.0.0.1', '::1', 'go-tester.twinkl.it'];
        return domains.includes(window.location.hostname);    // or check url string for 'local.games.it' or 'localhost'
    };

    var isIOSDevice = function () {
        return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    };

    var isDesktopDevice = function () {
        return document.body.className.includes('is-desktop-device');
    };

    var canAutofocus = function () {
        return isDesktopDevice() || siteInDev();
    };

    // sound

    var attachButtonSounds = function (clickPlayer, excludeElements) {
        excludeElements = excludeElements || [];
        var buttons = Array.prototype.slice.call(document.getElementsByClassName('font-button'))
            .concat(Array.prototype.slice.call(document.getElementsByClassName('text-button')));

        var handler = function () { clickPlayer.play() };
        for(var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('mousedown', handler);
            buttons[i].addEventListener('touchstart', handler);
        }

        for(var i = 0; i < excludeElements.length; i++) {
            excludeElements[i].removeEventListener('mousedown', handler);
            excludeElements[i].removeEventListener('touchstart', handler);
        }
    };

    // pattern

    var euclid = function (onNotes, totalNotes) {
        var groups = [];
        for (var i = 0; i < totalNotes; i++) groups.push([Number(i < onNotes)]);

        var l;
        while (l = groups.length - 1) {
            var start = 0, first = groups[0];
            while (start < l && compareArrays(first, groups[start])) start++;
            if (start === l) break;

            var end = l, last = groups[l];
            while (end > 0 && compareArrays(last, groups[end])) end--;
            if (end === 0) break;

            var count = Math.min(start, l - end);
            groups = groups
                .slice(0, count)
                .map(function (group, i) { return group.concat(groups[l - i]); })
                .concat(groups.slice(count, -count));
        }
        return [].concat.apply([], groups);
    };

    tw.Utils = {
        noOp: noOp,
        pipe: pipe,
        extend: extend,
        getObjectFromArray: getObjectFromArray,
        getParamNames: getParamNames,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        loadSvgIntoElementFromURL: loadSvgIntoElementFromURL,
        svgToCanvas: svgToCanvas,
        svgToPoints: svgToPoints,
        supportFullScreen: supportFullScreen,
        makeFullScreen: makeFullScreen,
        leaveFullScreen: leaveFullScreen,
        addFullscreenCallback: addFullscreenCallback,
        clientWidth: clientWidth,
        clientHeight: clientHeight,
        touchBlocker: touchBlocker,
        copyTouch: copyTouch,
        getTouchIndexById: getTouchIndexById,
        getMouseOnCanvas: getMouseOnCanvas,
        sign: sign,
        dist: dist,
        hexToRGB: hexToRGB,
        rgbToHex: rgbToHex,
        randomInt: randomInt,
        mmss: mmss,
        ordinalSuffix: ordinalSuffix,
        capitalise: capitalise,
        fitText: fitText,
        randomFromArray: randomFromArray,
        filledArray: filledArray,
        removeFromArray: removeFromArray,
        removeDuplicates: removeDuplicates,
        shuffleArray: shuffleArray,
        getAverage: getAverage,
        downsampleImage: downsampleImage,
        swatch: swatch,
        tintImage: tintImage,
        getAllHues: getAllHues,
        twinklifyHues: twinklifyHues,
        getUniqueHues: getUniqueHues,
        getUniqueHuesAndSort: getUniqueHuesAndSort,
        replaceHuesWithClosest: replaceHuesWithClosest,
        getTwinklyPalette: getTwinklyPalette,
        getAverageHue: getAverageHue,
        getClosestHueName: getClosestHueName,
        getAnimateComposition: getAnimateComposition,
        loadAnimateClip: loadAnimateClip,
        loadAnimateLibrary: loadAnimateLibrary,
        loadAnimateClips: loadAnimateClips,
        pauseAnimateClip: pauseAnimateClip,
        resumeAnimateClip: resumeAnimateClip,
        playAnimateLabel: playAnimateLabel,
        loadAnimateSVG: loadAnimateSVG,
        listenForAnimationFramesReady: listenForAnimationFramesReady,
        translate: translate,
        getResourceId: getResourceId,
        getInitialConfig: getInitialConfig,
        setConfig: setConfig,
        getConfig: getConfig,
        getAssetUrl: getAssetUrl,
        getConfigAssetUrl: getConfigAssetUrl,
        configFallback: configFallback,
        track: track,
        error: error,
        eventNames: eventNames,
        siteInDev: siteInDev,
        isIOSDevice: isIOSDevice,
        isDesktopDevice: isDesktopDevice,
        canAutofocus: canAutofocus,
        attachButtonSounds: attachButtonSounds,
        euclid: euclid
    }

})(TwinklGame);