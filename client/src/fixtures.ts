import {SerializedFeatureModel} from './modeling/types';

/**
 * Some fixtures for use in tests.
 */

export const invalidFeatureModel1 = <SerializedFeatureModel>{};

export const invalidFeatureModel2 = <any>{
    'struct': [],
    'constraints': [],
    'properties': [],
    'calculations': {
        'Auto': true,
        'Features': true,
        'Constraints': true,
        'Redundant': true,
        'Tautology': true
    },
    'comments': [],
    'featureOrder': {'userDefined': false}
};

export const validFeatureModel = <SerializedFeatureModel>{
    'struct': [
        {
            'uuid': 'Eclipse',
            'name': 'Eclipse',
            'mandatory': true,
            'description': 'this is a feature which has a description text',
            'type': 'and',
            'children': [
                {'type': 'feature', 'uuid': 'JDT', 'name': 'JDT'},
                {'type': 'feature', 'uuid': 'CDT', 'name': 'CDT'},
                {'type': 'feature', 'uuid': 'AJDT', 'name': 'AJDT'},
                {
                    'uuid': 'FeatureModeling',
                    'name': 'FeatureModeling',
                    'type': 'and',
                    'children': [
                        {'type': 'feature', 'uuid': 'CIDE', 'name': 'CIDE'},
                        {'type': 'feature', 'uuid': 'FAMILIAR', 'name': 'FAMILIAR'},
                        {
                            'uuid': 'FeatureIDE',
                            'name': 'FeatureIDE',
                            'description': 'A sample description',
                            'type': 'or',
                            'children': [
                                {'type': 'feature', 'uuid': 'AHEAD', 'name': 'AHEAD'},
                                {'type': 'feature', 'uuid': 'FeatureHouse', 'name': 'FeatureHouse'},
                                {'type': 'feature', 'uuid': 'FeatureCpp', 'name': 'FeatureCpp'},
                                {'type': 'feature', 'uuid': 'DeltaJ', 'name': 'DeltaJ'},
                                {'type': 'feature', 'uuid': 'AspectJ', 'name': 'AspectJ'},
                                {'type': 'feature', 'uuid': 'Munge', 'name': 'Munge'},
                                {'type': 'feature', 'uuid': 'Antenna', 'name': 'Antenna'},
                                {'type': 'feature', 'uuid': 'DeltaMontiArc', 'name': 'DeltaMontiArc'}
                            ]
                        },
                        {'type': 'feature', 'uuid': 'ExtendedFM', 'name': 'ExtendedFM'},
                        {'type': 'feature', 'uuid': 'MoSoPoLiTe', 'name': 'MoSoPoLiTe'}
                    ]
                },
                {'type': 'feature', 'uuid': 'DeltaJEclipsePlugin', 'name': 'DeltaJEclipsePlugin'}
            ]
        }
    ],
    'constraints': [
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {
                            'type': 'disj',
                            'children': [
                                {'type': 'var', 'var': 'AHEAD'},
                                {
                                    'type': 'disj',
                                    'children': [
                                        {'type': 'var', 'var': 'FeatureHouse'},
                                        {
                                            'type': 'disj',
                                            'children': [
                                                {'type': 'var', 'var': 'Munge'},
                                                {'type': 'var', 'var': 'Antenna'}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {'type': 'var', 'var': 'JDT'}
                    ]
                }
            ]
        },
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {'type': 'var', 'var': 'FeatureCpp'},
                        {'type': 'var', 'var': 'CDT'}
                    ]
                }
            ]
        },
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {'type': 'var', 'var': 'AspectJ'},
                        {'type': 'var', 'var': 'AJDT'}
                    ]
                }
            ]
        },
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {'type': 'var', 'var': 'DeltaJ'},
                        {'type': 'var', 'var': 'DeltaJEclipsePlugin'}
                    ]
                }
            ]
        }
    ],
    'calculations': {
        'Auto': true,
        'Features': true,
        'Constraints': true,
        'Redundant': true,
        'Tautology': true
    },
    'comments': [],
    'featureOrder': {'userDefined': false}
};

export const validFeatureModelWithRemovedFeatures = <SerializedFeatureModel>{
    'struct': [
        {
            'name': 'Eclipse',
            'mandatory': true,
            'description': 'this is a feature which has a description text',
            'type': 'and',
            'children': [
                {'type': 'feature', 'name': 'JDT'},
                {'type': 'feature', 'name': 'CDT'},
                {'type': 'feature', 'name': 'AJDT'},
                {
                    'name': 'FeatureModeling',
                    'type': 'and',
                    'children': [
                        {'type': 'feature', 'name': 'CIDE'},
                        {'type': 'feature', 'name': 'FAMILIAR'},
                        {'type': 'feature', 'name': 'AHEAD'},
                        {'type': 'feature', 'name': 'FeatureHouse'},
                        {'type': 'feature', 'name': 'FeatureCpp'},
                        {'type': 'feature', 'name': 'AspectJ'},
                        {'type': 'feature', 'name': 'Munge'},
                        {'type': 'feature', 'name': 'Antenna'},
                        {'type': 'feature', 'name': 'DeltaMontiArc'},
                        {'type': 'feature', 'name': 'ExtendedFM'},
                        {'type': 'feature', 'name': 'MoSoPoLiTe'}
                    ]
                }
            ]
        }
    ],
    'constraints': [
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {
                            'type': 'disj',
                            'children': [
                                {'type': 'var', 'var': 'AHEAD'},
                                {
                                    'type': 'disj',
                                    'children': [
                                        {'type': 'var', 'var': 'FeatureHouse'},
                                        {
                                            'type': 'disj',
                                            'children': [
                                                {'type': 'var', 'var': 'Munge'},
                                                {'type': 'var', 'var': 'Antenna'}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {'type': 'var', 'var': 'JDT'}
                    ]
                }
            ]
        },
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {'type': 'var', 'var': 'FeatureCpp'},
                        {'type': 'var', 'var': 'CDT'}
                    ]
                }
            ]
        },
        {
            'type': 'rule',
            'children': [
                {
                    'type': 'imp',
                    'children': [
                        {'type': 'var', 'var': 'AspectJ'},
                        {'type': 'var', 'var': 'AJDT'}
                    ]
                }
            ]
        }
    ],
    'calculations': {
        'Auto': true,
        'Features': true,
        'Constraints': true,
        'Redundant': true,
        'Tautology': true
    },
    'comments': [],
    'featureOrder': {'userDefined': false}
};