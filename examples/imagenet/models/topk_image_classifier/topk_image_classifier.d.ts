import { Array3D, Model, NDArrayMath } from '../../src';
export declare class TopKImageClassifier implements Model {
    private numClasses;
    private k;
    private math;
    private squeezeNet;
    private trainLogitsMatrix;
    private classLogitsMatrices;
    private classExampleCount;
    private varsLoaded;
    private mathCPU;
    constructor(numClasses: number, k: number, math: NDArrayMath);
    load(): Promise<void>;
    clearClass(classIndex: number): void;
    addImage(image: Array3D, classIndex: number): Promise<void>;
    predict(image: Array3D): Promise<{
        classIndex: number;
        confidences: number[];
    }>;
    getClassExampleCount(): number[];
    private clearTrainLogitsMatrix();
    private concatWithNulls(ndarray1, ndarray2);
    private normalizeVector(vec);
    private getNumExamples();
    dispose(): void;
}
