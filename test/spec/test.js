(function () {
  'use strict';

  describe('Map should be properly created', function () {

    beforeEach(function() {
      this.height = 500;
      this.width = 500;
      this.margin = { top: 50, right: 60, bottom: 70, left: 80 };
      this.testMap = strikeMap();
      this.testMap.width(this.width).height(this.height).margin(this.margin);
      d3.select('#chart').call(this.testMap);
    });

    afterEach(function() {
      d3.select('#chart').html("");
    })

    describe('the svg container', function() {
      it('should be created', function() {
      expect(selectSVG()).not.toBeNull();
      });

      it('should be the specified width', function() {
        expect(+selectSVG().attr('width')).toBe(this.width + this.margin.right + this.margin.left);
      });

      it('should be the specified height', function() {
        expect(+selectSVG().attr('height')).toBe(this.height + this.margin.top + this.margin.bottom);
      });
    });

    describe('the map object', function() {
      it('should be positioned inside the SVG container by the margin values', function() {
        expect(selectMapObject().attr('transform')).toBe(`translate(${this.margin.left},${this.margin.top})`)
      });
      describe('has getter methods', function() {
        it('should return the current width', function() {
          expect(this.testMap.width()).toBe(this.width);
        });
        it('should return the current height', function() {
          expect(this.testMap.height()).toBe(this.height);
        });
        it('should return the current margin object', function() {
          expect(this.testMap.margin()).toEqual(this.margin);
        });
      });
      describe('has setter methods', function() {
        it('should set the width', function() {
          expect(this.testMap.width()).toBe(this.width);
          this.testMap.width(1000);
          expect(this.testMap.width()).toBe(1000);
        });
        it('should set the height', function() {
          expect(this.testMap.height()).toBe(this.height);
          this.testMap.height(1000);
          expect(this.testMap.height()).toBe(1000);
        });
        it('should set the margin object', function() {
          var newMargin = { top: 80, right: 70, bottom: 60, left: 50 }
          expect(this.testMap.margin()).toBe(this.margin);
          this.testMap.margin(newMargin);
          expect(this.testMap.margin()).toEqual(newMargin);
        });
      });
    });

    function selectSVG() {
      return d3.select('svg');
    }

    function selectMapObject() {
      return d3.select('g.mapContainer');
    }
  });
})();
