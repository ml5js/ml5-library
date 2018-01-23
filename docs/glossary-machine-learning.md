---
id: glossary-machine-learning
title: Machine Learning
---

## The data set
The accessible sample is our data set, which consists of a number of _data points_. Each data point will contain information expressed through a number of attributes. Each attribute has a _data type_. The most common data types are numbers (_numerical data_) and text strings (_nominal data_). A subset of nominal data is _categorical_, i.e. from a finite set of options, such as "yes/no", month, etc. Categorical data are sometimes known as _factors_.

## Features
A feature is an attribute that is used in the machine learning analysis of the problem. This could be the raw features, but may also be quantities extracted by some kind of pre-processing of the data. Extracting appropriate features is known as _feature engineering_. Feature engineering traditionally requires some kind of _domain knowledge_. One of the strengths of deep learning is, that it essentially does the feature engineering for you: The model itself learns appropriate features from the raw data.

## Models
A _mathematical model_ is an abstraction trying to describe some part of reality. Reality is complex, so a model will never be able to completely mimic real phenomena. But we should pick a model that catches the broad strokes of behaviour. Keep in mind the famous words of the great statistician George Box: "All models are wrong, but some are useful".

## Algorithms
A _machine learning algorithm_ is a "recipe" that uses the data to make a model of a given type. A model is usually described by a number of _parameters_. For instance, a linear model y=ax+b has the slope a and the intercept b as parameters. The algorithm seeks out values of the parameters that are the best in some sense.

## Supervised learning
Supervised learning is a class of algorithms, where we already know the attribute we wish to predict for the sample data set. For instance, we may have a large number of pictures of cats and dogs, where the animal in each photo as already been identified. Such an attribute is known as a _label_.

The two most important subcategories of supervised learning is:

### Classification
Supervised learning, where the label is categorical. Like in the cat/dog example above. When, like here, there's only two possible outcomes, we speak of _binary classification_. An example is _k-nearest neighbors_ (kNN) which looks at the k nearest data points and predicts based on the majority of these.

### Regression
Supervised learning, where the label is numerical. _Simple linear regression_ is an example.

## Unsupervised learning
Unsupervised learning is the process of searching for _structure_ in a data set. This often involves _clustering_, i.e. dividing the data set into groups that are similar in some respect. k-means clustering is the most famous example.

## Subdividing the data set
To be able to validate a model learned by a supervised training algorithm, the data set is traditionally divided into two sets (at random) before doing the training: The _training set_ and the _test_ set. The idea is, that we must not use the test set in our model building. That way, we can see how it performs on a "new" data set - the test set. A typical split is 80% for the training set and 20% for the test set, but there's no hard and fast rules.

### Training set
This is the set for which the actual training algorithm is performed. So the model is made using only the data in the training set.

### Test set
The model resulting from the test set is used to make _predictions_ for the data in the test set. These predictions are then compared to the actual labels from the test set. For categorical data, the results are often summed up in a _confusion matrix_.

### Validation set
Some models have additional _hyperparameters_ that needs to be tuned to find the best version of the model. A hyperparameter is typically a quantity which tweaks the way the "ordinary" model parameters are found. Examples are the k in k-nearest neighbors or the learning rate described below. It can be tempting to try out different values of these hyperparameters when using the test set to make predictions. However, if we do this, we violate the principle that only the training set should be used to build the model. Therefore, often the training set is further subdivided into (proper) training set and _validation set_. The model is then build using the training set, and the hyperparameter(s) are fitted by prediction on the validation set. Some methods randomly pick several validation sets as part of  learning. Such sets are known as _cross-validation_ sets (but is often used synonymously with validation set). A common distribution between training and validation sets is 70% and 30%, but again these are guidelines.

## Loss function
Many machine learning algorithms work through a _loss function_. A loss function (also known as a _cost function_) quantifies how badly a model performs on the training set. For instance, for numerical labels, it might sum over the squared differences between predicted and actual values. Hence, the smaller the loss function, the better the model.

## Gradient descent
So the objective is to minimize the loss function. If the gradients of the function can be calculated (or estimated numerically), a minimum can be searched for by starting with a random set of model parameters and the gradually moving in the direction where the loss functions decreases the most. This is known as _gradient descent_, and is similar to a ball rolling downhill in the parameter landscape. The size of these steps is proportional to the _learning rate_ hyperparameter (also known as the _step size_). A large learning rate will make convergence faster, but sometimes has trouble finding the minimum, while a smaller learning rate is slower but more reliable. If the loss function is not _convex_ in the parameters, the algorithm may get stuck at a local minimum. A number of modifications to this algorithm exists.

## Over- and underfitting
A model that follows the training data very closely by fitting a large number of parameters has the risk of building the model on the noise in the training as well as the overall trends. This means, that while the model will perform excellently on the training set, it will usually perform poorly on the test set. This is known as _overfitting_. On the other hand, if there's not a lot of parameters to tune - or if the model is simply inappropriate to describe the underlying phenomenon - the model will always perform badly. This is known as _underfitting_. _Regularization_ is a technique commonly used to avoid overfitting. It uses a hyperparameter to control the magnitude of the model parameters.