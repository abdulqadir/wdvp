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

var ddata = _.sortBy(_.filter(data, function(c){return isFinite(c['human development index']);}), function(c){return Number(c['human development index']);});

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

var htmlNode = d3.select('html').node();
var countryInfoElem = d3.select('#countryInfo');
var centerTransform = 'translate(570, 530)';

var arc = d3.arc();
var arcLength = Math.PI * 2 / ddata.length;
var circular = d3.select('#circular').attr('width','1140').attr('height','1052');

var gbackground = circular.append('g').attr('transform',centerTransform);
arc.outerRadius(450).innerRadius(200);
gbackground.selectAll('path').data(ddata).enter().append('path').attr('d', function(d, i) {
    arc.startAngle(i * arcLength).endAngle((i * arcLength) + (arcLength));
    return arc();
})
.attr('class', function(d) { return classifyHDI(d) + ' background'; })
.attr('data-country', function(d){return d['indicator'];})
.style('opacity',0.1)
.on('mouseover', function(d) {
    var country = d['indicator'];
    d3.select(this).transition().duration(100).style('opacity','0.21');
    d3.selectAll('.background:not([data-country="' + country + '"])').transition().duration(210).style('opacity','0.07');
    var mouse = d3.mouse(htmlNode);
    countryInfoElem.style('top', mouse[1]+'px').style('left', (mouse[0]+11)+'px').style('opacity', 0.97);
    countryInfoElem.select('.card-title').text(country);
})
.on('mousemove', function(e) {
    var mouse = d3.mouse(htmlNode);
    countryInfoElem.style('top', mouse[1]+'px').style('left', (mouse[0]+11)+'px');
})
.on('mouseout', function(e) {
    d3.selectAll('.background').transition().duration(100).style('opacity','0.1');
    countryInfoElem.style('opacity',0);
});

var ginner = circular.append('g').attr('transform',centerTransform);
arc.outerRadius(190).innerRadius(180);
ginner.selectAll('path').data(ddata).enter().append('path').attr('d', function(d, i) {
    arc.startAngle(i * arcLength).endAngle((i * arcLength) + (arcLength));
    return arc();
})
.attr('class', classifyHDI);

function coords(angle, radius) {
    var y = Math.sin(angle) * radius;
    var x = Math.cos(angle) * radius;
    return [x, y];
}

var circularPlot = function(y, outerRadius) {
    var ydomain = [-2.5, 2.5];
    var colorscale =  d3.scaleQuantize().domain([-2.5, 2.5]).range(['#FF35AA','#FF3535','#FF5300','#FFB505','#FFE526','#6AE71E','#53ECDA','#07BDE7','#0571D4','#2D1FCF']);
    return {
        draw: function(elem) {
            var g = elem.append('g').attr('transform',centerTransform).attr('class', 'circular-plot');
            g.append('circle').attr('x', 0).attr('y', 0).attr('r', outerRadius - 50);
            var cs = coords(5.2 * Math.PI/4, outerRadius - 45);
            var ce = coords(3 * Math.PI/2, outerRadius - 45);
            g.append('path').attr('d', 'M' + cs + 'A' + (outerRadius-45) +',' + (outerRadius-45) + ' 0 0 1 ' + ce)
                .attr('fill','none').attr('stroke', 'none').attr('id', y);
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
            g.append('text').append('textPath').attr('href','#' + y).text(y);
        }
    }
}
var c = circularPlot('political stability & absence of violence', 450);
c.draw(circular);
c = circularPlot('government effectiveness', 400);
c.draw(circular);
c = circularPlot('regulatory quality', 350);
c.draw(circular);
c = circularPlot('rule of law', 300);
c.draw(circular);

var radialLineChart = function(y1, y2, outerRadius, class1, class2) {
    var validy1 = _.filter(data, function(c){return isFinite(c[y1]);});
    var validy2 = _.filter(data, function(c){return isFinite(c[y2]);});
    var yscale = d3.scaleLinear().domain([_.min(
            [
                Number(_.min(validy1, function(c){return Number(c[y1]);})[y1]),
                Number(_.min(validy2, function(c){return Number(c[y2]);})[y2])
            ])
            ,_.max(
            [
                Number(_.max(validy1, function(c){return Number(c[y1]);})[y1]),
                Number(_.max(validy2, function(c){return Number(c[y2]);})[y2])
            ])])
    .range([outerRadius - 50, outerRadius]);
    return {
        draw: function(elem) {
            var g = circular.append('g').attr('transform', centerTransform).attr('class','radial-line-chart ');
            var loop = function(y) {
                return d3.lineRadial().curve(d3.curveCatmullRomClosed)
                    .angle(function(d,i) {
                        return i * arcLength + (0.53 * arcLength);
                    })
                    .radius(function(d,i) {
                        if (!isFinite(d[y])) {
                            return outerRadius-50;
                        }
                        var r = yscale(d[y]);
                        return r;
                    });
            }
            g.append('path').attr('d', loop(y1)(ddata)).attr('class', class1);
            g.append('path').attr('d', loop(y2)(ddata)).attr('class', class2);
        }
    }
}

var r = radialLineChart('health expenditure \n% of GDP', 'education expenditure\n% of GDP', 250, 'healthexp', 'eduexp');
r.draw(circular);
