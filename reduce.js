module.exports.coordReduce = coordReduce;

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
      switch (features[i].geometry.type) {
        case 'Point':
          memo = callback(memo, coords);
          break;
        case 'LineString':
        case 'MultiPoint':
          for (j = 0; j < coords.length; j++) memo = callback(memo, coords[j]);
          break;
        case 'Polygon':
        case 'MultiLineString':
          for (j = 0; j < coords.length; j++)
            for (k = 0; k < coords[j].length; k++)
              memo = callback(memo, coords[j][k]);
          break;
        case 'MultiPolygon':
          for (j = 0; j < coords.length; j++)
            for (k = 0; k < coords[j].length; k++)
              for (l = 0; l < coords[j][k].length; l++)
                memo = callback(memo, coords[j][k][l]);
          break;
        default:
          throw new Error('Unknown Geometry Type');
      }
    }
  }
  return memo;
}
