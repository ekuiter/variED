import {KernelFeatureModel} from './modeling/types';

/**
 * Some fixtures for use in tests.
 */

export const invalidFeatureModel = <KernelFeatureModel>{};

export const validFeatureModel = <KernelFeatureModel>{
    "features": {
        "DeltaJEclipsePlugin": {
            "description": null,
            "name": "DeltaJEclipsePlugin",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "Eclipse",
            "abstract?": false,
            "group-type": "and",
            "ID": "DeltaJEclipsePlugin"
        },
        "FAMILIAR": {
            "description": null,
            "name": "FAMILIAR",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "FeatureModeling",
            "abstract?": false,
            "group-type": "and",
            "ID": "FAMILIAR"
        },
        "Antenna": {
            "description": null,
            "name": "Antenna",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "Antenna"
        },
        "FeatureHouse": {
            "description": null,
            "name": "FeatureHouse",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "FeatureHouse"
        },
        "AJDT": {
            "description": null,
            "name": "AJDT",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "Eclipse",
            "abstract?": false,
            "group-type": "and",
            "ID": "AJDT"
        },
        "FeatureCpp": {
            "description": null,
            "name": "FeatureCpp",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "FeatureCpp"
        },
        "JDT": {
            "description": null,
            "name": "JDT",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "Eclipse",
            "abstract?": false,
            "group-type": "and",
            "ID": "JDT"
        },
        "DeltaJ": {
            "description": null,
            "name": "DeltaJ",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "DeltaJ"
        },
        "FeatureIDE": {
            "description": "A sample description",
            "name": "FeatureIDE",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "FeatureModeling",
            "abstract?": false,
            "group-type": "or",
            "ID": "FeatureIDE"
        },
        "AHEAD": {
            "description": null,
            "name": "AHEAD",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "AHEAD"
        },
        "DeltaMontiArc": {
            "description": null,
            "name": "DeltaMontiArc",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "DeltaMontiArc"
        },
        "CIDE": {
            "description": null,
            "name": "CIDE",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "FeatureModeling",
            "abstract?": false,
            "group-type": "and",
            "ID": "CIDE"
        },
        "FeatureModeling": {
            "description": null,
            "name": "FeatureModeling",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "Eclipse",
            "abstract?": false,
            "group-type": "and",
            "ID": "FeatureModeling"
        },
        "ExtendedFM": {
            "description": null,
            "name": "ExtendedFM",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "FeatureModeling",
            "abstract?": false,
            "group-type": "and",
            "ID": "ExtendedFM"
        },
        "Eclipse": {
            "description": "his is a feature which has a description text",
            "name": "Eclipse",
            "optional?": true,
            "hidden?": false,
            "parent-ID": null,
            "abstract?": false,
            "group-type": "and",
            "ID": "Eclipse"
        },
        "CDT": {
            "description": null,
            "name": "CDT",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "Eclipse",
            "abstract?": false,
            "group-type": "and",
            "ID": "CDT"
        },
        "AspectJ": {
            "description": null,
            "name": "AspectJ",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "AspectJ"
        },
        "MoSoPoLiTe": {
            "description": null,
            "name": "MoSoPoLiTe",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "FeatureModeling",
            "abstract?": false,
            "group-type": "and",
            "ID": "MoSoPoLiTe"
        },
        "Munge": {
            "description": null,
            "name": "Munge",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "FeatureIDE",
            "abstract?": false,
            "group-type": "and",
            "ID": "Munge"
        }
    },
    "constraints": {
        "607fef7a-0777-4f4b-b655-bb07e0426fe9": {
            "graveyarded?": false,
            "formula": [
                "imp",
                "FeatureCpp",
                "CDT"
            ],
            "ID": "607fef7a-0777-4f4b-b655-bb07e0426fe9"
        },
        "ae2d05d5-b80a-4bfc-a2da-ab9de2fa347b": {
            "graveyarded?": false,
            "formula": [
                "imp",
                "AspectJ",
                "AJDT"
            ],
            "ID": "ae2d05d5-b80a-4bfc-a2da-ab9de2fa347b"
        },
        "3e7a2089-62e7-49d7-b0b7-d43f5f11d16a": {
            "graveyarded?": false,
            "formula": [
                "imp",
                [
                    "disj",
                    "AHEAD",
                    [
                        "disj",
                        "FeatureHouse",
                        [
                            "disj",
                            "Munge",
                            "Antenna"
                        ]
                    ]
                ],
                "JDT"
            ],
            "ID": "3e7a2089-62e7-49d7-b0b7-d43f5f11d16a"
        },
        "713768aa-f9d3-4c0a-bf7c-881d1f711397": {
            "graveyarded?": false,
            "formula": [
                "imp",
                "DeltaJ",
                "DeltaJEclipsePlugin"
            ],
            "ID": "713768aa-f9d3-4c0a-bf7c-881d1f711397"
        }
    },
    "children-cache": {
        "Eclipse": [
            "DeltaJEclipsePlugin",
            "AJDT",
            "JDT",
            "FeatureModeling",
            "CDT"
        ],
        "FeatureModeling": [
            "FAMILIAR",
            "FeatureIDE",
            "CIDE",
            "ExtendedFM",
            "MoSoPoLiTe"
        ],
        "FeatureIDE": [
            "Antenna",
            "FeatureHouse",
            "FeatureCpp",
            "DeltaJ",
            "AHEAD",
            "DeltaMontiArc",
            "AspectJ",
            "Munge"
        ],
        "nil": [
            "Eclipse"
        ]
    }
};