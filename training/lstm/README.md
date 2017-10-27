# Training

## Python Environment

Set up a python environment with tensorflow installed. ([more detailed instructions](https://github.com/shiffman/A2Z-F17/wiki/Python-Environment-for-LSTM-example))

```
pip install tensorflow
```

## Training

```
python train.py
```

```python
# directory to write output
tf.app.flags.DEFINE_string('output_dir', 'checkpoints/itp/itp', 'Directory to write checkpoint.')
```

```python
# Path to your data
path ='data/itp.txt'
# Any post processing of the text? Line breaks, etc.?
text = open(path).read().lower()
```

```python
# Increase hidden layers depending on amount of text 256, 512, etc.
# 2 MB: 256 (or 128)
# 5 MB: 512
# 10-20 MB: 1024
# 25+ MB: 2048
NHIDDEN = 128
```

```python
# How long do you want to train for?
NEPOCH = 1000
```

```python
# How often do you want to save model?
if step % 100 == 0:
  saver = tf.train.Saver()
  path = saver.save(sess, FLAGS.output_dir, global_step=step)
  print('Saved checkpoint at {}'.format(path))
```

## Convert model

The next step requires you to convert the model to a format compatible with p5-deeplearn-js. This is accomplished with the `json_checkpoint_vars.py` script. The command below specifies where to find the checkpoints file as well as where to write the model.

```
python json_checkpoint_vars.py --checkpoint_file checkpoints/itp-1000 --output_dir models/itp
```

## Run p5 Sketch!

To work with the model in p5, you'll need to copy the following over to your p5.js sketch.

1. `models/itp` (or whatever you named your model)
2. `char_indices.json` and `indices_char.json` (these files were generated when you ran `train.py`.)

See the [lstm_1](https://github.com/ITPNYU/p5-deeplearn-js/tree/master/examples/plainjs/lstm_1) example for a directory structure. In `sketch.js` you'll need to make sure you have:

```javascript
let char_indices;
let indices_char;

function preload() {
  char_indices = loadJSON('data/itp/char_indices.json');
  indices_char = loadJSON('data/itp/indices_char.json');
}
```

And in `lstm.js` (this will eventually be broken out into a library):

```javascript
const reader = new deeplearn.CheckpointLoader('./models/itp');
```








### More notes about RNN configurations (Thanks to Ross Goodwin!)
* 2 MB: -rnn_size 256 (or 128) -layers 2 -seq_length 64 -batch_size 32 -dropout 0.25
* 5-8 MB: -rnn_size 512 -layers 2 (or 3) -seq_length 128 -batch_size 64 -dropout 0.25
* 10-20 MB: -rnn_size 1024 -layers 2 (or 3) -seq_length 128 (or 256) -batch_size 128 -dropout 0.25
* 25+ MB: -rnn_size 2048 -layers 2 (or 3) -seq_length 256 (or 128) -batch_size 128 -dropout 0.25
