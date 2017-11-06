import { Array1D, Array3D, Model, NDArrayMath } from '../../src';
export declare class SqueezeNet implements Model {
    private math;
    private variables;
    private preprocessOffset;
    constructor(math: NDArrayMath);
    load(): Promise<void>;
    predict(input: Array3D): Promise<{
        namedActivations: {
            [activationName: string]: Array3D;
        };
        logits: Array1D;
    }>;
    private fireModule(input, fireId);
    dispose(): void;
}
