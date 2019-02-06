import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
declare class KNN {
    knnClassifier: knnClassifier.KNNClassifier;
    mapStringToIndex: Array<any>;
    constructor();
    addExample(input: any, classIndexOrLabel: any): void;
    classify(input: any, kOrCallback: any, cb: any): Promise<any>;
    classifyInternal(input: any, k: any): Promise<{
        classIndex: number;
        confidences: {
            [classId: number]: number;
        };
    }>;
    clearLabel(labelIndex: any): void;
    clearAllLabels(): void;
    getCountByLabel(): {
        [classId: number]: number;
    };
    getCount(): {
        [classId: number]: number;
    };
    getClassifierDataset(): {
        [classId: number]: tf.Tensor<tf.Rank.R2>;
    };
    setClassifierDataset(dataset: any): void;
    getNumLabels(): number;
    dispose(): void;
    save(name: any): void;
    load(path: any, callback: any): void;
}
declare const KNNClassifier: () => KNN;
export default KNNClassifier;
