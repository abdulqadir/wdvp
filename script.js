var lhdi = function(c) { return c['human development index'] < 0.55; };
var mhdi = function(c) { return c['human development index'] >= 0.55 && c['human development index'] < 0.7; };
var hhdi = function(c) { return c['human development index'] >= 0.7  && c['human development index'] < 0.8; };
var vhdi = function(c) { return c['human development index'] >= 0.8; };
var classifyHDI = function(d) {
    if (lhdi(d)) {
        return 'lhdi';
    }
    if (mhdi(d)) {
        return 'mhdi';
    }
    if (hhdi(d)) {
        return 'hhdi';
    }
    if (vhdi(d)) {
        return 'vhdi';
    }
    return 'nodata';
}

var svg = d3.select('#distribution').attr('width',350).attr('height', 321);
var ddata = _.sortBy(_.filter(data, function(c){return isFinite(c['human development index']);}), function(c){return Number(c['human development index']);}).concat(_.filter(data, function(c){return !isFinite(c['human development index'])}));
var dlabel = svg.append('text').attr('x',5).attr('y', 300).attr('width',53).attr('height',27);
svg.selectAll('rect').data(ddata).enter().append('rect')
    .attr('class', classifyHDI)
    .attr('x',function(d,i){return (i%15)*21+5;}).attr('y', function(d,i){return Math.floor(i/15)*21+5;}).attr('width',11).attr('height',11).attr('rx', 3).attr('ry', 3)
    .on('mouseover', function(d) {
        dlabel.text(d['indicator'] + ' ' + d['human development index']);
    });

var plot = function(x, y) {
    var plotdata = _.filter(data, function(c){return isFinite(c[x]) && isFinite(c[y]);})
    return {
        data: plotdata,
        xscale: d3.scaleLinear().domain([0,_.max(plotdata, function(c){return Number(c[x]);})[x]]).range([0,950]),
        yscale: d3.scaleLinear().domain([0,_.max(plotdata, function(c){return Number(c[y]);})[y]]).range([290, 10]),
        draw: function(elem) {
            elem.attr('width', 960).attr('height', 300);
            var xscale = this.xscale;
            var yscale = this.yscale;
            elem.selectAll('circle').data(plotdata).enter().append('circle').attr('cx',function(d){return xscale(d[x]);}).attr('cy',function(d){return yscale(d[y]);}).attr('r',5)
                .attr('data-country', function(d){ return d['indicator']; })
                .attr('data-gdp', function(d) {return d[x];})
                .attr('data-healthexp', function(d) {return d[y];})
                .attr('class', classifyHDI);
        }
    }
}
var p1 = plot('GDP per capita (PPP)', 'health expenditure \n% of GDP');
p1.draw(d3.select('#plot'));

var p2 = plot('GDP per capita (PPP)', 'education expenditure\n% of GDP');
p2.draw(d3.select('#plot2'));
