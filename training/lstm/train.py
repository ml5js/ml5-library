"""Trains and Evaluates a simple LSTM network."""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import numpy as np
import tensorflow as tf

FLAGS = tf.app.flags.FLAGS

tf.app.flags.DEFINE_string('output_dir', 'checkpoints', 'Directory to write checkpoint.')

def main(unused_argv):
  # Load the data
  path ='data/hamlet.txt'
  text = open(path).read().lower().replace("\n", "")
  chars = sorted(list(set(text)))
  char_indices = dict((c,i) for i,c in enumerate(chars))
  indices_char = dict((i,c) for i,c in enumerate(chars))

  encoded_data = []

  for c in text[:500]:
    encoded_data.append(char_indices[c])

  data = np.array([encoded_data])
  print(data)

  tf.reset_default_graph()

  x = tf.placeholder(dtype=tf.int32, shape=[1, data.shape[1] - 1])
  y = tf.placeholder(dtype=tf.int32, shape=[1, data.shape[1] - 1])

  NHIDDEN = 512
  NLABELS = 40

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

  print('Start training')
  NEPOCH = 1000
  for step in range(NEPOCH + 1):
    loss_out, _ = sess.run([loss, train_op],
                           feed_dict={
                               x: data[:, :-1],
                               y: data[:, 1:],
                           })
    if step % 10 == 0:
      print('Loss at step {}: {}'.format(step, loss_out))

  print('Expected data:')
  expected = ''
  for c in data[:, 1:][0]:
    expected += indices_char[c]
  print(expected)
  print('Results:')
  results = sess.run([predictions], feed_dict={x: data[:, :-1]})
  textResult = ''
  for c in results[0][0]:
    textResult += indices_char[c]
  print(textResult)

  saver = tf.train.Saver()
  path = saver.save(sess, FLAGS.output_dir, global_step=step)
  print('Saved checkpoint at {}'.format(path))

if __name__ == '__main__':
  tf.app.run(main)

