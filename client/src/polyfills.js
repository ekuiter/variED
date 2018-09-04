import 'element-closest';
import 'blob-polyfill';

// some simple shims for IE11 (see MDN). we could use es*-shim, but it is very large
/* eslint-disable no-extend-native */

if (!Object.values)
    Object.values = obj => Object.keys(obj).map(key => obj[key]);

if (!Object.entries)
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i);
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
    };

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (search, pos) {
        return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    };
}

if (!Array.prototype.find)
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            if (this == null)
                throw new TypeError('"this" is null or not defined');
            var o = Object(this);
            var len = o.length >>> 0;
            if (typeof predicate !== 'function')
                throw new TypeError('predicate must be a function');
            var thisArg = arguments[1];
            var k = 0;

            while (k < len) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o))
                    return kValue;
                k++;
            }

            return undefined;
        },
        configurable: true,
        writable: true
    });

if (!Array.prototype.findIndex)
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            if (this == null)
                throw new TypeError('"this" is null or not defined');
            var o = Object(this);
            var len = o.length >>> 0;
            if (typeof predicate !== 'function')
                throw new TypeError('predicate must be a function');
            var thisArg = arguments[1];
            var k = 0;

            while (k < len) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o))
                    return k;
                k++;
            }
            return -1;
        },
        configurable: true,
        writable: true
    });

if (!Array.prototype.includes)
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {
            if (this == null)
                throw new TypeError('"this" is null or not defined');
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0)
                return false;
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            while (k < len) {
                if (sameValueZero(o[k], searchElement))
                    return true;
                k++;
            }

            return false;
        }
    });

if (!Array.from)
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
      
        return function from(arrayLike) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null)
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                if (!isCallable(mapFn))
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                if (arguments.length > 2)
                    T = arguments[2];
            }
            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;

            while (k < len) {
                kValue = items[k];
                if (mapFn)
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                else
                    A[k] = kValue;
                k += 1;
            }

            A.length = len;
            return A;
        };
    }());