(function () {
  'use strict';
  var worldDataLocal = '/Users/gregsmith/Dropbox/Public/world-50m.json',
      meteorDataLocal = '/Users/gregsmith/Dropbox/Public/meteorite-strike-data.json',
      testStrokeColor = 'white',
      testStrokeWidth = '1',
      mapFillColor = '#95E1D3',
      mapStrokeWith = '1',
      height = 500,
      width = 500,
      margin = { top: 50, right: 60, bottom: 70, left: 80 };

  var meteoriteData, worldData, gdata, testMap, testPromise;

  function getChart() {
      return d3.select('#chart');
    }
  function getSVG() {
    return d3.select('svg');
  }
  function getMeteoriteStrikes() {
    return getSVG().selectAll('circle.meteoriteStrike')[0];
  }
  function getMapPaths() {
    return getSVG().selectAll('path.world')[0];
  }
  function selectMapObject() {
    return d3.select('g.mapContainer');
  }
  function setup(done) {
    testMap = strikeMap();
      testMap.width(width).height(height).margin(margin);
      Promise.all([getJSON(worldDataLocal), getJSON(meteorDataLocal)])
        .then(function(data) {
          gdata = data;
          meteoriteData = data[1].features;
          worldData = data[0].objects.countries;
          getChart().datum(data).call(testMap);
          done();
        }).catch(function(error) {
          console.error(error);
          done();
        });
  }
  function cleanup() {
    getChart().html("");
    var height = 500,
      width = 500,
      margin = { top: 50, right: 60, bottom: 70, left: 80 },
      testPromise = '';
  }

  describe('Map object gets created', function () {

    beforeEach(setup);

    afterEach(cleanup);

    describe('the svg container', function() {
      it('should be created', function() {
      expect(getSVG()).not.toBeNull();
      });

      it('should be the specified width', function() {
        expect(+getSVG().attr('width')).toBe(width + margin.right + margin.left);
      });

      it('should be the specified height', function() {
        expect(+getSVG().attr('height')).toBe(height + margin.top + margin.bottom);
      });
    });

    describe('the map object', function() {
      it('should be positioned inside the SVG container by the margin values', function() {
        expect(selectMapObject().attr('transform')).toBe(`translate(${margin.left},${margin.top})`)
      });
      describe('has getter methods', function() {
        it('should return the current width', function() {
          expect(testMap.width()).toBe(width);
        });
        it('should return the current height', function() {
          expect(testMap.height()).toBe(height);
        });
        it('should return the current margin object', function() {
          expect(testMap.margin()).toEqual(margin);
        });
      });
      describe('has setter methods', function() {
        it('should set the width', function() {
          expect(testMap.width()).toBe(width);
          testMap.width(1000);
          expect(testMap.width()).toBe(1000);
        });
        it('should set the height', function() {
          expect(testMap.height()).toBe(height);
          testMap.height(1000);
          expect(testMap.height()).toBe(1000);
        });
        it('should set the margin object', function() {
          var newMargin = { top: 80, right: 70, bottom: 60, left: 50 }
          expect(testMap.margin()).toBe(margin);
          testMap.margin(newMargin);
          expect(testMap.margin()).toEqual(newMargin);
        });
      });
    });
  });

  describe('The getJSON helper function', function() {
    describe('works with valid input', function() {
      beforeEach(function(done) {
        testPromise = getJSON(worldDataLocal)
          .then(function(data) {
            gdata = data;
            done();
          })
          .catch(function(error) {
            console.error(error);
            done.fail();
          });
      });
      it('returns a promise', function() {
        expect(typeof testPromise).toBe('object');
        expect(testPromise.then).not.toBe(undefined);
      });
      it('should fetch JSON data from valid URL', function(done) {
        expect(gdata).not.toBe(null);
        expect(gdata.type).toBe("Topology");
        done();
      });
    });
    describe('handles errors', function() {
      var gerror;
      beforeEach(function(done) {
        getJSON('notaworkingurl').then(function(data) {
          done.fail()
        })
        .catch(function(error) {
          gerror = error;
          console.error(error);
          done();
        });
      });
      it('should send an error when trying to access an invalid URL', function(done) {
        expect(gerror).not.toBe(null);
        done();
      });
    });
  });

  describe('The map object parses data', function() {
    beforeEach(setup);
    afterEach(cleanup);
    describe('meteorite strikes', function() {
      it('should place a circle for each meteor strike', function(done) {
        var numberOfMeteors = meteoriteData.length;
        expect(getMeteoriteStrikes().length).toBe(numberOfMeteors);
        done();
      });
      it('should set each circle\'s position based on the coordinate data', function(done) {
        var testProjection = testMap.getProjection();
        var someRandomNumber = Math.floor(Math.random() * meteoriteData.length);
        console.log(`Checking circle position with random number: ${someRandomNumber}`);
        var testCoords = testProjection([meteoriteData[someRandomNumber].properties.reclong, meteoriteData[someRandomNumber].properties.reclat]);
        expect(+d3.select(getMeteoriteStrikes()[someRandomNumber]).attr('cx')).toBe(testCoords[0]);
        expect(+d3.select(getMeteoriteStrikes()[someRandomNumber]).attr('cy')).toBe(testCoords[1]);
        done();
      });
      it('should set the circle\'s radius based on the mass property', function(done) {
        var someRandomNumber = Math.floor(Math.random() * meteoriteData.length);
        console.log(`Checking circle's radius with random number: ${someRandomNumber}`);
        var setRadius = testMap.getSetRadius();
        var circleRadius = +d3.select(getMeteoriteStrikes()[someRandomNumber]).attr('r');
        expect(circleRadius).toBe(setRadius(meteoriteData[someRandomNumber].properties.mass));
        expect(circleRadius).toBeLessThan(testMap.impactRadiusMax() + 1e-4);
        expect(circleRadius).toBeGreaterThan(testMap.impactRadiusMin() - 1e-4);
        done();
      });
      it('should set the circle\'s hue based on the mass property', function(done) {
        var someRandomNumber = Math.floor(Math.random() * meteoriteData.length);
        console.log(`Checking circle's hue with random number: ${someRandomNumber}`);
        var setHue = testMap.getSetHue();
        var circleHue = d3.select(getMeteoriteStrikes()[someRandomNumber]).attr('fill');
        expect(circleHue).toBe(setHue(meteoriteData[someRandomNumber].properties.mass));
        done();
      });
      it('should set the circle\'s opacity to 50% regardless of mass', function(done) {
        var someRandomNumber = Math.floor(Math.random() * meteoriteData.length);
        console.log(`Checking circle's opacity with random number: ${someRandomNumber}`);
        var circleOpacity = d3.select(getMeteoriteStrikes()[someRandomNumber]).attr('fill-opacity');
        expect(circleOpacity).toBe('0.5')
        done();
      });
      it(`should set the circle's stroke-width to ${testStrokeWidth} and stroke color to ${testStrokeColor}`, function(done) {
        var someRandomNumber = Math.floor(Math.random() * meteoriteData.length);
        console.log(`Checking circle's stroke with random number: ${someRandomNumber}`);
        var testCircle = d3.select(getMeteoriteStrikes()[someRandomNumber]);
        var testColor = testCircle.attr('stroke-fill');
        var testStroke = testCircle.attr('stroke');
        expect(testColor).toBe(testStrokeColor);
        expect(testStroke).toBe(testStrokeWidth);
        done();
      });
    });
    describe('map data', function() {
      it('should draw the map', function(done) {
        var mapFeatures = topojson.feature(gdata[0], worldData).features;
        var someRandomNumber = Math.floor(Math.random() * mapFeatures.length);
        var path = d3.geo.path().projection(testMap.getProjection());
        console.log(`Checking map path with random number: ${someRandomNumber}`);
        var testPath = path(mapFeatures[someRandomNumber]);
        expect(d3.select(getMapPaths()[someRandomNumber]).attr('d')).toEqual(testPath);
        done();
      });
      it(`it should draw the map with a fill color of ${mapFillColor} and a stroke width of ${mapStrokeWith}`,function (done) {
        var mapFeatures = topojson.feature(gdata[0], worldData).features;
        var someRandomNumber = Math.floor(Math.random() * mapFeatures.length);
        var path = d3.geo.path().projection(testMap.getProjection());
        console.log(`Checking map stroke and fill with random number: ${someRandomNumber}`);
        var testPath = path(mapFeatures[someRandomNumber]);
        expect(d3.select(getMapPaths()[someRandomNumber]).attr('fill')).toBe(mapFillColor);
        expect(d3.select(getMapPaths()[someRandomNumber]).attr('stroke-width')).toBe(mapStrokeWith);
        done();
      });
    });
  });

  describe('There should be buttons to navigate the map', function() {
    beforeEach(setup);
    afterEach(cleanup);
    it('should have four arrow buttons', function(done) {
      expect(getChart().selectAll('.navBtn')[0].length).toBe(4);
      done();
    });
  });
})();
