import {ArtifactPath} from '../../types';
import {State} from '../../store/types';

class Kernel {
    static run<T>(state: State, artifactPath: ArtifactPath | undefined, fn: (kernel: Kernel) => T): never {
        throw new Error('Kernel currently not stubbed');
    }

    static initialize(artifactPath: ArtifactPath, siteID: string, context: string): never {
        throw new Error('Kernel currently not stubbed');
    }
}

export default Kernel;