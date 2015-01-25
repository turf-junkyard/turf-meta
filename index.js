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
  var i, j, k, g, geometry, stopG, coords,
    geometryMaybeCollection,
    isGeometryCollection,
    isFeatureCollection = layer.type === 'FeatureCollection',
    isFeature = layer.type === 'Feature',
    stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {

    geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
    isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
    stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

    for (g = 0; g < stopG; g++) {

      geometry = isGeometryCollection ?
          geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
      coords = geometry.coordinates;

      if (geometry.type === 'Point') {
        callback(coords);
      } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        for (j = 0; j < coords.length; j++) callback(coords[j]);
      } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length; k++)
            callback(coords[j][k]);
      } else if (geometry.type === 'MultiPolygon') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length; k++)
            for (l = 0; l < coords[j][k].length; l++)
              callback(coords[j][k][l]);
      } else {
        throw new Error('Unknown Geometry Type');
      }
    }
  }
}
module.exports.coordEach = coordEach;

/**
 * Create a new array from the results of calling a callback on each
 * coordinate in a GeoJSON object.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value) and returns
 * a new value
 * @returns {Array} an array of results.
 */
function coordFlatMap(layer, callback) {
  var output = [];
  coordEach(layer, function(coord) { output.push(callback(coord)); });
  return output;
}
module.exports.coordFlatMap = coordFlatMap;


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

/**
 * Provide an Array.map-like function that iterates over
 * each Position of any GeoJSON object and returns a GeoJSON
 * object with the Positions mapped. Like `Array.map`, this
 * will not mutate the input value.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value, index) and returns
 * (new value)
 * @example
 * var point = { type: 'Point', coordinates: [10, 0] };
 * var flippedPoint = coordMap(point, function(coords) {
 *   return [coords[1], coords[0]];
 * });
 */
function coordMap(input, callback) {
  var layer = JSON.parse(JSON.stringify(input)),
    i, j, k, g, geometry, stopG, coords,
    geometryMaybeCollection,
    isGeometryCollection,
    isFeatureCollection = layer.type === 'FeatureCollection',
    isFeature = layer.type === 'Feature',
    stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {

    geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
    isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
    stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

    for (g = 0; g < stopG; g++) {

      geometry = isGeometryCollection ?
          geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
      coords = geometry.coordinates;

      if (geometry.type === 'Point') {
        geometry.coordinates = callback(geometry.coordinates, 0);
      } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        geometry.coordinates = geometry.coordinates.map(callback);
      } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        geometry.coordinates = geometry.coordinates.map(function(ring) {
          return ring.map(callback);
        });
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates = geometry.coordinates.map(function(polygon) {
          return polygon.map(function(ring) {
              return ring.map(callback);
          });
        });
      } else {
        throw new Error('Unknown Geometry Type');
      }
    }
  }
  return layer;
}
module.exports.coordMap = coordMap;

/**
 * Curry the outer argument to a given function. This is generally
 * useful for iterator functions that take their input as the first
 * argument and a callback as a second argument: this lets you functionally
 * curry them into forms that already 'know' what callback they'll run.
 *
 * @param {Function} function the function to run
 * @param {*} argument the outer argument to add
 * @returns {Function} a curried version of this function.
 * @example
 *
 * var parseRadix10Number = curryOuter(parseInt, 10);
 * // this call is the equivalent of parseInt('05', 10);
 * var five = parseRadix10Number('05');
 * //=five
 */
function curryOuter(fn, b, c, d) {
    return function(a) {
        return fn(a, b);
    };
}
module.exports.curryOuter = curryOuter;

function invoke(a) {
    return function(b) { return b[a](); };
}
module.exports.invoke = invoke;
