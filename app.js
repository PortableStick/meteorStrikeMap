function strikeMap() {
  // http://bl.ocks.org/patricksurry/6621971
  var maximumLatitude = 83,
      initialRotation = 60,
      maximumScaleFactor = 10,
      impactRadiusMin = 2,
      impactRadiusMax = 45;
  var margin = { top: 0, right: 180, bottom: 120, left: 100 },
        width = 1200 - margin.left - margin.right,
        height = 720 - margin.top - margin.bottom;
  var projection = d3.geo.mercator()
                      .rotate([initialRotation, 0])
                      .scale(1)
                      .translate([width / 2, height / 2]);
  var impactScale = d3.scale.linear();

  var bounds = findMercatorBounds(projection, maximumLatitude),
      scale =  width / (bounds[1][0] - bounds[0][0]), // ratio of svg width to boundary width
      scaleExtent = [scale, scale * maximumScaleFactor];

  projection.scale(scaleExtent[0]);

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
        });
      var meteorites = data[1].features;
      var massData = d3.extent(meteorites.map(function(d){return +d.properties.mass;}));
      impactScale.domain(massData).range([impactRadiusMin, impactRadiusMax]);
      svg.append('g')
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
          }
        });
    });//selection
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

  chart.getSetRadius = function() {
    return setRadius;
  }
  chart.getProjection = function() {
    return projection;
  }
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
