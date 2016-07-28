function strikeMap() {
  var margin = { top: 0, right: 180, bottom: 120, left: 100 },
        width = 1200 - margin.left - margin.right,
        height = 720 - margin.top - margin.bottom;

  function chart(selection) {
    d3.select(this).html("") // clear present maps before redrawing
    selection.each(function(data) {
      var svg = d3.select(this).append('svg')
        .classed("main", true)
        .attr({
            'width': width + margin.left + margin.right,
            'height': height + margin.top + margin.bottom
        }).append('g').classed("chartContainer", true)
        .attr({
            "transform": `translate(${margin.left},${margin.top})`
        });
    });
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
  return chart;
}
