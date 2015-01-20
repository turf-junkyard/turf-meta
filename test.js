var test = require('tape'),
    meta = require('./');

test('propEach#Feature,Point', function(t) {
    meta.propEach({
        type: 'Feature',
        geometry: null,
        properties: { a: 1 }
    }, function(prop) {
        t.deepEqual(prop, { a: 1 });
        t.end();
    });
});

test('coordEach#Feature,Point', function(t) {
    meta.coordEach({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: { }
    }, function(coord) {
        t.deepEqual(coord, [0, 0]);
        t.end();
    });
});
