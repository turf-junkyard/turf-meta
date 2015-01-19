module.exports = each;

/**
 * Lazily iterate over coordinates in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 */
function each(layer, callback) {
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
