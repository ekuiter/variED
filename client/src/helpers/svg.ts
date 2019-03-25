/**
 * Helpers for drawing SVG elements.
 * Depends on the D3.js library to manipulate elements.
 */

import {Point, D3Selection, Func} from '../types';
import {ValueMap} from 'd3-selection-multi';
import logger from './logger';
import {FeaturePropertyKey, NodeCoordinateFunction, FeatureNode, NodePointFunction} from '../modeling/types';

export type Style = ValueMap<any, any>;
export interface StyleDescriptor {
    property?: FeaturePropertyKey,
    [x: string]: any
};
export type ArcPathFunction = (center: Point, radius: number, startAngle: number, endAngle: number, sweepFlag?: boolean) => string;

function toPath(point: Point): string;
function toPath(x: number, y: number): string;
function toPath(x: number | {x: number, y: number}, y?: number): string {
    if (typeof x === 'object')
        ({x, y} = x);
    return `${x},${y}`;
}

const MOVE = 'M', LINE = 'L', CURVE = 'C', ARC = 'A', CLOSE = 'Z';

function toD(...data: (string | number)[]): string {
    return data.join(' ');
}

export function attrIfPresent(selection: D3Selection, key: string, value?: any): void {
    if (typeof value !== 'undefined')
        selection.attr(key, value);
}

export function styleIfPresent(selection: D3Selection, style?: Style): void {
    if (typeof style !== 'undefined')
        selection.call(addStyle, style);
}

export function fnIfPresent(selection: D3Selection, fn?: Func): void {
    if (typeof fn !== 'undefined')
        selection.call(fn);
}

export function appendCross(selection: D3Selection, style?: Style): void {
    style = style || {
        fill: 'none',
        stroke: 'red',
        'stroke-width': '1.5px'
    };
    selection.append('path').attr('d', toD(MOVE, -4, -4, LINE, 4, 4)).attrs(style);
    selection.append('path').attr('d', toD(MOVE, -4, 4, LINE, 4, -4)).attrs(style);
}

export function updateRect(selection: D3Selection, {x, y, klass, width, height, style, fn}:
    {x: number, y: number, klass?: string, width: number, height: number, style?: Style, fn?: Func}): void {
    style = style || {
        fill: 'none',
        stroke: 'red',
        'stroke-dasharray': '4,4'
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

export function translateTransform(selection: D3Selection, x: NodeCoordinateFunction, y: NodeCoordinateFunction): void {
    selection.attr('transform', (d: FeatureNode) => `translate(${toPath(x(d), y(d))})`);
}

export function drawLine(selection: D3Selection, selector: string | undefined,
    {klass, from, to, style, fn}:
    {klass?: string, from: NodePointFunction, to: NodePointFunction, style?: Style, fn?: Func}): void {
    (!selector ? selection.append('path') : selection.select(selector))
        .call(attrIfPresent, 'class', klass)
        .call(styleIfPresent, style)
        .call(fnIfPresent, fn)
        .attr('d', (d: FeatureNode) => toD(MOVE, toPath(from(d)), LINE, toPath(to(d))));
}

export function drawCurve(selection: D3Selection, selector: string | undefined,
    {klass, from, to, inset, style, fn}:
    {klass?: string, from: NodePointFunction, to: NodePointFunction, inset: number, style?: Style, fn?: Func}): void {
    (!selector ? selection.append('path') : selection.select(selector))
        .call(attrIfPresent, 'class', klass)
        .call(styleIfPresent, style)
        .call(fnIfPresent, fn)
        .attr('d', (d: FeatureNode) => {
            const _from = from(d), _to = to(d);
            if (_from.x - inset < _to.x)
                logger.warn(() => 'too much inset or wrong order of points');
            return toD(MOVE, toPath(_to),
                CURVE, toPath(_from.x - inset, _to.y), toPath(_from.x - inset, _from.y), toPath(_from));
        });
}

export function drawCircle(selection: D3Selection, selector: string | undefined,
    {klass, center, radius, style, fn}:
    {klass?: string, from: NodePointFunction, to: NodePointFunction, center: NodePointFunction,
        radius: number, style?: Style, fn?: Func}): void {
    (!selector ? selection.append('circle') : selection.select(selector))
        .call(attrIfPresent, 'class', klass)
        .call(attrIfPresent, 'r', radius)
        .call(styleIfPresent, style)
        .call(fnIfPresent, fn)
        .call((selection: D3Selection) => {
            if (center)
                selection.attr('transform', (d: FeatureNode) => `translate(${toPath(center(d))})`);
        });
}

function polarToCartesian({x, y}: Point, radius: number, degrees: number): Point {
    const radians = degrees * Math.PI / 180.0;
    return {
        x: x + (radius * Math.cos(radians)),
        y: y + (radius * Math.sin(radians))
    };
}

export function cartesianToAngle(center: Point, point: Point): number {
    return Math.atan2(point.y - center.y, point.x - center.x) * 180.0 / Math.PI;
}

export function arcSegmentPath(center: Point, radius: number, startAngle: number, endAngle: number, sweepFlag = false): string {
    const start = polarToCartesian(center, radius, startAngle),
        end = polarToCartesian(center, radius, endAngle);
    return toD(MOVE, toPath(end), ARC, radius, radius, 0, 0, sweepFlag ? 1 : 0, toPath(start));
}

export function arcSlicePath(center: Point, radius: number, startAngle: number, endAngle: number, sweepFlag = false): string {
    return toD(arcSegmentPath(center, radius, startAngle, endAngle, sweepFlag), toD(LINE, toPath(center), CLOSE));
}

export function addStyle(selection: D3Selection, ...styleDescriptors: StyleDescriptor[]): void {
    styleDescriptors.forEach(styleDescriptor => {
        let {property, ...styles} = styleDescriptor;
        if (typeof property !== 'undefined')
            Object.keys(styles).forEach(key =>
                selection
                    .filter((node: FeatureNode) => node.feature().getPropertyString(property!) === key)
                    .call(selection => selection.attrs(styles[key])));
        else
            selection.attrs(styleDescriptor);
    });
}