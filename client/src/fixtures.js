
export const invalidFeatureModel1 = {};

export const invalidFeatureModel2 = {
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

export const validFeatureModel = {
    'struct': [
        {
            'name': 'Eclipse',
            'mandatory': true,
            'description': 'his is a feature which has a description text',
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
                        {
                            'name': 'FeatureIDE',
                            'type': 'or',
                            'children': [
                                {'type': 'feature', 'name': 'AHEAD'},
                                {'type': 'feature', 'name': 'FeatureHouse'},
                                {'type': 'feature', 'name': 'FeatureCpp'},
                                {'type': 'feature', 'name': 'DeltaJ'},
                                {'type': 'feature', 'name': 'AspectJ'},
                                {'type': 'feature', 'name': 'Munge'},
                                {'type': 'feature', 'name': 'Antenna'},
                                {'type': 'feature', 'name': 'DeltaMontiArc'}
                            ]
                        },
                        {'type': 'feature', 'name': 'ExtendedFM'},
                        {'type': 'feature', 'name': 'MoSoPoLiTe'}
                    ]
                },
                {'type': 'feature', 'name': 'DeltaJEclipsePlugin'}
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