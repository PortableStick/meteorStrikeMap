function strikeMap() {
  // http://bl.ocks.org/patricksurry/6621971
  var maximumLatitude = 83,
      initialRotation = 60,
      maximumScaleFactor = 10,
      lastTranslation = [0,0],
      impactRadiusMin = 4,
      impactRadiusMax = 50,
      lastScale = null,
      margin = { top: 0, right: 0, bottom: 0, left: 0 },
      width = 1680 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  var waterColor = '#447DCC',
      landColor = '#FFF7C0';
  var projection = d3.geo.mercator()
                      .rotate([initialRotation, 0])
                      .scale(0.85)
                      .translate([width / 2, height / 2]);
  var impactScale = d3.scale.log().range([impactRadiusMin, 8, 15, impactRadiusMax]);
  var colorScale = d3.scale.log().range(['#005C1B', '#00D800', '#F56F61', '#A81000']);

  var bounds = findMercatorBounds(projection, maximumLatitude),
      scale =  width / (bounds[1][0] - bounds[0][0]), // ratio of svg width to boundary width
      scaleExtent = [scale, scale * maximumScaleFactor];

  projection.scale(scaleExtent[0]);
  var path = d3.geo.path().projection(projection);

  var zoom = d3.behavior.zoom()
                .scaleExtent(scaleExtent)
                .scale(projection.scale())
                .translate(projection.translate())
                .on("zoom", zoomed);
  var buttonClasses = ['fa-chevron-right','fa-chevron-left','fa-chevron-up','fa-chevron-down'];
  var tooltip = d3.select('body').append('div').classed('tooltip', true)
                  .style({
                    opacity: 0,
                    position: 'absolute'
                  });

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
            'fill': waterColor,
            'width': width,
            'height': height
          })
      var worldData = data[0];
      var meteorites = data[1].features;
      var massData = meteorites.map(function(d){return +d.properties.mass || 1;});
      var median = d3.median(massData);
      var inputDomain = [d3.extent(massData)[0], median * 5, median * 50, d3.extent(massData)[1]];
      impactScale.domain(inputDomain);
      colorScale.domain(inputDomain);

      var world = svg.append('g')
            .selectAll('path')
            .data(topojson.feature(worldData, worldData.objects.countries).features)
            .enter()
            .append('path')
            .classed('world', true)
            .attr({
              'd': path,
              'stroke-width': 1,
              'fill': landColor
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
          'fill-opacity': 0.6,
          'stroke': 1,
          'stroke-fill': 'white'
        })
        .on('mouseover', function(d) {
          tooltip.style({
            opacity: 1,
            'top': function() { return `${d3.event.pageY - 50}px`; },
            'left': function() { return `${d3.event.pageX + 30}px`; }
          })
          .html(`<h1>${d.properties.name}</h1>
  <h2>${formatMass(d.properties.mass)}</h2>
  <h3>Year fell: ${d.properties.year.slice(0,4)}</h3>`);
        })
        .on('mouseout', function() {
          tooltip.style({
            'opacity': 0,
            'top': `${-9999}px`,
            'left':`${-9999}px`
          })
        });
    });//selection
  }

  function formatMass(mass) {
    mass = +mass;
    if (mass >= 1000000) {
      return `${mass.toFixed(1)/1000000} ${mass === 1 ? 'megagram' : 'megagrams'}`;
    } else if(mass >= 1000) {
      return `${mass.toFixed(1)/1000} ${mass === 1 ? 'kilogram' : 'kilograms'}`;
    } else {
      return `${mass} ${mass === 1 ? 'gram' : 'grams'}`;
    }
  }

  function zoomed() {
    projection.translate(d3.event.translate).scale(d3.event.scale);
    d3.selectAll('path').attr({'d': path});
    d3.selectAll('circle').attr({'cx': function(d) {
            return projection([d.properties.reclong, d.properties.reclat])[0]
          },
          'cy': function(d) {
            return projection([d.properties.reclong, d.properties.reclat])[1]
          }});
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
