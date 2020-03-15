# Classifying multiple images

## This example shows how to classify multiple images and save predictions to a JSON file. 

***

## Using your own images

This example uses a few photos from the [Caltech 101](http://www.vision.caltech.edu/Image_Datasets/Caltech101/).

#### Collect the data

If you're downloading a dataset, download it and move it to the 'images' folder of this example. Unzip it. Delete the zip file. Rename the parent folder (under 'images') to 'dataset'. The dataset folder should contain only images.

If you already have a collection of images, place those in a folder called 'dataset' in the 'images' folder of this example.

#### Get the data's structure and put it in a text file 

Because JavaScript has a hard time pulling in multiple files, we need to make a JSON file of the image folder's structure, with all of the file names. 

Navigate to the dataset in your terminal:

```cd images/dataset```

If you type 'ls', you can see many folders, each containing images. The images that you want to make predictions on can be in any format.

Once in the folder, type 'tree'. You can see a printout of the structure of the data folder. Type 

```tree > ../../make_json/tree.txt```

to save this structure to a text file in the "make_json" folder.

Next, navigate to the make_json folder:

```cd ../../make_json```

There is a program here that will take the tree structure and turn it into a nice clean JSON file to read into our JavaScript program.

Once there, if you type 'ls', you will see your tree.txt file and a python script called main.py. Run this program by typing 

```python main.py```

in your terminal. If you type 'ls' again after this, you will see a data.json file with your JSON-structured data.

Move that file to your 'assets' folder. You can do this on the command line by typing:

```mv data.json ../assets/data.json```





