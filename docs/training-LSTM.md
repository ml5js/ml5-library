---
id: training-lstm
title: Training a LSTM 
---


Multi-layer Recurrent Neural Networks (LSTM, RNN) for character-level language models in Python using Tensorflow and modified to work with [deeplearn.js](https://github.com/PAIR-code/deeplearnjs) and ml5.js

Based on [char-rnn-tensorflow](https://github.com/sherjilozair/char-rnn-tensorflow).

## Requirements

Set up a python environment with tensorflow installed. [More detailed instructions here](../)

## Usage

### 1) Train

Inside the `/data` folder, create a new folder with the name of your data. Inside that folder should be one file called `input.txt`
(A quick tip to concatenate many small disparate `.txt` files into one large training file: `ls *.txt | xargs -L 1 cat >> input.txt`)
Then run:

```bash
python train.py --data_dir=./data/my_own_data/
```

You can specify the hyperparameters:

```bash
python train.py --data_dir=./data/my_own_data/ --rnn_size 128 --num_layers 2 --seq_length 64 --batch_size 32 --num_epochs 1000
```

This will train your model and save the model, **in the globals `./models` folder**, in a format usable in javascript. 

### 2) Run!

To work with the model in ML5, you'll just need to point to the new folder in your sketch:

```javascript
var lstm = new ml5.LSTMGenerator('./models/your_new_model');
```

That's it!

## Hyperparameters

_Thanks to Ross Goodwin!_

Given the size of the training dataset, you can use:

* 2 MB: 
   - rnn_size 256 (or 128) 
   - layers 2 
   - seq_length 64 
   - batch_size 32 
   - dropout 0.25
* 5-8 MB: 
  - rnn_size 512 
  - layers 2 (or 3) 
  - seq_length 128 
  - batch_size 64 
  - dropout 0.25
* 10-20 MB: 
  - rnn_size 1024 
  - layers 2 (or 3) 
  - seq_length 128 (or 256) 
  - batch_size 128 
  - dropout 0.25
* 25+ MB: 
  - rnn_size 2048 
  - layers 2 (or 3) 
  - seq_length 256 (or 128) 
  - batch_size 128 
  - dropout 0.25

## Tensorboard

Tensorflow comes with [Tensorboard](https://github.com/tensorflow/tensorboard): "a suite of web applications for inspecting and understanding your TensorFlow runs and graphs.".

To visualize training progress, model graphs, and internal state histograms: fire up Tensorboard and point it at your `log_dir`:

```bash
$ tensorboard --logdir=./logs/
```

Then open a browser to [http://localhost:6006](http://localhost:6006) or the correct IP/Port specified.

