/**
 * This file contains a mutable feature model compatible with the FeatureIDE API.
 * Because operations are implemented on the server using FeatureIDE, we need to mimic
 * its API if we want to provide optimistic UI on the client. Only methods that are
 * actually used have to be implemented here. (The original API is shown in comments.)
 * (There are other approaches, such as compiling/transpiling FeatureIDE automatically
 * to JavaScript with TeaVM, Cheerpj or JSweet. Due to many (big) dependencies, this
 * is not feasible though, and this approach is very lightweight.)
 */

import {FeatureType, SerializedFeatureModel, STRUCT, SerializedFeatureNode, TYPE, NAME, DESCRIPTION, ABSTRACT, MANDATORY, HIDDEN, UUID, SerializedConstraint, SerializedConstraintNode, ConstraintType, VAR, CONSTRAINTS} from './types';
import {FeatureUtils} from '../common/util/FeatureUtils';

class IFeatureStructure {
    correspondingFeature: IFeature;
    parent: IFeatureStructure | null = null;
    children: IFeatureStructure[] = [];
    and: boolean = true;
    multiple: boolean = false;
    mandatory: boolean = false;
    hidden: boolean = false;
    concrete: boolean = true;
    partOfConstraints: IConstraint[] = [];

    addChild(newChild: IFeatureStructure): void {
        this.children.push(newChild);
        newChild.setParent(this);
    }

    addChildAtPosition(index: number, newChild: IFeatureStructure): void {
        if (index > this.getChildrenCount())
			this.children.push(newChild);
		else
			this.children.splice(index, 0, newChild);
		newChild.setParent(this);
    }

    changeToAlternative(): void {
        if (this.getChildrenCount() <= 1)
			return;
		this.and = false;
		this.multiple = false;
    }

    changeToAnd(): void {
        this.and = true;
		this.multiple = false;
    }

    changeToOr(): void {
        if (this.getChildrenCount() <= 1)
			return;
		this.and = false;
		this.multiple = true;
    }
    
    // IFeatureStructure cloneSubtree(IFeatureModel newFeatureModel);

    getChildIndex(feature: IFeatureStructure): number {
        return this.children.indexOf(feature);
    }

    getChildren(): IFeatureStructure[] {
        return this.children;
    }

    getChildrenCount(): number {
        return this.children.length;
    }

    getFeature(): IFeature {
        return this.correspondingFeature;
    }
    
    // IFeatureStructure getFirstChild();
	// IFeatureStructure getLastChild();

    getParent(): IFeatureStructure | null {
        return this.parent;
    }
    
    getRelevantConstraints(): IConstraint[] {
        return this.partOfConstraints;
    }

    hasChildren(): boolean {
        return this.getChildrenCount() > 0;
    }
    
    // boolean hasVisibleChildren(boolean showHiddenFeatures);
	// boolean hasHiddenParent();
	// boolean hasInlineRule();

    isAbstract(): boolean {
        return !this.isConcrete();
    }

    isAlternative(): boolean {
        return !this.and && !this.multiple && this.getChildrenCount() > 1;
    }
    
    // boolean isAncestorOf(IFeatureStructure next);

    isAnd(): boolean {
        return this.and || this.getChildrenCount() <= 1;
    }
    
    // boolean isANDPossible();

    isConcrete(): boolean {
        return this.concrete;
    }
    
    // boolean isFirstChild(IFeatureStructure child);

    isHidden(): boolean {
        return this.hidden;
    }

    isMandatory(): boolean {
        return this.parent === null || !this.parent.isAnd() || this.mandatory;
    }
    
    // boolean isMandatorySet();

    isMultiple(): boolean {
        return this.multiple && this.getChildrenCount() > 1;
    }

    isOr(): boolean {
        return !this.and && this.multiple && this.getChildrenCount() > 1;
    }

    isRoot(): boolean {
        return this.parent === null;
    }

    removeChild(child: IFeatureStructure): void {
        const idx = this.children.indexOf(child);
        if (idx === -1)
            throw new Error('no such element');
        this.children.splice(idx, 1);
		child.setParent(null);
    }

    removeLastChild(): IFeatureStructure {
        const child = this.children.pop();
        if (!child)
            throw new Error('there is no last child');
		child.setParent(null);
		return child;
    }
    
    // void replaceChild(IFeatureStructure oldChild, IFeatureStructure newChild);

    setAbstract(value: boolean): void {
        this.concrete = !value;
    }

    setAlternative(): void {
        this.and = false;
        this.multiple = false;
    }

    setAnd(): void {
        this.and = true;
    }
    
    // void setAND(boolean and);

    setChildren(children: IFeatureStructure[]): void {
        this.children.length = 0;
        children.forEach(child => this.addChild(child));
    }

    setHidden(hidden: boolean): void {
        this.hidden = hidden;
    }

    setMandatory(mandatory: boolean): void {
        this.mandatory = mandatory;
    }

    setMultiple(multiple: boolean): void {
        this.multiple = multiple;
    }

    setOr(): void {
        this.and = false;
        this.multiple = true;
    }

    setParent(newParent: IFeatureStructure | null): void {
        if (newParent === this.parent)
			return;
		this.parent = newParent;
    }
    
    setRelevantConstraints(): void {
        this.partOfConstraints = this.correspondingFeature.getFeatureModel().getConstraints()
            .filter(constraint => constraint.getContainedFeatures().includes(this.correspondingFeature));
    }

	// void setRelevantConstraints(List<IConstraint> constraints);
}

class IFeatureProperty {
    correspondingFeature: IFeature;
    description: string = '';

    // IFeatureProperty clone(IFeature newFeature);

    getDescription(): string {
        return this.description;
    }

    // String getDisplayName();
	// IFeature getFeature();
	// FeatureStatus getFeatureStatus();

    setDescription(description: string): void {
        this.description = description;
    }

	// void setDisplayName(CharSequence name);
	// void setFeatureStatus(FeatureStatus status);
	// void setFeatureStatus(FeatureStatus stat, boolean fire);
	// boolean isConstraintSelected();
	// boolean selectConstraint(boolean state);
}

class IPropertyContainer {
    correspondingFeature: IFeature;
    name: string;

    // <T> T get(final String key, final T defaultValue);
	// Type getDataType(final String key) throws NoSuchPropertyException;
    
    get(key: string): string {
        if (key !== FeatureUtils.NAME_PROPERTY)
            throw new Error('only the name property is valid');
        return this.name;
    }

    has(key: string): boolean {
        if (key !== FeatureUtils.NAME_PROPERTY)
            throw new Error('only the name property is valid');
        return true;
    }

	// Set<String> keySet();
	// Set<Entry<String, Type, Object>> entrySet();
	// void setEntrySet(final Set<Entry<String, Type, Object>> entries);
	// void remove(final String key) throws NoSuchPropertyException;
    
    set(key: string, _type: any, value: string): void {
        if (key !== FeatureUtils.NAME_PROPERTY)
            throw new Error('only the name property is valid');
        this.name = value;
    }
}

class IFeature {
    name: string;
    featureModel: IFeatureModel;
    featureStructure: IFeatureStructure;
    property: IFeatureProperty;
    propertyContainer: IPropertyContainer;

    // IFeature clone(IFeatureModel newFeatureModel, IFeatureStructure newStructure);

    getProperty(): IFeatureProperty {
        return this.property;
    }

    getCustomProperties(): IPropertyContainer {
        return this.propertyContainer;
    }

    getStructure(): IFeatureStructure {
        return this.featureStructure;
    }

    // String createTooltip(Object... objects);

    getFeatureModel(): IFeatureModel {
        return this.featureModel;
    }

	// long getInternalId();

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }
}

class IConstraint {
    serializedConstraint: SerializedConstraint;
    containedFeatureList: IFeature[] = [];
    featureModel: IFeatureModel;

    static getContainedFeatureNames(node: SerializedConstraintNode): string[] {
        if (node[TYPE] === ConstraintType.var)
            return [node[VAR]!];
        return node.children!.reduce((acc: string[], child) => acc.concat(this.getContainedFeatureNames(child)), []);
    };

	// IConstraint clone(IFeatureModel newFeatureModel);
	// ConstraintAttribute getConstraintAttribute();

    getContainedFeatures(): IFeature[] {
        if (this.containedFeatureList.length === 0) {
            this.setContainedFeatures();
        }
        return this.containedFeatureList;
    }

	// Collection<IFeature> getDeadFeatures();
	// Collection<IFeature> getDeadFeatures(SatSolver solver, IFeatureModel featureModel, Collection<IFeature> exlcudeFeatuers);
	// Collection<IFeature> getFalseOptional();
	// Node getNode();
	// void setNode(Node node);
	// boolean hasHiddenFeatures();
	// void setConstraintAttribute(ConstraintAttribute attribute, boolean notifyListeners);
    // void setContainedFeatures();

    setContainedFeatures(): void {
        this.containedFeatureList.length = 0;
        IConstraint.getContainedFeatureNames(this.serializedConstraint.children[0]).forEach(featureName => {
            this.containedFeatureList.push(this.featureModel.getFeature(featureName)!);
        });
    }

	// void setDeadFeatures(Iterable<IFeature> deadFeatures);
	// boolean setFalseOptionalFeatures(IFeatureModel featureModel, Collection<IFeature> collection);
	// String getDisplayName();
	// void setFalseOptionalFeatures(Iterable<IFeature> foFeatures);
	// void setDescription(String description);
    // String getDescription();
    // IFeatureModel getFeatureModel();
	// long getInternalId();
	// String getName();
	// void setName(String name);
}

class IFeatureModelStructure {
    correspondingFeatureModel: IFeatureModel;
    rootFeature: IFeatureStructure;

	// IFeatureModelStructure clone(IFeatureModel newFeatureNodel);
	// IFeatureModel getFeatureModel();
	// Collection<IFeature> getFeaturesPreorder();

    getRoot(): IFeatureStructure {
        return this.rootFeature;
    }

	// boolean hasAbstract();
	// boolean hasAlternativeGroup();
	// boolean hasAndGroup();
	// boolean hasConcrete();
	// boolean hasHidden();
	// boolean hasIndetHidden();
	// boolean hasMandatoryFeatures();
	// boolean hasOptionalFeatures();
	// boolean hasOrGroup();
	// int numAlternativeGroup();
	// int numOrGroup();

    replaceRoot(feature: IFeatureStructure): void {
        this.correspondingFeatureModel.deleteFeatureFromTable(this.rootFeature.getFeature());
		feature.setParent(null);
		this.rootFeature = feature;
    }

    setRoot(root: IFeatureStructure): void {
        this.rootFeature = root;
    }

	// boolean hasFalseOptionalFeatures();
	// boolean hasUnsatisfiableConstraints();
	// boolean hasTautologyConstraints();
	// boolean hasDeadConstraints();
	// boolean hasVoidModelConstraints();
	// boolean hasRedundantConstraints();
	// boolean hasDeadFeatures();
	// void setShowHiddenFeatures(boolean showHiddenFeatures);
}

class IFeatureModel {
    serializedFeatureModel: SerializedFeatureModel;
    featureTable: {[x: string]: IFeature} = {};
    structure: IFeatureModelStructure;
    constraints: IConstraint[] = [];

    // used by BridgeUtils
    createFeature(name: string): IFeature {
        const feature = new IFeature(),
            featureStructure = new IFeatureStructure(),
            property = new IFeatureProperty(),
            propertyContainer = new IPropertyContainer();
        feature.name = name;
        feature.featureModel = this;
        feature.featureStructure = featureStructure;
        feature.property = property;
        feature.propertyContainer = propertyContainer;
        featureStructure.correspondingFeature = feature;
        property.correspondingFeature = feature;
        propertyContainer.correspondingFeature = feature;
        return feature;
    }

    // long getId();
    // String getFactoryID();
    // void addConstraint(IConstraint constraint);
    // void addConstraint(IConstraint constraint, int index);

    addFeature(feature: IFeature): boolean {
        const name = feature.getName();
		if (this.featureTable.hasOwnProperty(name))
			return false;
		this.featureTable[name] = feature;
		return true;
    }

    // IFeatureModel clone(IFeature newRoot);
    // void createDefaultValues(CharSequence projectName);

    deleteFeature(feature: IFeature): boolean {
        if (feature === this.structure.getRoot().getFeature())
            return false;

        const name = feature.getName();
        if (!this.featureTable.hasOwnProperty(name))
            return false;

        const parent = feature.getStructure().getParent();

        if (parent!.getChildrenCount() === 1) {
            if (feature.getStructure().isAnd()) {
                parent!.setAnd();
            } else if (feature.getStructure().isAlternative()) {
                parent!.setAlternative();
            } else {
                parent!.setOr();
            }
        }

        const index = parent!.getChildIndex(feature.getStructure());
        while (feature.getStructure().hasChildren()) {
            parent!.addChildAtPosition(index, feature.getStructure().removeLastChild());
        }

        parent!.removeChild(feature.getStructure());
        delete this.featureTable[name];
        // featureOrderList.remove(name);
        return true;
    }

    deleteFeatureFromTable(feature: IFeature): void {
        delete this.featureTable[feature.getName()];
    }

    // FeatureModelAnalyzer getAnalyser();
    // int getConstraintCount();
    // int getConstraintIndex(IConstraint constraint);

    getConstraints(): IConstraint[] {
        return this.constraints;
    }

    getFeature(name: string): IFeature | null {
        return this.featureTable[name] || null;
    }

    // List<String> getFeatureOrderList();

    getFeatures(): IFeature[] {
        return Object.values(this.featureTable);
    }

    // Iterable<IFeature> getVisibleFeatures(boolean showHiddenFeatures);
    // int getNumberOfFeatures();
    // IFeatureModelProperty getProperty();
    // RenamingsManager getRenamingsManager();
    
    getStructure(): IFeatureModelStructure {
        return this.structure;
    }

    // void handleModelDataChanged();
    // void handleModelDataLoaded();
    // boolean isFeatureOrderUserDefined();
    // void removeConstraint(IConstraint constraint);
    // void removeConstraint(int index);
    // void replaceConstraint(IConstraint constraint, int index);
    // void reset();
    // void setConstraints(final Iterable<IConstraint> constraints);
    // void setFeatureOrderList(final List<String> featureOrderList);
    // void setFeatureOrderUserDefined(boolean featureOrderUserDefined);
    // void setFeatureTable(final Hashtable<String, IFeature> featureTable);
    
    getFeatureTable(): {[x: string]: IFeature} {
        return this.featureTable;
    }
    
    // IFeatureModel clone();
    // Object getUndoContext();
    // void setUndoContext(Object undoContext);
    // void setFeatureOrderListItem(int i, String newName);
    // void setSourceFile(Path file);
    // Path getSourceFile();
    // long getNextElementId();
    // void setConstraint(int index, IConstraint constraint);
}

class MutableFeatureModel extends IFeatureModel {
    // a serialized JSON feature model as received from the server
    static fromJSON(serializedFeatureModel: SerializedFeatureModel): MutableFeatureModel {
        if (!serializedFeatureModel[STRUCT] || serializedFeatureModel[STRUCT].length !== 1)
            throw new Error('feature model has no structure');
    
        const mutableFeatureModel = new MutableFeatureModel(),
            featureModelStructure = new IFeatureModelStructure();
        mutableFeatureModel.structure = featureModelStructure;
        mutableFeatureModel.serializedFeatureModel = serializedFeatureModel;
        featureModelStructure.correspondingFeatureModel = mutableFeatureModel;
    
        mutableFeatureModel.constraints = serializedFeatureModel[CONSTRAINTS].map(serializedConstraint => {
            const constraint = new IConstraint();
            constraint.serializedConstraint = serializedConstraint;
            constraint.featureModel = mutableFeatureModel;
            return constraint;
        });

        function parseFeatures(nodes: SerializedFeatureNode[], parent: IFeature | null): void {
            nodes.forEach(node => {
                const type = node[TYPE],
                    uuid = node[UUID],
                    name = node[NAME];
                if (mutableFeatureModel.getFeature(uuid) !== null)
                    throw new Error('Duplicate entry for feature: ' + uuid);
                const feature = mutableFeatureModel.createFeature(uuid);
                feature.getCustomProperties().set(FeatureUtils.NAME_PROPERTY, null, name);
                if (node[DESCRIPTION])
                    feature.getProperty().setDescription(node[DESCRIPTION]!);
                feature.getStructure().setMandatory(true);
                if (type === FeatureType.and)
                    feature.getStructure().setAnd();
                else if (type === FeatureType.alt)
                    feature.getStructure().setAlternative();
                else if (type === FeatureType.or)
                    feature.getStructure().setOr();
                else if (type === FeatureType.feature) {}
                else
                    throw new Error('Unknown feature type: ' + type);
                feature.getStructure().setAbstract(!!node[ABSTRACT]);
                feature.getStructure().setMandatory(!!node[MANDATORY]);
                feature.getStructure().setHidden(!!node[HIDDEN]);
                mutableFeatureModel.addFeature(feature);
                if (parent === null)
                    mutableFeatureModel.getStructure().setRoot(feature.getStructure());
                else
                    parent.getStructure().addChild(feature.getStructure());
                if (node['children'] && node['children'].length > 0)
                    parseFeatures(node['children'], feature);
            });
        }
    
        parseFeatures(serializedFeatureModel[STRUCT], null);
        return mutableFeatureModel;
    }

    // serializes feature model back to JSON (to allow storing in Redux)
    toJSON(): SerializedFeatureModel {
        function writeAttributes(node: SerializedFeatureNode, feature: IFeature): SerializedFeatureNode {
            if (feature.getStructure().isHidden())
                node[HIDDEN] = true;
            if (feature.getStructure().isMandatory() &&
                ((feature.getStructure().getParent() !== null && feature.getStructure().getParent()!.isAnd()) ||
                    feature.getStructure().getParent() == null))
                    node[MANDATORY] = true;
            if (feature.getStructure().isAbstract())
                node[ABSTRACT] = true;
            const description = feature.getProperty().getDescription();
            if (description !== null && description.trim())
                node[DESCRIPTION] = description.replace("\r", "");
            return node;
        }

        function serializeFeature(feature: IFeature | null): SerializedFeatureNode {
            if (feature == null)
                throw new Error('no feature given');
            const children = feature.getStructure().getChildren()
                .map(featureStructure => featureStructure.getFeature()),
                node = {
                    [TYPE]: FeatureType.feature,
                    [UUID]: feature.getName(),
                    [NAME]: feature.getCustomProperties().get(FeatureUtils.NAME_PROPERTY)
                };
    
            if (children.length === 0)
                return writeAttributes(node, feature);
            else
                return writeAttributes({
                    ...node,
                    [TYPE]: feature.getStructure().isAnd()
                        ? FeatureType.and
                        : feature.getStructure().isOr()
                            ? FeatureType.or
                            : feature.getStructure().isAlternative()
                                ? FeatureType.alt
                                : FeatureType.unknown,
                    children: children.map(serializeFeature)
                }, feature);
        }

        return {
            ...this.serializedFeatureModel,
            [STRUCT]: [serializeFeature(this.getStructure().getRoot().getFeature())]
        };
    }
}

export default MutableFeatureModel;