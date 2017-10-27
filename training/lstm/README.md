# Training a simple LSTM network

## Python Environment

Set up a python environment with tensorflow installed. ([more detailed instructions](https://github.com/shiffman/A2Z-F17/wiki/Python-Environment-for-LSTM-example))

```
pip install tensorflow
```

## 1) Training

The input file must be inside the `/data` folder in `.txt` format. 

Then run:
```
python train.py --file YOURFILENAME.txt --nhidden 128 --epochs 1000 --save 100
```
--nhidden is the amount of hidden layers

--epochs is the amount of epochs to run the training. Defaults to 1000.

--save is the how often do you want to save model. Defaults to 100.

This will save the output to the `/checkpoints` and create a `variables.json` file.

## 2) Convert model

The next step requires you to convert the model to a format compatible with p5-deeplearn-js. This is accomplished with the `json_checkpoint_vars.py` script find in `/training/`. This scripts is the same for any model trained in tensorflow. The command below specifies where to find the checkpoints file as well as where to write the model.

```
python json_checkpoint_vars.py --checkpoint_file lstm/checkpoints/demo/demo-10 --output_dir demo
```

This will save the model in a js ready format in the globals `./models` folder.

## 3) Run p5 Sketch!

To work with the model in p5, you'll need to:

1. Change the model in the `lstm.js`file:
```javascript
const reader = new deeplearn.CheckpointLoader('../../models/demo');
```
2. Replace the `variables.json` file for the new `variables.json` created in the training.

### More notes about RNN configurations (Thanks to Ross Goodwin!)
* 2 MB: -rnn_size 256 (or 128) -layers 2 -seq_length 64 -batch_size 32 -dropout 0.25
* 5-8 MB: -rnn_size 512 -layers 2 (or 3) -seq_length 128 -batch_size 64 -dropout 0.25
* 10-20 MB: -rnn_size 1024 -layers 2 (or 3) -seq_length 128 (or 256) -batch_size 128 -dropout 0.25
* 25+ MB: -rnn_size 2048 -layers 2 (or 3) -seq_length 256 (or 128) -batch_size 128 -dropout 0.25
