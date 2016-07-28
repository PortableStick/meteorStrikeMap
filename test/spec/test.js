(function () {
  'use strict';

  describe('Map should be properly created', function () {
    var height = 500, width = 500;
    var margin = { top: 50, right: 60, bottom: 70, left: 80 };
    beforeAll(function() {
      var testMap = strikeMap();
      testMap.width(width).height(height).margin(margin);
      d3.select('#chart').call(testMap);
    });

    describe('the svg container', function() {
      it('should be created', function() {
      expect(selectSVG()).not.toBeNull();
      });

      it('should be the specified width', function() {
        expect(+selectSVG().attr('width')).toBe(width + margin.right + margin.left);
      });

      it('should be the specified height', function() {
        expect(+selectSVG().attr('height')).toBe(height + margin.top + margin.bottom);
      });
    })

    function selectSVG() {
      return d3.select('svg');
    }
  });
})();
