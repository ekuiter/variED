import './_kernel';
import {ArtifactPath, artifactPathToString} from '../types';
import logger from '../helpers/logger';
import {KernelContext, State, KernelData} from '../store/types';
import {GroupType, KernelFeatureModel} from './types';
import {isFeatureDiagramCollaborativeSession, getCollaborativeSession} from '../store/selectors';
import uuidv4 from 'uuid/v4';

declare var window: any;
declare var kernel: {api: any};
const _kernel = kernel;
delete window.kernel;

class Kernel {
    artifactPath: ArtifactPath;
    context?: KernelContext;
    running = false;

    _kernelLogger = (str: string) =>
        logger.infoTagged({tag: 'kernel'}, () => `[${artifactPathToString(this.artifactPath)}] ${str}`);

    _callKernel(fn: (api: any) => void): KernelData {
        if (!this.running)
            throw new Error('can only call API function on running kernel');
        _kernel.api.setLoggerFunction(logger.isLoggingInfo() ? this._kernelLogger : null);
        _kernel.api.setGenerateIDFunction(uuidv4);
        _kernel.api.setContext(this.context);
        const result: any = fn(_kernel.api);
        this.context = _kernel.api.getContext();
        if (logger.isLoggingInfo())
            _kernel.api.logProfile();
        return result;
    }

    constructor(artifactPath: ArtifactPath, context?: KernelContext) {
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
                throw new Error(`can not find a kernel for artifact ${artifactPathToString(artifactPath)}`);
        kernel.running = true;
        const result = fn(kernel);
        kernel.running = false;
        return [kernel.context!, result];
    }

    static initialize(artifactPath: ArtifactPath, siteID: string, context: string):
    [KernelContext, KernelFeatureModel] {
        const kernel = new Kernel(artifactPath);
        kernel.running = true;
        const kernelFeatureModel = kernel._initialize(siteID, context);
        kernel.running = false;
        return [kernel.context!, kernelFeatureModel];
    }

    _initialize(siteID: string, context: string): KernelFeatureModel {
        return this._callKernel(api => api.clientInitialize(siteID, context));
    }

    generateOperation(POSequence: KernelData): [KernelFeatureModel, string] {
        const [kernelFeatureModel, operation]: [KernelData, string] =
            this._callKernel(api => api.clientGenerateOperation(POSequence))
        // TODO: assuming into-array can be destructured like this
        return [kernelFeatureModel, operation];
    }

    generateHeartbeat(): string {
        return this._callKernel(api => api.clientGenerateHeartbeat())
    }

    receiveMessage(message: string): KernelFeatureModel /* | ConflictResolutionDetails */ {
        // TODO: might return conflict resolution information
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
        // TODO: constraint formula format (js->clj?)
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