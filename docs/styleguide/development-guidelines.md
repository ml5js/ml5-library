# Development Guidelines

## Principles for ml5.js source code

Here are some principles that we try to uphold while developing `ml5-library`:

|       Guideline                |              description            | 
| ------------- | ------------ |               
| **Clarity over Complexity**  | We strive to make using and maintaining ml5 as approachable as possible. This means that we prefer to define sensible `defaults` (more on that later), simple short function names, and hiding data wrangling steps from the user. |
| **Readibility over Fanciness** | We're all for supporting the latest and greatest, but the reality is that the maintainers of ml5 come from a wide background of skills and levels. To promote contributions from all levels, we favor more readable code than the most efficient or streamlined. |
| **Property and function names** | A guideline drawn from Processing is that function and property names should not be more than 2 words mashed together in camelCase. We try our best to adhere to this, except in cases where were are aligning as closely as possible to the API or pretrained model we've wrapped up. This is totally TBD | 
| **modelNames** | Our general rule of thumb is to use camelCase for models -- e.g. `ml5.bodyPix()` or `ml5.poseNet()`. In some cases, the rules aren't entirely clear, but this is what we strive for. |



## Principles for ml5.js examples 

In addition to the principles above, we try our best to write our `ml5-examples`:

|       Guideline                |              description            | 
| ------------- | ------------ |               
| **Beginner friendly first**  | We try to make sure the examples are as beginner friendly as possible. For example, this means using `for loops` rather than *fancy (but lovely) javascript array methods* when possible, or sometimes doing things in multiple steps.  |
| **With as little HTML markup as possible** | We try to focus as much of the example in javascript as possible. That being said, it is not always possible to avoid HTML markup or advantageous to do so. When possible, add elements with javascript. |
