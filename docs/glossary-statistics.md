---
id: glossary-statistics
title: Statistics
---

## Population
The entire group which we want to study. Usually, we do not have access to the data for the entirety of this group.

## Sample
A subset of the population. If the sample is _representative_, we can use it to make _inferences_ about the population. A lot of classical statistics deals with this subject. There's various strategies to make a sample representative, the simplest of which is drawing it completely at random from the population. If the sample is not representative, we speak of sample _bias_. The rare case where the sample is actually the entire population is called a _census_.

## Mean
The _mean_ is just another name for average value. So the _sample mean_ is simply the average over all data points. The mean of quantity x is often denoted with a bar:

![](http://chart.apis.google.com/chart?cht=tx&chl={\bar{x}=\frac{1}{n}\sum_{i=1}^n%20x_i})

Here we have assumed that the sample consists of n data points.

## Variance
The _variance_ is a measure or _spread_ in the data. It is found by averaging over the square of the distance from the mean:

![](http://chart.apis.google.com/chart?cht=tx&chl=\textrm{var}(x)=\frac{1}{n-1}\sum_{i=1}^n(x_i-\bar{x})^2)

Note that the "averaging over" is not technically true, as there's n-1 in the denominator rather than n. The reason for this is essentially that we cannot estimate spread in data from one data point alone, so we need at least two points not to "get infinity" by dividing by zero.

## Standard deviation
Variance measures spread, but has the disadvantage of having the units of x squared. This makes interpretation harder. For instance, measuring the heights of a group of people and having the measure of spread be an area (length squared) seems unintuitive. So often, the _standard deviation_ - which is just the square root of the variance - is used instead:

![](http://chart.apis.google.com/chart?cht=tx&chl=\sigma_x=\sqrt{\textrm{var}(x)}=\sqrt{\frac{1}{n-1}\sum_{i=1}^n(x_i-\bar{x})^2})

## Covariance
Often, we wish to get an idea of whether a change in one variable also means that another variable changes. Imagine we have a sample of n data sets where the variables x and y have been measured. The _covariance_ between the two is then:

![](http://chart.apis.google.com/chart?cht=tx&chl=\textrm{cov}(x,y)=\frac{1}{n-1}\sum_{i=1}^n(x_i-\bar{x})(y_i-\bar{y}))

Note: This means the covariance of a variable with itself is just the variance of the variable.

## Correlation
Often covariance itself is not as interesting as the _correlation_, which can be seen as a normalized version of covariance:

![](http://chart.apis.google.com/chart?cht=tx&chl=r_{xy}=\textrm{cor}(x,y)=\frac{\textrm{cov}(x,y)}{\sigma_x\sigma_y})

This quantity is sometimes known as the _Pearson's correlation coefficient_. With this definition, the correlation is always between -1 and 1. Positive (negative) values means that increasing one variable generally increases (decreases) the other. The closer the absolute value is to one, the more pronounced the tendency is. The picture below graphs different datasets and associated correlation values.

![Source: Wikipedia](https://i.stack.imgur.com/AcC3d.png)

A few words of caution are in order here!

### Correlation does *not* imply causation
This is often stated, and is very important to remember. For instance, there might be a positive correlation between ice cream sales and the number of drowning accidents. This does not mean that people drown because the have eaten ice cream! There is a third factor - seasonality - which is the cause of both: People eat more ice cream in the summer. More people go swimming in the summer too, which means more drowning accidents too. Seasonality in this example is called a _confounder_ or _hidden variable_. Causation is generally much harder to detect than correlation.

### Correlation only measures linear tendency
Look at the lower row in the figure above. All have zero correlation, but not all are flat lines. This is because correlation only detects linear variations between the variables. So symmetric variations in particular will have zero correlation. But the two variables are not _independent_. Independence has a probabilty theoretical definition, but for now, the important thing to note is, that while independent variables are uncorrelated, not all uncorrelated variables are independent.