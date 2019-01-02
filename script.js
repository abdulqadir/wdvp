var svg = d3.select('#distribution');
var lhdi = _.filter(data, function(c) { return c['human development index'] < 0.55; });
var mhdi = _.filter(data, function(c) { return c['human development index'] >= 0.55 && c['human development index'] < 0.7; });
var hhdi = _.filter(data, function(c) { return c['human development index'] >= 0.7  && c['human development index'] < 0.8; });
var vhdi = _.filter(data, function(c) { return c['human development index'] >= 0.8; });
svg.attr('width',350).attr('height', 300);
for (var i=0; i<data.length; i++) {
    var className = 'nodata';
    if (i<lhdi.length) {
        className = 'lhdi';
    }
    else if (i<lhdi.length+mhdi.length) {
        className = 'mhdi';
    }
    else if (i<lhdi.length+mhdi.length+hhdi.length) {
        className = 'hhdi';
    }
    else if (i<lhdi.length+mhdi.length+hhdi.length+vhdi.length) {
        className = 'vhdi';
    }
    svg.append('rect').attr('x', (i%15)*21+5).attr('y', Math.floor(i/15)*21+5)
        .attr('width',11).attr('height',11).attr('rx', 3).attr('ry', 3)
        .attr('class', className);
}
