/**
 * Gets a unique name for Angular services and controllers.
 */
export default function getUniqueName () {
  let text = [];
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-*.:=|!@#%&~';

  for (let i = 0; i < 16; i++) {
    text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }
  return text.join('');
}
