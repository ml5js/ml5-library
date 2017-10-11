"""Trains and Evaluates a simple LSTM network."""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import numpy as np
import tensorflow as tf

FLAGS = tf.app.flags.FLAGS

tf.app.flags.DEFINE_string('output_dir', '/Users/cristobalvalenzuela/Dropbox/cvalenzuelab/github/p5deeplearn/experiments/lstm/checkpoints', 'Directory to write checkpoint.')

def main(unused_argv):
  path ='../data/hamlet.txt'
  text = open(path).read().lower()
  chars = sorted(list(set(text)))
  char_indices = dict((c,i) for i,c in enumerate(chars))
  indices_char = dict((i,c) for i,c in enumerate(chars))
  maxlen = 40
  sentences= []
  next_chars=[]
  for i in range(0, len(text)-maxlen, 3):
      sentences.append(text[i:i+maxlen])
      next_chars.append(text[i+maxlen])

  x = np.zeros((len(sentences), maxlen, len(chars)), dtype=np.int32)
  y = np.zeros((len(sentences), len(chars)), dtype=np.int32)
  for i, sentence in enumerate(sentences):
      for t, char in enumerate(sentence):
          x[i, t, char_indices[char]] = 1
      y[i, char_indices[next_chars[i]]]=1
  
  ########

  data = np.array([[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4]])

  tf.reset_default_graph()

  #x = tf.placeholder(dtype=tf.int32, shape=[1, data.shape[1] - 1])
  #y = tf.placeholder(dtype=tf.int32, shape=[1, data.shape[1] - 1])

  NHIDDEN = 20
  NLABELS = 10

  lstm1 = tf.contrib.rnn.BasicLSTMCell(NHIDDEN)
  lstm2 = tf.contrib.rnn.BasicLSTMCell(NHIDDEN)
  lstm = tf.contrib.rnn.MultiRNNCell([lstm1, lstm2])
  initial_state = lstm.zero_state(1, tf.float32)

  outputs, final_state = tf.nn.dynamic_rnn(cell=lstm, inputs=tf.one_hot(x, NLABELS), initial_state=initial_state)

  logits = tf.contrib.layers.linear(outputs, NLABELS)

  softmax_cross_entropy = tf.nn.sparse_softmax_cross_entropy_with_logits(labels=y, logits=logits)

  predictions = tf.argmax(logits, axis=-1)
  loss = tf.reduce_mean(softmax_cross_entropy)

  train_op = tf.train.AdamOptimizer().minimize(loss)

  sess = tf.InteractiveSession()
  sess.run(tf.global_variables_initializer())

  print('Starting training...')
  NEPOCH = 1000
  for step in range(NEPOCH + 1):
    loss_out, _ = sess.run([loss, train_op], feed_dict={x: data[:, :-1], y: data[:, 1:],})
    if step % 100 == 0:
      print('Loss at step {}: {}'.format(step, loss_out))

  print('Expected data:')
  print(data[:, 1:])
  print('Results:')
  print(sess.run([predictions], feed_dict={x: data[:, :-1]}))

  saver = tf.train.Saver()
  path = saver.save(sess, FLAGS.output_dir, global_step=step)
  print('Saved checkpoint at {}'.format(path))


if __name__ == '__main__':
  tf.app.run(main)

