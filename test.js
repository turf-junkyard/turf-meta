'use strict';

var test = require('tape'),
    meta = require('./');

var pointGeometry = Object.freeze({
    type: 'Point',
    coordinates: [0, 0]
});

var lineStringGeometry = Object.freeze({
    type: 'LineString',
    coordinates: [[0, 0], [1, 1]]
});

var polygonGeometry = Object.freeze({
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]]
});

var multiPolygonGeometry = Object.freeze({
    type: 'MultiPolygon',
    coordinates: [[[[0, 0], [1, 1], [0, 1], [0, 0]]]]
});

var geometryCollection = Object.freeze({
    type: 'GeometryCollection',
    geometries: [pointGeometry, lineStringGeometry]
});

var pointFeature = Object.freeze({
    type: 'Feature',
    properties: { a: 1},
    geometry: pointGeometry
});

function collection(feature) {
    var featureCollection = {
        type: 'FeatureCollection',
        features: [feature]
    };

    return [feature, featureCollection];
}

function featureAndCollection(geometry) {
    var feature = {
        type: 'Feature',
        geometry: geometry,
        properties: { a: 1 }
    };

    var featureCollection = {
        type: 'FeatureCollection',
        features: [feature]
    };

    return [geometry, feature, featureCollection];
}


collection(pointFeature).forEach(function(input) {
    test('propEach', function(t) {
        meta.propEach(input, function(prop) {
            t.deepEqual(prop, { a: 1 });
            t.end();
        });
    });
});

featureAndCollection(pointGeometry).forEach(function(input) {
    test('coordEach#Point', function(t) {
        meta.coordEach(input, function(coord) {
            t.deepEqual(coord, [0, 0]);
            t.end();
        });
    });
});

featureAndCollection(lineStringGeometry).forEach(function(input) {
    test('coordEach#LineString', function(t) {
        var output = [];
        meta.coordEach(input, function(coord) {
            output.push(coord);
        });
        t.deepEqual(output, [[0, 0], [1, 1]]);
        t.end();
    });
});

featureAndCollection(polygonGeometry).forEach(function(input) {
    test('coordEach#Polygon', function(t) {
        var output = [];
        meta.coordEach(input, function(coord) {
            output.push(coord);
        });
        t.deepEqual(output, [[0, 0], [1, 1], [0, 1], [0, 0]]);
        t.end();
    });
});

featureAndCollection(multiPolygonGeometry).forEach(function(input) {
    test('coordEach#MultiPolygon', function(t) {
        var output = [];
        meta.coordEach(input, function(coord) {
            output.push(coord);
        });
        t.deepEqual(output, [[0, 0], [1, 1], [0, 1], [0, 0]]);
        t.end();
    });
});

featureAndCollection(geometryCollection).forEach(function(input) {
    test('coordEach#GeometryCollection', function(t) {
        var output = [];
        meta.coordEach(input, function(coord) {
            output.push(coord);
        });
        t.deepEqual(output, [[0, 0], [0, 0], [1, 1]]);
        t.end();
    });
});

test('unknown', function(t) {
    t.throws(function() {
        meta.coordEach({});
    });
    t.end();
});

test('map#Point', function(t) {
    t.deepEqual(meta.coordMap(pointGeometry, function(coord) {
        return [coord[0] + 10, coord[1] + 20];
    }), {
        type: 'Point', coordinates: [10, 20]
    }, 'adds point');
    t.end();
});

test('map#Feature#Point', function(t) {
    t.deepEqual(meta.coordMap(pointFeature, function(coord) {
        return [coord[0] + 10, coord[1] + 20];
    }), {
        type: 'Feature',
        properties: { a: 1 },
        geometry: {
            type: 'Point', coordinates: [10, 20]
        }
    }, 'adds point');
    t.end();
});

test('map#LineString', function(t) {
    t.deepEqual(meta.coordMap(lineStringGeometry, function(coord) {
        return [coord[0] * 10, coord[1] * 10];
    }), {
        type: 'LineString', coordinates: [[0, 0], [10, 10]]
    }, 'multiplies linestring');
    t.end();
});
