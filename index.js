/**
 * Lazily iterate over coordinates in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var point = { type: 'Point', coordinates: [0, 0] };
 * coordEach(point, function(coords) {
 *   // coords is equal to [0, 0]
 * });
 */
function coordEach(layer, callback) {
  var features = [], i, j, k, g;

  switch (layer.type) {
      case 'FeatureCollection':
        features = layer.features;
        break;
      case 'Feature':
        features = [layer];
        break;
      default:
        features = [{ geometry: layer }];
        break;
  }

  for (i = 0; i < features.length; i++) {
    var geometries = (features[i].geometry.type === 'GeometryCollection') ?
        features[i].geometry.geometries :
        [features[i].geometry];
    for (g = 0; g < geometries.length; g++) {
      var coords = geometries[g].coordinates;
      switch (geometries[g].type) {
        case 'Point':
          callback(coords);
          break;
        case 'LineString':
        case 'MultiPoint':
          for (j = 0; j < coords.length; j++) callback(coords[j]);
          break;
        case 'Polygon':
        case 'MultiLineString':
          for (j = 0; j < coords.length; j++)
            for (k = 0; k < coords[j].length; k++)
              callback(coords[j][k]);
          break;
        case 'MultiPolygon':
          for (j = 0; j < coords.length; j++)
            for (k = 0; k < coords[j].length; k++)
              for (l = 0; l < coords[j][k].length; l++)
                callback(coords[j][k][l]);
          break;
        default:
          throw new Error('Unknown Geometry Type');
      }
    }
  }
}
module.exports.coordEach = coordEach;

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
module.exports.coordReduce = coordReduce;

/**
 * Lazily iterate over property objects in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var point = { type: 'Feature', geometry: null, properties: { foo: 1 } };
 * propEach(point, function(props) {
 *   // props is equal to { foo: 1}
 * });
 */
function propEach(layer, callback) {
  var i;
  switch (layer.type) {
      case 'FeatureCollection':
        features = layer.features;
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties);
        }
        break;
      case 'Feature':
        callback(layer.properties);
        break;
  }
}
module.exports.propEach = propEach;

/**
 * Lazily reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, coord) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 */
function propReduce(layer, callback, memo) {
  propEach(layer, function(prop) {
    memo = callback(memo, prop);
  });
  return memo;
}
module.exports.propReduce = propReduce;
