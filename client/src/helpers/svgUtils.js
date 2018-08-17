import {getNodeProperty} from '../server/featureModel';

function toPath(x, y) {
    if (typeof x === 'object')
        ({x, y} = x);
    return `${x},${y}`;
}

const MOVE = 'M', LINE = 'L', CURVE = 'C', ARC = 'A', CLOSE = 'Z';

function toD(...data) {
    return data.join(' ');
}

export function attrIfPresent(selection, key, value) {
    if (typeof value !== 'undefined')
        selection.attr(key, value);
}

function styleIfPresent(selection, style) {
    if (typeof style !== 'undefined')
        selection.call(addStyle, style);
}

function fnIfPresent(selection, fn) {
    if (typeof fn !== 'undefined')
        selection.call(fn);
}

export function appendCross(selection, style) {
    style = style || {
        fill: 'none',
        stroke: 'red',
        'stroke-width': '1.5px'
    };
    selection.append('path').attr('d', toD(MOVE, -4, -4, LINE, 4, 4)).attrs(style);
    selection.append('path').attr('d', toD(MOVE, -4, 4, LINE, 4, -4)).attrs(style);
}

export function updateRect(selection, {x, y, klass, width, height, style, fn}) {
    style = style || {
        fill: 'none',
        stroke: 'red',
        'stroke-dasharray': [4, 4]
    };
    selection
        .call(attrIfPresent, 'class', klass)
        .call(fnIfPresent, fn)
        .call(styleIfPresent, style)
        .attr('width', width)
        .attr('height', height)
        .attr('x', x)
        .attr('y', y);
}

export function translateTransform(selection, x, y) {
    selection.attr('transform', d => `translate(${toPath(x(d), y(d))})`);
}

export function drawLine(selection, selector, {klass, from, to, style, fn}) {
    (!selector ? selection.append('path') : selection.select(selector))
        .call(attrIfPresent, 'class', klass)
        .call(styleIfPresent, style)
        .call(fnIfPresent, fn)
        .attr('d', d => toD(MOVE, toPath(from(d)), LINE, toPath(to(d))));
}

export function drawCurve(selection, selector, {klass, from, to, inset = 0, style, fn}) {
    (!selector ? selection.append('path') : selection.select(selector))
        .call(attrIfPresent, 'class', klass)
        .call(styleIfPresent, style)
        .call(fnIfPresent, fn)
        .attr('d', d => {
            const _from = from(d), _to = to(d);
            if (_from.x - inset < _to.x)
                throw new Error('too much inset or wrong order of points');
            return toD(MOVE, toPath(_to),
                CURVE, toPath(_from.x - inset, _to.y), toPath(_from.x - inset, _from.y), toPath(_from));
        });
}

export function drawCircle(selection, selector, {klass, center, radius, style, fn}) {
    (!selector ? selection.append('circle') : selection.select(selector))
        .call(attrIfPresent, 'class', klass)
        .call(attrIfPresent, 'r', radius)
        .call(styleIfPresent, style)
        .call(fnIfPresent, fn)
        .attr('transform', d => `translate(${toPath(center(d))})`);
}

function polarToCartesian({x, y}, radius, degrees) {
    const radians = degrees * Math.PI / 180.0;
    return {
        x: x + (radius * Math.cos(radians)),
        y: y + (radius * Math.sin(radians))
    };
}

export function cartesianToAngle(center, point) {
    return Math.atan2(point.y - center.y, point.x - center.x) * 180.0 / Math.PI;
}

export function arcSegmentPath(center, radius, startAngle, endAngle, sweepFlag = false) {
    const start = polarToCartesian(center, radius, startAngle),
        end = polarToCartesian(center, radius, endAngle);
    return toD(MOVE, toPath(end), ARC, radius, radius, 0, 0, sweepFlag ? 1 : 0, toPath(start));
}

export function arcSlicePath(center, radius, startAngle, endAngle, sweepFlag = false) {
    return toD(arcSegmentPath(center, radius, startAngle, endAngle, sweepFlag), toD(LINE, toPath(center), CLOSE));
}

export function addStyle(selection, ...styleDescriptors) {
    styleDescriptors.forEach(styleDescriptor => {
        let {property, ...styles} = styleDescriptor;
        property = typeof property === 'function' ? property() : property;
        if (property)
            Object.keys(styles).forEach(key =>
                selection.filter(node => getNodeProperty(node, property) === key).call(
                typeof styles[key] === 'function' ? styles[key] : selection => selection.attrs(styles[key])));
        else
            selection.attrs(styleDescriptor);
    });
}