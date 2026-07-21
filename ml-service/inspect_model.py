from pathlib import Path
import tensorflow as tf
p = Path('model/vggres_best.h5')
print('exists', p.exists())
print('abs', p.resolve())
model = tf.keras.models.load_model(p, compile=False)
print('output_shape', model.output_shape)
print('output_dtype', model.output.dtype)
