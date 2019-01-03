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

var plot = function(x, y1, y2) {
    var plotdata = _.filter(data, function(c){return isFinite(c[x]) && isFinite(c[y1]) && isFinite(c[y2]);})
    return {
        data: plotdata,
        xscale: d3.scaleLinear().domain([_.min(plotdata, function(c){return Number(c[x]);})[x],_.max(plotdata, function(c){return Number(c[x]);})[x]]).range([10,950]),
        yscale: d3.scaleLinear().domain([0,_.max(
            [
                Number(_.max(plotdata, function(c){return Number(c[y1]);})[y1]),
                Number(_.max(plotdata, function(c){return Number(c[y2]);})[y2])
            ])])
            .range([290, 10]),
        draw: function(elem) {
            elem.attr('width', 960).attr('height', 300);
            var xscale = this.xscale;
            var yscale = this.yscale;
            var g = elem.selectAll('g').data(plotdata).enter().append('g')
                .attr('data-country', function(d){return d['indicator'];})
                .attr('data-x', function(d) {return d[x];})
                .attr('data-y1', function(d) {return d[y1];})
                .attr('data-y2', function(d) {return d[y2];})
                .classed('lhdi', lhdi)
                .classed('mhdi', mhdi)
                .classed('hhdi', hhdi)
                .classed('vhdi', vhdi);
            g.append('line').attr('x1', function(d) {return xscale(d[x])}).attr('x2', function(d) {return xscale(d[x])}).attr('y1', function(d) {return yscale(d[y1])}).attr('y2',function(d) {return yscale(d[y2])})
                .attr('class', function(d) {
                    if (Number(d[y1]) > Number(d[y2])) {
                        return 'y1y2';
                    }
                    else {
                        return 'y2y1';
                    }
                });
            g.append('circle')
                .attr('cx',function(d){return xscale(d[x]);})
                .attr('cy',function(d){return yscale(d[y1]);})
                .attr('r',3)
                .attr('class', 'y1');
            g.append('circle')
                .attr('cx',function(d){return xscale(d[x]);})
                .attr('cy',function(d){return yscale(d[y2]);})
                .attr('r',3)
                .attr('class', 'y2');
        }
    }
}
var p1 = plot('human development index', 'health expenditure \n% of GDP', 'education expenditure\n% of GDP');
p1.draw(d3.select('#plot'));
