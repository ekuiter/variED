import * as svg from './svg';
import {select as d3Select} from 'd3-selection';
import 'd3-selection-multi';
import {FeaturePropertyKey} from '../types';
import logger from './logger';

jest.mock('./logger');

const point = (x: number, y: number) => ({x, y}),
    pointFn = (x: number, y: number) => () => point(x, y);

describe('svg', () => {
    const createSvg = () => d3Select(document.createElement('svg'));

    describe('drawLine', () => {
        it('sets an attribute if present', () => {
            expect(createSvg().call(svg.attrIfPresent, 'attr', 'value').attr('attr')).toBe('value');
            expect(createSvg().call(svg.attrIfPresent, 'attr').attr('attr')).toBeNull();
        });

        it('sets a style if present', () => {
            expect(createSvg().call(svg.styleIfPresent, {width: 100}).attr('width')).toBe('100');
            expect(createSvg().call(svg.styleIfPresent).attr('width')).toBeNull();
        });

        it('calls a function if present', () => {
            const mock = jest.fn();
            createSvg().call(svg.fnIfPresent);
            expect(mock).not.toBeCalled();
            createSvg().call(svg.fnIfPresent, mock);
            expect(mock).toBeCalled();
        });

        it('appends a cross', () => {
            expect(createSvg().call(svg.appendCross)).toMatchSnapshot();
        });

        it('updates a rectangle', () => {
            expect(createSvg().call(svg.updateRect, {x: 10, y: 10, width: 100, height: 50})).toMatchSnapshot();
        });

        it('set a translation transformation', () => {
            expect(createSvg().call(svg.translateTransform, () => 10, () => 20).attr('transform'))
                .toBe('translate(10,20)');
        });

        it('draws a line', () => {
            expect(createSvg().call(svg.drawLine, null, {from: pointFn(0, 0), to: pointFn(10, 10)})).toMatchSnapshot();
        });
        
        it('updates a line', () => {
            const selection = createSvg();
            selection.append('path');
            selection.call(svg.drawLine, 'path', {from: pointFn(0, 0), to: pointFn(10, 10)});
            expect(selection).toMatchSnapshot();
        });

        it('draws a curve', () => {
            expect(createSvg().call(svg.drawCurve, null, {from: pointFn(10, 10), to: pointFn(0, 0), inset: 5})).toMatchSnapshot();
        });

        it('updates a curve', () => {
            const selection = createSvg();
            selection.append('path');
            selection.call(svg.drawCurve, 'path', {from: pointFn(10, 10), to: pointFn(0, 0), inset: 5});
            expect(selection).toMatchSnapshot();
        });

        it('warns when drawing a curve with invalid inset or point order', () => {
            (logger.warn as any).mockReset();
            const selection = createSvg();
            expect(logger.warn).not.toBeCalled();
            selection.call(svg.drawCurve, null, {from: pointFn(0, 0), to: pointFn(10, 10), inset: 5});
            expect(logger.warn).toBeCalled();
        });

        it('draws a circle', () => {
            expect(createSvg().call(svg.drawCircle, null, {radius: 5})).toMatchSnapshot();
        });

        it('draws a circle with a center', () => {
            expect(createSvg().call(svg.drawCircle, null, {center: pointFn(10, 10), radius: 5})).toMatchSnapshot();
        });

        it('updates a circle', () => {
            const selection = createSvg();
            selection.append('circle');
            selection.call(svg.drawCircle, 'circle', {center: pointFn(10, 10), radius: 5});
            expect(selection).toMatchSnapshot();
        });

        it('extracts an angle from cartesian coordinates', () => {
            expect(svg.cartesianToAngle(point(0, 0), point(0, 0))).toBe(0);
            expect(svg.cartesianToAngle(point(0, 0), point(10, 10))).toBe(45);
            expect(svg.cartesianToAngle(point(10, 10), point(20, 10))).toBe(0);
            expect(svg.cartesianToAngle(point(10, 10), point(10, 20))).toBe(90);
            expect(svg.cartesianToAngle(point(10, 10), point(-10, 10))).toBe(180);
            expect(svg.cartesianToAngle(point(10, 10), point(10, -10))).toBe(-90);
            expect(svg.cartesianToAngle(point(10, 10), point(-10, -10))).toBe(-135);
        });

        it('creates an arc segment path', () => {
            expect(svg.arcSegmentPath(point(10, 10), 5, 0, 90)).toBe('M 10,15 A 5 5 0 0 0 15,10');
        });

        it('creates an arc segment path with enabled sweep flag', () => {
            expect(svg.arcSegmentPath(point(10, 10), 5, 0, 90, true)).toBe('M 10,15 A 5 5 0 0 1 15,10');
        });

        it('creates an arc slice path', () => {
            expect(svg.arcSlicePath(point(10, 10), 5, 0, 90)).toBe('M 10,15 A 5 5 0 0 0 15,10 L 10,10 Z');
        });

        it('adds styles', () => {
            const selection = createSvg();
            selection.append('g');
            const g = selection.selectAll('g').data([
                {
                    feature: () => ({
                        getPropertyString: (key: FeaturePropertyKey) => {
                            if (typeof key === 'function')
                                return key(undefined!);
                            return key === 'yesProperty' ? 'yes' : 'no'
                        }
                    })
                }
            ]);
            g.call(svg.addStyle, {width: 100}, {
                property: 'yesProperty',
                yes: {shouldBeYes: 'yes'},
                no: {shouldBeYes: 'no'}
            }, {
                property: 'noProperty',
                yes: {shouldBeNo: 'yes'},
                no: {shouldBeNo: 'no'}
            }, {
                property: () => 'yes',
                yes: {shouldAlsoBeYes: 'yes'},
                no: {shouldAlsoBeYes: 'no'}
            });
            expect(g.attr('shouldBeYes')).toBe('yes');
            expect(g.attr('shouldBeNo')).toBe('no');
            expect(g.attr('shouldAlsoBeYes')).toBe('yes');
            expect(selection.node()).toMatchSnapshot();
        });
    });
});