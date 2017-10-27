"""Trains and Evaluates a simple LSTM network."""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import argparse
import numpy as np
import tensorflow as tf
import json

def main(unused_argv):

  # get the file name
  fileName = FLAGS.file
  fileName = fileName.split(".")[0]

  # create the output directory
  output_dir = 'checkpoints/{}/'.format(fileName)
  tf.gfile.MakeDirs(output_dir)

  # Load the data
  path ='data/{}'.format(FLAGS.file)
  # Case by case basis in terms of handling line breaks
  text = open(path).read().lower()

  # map chars to indices and indices to chars
  chars = sorted(list(set(text)))
  char_indices = dict((c,i) for i,c in enumerate(chars))
  indices_char = dict((i,c) for i,c in enumerate(chars))

  # encode the data
  encoded_data = []
  # number of characters to use
  for c in text:
    encoded_data.append(char_indices[c])

  data = np.array([encoded_data])
  tf.reset_default_graph()

  # input, output placeholders
  x = tf.placeholder(dtype=tf.int32, shape=[1, data.shape[1] - 1])
  y = tf.placeholder(dtype=tf.int32, shape=[1, data.shape[1] - 1])

  # Increase hidden layers depending on amount of text 256, 512, etc.
  NHIDDEN = FLAGS.nhidden
  NLABELS = len(chars)

  # print how is everything
  print('text len:', len(text))
  print('chars len:', len(chars))
  print('All posible chars are:', chars)
  print('char_indices:', char_indices)
  print('indices_char:', indices_char)
  print('data.shape:', data.shape)
  print('x.shape:', x.shape)
  print('y.shape:', y.shape)
  print('y.shape:', y.shape)
  print('NLABELS:', NLABELS)
  print('NHIDDEN:', NHIDDEN)

  # create a js file to import in js
  print('Writing variables.json')
  with open("variables.json", "w") as out:
    js_obj = {
      "char_indices": char_indices,
      "indices_char": indices_char,
      "NLABELS": NLABELS
    }
    json.dump(js_obj, out)

  # create the lstm architecture
  lstm1 = tf.contrib.rnn.BasicLSTMCell(NHIDDEN)
  lstm2 = tf.contrib.rnn.BasicLSTMCell(NHIDDEN)
  lstm = tf.contrib.rnn.MultiRNNCell([lstm1, lstm2])
  initial_state = lstm.zero_state(1, tf.float32)

  outputs, final_state = tf.nn.dynamic_rnn(
      cell=lstm, inputs=tf.one_hot(x, NLABELS), initial_state=initial_state)

  logits = tf.contrib.layers.linear(outputs, NLABELS)

  softmax_cross_entropy = tf.nn.sparse_softmax_cross_entropy_with_logits(
      labels=y, logits=logits)

  predictions = tf.argmax(logits, axis=-1)
  loss = tf.reduce_mean(softmax_cross_entropy)

  train_op = tf.train.AdamOptimizer().minimize(loss)

  sess = tf.InteractiveSession()
  sess.run(tf.global_variables_initializer())

  # start the training
  print('Start training')
  NEPOCH = FLAGS.epochs
  for step in range(NEPOCH + 1):
    loss_out, _ = sess.run([loss, train_op],
                           feed_dict={
                               x: data[:, :-1],
                               y: data[:, 1:],
                           })
    if step % 100 == 0:
      print('Loss at step {}: {}'.format(step, loss_out))

    if step % FLAGS.save == 0:
      saver = tf.train.Saver()
      path = saver.save(sess, output_dir+fileName, global_step=step)
      print('Saved checkpoint at {}'.format(path))

  print('Results:')
  results = sess.run([predictions], feed_dict={x: data[:, :-1]})
  textResult = ''
  for c in results[0][0]:
    textResult += indices_char[c]
  print(textResult)

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument(
      '--file',
      type=str,
      required=True,
      help='Name of the file to train the model on. Must be a .txt file inside the data folder.')
  parser.add_argument(
      '--nhidden',
      type=int,
      required=False,
      default=128,
      help='Number of hidden layers. Defaults to 128')
  parser.add_argument(
      '--epochs',
      type=int,
      required=False,
      default=1000,
      help='Number of epochs layers. Defaults to 1000')
  parser.add_argument(
      '--save',
      type=int,
      required=False,
      default=100,
      help='How often do you want to save model? Defaults to 100.')
  FLAGS, unparsed = parser.parse_known_args()
  if unparsed:
    print('Error, unrecognized flags:', unparsed)
    exit(-1)
  tf.app.run(main)
