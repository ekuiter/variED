import {KernelFeatureModel} from './modeling/types';

/**
 * Some fixtures for use in tests.
 */

export const invalidFeatureModel = <KernelFeatureModel>{};

export const validFeatureModel = <KernelFeatureModel>{
    "features": {
        "edd3d943-f627-4ab8-9ab7-c40ec275d49f": {
            "description": null,
            "name": "DeltaJEclipsePlugin",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "404ebdb5-5d83-4461-8e1c-1a864b0999d8",
            "abstract?": false,
            "group-type": "and",
            "ID": "edd3d943-f627-4ab8-9ab7-c40ec275d49f"
        },
        "7e2c9445-9c93-4a72-842e-271134d3cba2": {
            "description": null,
            "name": "FAMILIAR",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1",
            "abstract?": false,
            "group-type": "and",
            "ID": "7e2c9445-9c93-4a72-842e-271134d3cba2"
        },
        "e166f4f0-910f-45e1-a2f6-d48f132617ef": {
            "description": null,
            "name": "Antenna",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "e166f4f0-910f-45e1-a2f6-d48f132617ef"
        },
        "82bb498c-b1c9-4868-b657-04b0b7768043": {
            "description": null,
            "name": "FeatureHouse",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "82bb498c-b1c9-4868-b657-04b0b7768043"
        },
        "47f5f3fc-ee89-4c06-9338-bf55605b2363": {
            "description": null,
            "name": "AJDT",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "404ebdb5-5d83-4461-8e1c-1a864b0999d8",
            "abstract?": false,
            "group-type": "and",
            "ID": "47f5f3fc-ee89-4c06-9338-bf55605b2363"
        },
        "4a315af9-7076-4cc4-ab06-d32668c27203": {
            "description": null,
            "name": "FeatureCpp",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "4a315af9-7076-4cc4-ab06-d32668c27203"
        },
        "fdb99cf7-383a-43e2-87b9-ea317afa3491": {
            "description": null,
            "name": "JDT",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "404ebdb5-5d83-4461-8e1c-1a864b0999d8",
            "abstract?": false,
            "group-type": "and",
            "ID": "fdb99cf7-383a-43e2-87b9-ea317afa3491"
        },
        "70464990-591e-444d-b84b-4e2b209dea7f": {
            "description": null,
            "name": "DeltaJ",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "70464990-591e-444d-b84b-4e2b209dea7f"
        },
        "eea83117-3eae-43b1-9be4-c5ffdab5c58f": {
            "description": null,
            "name": "FeatureIDE",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1",
            "abstract?": false,
            "group-type": "or",
            "ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f"
        },
        "dbfefb58-0737-4214-a487-8a1daee3ffbd": {
            "description": null,
            "name": "AHEAD",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "dbfefb58-0737-4214-a487-8a1daee3ffbd"
        },
        "48d9f620-e855-4244-aa2a-e76f6a20d582": {
            "description": null,
            "name": "DeltaMontiArc",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "48d9f620-e855-4244-aa2a-e76f6a20d582"
        },
        "9ead87f1-2b71-47d7-803c-a28adf276883": {
            "description": null,
            "name": "CIDE",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1",
            "abstract?": false,
            "group-type": "and",
            "ID": "9ead87f1-2b71-47d7-803c-a28adf276883"
        },
        "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1": {
            "description": null,
            "name": "FeatureModeling",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "404ebdb5-5d83-4461-8e1c-1a864b0999d8",
            "abstract?": false,
            "group-type": "and",
            "ID": "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1"
        },
        "318b589f-05f3-4bde-a096-85e196135106": {
            "description": null,
            "name": "ExtendedFM",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1",
            "abstract?": false,
            "group-type": "and",
            "ID": "318b589f-05f3-4bde-a096-85e196135106"
        },
        "404ebdb5-5d83-4461-8e1c-1a864b0999d8": {
            "description": "his is a feature which has a description text",
            "name": "Eclipse",
            "optional?": true,
            "hidden?": false,
            "parent-ID": null,
            "abstract?": false,
            "group-type": "and",
            "ID": "404ebdb5-5d83-4461-8e1c-1a864b0999d8"
        },
        "dcc6497e-9e2e-4f95-9af6-e88295253d00": {
            "description": null,
            "name": "CDT",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "404ebdb5-5d83-4461-8e1c-1a864b0999d8",
            "abstract?": false,
            "group-type": "and",
            "ID": "dcc6497e-9e2e-4f95-9af6-e88295253d00"
        },
        "08ade032-76f2-4267-a116-c03619ddac2f": {
            "description": null,
            "name": "AspectJ",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "08ade032-76f2-4267-a116-c03619ddac2f"
        },
        "f32906e4-ea7f-4ead-883a-781b0e27fc14": {
            "description": null,
            "name": "MoSoPoLiTe",
            "optional?": false,
            "hidden?": false,
            "parent-ID": "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1",
            "abstract?": false,
            "group-type": "and",
            "ID": "f32906e4-ea7f-4ead-883a-781b0e27fc14"
        },
        "6dae4f1a-61fa-40ac-8d1b-5692a635e839": {
            "description": null,
            "name": "Munge",
            "optional?": true,
            "hidden?": false,
            "parent-ID": "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "abstract?": false,
            "group-type": "and",
            "ID": "6dae4f1a-61fa-40ac-8d1b-5692a635e839"
        }
    },
    "constraints": {
        "607fef7a-0777-4f4b-b655-bb07e0426fe9": {
            "graveyarded?": false,
            "formula": [
                "imp",
                "4a315af9-7076-4cc4-ab06-d32668c27203",
                "dcc6497e-9e2e-4f95-9af6-e88295253d00"
            ],
            "ID": "607fef7a-0777-4f4b-b655-bb07e0426fe9"
        },
        "ae2d05d5-b80a-4bfc-a2da-ab9de2fa347b": {
            "graveyarded?": false,
            "formula": [
                "imp",
                "08ade032-76f2-4267-a116-c03619ddac2f",
                "47f5f3fc-ee89-4c06-9338-bf55605b2363"
            ],
            "ID": "ae2d05d5-b80a-4bfc-a2da-ab9de2fa347b"
        },
        "3e7a2089-62e7-49d7-b0b7-d43f5f11d16a": {
            "graveyarded?": false,
            "formula": [
                "imp",
                [
                    "disj",
                    "dbfefb58-0737-4214-a487-8a1daee3ffbd",
                    [
                        "disj",
                        "82bb498c-b1c9-4868-b657-04b0b7768043",
                        [
                            "disj",
                            "6dae4f1a-61fa-40ac-8d1b-5692a635e839",
                            "e166f4f0-910f-45e1-a2f6-d48f132617ef"
                        ]
                    ]
                ],
                "fdb99cf7-383a-43e2-87b9-ea317afa3491"
            ],
            "ID": "3e7a2089-62e7-49d7-b0b7-d43f5f11d16a"
        },
        "713768aa-f9d3-4c0a-bf7c-881d1f711397": {
            "graveyarded?": false,
            "formula": [
                "imp",
                "70464990-591e-444d-b84b-4e2b209dea7f",
                "edd3d943-f627-4ab8-9ab7-c40ec275d49f"
            ],
            "ID": "713768aa-f9d3-4c0a-bf7c-881d1f711397"
        }
    },
    "children-cache": {
        "404ebdb5-5d83-4461-8e1c-1a864b0999d8": [
            "edd3d943-f627-4ab8-9ab7-c40ec275d49f",
            "47f5f3fc-ee89-4c06-9338-bf55605b2363",
            "fdb99cf7-383a-43e2-87b9-ea317afa3491",
            "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1",
            "dcc6497e-9e2e-4f95-9af6-e88295253d00"
        ],
        "5d6f2baf-eeaa-49af-884c-41f6f2a6f1c1": [
            "7e2c9445-9c93-4a72-842e-271134d3cba2",
            "eea83117-3eae-43b1-9be4-c5ffdab5c58f",
            "9ead87f1-2b71-47d7-803c-a28adf276883",
            "318b589f-05f3-4bde-a096-85e196135106",
            "f32906e4-ea7f-4ead-883a-781b0e27fc14"
        ],
        "eea83117-3eae-43b1-9be4-c5ffdab5c58f": [
            "e166f4f0-910f-45e1-a2f6-d48f132617ef",
            "82bb498c-b1c9-4868-b657-04b0b7768043",
            "4a315af9-7076-4cc4-ab06-d32668c27203",
            "70464990-591e-444d-b84b-4e2b209dea7f",
            "dbfefb58-0737-4214-a487-8a1daee3ffbd",
            "48d9f620-e855-4244-aa2a-e76f6a20d582",
            "08ade032-76f2-4267-a116-c03619ddac2f",
            "6dae4f1a-61fa-40ac-8d1b-5692a635e839"
        ],
        "nil": [
            "404ebdb5-5d83-4461-8e1c-1a864b0999d8"
        ]
    }
};