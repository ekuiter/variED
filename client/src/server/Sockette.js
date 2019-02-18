/**
 * see https://github.com/lukeed/sockette - adapted to allow arbitrary URL when reconnecting
 */

function noop() {}

export default function (url, opts) {
	opts = opts || {};

	var ws, num=0, $={};
	var max = opts.maxAttempts || Infinity;

	$.open = function (url) {
		ws = new WebSocket(url, opts.protocols || []);

		ws.onmessage = opts.onmessage || noop;

		ws.onopen = function (e) {
			(opts.onopen || noop)(e);
			num = 0;
		};

		ws.onclose = function (e) {
			e.code === 1e3 || e.code === 1005 || $.reconnect(e);
			(opts.onclose || noop)(e);
		};

		ws.onerror = function (e) {
			(e && e.code==='ECONNREFUSED') ? $.reconnect(e) : (opts.onerror || noop)(e);
		};
	};

	$.reconnect = function (e) {
		(num++ < max) ? setTimeout(function () {
			var url = (opts.onreconnect || noop)(e);
			$.open(url);
		}, opts.timeout || 1e3) : (opts.onmaximum || noop)(e);
	};

	$.json = function (x) {
		ws.send(JSON.stringify(x));
	};

	$.send = function (x) {
		ws.send(x);
	};

	$.close = function (x, y) {
		ws.close(x || 1e3, y);
	};

	$.open(url); // init

	return $;
}