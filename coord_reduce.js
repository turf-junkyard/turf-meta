var coordEach = require('./coord_each');

module.exports = coordReduce;

/**
 * Lazily reduce coordinates in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all coordinates is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, value) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 */
function coordReduce(layer, callback, memo) {
  coordEach(layer, function(coord) {
    memo = callback(memo, coord);
  });
  return memo;
}
