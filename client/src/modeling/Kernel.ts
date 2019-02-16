import './_kernel';
import {ArtifactPath} from '../types';
import logger from '../helpers/logger';

declare var kernel: {api: any};
type KernelData = any;

export enum GroupType {
    and = 'and',
    or = 'or',
    alternative = 'alternative'
};

export default class {
    artifactPath: ArtifactPath;
    context: object;

    kernelLogger(str: string): void {
        logger.logTagged({tag: `kernel [${this.artifactPath}]`}, () => str);
    }

    callKernel(fn: (api: any) => void): KernelData {
        const api = kernel.api;
        api.setLoggerFunction(this.kernelLogger);
        api.setContext(this.context);
        let result: any = fn(api);
        this.context = api.getContext();
        return result;
    }

    constructor(artifactPath: ArtifactPath, siteID: string, context: string) {
        this.artifactPath = artifactPath;
        this.callKernel(api => api.clientInitialize(siteID, context));
    }

    generateOperation(POSequence: KernelData): [KernelData, string] {
        let [nextFeatureModel, operation]: [KernelData, string] = this.callKernel(api => api.clientGenerateOperation(POSequence))
        // TODO: assuming into-array can be destructured like this
        // TODO: which feature model format should be used here?
        return [nextFeatureModel, operation];
    }

    generateHeartbeat(): string {
        return this.callKernel(api => api.clientGenerateHeartbeat())
    }

    receiveMessage(message: string): KernelData {
        // TODO: returns feature model (or conflict resolution information)
        return this.callKernel(api => api.clientReceiveMessage(message));
    }

    GC(): void {
        this.callKernel(api => api.clientGC());
    }

    operationCompose(...POSequences: KernelData[]): KernelData {
        return this.callKernel(api => api.operationCompose(...POSequences));
    }

    operationCreateFeatureBelow(parentID: string): KernelData {
        return this.callKernel(api => api.operationCreateFeatureBelow(parentID));
    }

    operationCreateFeatureAbove(...IDs: string[]): KernelData {
        return this.callKernel(api => api.operationCreateFeatureAbove(...IDs));
    }

    operationRemoveFeatureSubtree(ID: string): KernelData {
        return this.callKernel(api => api.operationRemoveFeatureSubtree(ID));
    }

    operationMoveFeatureSubtree(ID: string, parentID: string): KernelData {
        return this.callKernel(api => api.operationMoveFeatureSubtree(ID, parentID));
    }

    operationRemoveFeature(ID: string): KernelData {
        return this.callKernel(api => api.operationRemoveFeature(ID));
    }

    operationSetFeatureOptional(ID: string, isOptional: boolean): KernelData {
        return this.callKernel(api => api.operationSetFeatureOptional(ID, isOptional));
    }

    operationSetFeatureGroupType(ID: string, groupType: GroupType): KernelData {
        return this.callKernel(api => api.operationSetFeatureGroupType(ID, groupType));
    }

    operationSetFeatureProperty(ID: string, property: string, value: any): KernelData {
        return this.callKernel(api => api.operationSetFeatureProperty(ID, property, value));
    }

    operationCreateConstraint(formula: KernelData): KernelData {
        // TODO: constraint formula format
        return this.callKernel(api => api.operationCreateConstraint(formula));
    }

    operationSetConstraint(ID: string, formula: KernelData): KernelData {
        // TODO: constraint formula format
        return this.callKernel(api => api.operationSetConstraint(ID, formula));
    }

    operationRemoveConstraint(ID: string): KernelData {
        return this.callKernel(api => api.operationRemoveConstraint(ID));
    }
}