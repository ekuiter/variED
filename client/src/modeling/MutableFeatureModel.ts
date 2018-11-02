/**
 * This file contains a mutable feature model compatible with the FeatureIDE API.
 * Because operations are implemented on the server using FeatureIDE, we need to mimic
 * its API if we want to provide optimistic UI on the client. Only methods that are
 * actually used have to be implemented here. (The original API is shown in comments.)
 * (There are other approaches, such as compiling/transpiling FeatureIDE automatically
 * to JavaScript with TeaVM, Cheerpj or JSweet. Due to many (big) dependencies, this
 * is not feasible though, and this approach is very lightweight.)
 */

import {FeatureType, SerializedFeatureModel, STRUCT, SerializedFeatureModelNode, TYPE, NAME, DESCRIPTION, ABSTRACT, MANDATORY, HIDDEN} from './types';

class IFeatureStructure {
    correspondingFeature: IFeature;
    parent: IFeatureStructure | null = null;
    children: IFeatureStructure[] = [];
    and: boolean = true;
    multiple: boolean = false;
    mandatory: boolean = false;
    hidden: boolean = false;
    concrete: boolean = true;

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
    
    // Collection<IConstraint> getRelevantConstraints();

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
    
    // void setRelevantConstraints();
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

class IFeature {
    name: string;
    featureStructure: IFeatureStructure;
    property: IFeatureProperty;

    // IFeature clone(IFeatureModel newFeatureModel, IFeatureStructure newStructure);

    getProperty(): IFeatureProperty {
        return this.property;
    }

	// IPropertyContainer getCustomProperties();

    getStructure(): IFeatureStructure {
        return this.featureStructure;
    }

    // String createTooltip(Object... objects);
    // IFeatureModel getFeatureModel();
	// long getInternalId();

    getName(): string {
        return this.name;
    }

    // void setName(String name);
    setName(name: string): void {
        this.name = name;
    }
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

class RenamingsManager {
    model: IFeatureModel;

	renameFeature(oldName: string, newName: string): boolean {
		const featureTable = this.model.getFeatureTable();
		if (!featureTable.hasOwnProperty(oldName) || featureTable.hasOwnProperty(newName))
			return false;
		//final List<IConstraint> constraints = model.getConstraints();
		const feature = this.model.getFeature(oldName)!;
		this.model.deleteFeatureFromTable(feature);
		feature.setName(newName);
		this.model.addFeature(feature);
		/*for (final IConstraint c : constraints) {
			renameVariables(c.getNode(), oldName, newName);
		}
		final List<String> featureOrderList = Functional.toList(model.getFeatureOrderList());
		for (int i = 0; i < featureOrderList.size(); i++) {
			if (featureOrderList.get(i).equals(oldName)) {
				model.setFeatureOrderListItem(i, newName);
				break;
			}
		}*/
		return true;
	}

	// boolean isRenamed();
	// void performRenamings();
	// void performRenamings(File file);
	// void performRenamings(Path path);
	// String getNewName(String name);
	// String getOldName(String name);
	// Set<String> getOldFeatureNames();
	// void clear();
}

class IFeatureModel {
    serializedFeatureModel: SerializedFeatureModel;
    featureTable: {[x: string]: IFeature} = {};
    structure: IFeatureModelStructure;
    renamingsManager: RenamingsManager;

    // used by BridgeUtils
    createFeature(name: string): IFeature {
        const feature = new IFeature(),
            featureStructure = new IFeatureStructure(),
            featureProperty = new IFeatureProperty();
        feature.name = name;
        feature.featureStructure = featureStructure;
        feature.property = featureProperty;
        featureStructure.correspondingFeature = feature;
        featureProperty.correspondingFeature = feature;
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
    // List<IConstraint> getConstraints();

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

    getRenamingsManager(): RenamingsManager {
        return this.renamingsManager;
    }
    
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
            featureModelStructure = new IFeatureModelStructure(),
            renamingsManager = new RenamingsManager();
        mutableFeatureModel.structure = featureModelStructure;
        mutableFeatureModel.serializedFeatureModel = serializedFeatureModel;
        mutableFeatureModel.renamingsManager = renamingsManager;
        featureModelStructure.correspondingFeatureModel = mutableFeatureModel;
        renamingsManager.model = mutableFeatureModel;
    
        function parseFeatures(nodes: SerializedFeatureModelNode[], parent: IFeature | null): void {
            nodes.forEach(node => {
                const type = node[TYPE],
                    name = node[NAME];
                if (mutableFeatureModel.getFeature(name) !== null)
                    throw new Error('Duplicate entry for feature: ' + name);
                const feature = mutableFeatureModel.createFeature(name);
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
        function writeAttributes(node: SerializedFeatureModelNode, feature: IFeature): SerializedFeatureModelNode {
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

        function serializeFeature(feature: IFeature | null): SerializedFeatureModelNode {
            if (feature == null)
                throw new Error('no feature given');
            const children = feature.getStructure().getChildren()
                .map(featureStructure => featureStructure.getFeature());
    
            if (children.length === 0)
                return writeAttributes({[TYPE]: FeatureType.feature, [NAME]: feature.getName()}, feature);
            else
                return writeAttributes({
                    [TYPE]: feature.getStructure().isAnd()
                        ? FeatureType.and
                        : feature.getStructure().isOr()
                            ? FeatureType.or
                            : feature.getStructure().isAlternative()
                                ? FeatureType.alt
                                : FeatureType.unknown,
                    [NAME]: feature.getName(),
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