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
var ddata = _.sortBy(_.filter(data, function(c){return isFinite(c['human development index']);}), function(c){return Number(c['human development index']);});
var dlabel = svg.append('text').attr('x',5).attr('y', 300).attr('width',53).attr('height',27);
svg.selectAll('rect').data(ddata.concat(_.filter(data, function(c){return !isFinite(c['human development index'])}))).enter().append('rect')
    .attr('class', classifyHDI)
    .attr('x',function(d,i){return (i%15)*21+5;}).attr('y', function(d,i){return Math.floor(i/15)*21+5;}).attr('width',10).attr('height',10).attr('rx', 3).attr('ry', 3)
    .on('mouseover', function(d) {
        dlabel.text(d['indicator'] + ' ' + d['human development index']);
    });

var dumbbell = function(x, y1, y2) {
    var plotdata = _.filter(data, function(c){return isFinite(c[x]) && isFinite(c[y1]) && isFinite(c[y2]);})
    return {
        data: plotdata,
        xscale: d3.scaleLinear().domain([_.min(plotdata, function(c){return Number(c[x]);})[x],_.max(plotdata, function(c){return Number(c[x]);})[x]]).range([10,1130]),
        yscale: d3.scaleLinear().domain([_.min(
            [
                Number(_.min(plotdata, function(c){return Number(c[y1]);})[y1]),
                Number(_.min(plotdata, function(c){return Number(c[y2]);})[y2])
            ])
            ,_.max(
            [
                Number(_.max(plotdata, function(c){return Number(c[y1]);})[y1]),
                Number(_.max(plotdata, function(c){return Number(c[y2]);})[y2])
            ])])
            .range([290, 10]),
        draw: function(elem) {
            elem.attr('width', 1140).attr('height', 300);
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
                .attr('r',3.5)
                .attr('class', 'y1');
            g.append('circle')
                .attr('cx',function(d){return xscale(d[x]);})
                .attr('cy',function(d){return yscale(d[y2]);})
                .attr('r',3.5)
                .attr('class', 'y2');
        }
    }
}
var p1 = dumbbell('human development index', 'health expenditure \n% of GDP', 'education expenditure\n% of GDP');
p1.draw(d3.select('#plot'));

var plot = function(x, y) {
    var plotdata = _.filter(data, function(c){return isFinite(c[x]) && isFinite(c[y]);})
    var ydomain = [-2.5, 2.5];
    var colorscale =  d3.scaleQuantize().domain([-2.5, 2.5]).range(['#FF35FD','#FF3535','#FF5300','#FFB505','#FFE526','#6AE71E','#53ECDA','#07BDE7','#0571D4','#2D1FCF']);
    var height = 200;
    return {
        data: plotdata,
        xscale: d3.scaleLinear().domain([_.min(plotdata, function(c){return Number(c[x]);})[x],_.max(plotdata, function(c){return Number(c[x]);})[x]]).range([10,1130]),
        yscale: d3.scaleLinear().domain(ydomain).range([height - 10, 10]),
        draw: function(elem) {
            elem.attr('width', 1140).attr('height', height);
            var xscale = this.xscale;
            var yscale = this.yscale;
            elem.append('rect').attr('x',xscale.domain()[0]).attr('y',0).attr('width',xscale(0.55)).attr('height',height)
                .attr('class','lhdi').attr('opacity',0.1);
            elem.append('rect').attr('x',xscale(0.55)).attr('y',0).attr('width',xscale(0.7)-xscale(0.55)).attr('height',height)
                .attr('class','mhdi').attr('opacity',0.1);
            elem.append('rect').attr('x',xscale(0.7)).attr('y',0).attr('width',xscale(0.8)-xscale(0.7)).attr('height',height)
                .attr('class','hhdi').attr('opacity',0.1);
            elem.append('rect').attr('x',xscale(0.8)).attr('y',0).attr('width',1140-xscale(0.8)).attr('height',height)
                .attr('class','vhdi').attr('opacity',0.1);
            elem.append('line').attr('x1',0).attr('x2',1140).attr('y1',yscale(0)).attr('y2',yscale(0));
            var g = elem.selectAll('g').data(plotdata).enter().append('g')
                .attr('data-country', function(d){return d['indicator'];})
                .attr('data-x', function(d) {return d[x];})
                .attr('data-y', function(d) {return d[y];})
            g.append('circle')
                .attr('cx',function(d){return xscale(d[x]);})
                .attr('cy',function(d){return yscale(d[y]);})
                .attr('r',2.5)
                .attr('class', 'y')
                .style('stroke', function(d){return d3.color(colorscale(d[y])).darker()})
                .style('stroke-width','1px').style('stroke-opacity','0.53')
                .style('fill', function(d) {return colorscale(d[y]);});
        }
    }
}
var s;
s = plot('human development index', 'political stability & absence of violence');
s.draw(d3.select('#s1'));
s = plot('human development index', 'government effectiveness');
s.draw(d3.select('#s2'));
s = plot('human development index', 'regulatory quality');
s.draw(d3.select('#s3'));
s = plot('human development index', 'rule of law');
s.draw(d3.select('#s4'));

var circularPlot = function(y, outerRadius) {
    var ydomain = [-2.5, 2.5];
    var colorscale =  d3.scaleQuantize().domain([-2.5, 2.5]).range(['#FF35AA','#FF3535','#FF5300','#FFB505','#FFE526','#6AE71E','#53ECDA','#07BDE7','#0571D4','#2D1FCF']);
    return {
        draw: function(elem) {
            var g = elem.append('g').attr('transform','translate(570, 530)');
            var stops = [2.0, 1.5, 1.0, 0.5, 0, 0, -0.5, -1.0, -1.5, -2.0];
            arc.cornerRadius(2);
            for (var s=0; s<stops.length; s++) {
                var v = stops[s];
                arc.outerRadius(outerRadius).innerRadius(outerRadius - 3);
                g.selectAll('.v-' + String(v).replace('.','')).data(ddata).enter().append('path').attr('d', function(d,i) {
                    if ((s < (stops.length/2) && Number(d[y]) > v) || (s >= stops.length/2 && Number(d[y]) < v)) {
                        arc.startAngle(i * arcLength + (0.15*arcLength)).endAngle((i * arcLength) + (0.8 * arcLength));
                        return arc();
                    }
                })
                .attr('data-country', function(d){return d['indicator'];})
                .attr('data-y', function(d) {return d[y];})
                .style('fill', function(d,i) {
                    return colorscale(d[y]);
                });
                outerRadius = outerRadius - 5;
            }
        }
    }
}
var circular = d3.select('#circular').attr('width','1140').attr('height','1052');
var gbackground = circular.append('g').attr('transform','translate(570, 530)');
var arc = d3.arc();
var arcLength = Math.PI * 2 / ddata.length;
arc.outerRadius(450).innerRadius(250);
gbackground.selectAll('path').data(ddata).enter().append('path').attr('d', function(d, i) {
    arc.startAngle(i * arcLength).endAngle((i * arcLength) + (arcLength));
    return arc();
})
.attr('class', classifyHDI)
.attr('data-country', function(d){return d['indicator'];})
var c = circularPlot('rule of law', 450);
c.draw(circular);
c = circularPlot('regulatory quality', 400);
c.draw(circular);
c = circularPlot('government effectiveness', 350);
c.draw(circular);
c = circularPlot('political stability & absence of violence', 300);
c.draw(circular);
