# K-Means Clustering

<center>
    <img style="display:block; max-height:20rem" alt="groups of points colored depending on which cluster it has been categorized into by the kmeans algorithm" src="_media/reference__header-kmeans.png">
</center>


## Description

The KMeans clustering algorithm. Read more about it [here](https://en.wikipedia.org/wiki/K-means_clustering)

## Quickstart

```js
const data = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
const options = {
  k: 3,
  maxIter: 4,
  threshold: 0.5,
};
// Initialize the magicFeature
const kmeans = ml5.kmeans(data, options, clustersCalculated);

// When the model is loaded
function clustersCalculated() {
  console.log('Points Clustered!');
  console.log(kmeans.dataset);
}

```


## Usage

### Initialize

```js
const kmeans = ml5.kmeans(data, ?options, ?callback);
```

#### Parameters
* **data**: REQUIRED. JSON object | Data URL. Can be a CSV or JSON dataset. Your data might look like:
  * csv:
    ```csv
    x1, y1
    1, 2
    3, 4
    5, 6
    ```
  * json:
    ```json
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
    ```
* **options**: OPTIONAL. Sets the options including:
  * `k`: the number of clusters
  * `maxIter`: Max number of iterations to try before forcing convergence.
  * `threshold`: Threshold for updated centriod distance before declaring convergence.
* **callback**: OPTIONAL. A callback function that is called once the kmeans clusters have been calculated.


### Properties


***
#### .config
> *Object*: object containing the configuration of the kmeans
***

***
#### .dataset
> **Array**: an array of objects containing the original data where each object is a "row" of data with a property called `centroid` indicating which cluster this point belongs to.
***
***
#### .dataTensor
> **Tensor**: an tensorflow tensor representing the `.dataset` property
***
***
#### .centroids
> **Tensor**: an tensorflow tensor representing the `.centroids`
***



### Methods


* The `ml5.kmeans()` calculates the kmeans clusters of the input data. See usage above.

## Examples
```ml5-examples
KMeans
```

## Demo

No demos yet - contribute one today!

## Tutorials

No tutorials yet - contribute one today!


## Acknowledgements

**Contributors**:
  * [Jared Wilber](https://www.jwilber.me/)

**Credits**:
  * Paper Reference | Website URL | Github Repo | Book reference | etc

## Source Code

* [/src/KMeans](https://github.com/ml5js/ml5-library/tree/main/src/KMeans)
