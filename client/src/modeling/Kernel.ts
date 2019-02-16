import './_kernel';
import {ArtifactPath} from '../types';
import logger from '../helpers/logger';
import {KernelContext, State} from '../store/types';
import {GroupType, SerializedFeatureModel} from './types';
import {isFeatureDiagramCollaborativeSession, getCollaborativeSession} from 'src/store/selectors';

declare var kernel: {api: any};
type KernelData = any;

class Kernel {
    artifactPath: ArtifactPath;
    context: KernelContext;
    finalized = false;

    get tag() {
        return `kernel [${this.artifactPath}]`;
    }

    _kernelLogger(str: string): void {
        logger.logTagged({tag: this.tag}, () => str);
    }

    _callKernel(fn: (api: any) => void): KernelData {
        if (this.finalized)
            throw new Error('can not call API function on finalized kernel');
        const api = kernel.api;
        api.setLoggerFunction(this._kernelLogger);
        api.setContext(this.context);
        const result: any = fn(api);
        this.context = api.getContext();
        return result;
    }

    constructor(artifactPath: ArtifactPath, context: KernelContext) {
        this.artifactPath = artifactPath;
        this.context = context;
    }

    static _beginFor(state: State, artifactPath: ArtifactPath): Kernel | undefined {
        const collaborativeSession = getCollaborativeSession(state, artifactPath);
        if (!isFeatureDiagramCollaborativeSession(collaborativeSession))
            return;
        return new Kernel(collaborativeSession.artifactPath, collaborativeSession.kernelContext);
    }

    static run<T>(state: State, artifactPath: ArtifactPath | undefined, fn: (kernel: Kernel) => T):
    [KernelContext, T] {
        if (!artifactPath)
            throw new Error('no artifact edited currently, can not find kernel');
        const kernel = this._beginFor(state, artifactPath);
        if (!kernel)
                throw new Error(`can not find a kernel for artifact ${artifactPath}`);
        const result = fn(kernel);
        kernel._finalize();
        return [kernel.context, result];
    }

    static initialize(artifactPath: ArtifactPath, siteID: string, context: string):
    [KernelContext, SerializedFeatureModel] {
        const kernel = new Kernel(artifactPath, {});
        kernel._initialize(siteID, context);
        kernel._finalize();
        return [kernel.context, null as unknown as SerializedFeatureModel]; // TODO: extract initial FM
    }

    _finalize(): KernelContext {
        this.finalized = true;
        return this.context;
    }

    _initialize(siteID: string, context: string) {
        this._callKernel(api => api.clientInitialize(siteID, context));
    }

    generateOperation(POSequence: KernelData): [SerializedFeatureModel, string] {
        const [serializedFeatureModel, operation]: [KernelData, string] = this._callKernel(api => api.clientGenerateOperation(POSequence))
        // TODO: assuming into-array can be destructured like this
        // TODO: which feature model format should be used here?
        return [serializedFeatureModel, operation];
    }

    generateHeartbeat(): string {
        return this._callKernel(api => api.clientGenerateHeartbeat())
    }

    receiveMessage(message: string): SerializedFeatureModel /* | ConflictResolutionDetails */ {
        // TODO: returns serialized feature model (or conflict resolution information)
        return this._callKernel(api => api.clientReceiveMessage(message));
    }

    GC(): void {
        this._callKernel(api => api.clientGC());
    }

    operationCompose(...POSequences: KernelData[]): KernelData {
        return this._callKernel(api => api.operationCompose(...POSequences));
    }

    operationCreateFeatureBelow(parentID: string): KernelData {
        return this._callKernel(api => api.operationCreateFeatureBelow(parentID));
    }

    operationCreateFeatureAbove(...IDs: string[]): KernelData {
        return this._callKernel(api => api.operationCreateFeatureAbove(...IDs));
    }

    operationRemoveFeatureSubtree(ID: string): KernelData {
        return this._callKernel(api => api.operationRemoveFeatureSubtree(ID));
    }

    operationMoveFeatureSubtree(ID: string, parentID: string): KernelData {
        return this._callKernel(api => api.operationMoveFeatureSubtree(ID, parentID));
    }

    operationRemoveFeature(ID: string): KernelData {
        return this._callKernel(api => api.operationRemoveFeature(ID));
    }

    operationSetFeatureOptional(ID: string, isOptional: boolean): KernelData {
        return this._callKernel(api => api.operationSetFeatureOptional(ID, isOptional));
    }

    operationSetFeatureGroupType(ID: string, groupType: GroupType): KernelData {
        return this._callKernel(api => api.operationSetFeatureGroupType(ID, groupType));
    }

    operationSetFeatureProperty(ID: string, property: string, value: any): KernelData {
        return this._callKernel(api => api.operationSetFeatureProperty(ID, property, value));
    }

    operationCreateConstraint(formula: KernelData): KernelData {
        // TODO: constraint formula format
        return this._callKernel(api => api.operationCreateConstraint(formula));
    }

    operationSetConstraint(ID: string, formula: KernelData): KernelData {
        // TODO: constraint formula format
        return this._callKernel(api => api.operationSetConstraint(ID, formula));
    }

    operationRemoveConstraint(ID: string): KernelData {
        return this._callKernel(api => api.operationRemoveConstraint(ID));
    }
}

export default Kernel;