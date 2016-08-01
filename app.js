function strikeMap() {
  // http://bl.ocks.org/patricksurry/6621971
  var maximumLatitude = 83,
      initialRotation = 60,
      maximumScaleFactor = 10,
      impactRadiusMin = 4,
      impactRadiusMax = 40,
      lastTranslation = [0,0],
      lastScale = null;
  var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = 1680 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
  var projection = d3.geo.mercator()
                      .rotate([initialRotation, 0])
                      .scale(1)
                      .translate([width / 2, height / 2]);
  var impactScale = d3.scale.pow();
  var colorScale = d3.scale.category10();

  var bounds = findMercatorBounds(projection, maximumLatitude),
      scale =  width / (bounds[1][0] - bounds[0][0]), // ratio of svg width to boundary width
      scaleExtent = [scale, scale * maximumScaleFactor];

  projection.scale(scaleExtent[0]);
  var path = d3.geo.path().projection(projection);

  var zoom = d3.behavior.zoom()
                .scaleExtent(scaleExtent)
                .scale(projection.scale())
                .translate([0,0])
                .on("zoom", redraw);

  function chart(selection) {
    d3.select(this).html("") // clear present maps before redrawing
    selection.each(function(data) {
      var svg = d3.select(this).append('svg')
        .classed("main", true)
        .attr({
            'width': width + margin.left + margin.right,
            'height': height + margin.top + margin.bottom
        }).append('g').classed("mapContainer", true)
        .attr({
            "transform": `translate(${margin.left},${margin.top})`
        })
        .call(zoom);
        svg.append('rect')
          .attr({
            'fill': '#266D98',
            'width': width,
            'height': height
          })
      var worldData = data[0];
      var meteorites = data[1].features;
      var massData = meteorites.map(function(d){return +d.properties.mass || 1;});
      impactScale.domain(d3.extent(massData)).range([impactRadiusMin, impactRadiusMax]);

      var world = svg.append('g')
            .selectAll('path')
            .data(topojson.feature(worldData, worldData.objects.countries).features)
            .enter()
            .append('path')
            .classed('world', true)
            .attr({
              'd': path,
              'stroke-width': 1,
              'fill': '#95E1D3'
            });
      var meteorites = svg.append('g')
        .selectAll('path')
        .data(meteorites)
        .enter()
        .append('circle')
        .classed('meteoriteStrike', true)
        .attr({
          'cx': function(d) {
            return projection([d.properties.reclong, d.properties.reclat])[0]
          },
          'cy': function(d) {
            return projection([d.properties.reclong, d.properties.reclat])[1]
          },
          'r': function(d) {
            return setRadius(d.properties.mass);
          },
          'fill': function(d) {
            return setHue(d.properties.mass);
          },
          'fill-opacity': 0.5,
          'stroke': 1,
          'stroke-fill': 'white'
        });

    });//selection
  }

  function redraw() {
    if(d3.event) {
      var scale = d3.event.scale,
          translation = d3.event.translate;

      if(scale !== lastScale) {
        projection.scale(scale);
      } else {
        var deltaX = translation[0] - lastTranslation[0],
            deltaY = translation[1] - lastTranslation[1],
            yaw = projection.rotate()[0],
            projectionTranslation = projection.translate();

        projection.rotate([yaw + 360 * deltaX / width * scaleExtent[0] / scale, 0, 0]);
        var newBounds = findMercatorBounds(projection, maximumLatitude);
        if(newBounds[0][1] + deltaY > 0) { deltaY = -b[0][1];}
        else if(newBounds[1][1] + deltaY < height) {deltaY = height - newBounds[1][1];}

        projection.translate([projectionTranslation[0], projectionTranslation[1] + deltaY])
      }

      lastScale = scale;
      lastTranslation = translation;
    }
    d3.select('svg.main').attr({
            'width': width + margin.left + margin.right,
            'height': height + margin.top + margin.bottom
        });
    d3.selectAll('path').attr({'d': path});
    d3.selectAll('circle').attr({'cx': function(d) {
            return projection([d.properties.reclong, d.properties.reclat])[0]
          },
          'cy': function(d) {
            return projection([d.properties.reclong, d.properties.reclat])[1]
          }})
  }

  function findMercatorBounds(projection, maximumLatitude) {
    var yaw = projection.rotate()[0],
        xyMax = projection([-yaw+180-1e-6, -maximumLatitude]),
        xyMin = projection([-yaw-180+1e-6, maximumLatitude]);
    return [xyMin, xyMax];
  }

  function setRadius(mass) {
    return impactScale(mass);
  }

  function setHue(mass) {
    return colorScale(mass);
  }

  chart.getSetHue = function() {
    return setHue;
  };
  chart.getSetRadius = function() {
    return setRadius;
  };
  chart.getProjection = function() {
    return projection;
  };
  chart.width = function(_) {
    if(!arguments.length) {return width;}
    width = _;
    return this;
  };
  chart.height = function(_) {
    if(!arguments.length) {return height;}
    height = _;
    return this;
  };
  chart.margin = function(_) {
    if(!arguments.length) {return margin;}
    margin = _;
    return this;
  };
  chart.impactRadiusMin = function(_) {
    if(!arguments.length) {return impactRadiusMin;}
    impactRadiusMin = _;
    return this;
  };
  chart.impactRadiusMax = function(_) {
    if(!arguments.length) {return impactRadiusMax;}
    impactRadiusMax = _;
    return this;
  };
  return chart;
}

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    d3.json(url, function(error, data) {
      if(error) { reject(error) };
      resolve(data);
    })
  });
}
