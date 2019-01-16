var lhdi = function(c) { return c['hdi'] < 0.55; };
var mhdi = function(c) { return c['hdi'] >= 0.55 && c['hdi'] < 0.7; };
var hhdi = function(c) { return c['hdi'] >= 0.7  && c['hdi'] < 0.8; };
var vhdi = function(c) { return c['hdi'] >= 0.8; };
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

var data = _.sortBy(data, function(c){return c['hdi'];});
var htmlNode = d3.select('html').node();
var countryInfoElem = d3.select('#countryInfoPopover');
var centerX = 570, centerY = 530;
var centerTransform = 'translate(' + centerX + ',' + centerY + ')';

var arc = d3.arc();
var arcLength = Math.PI * 2 / data.length;
var circular = d3.select('#circular').attr('width','1140').attr('height','1052');

function getExpenditure(exp, d) {
    var p = 'N/A';
    if (d[exp] !== null) {
        p = Number(d[exp]);
        p = Math.round(p*100)/100;
        p += '%';
    }
    return p;
}
function fillCountryInfo(d) {
    d3.select('#countryInfoName').text(d['country']);
    countryInfoElem.select('#countryName').text(d['country']);
    d3.select('#countryInfoHDI').text(function() {
        var text;
        if (lhdi(d)) {
            text = 'Low';
        }
        else if (mhdi(d)) {
            text = 'Medium';
        }
        else if (hhdi(d)) {
            text = 'High';
        }
        else if (vhdi(d)) {
            text = 'Very high';
        }
        text += ' HDI - ';
        return text + d['hdi'];
    }).attr('class', classifyHDI(d));
    if (d['similar'].length > 0) {
        d3.select('#similar1').text(d['similar'][0]?d['similar'][0]:'');
        d3.select('#similar2').text(d['similar'][1]?d['similar'][1]:'');
        d3.select('#similar3').text(d['similar'][2]?d['similar'][2]:'');
        d3.select('#similarCountries').style('opacity',1);
    }
    else {
        d3.select('#similarCountries').style('opacity',0);
    }
    var mouse = d3.mouse(circular.node());
    mouse[0] -= centerX;
    mouse[1] -= centerY;
    var radius = Math.sqrt(Math.pow(mouse[0],2) + Math.pow(mouse[1],2));
    var statistic;
    var score;
    if (radius > 250) {
        countryInfoElem.select('#expenditure').style('display','none');
        if (radius > 400) {
            statistic = 'Political Stability & Absence Of Violence';
            score = Math.round(d['political stability & absence of violence']*100)/100;
        }
        else if (radius > 350) {
            statistic = 'Government Effectiveness';
            score = Math.round(d['government effectiveness']*100)/100;
        }
        else if (radius > 300) {
            statistic = 'Regulatory Quality';
            score = Math.round(d['regulatory quality']*100)/100;
        }
        else {
            statistic = 'Rule of Law';
            score = Math.round(d['rule of law']*100)/100;
        }
    }
    else {
        countryInfoElem.select('#expenditure').style('display','block');
        d3.select('#healthExpenditure').text(getExpenditure('health', d));
        d3.select('#educationExpenditure').text(getExpenditure('education', d));
    }
    countryInfoElem.select('#statistic').text(statistic);
    countryInfoElem.select('#score').text(score);
}

function positionPopover() {
    var mouse = d3.mouse(htmlNode);
    var cmouse = d3.mouse(circular.node());
    cmouse[0] -= centerX;
    cmouse[1] -= centerY;
    countryInfoElem.style('opacity', 0.8);
    var rect = countryInfoElem.node().getBoundingClientRect();
    if (cmouse[1] > 0){
        countryInfoElem.style('top', (mouse[1]+5)+'px');
    }
    else {
        countryInfoElem.style('top', (mouse[1]-rect['height']-5)+'px');
    }
    if (cmouse[0] > 0) {
        countryInfoElem.style('left', (mouse[0]+5)+'px');
    }
    else {
        countryInfoElem.style('left', (mouse[0]-rect['width']-5)+'px');
    }
}

var visNode = d3.select('#visualization').node();

function getScore(x) {
    return Math.round(x*100)/100;
}
function showScore(elem, score) {
    elem.select('svg').remove();
    var svg = elem.append('svg').attr('height',25).attr('width',25);
    var color = colorscale(score);
    var abs = Math.abs(score);
    if (abs > 2.0) {
        svg.append('rect').attr('y',0);
    }
    if (abs > 1.5) {
        svg.append('rect').attr('y',5);
    }
    if (abs > 1.0) {
        svg.append('rect').attr('y',10);
    }
    if (abs > 0.5) {
        svg.append('rect').attr('y',15);
    }
    svg.append('rect').attr('y',20);
    svg.selectAll('rect').attr('x',0).attr('height', 3).attr('width', 10).attr('rx',2).attr('ry',2).attr('fill', color);
}
function deselectAll() {
    selected = '';
    d3.selectAll('.selected').classed('selected', false);
    d3.select('#countryInfoTip').text('Click to compare with another country');
}
deselectAll();
function compare(c1, c2) {
    deselectAll();
    d3.select('#compareName1').text(c1['country']);
    d3.select('#compareName2').text(c2['country']);
    d3.select('#compareHDI1').text(c1['hdi']).attr('class', classifyHDI(c1));
    d3.select('#compareHDI2').text(c2['hdi']).attr('class', classifyHDI(c2));
    d3.select('#compareRank1').text(c1['rank']);
    d3.select('#compareRank2').text(c2['rank']);
    d3.select('#compareHealth1').text(getExpenditure('health',c1));
    d3.select('#compareHealth2').text(getExpenditure('health',c2));
    d3.select('#compareEducation1').text(getExpenditure('education',c1));
    d3.select('#compareEducation2').text(getExpenditure('education',c2));
    d3.select('#comparePS1').text(getScore(c1['political stability & absence of violence']));
    showScore(d3.select('#comparePSLev1'), c1['political stability & absence of violence']);
    d3.select('#comparePS2').text(getScore(c2['political stability & absence of violence']));
    showScore(d3.select('#comparePSLev2'), c2['political stability & absence of violence']);
    d3.select('#compareGE1').text(getScore(c1['government effectiveness']));
    showScore(d3.select('#compareGELev1'), c1['government effectiveness']);
    d3.select('#compareGE2').text(getScore(c2['government effectiveness']));
    showScore(d3.select('#compareGELev2'), c2['government effectiveness']);
    d3.select('#compareRQ1').text(getScore(c1['regulatory quality']));
    showScore(d3.select('#compareRQLev1'), c1['regulatory quality']);
    d3.select('#compareRQ2').text(getScore(c2['regulatory quality']));
    showScore(d3.select('#compareRQLev2'), c2['regulatory quality']);
    d3.select('#compareRL1').text(getScore(c1['rule of law']));
    showScore(d3.select('#compareRLLev1'), c1['rule of law']);
    d3.select('#compareRL2').text(getScore(c2['rule of law']));
    showScore(d3.select('#compareRLLev2'), c2['rule of law']);
    d3.select('#countryComparison').style('top', (visNode.offsetTop+253)+'px').transition().duration(153).style('left', (visNode.offsetLeft + 286) + 'px');
}
function dismiss() {
    d3.select('#countryComparison').transition().duration(253).style('left', '-610px');
}
d3.select('html').on('click', dismiss);

var gbackground = circular.append('g').attr('transform',centerTransform);
arc.outerRadius(450).innerRadius(200);
gbackground.selectAll('path').data(data).enter().append('path').attr('d', function(d, i) {
    arc.startAngle(i * arcLength).endAngle((i * arcLength) + (arcLength));
    return arc();
})
.attr('class', function(d) { return classifyHDI(d) + ' background'; })
.attr('data-country', function(d){return d['country'];})
.style('opacity',0.1)
.on('mouseover', function(d) {
    d3.selectAll('.background').style('opacity','0.07');
    d3.select(this).style('opacity','0.21');
    d3.select('#countryInfo').style('opacity',1);
    d3.select('#tip').style('opacity',0);
    if (selected === d) {
        d3.select('#countryInfoTip').style('opacity', 0);
    }
    else {
        d3.select('#countryInfoTip').style('opacity', 0.53);
    }
    fillCountryInfo(d);
    positionPopover();
})
.on('mousemove', function(d) {
    var mouse = d3.mouse(htmlNode);
    fillCountryInfo(d);
    positionPopover();
})
.on('mouseout', function(d) {
    d3.select('#countryInfo').style('opacity',0);
    d3.select('#tip').style('opacity',1);
    d3.selectAll('.background').style('opacity','0.1');
    countryInfoElem.style('opacity',0);
})
.on('click', function(d) {
    if (d3.select('#countryComparison').style('left')[0] !== '-') {
        dismiss();
        return;
    }
    d3.select('#countryInfoTip').style('opacity', 0);
    if (selected !== '') {
        if (d === selected) {
            deselectAll();
        }
        else {
            compare(selected, d);
        }
    }
    else {
        selected = d;
        d3.select('#countryInfoTip').text('Click to compare with ' + d['country']);
        d3.select(this).classed('selected',true);
    }
    d3.event.stopPropagation();
});

function coords(angle, radius) {
    var y = Math.sin(angle) * radius;
    var x = Math.cos(angle) * radius;
    return [x, y];
}

var ginner = circular.append('g').attr('transform',centerTransform).attr('class','inner');
arc.outerRadius(190).innerRadius(180);
ginner.selectAll('path').data(data).enter().append('path').attr('d', function(d, i) {
    arc.startAngle(i * arcLength).endAngle((i * arcLength) + (arcLength));
    return arc();
})
.attr('class', classifyHDI);

ginner.append('path').attr('d', 'M' + coords(6.2 * Math.PI/4, 169) + 'A' + '169,169 0 0 1 ' + coords(1.85*Math.PI, 169)).attr('id', 'LHDI');
ginner.append('text').append('textPath').attr('href','#LHDI').attr('xlink:href','#LHDI').text(_.filter(data,lhdi).length + ' countries with Low HDI').attr('class','lhdi');
ginner.append('path').attr('d', 'M' + coords(1.97 * Math.PI, 169) + 'A' + '169,169 0 0 1 ' + coords(0.72*Math.PI/2, 169)).attr('id', 'MHDI');
ginner.append('text').append('textPath').attr('href','#MHDI').attr('xlink:href','#MHDI').text(_.filter(data,mhdi).length + ' countries with Medium HDI').attr('class','mhdi');
ginner.append('path').attr('d', 'M' + coords(Math.PI/2, 169) + 'A' + '169,169 0 0 1 ' + coords(0.85*Math.PI, 169)).attr('id', 'HHDI');
ginner.append('text').append('textPath').attr('href','#HHDI').attr('xlink:href','#HHDI').text(_.filter(data,hhdi).length + ' countries with High HDI').attr('class','hhdi');
ginner.append('path').attr('d', 'M' + coords(Math.PI, 169) + 'A' + '169,169 0 0 1 ' + coords(2.9 * Math.PI/2, 169)).attr('id', 'VHDI');
ginner.append('text').append('textPath').attr('href','#VHDI').attr('xlink:href','#VHDI').text(_.filter(data,vhdi).length + ' countries with Very high HDI').attr('class','vhdi');

var colorPalette = ['#FF35AA','#FF3535','#FF5300','#FFB505','#FFE526','#6AE71E','#53ECDA','#07BDE7','#0571D4','#2D1FCF'];
var colorscale =  d3.scaleQuantize().domain([-2.5, 2.5]).range(colorPalette);
var circularPlot = function(y, outerRadius) {
    var ydomain = [-2.5, 2.5];
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
                g.selectAll('.v-' + String(v).replace('.','')).data(data).enter().append('path').attr('d', function(d,i) {
                    if ((s < (stops.length/2) && Number(d[y]) > v) || (s >= stops.length/2 && Number(d[y]) < v)) {
                        arc.startAngle(i * arcLength + (0.15*arcLength)).endAngle((i * arcLength) + (0.8 * arcLength));
                        return arc();
                    }
                })
                .attr('data-country', function(d){return d['country'];})
                .attr('data-y', function(d) {return d[y];})
                .style('fill', function(d,i) {
                    return colorscale(d[y]);
                });
                outerRadius = outerRadius - 5;
            }
            g.append('text').append('textPath').attr('href','#' + y).attr('xlink:href','#' + y).text(y);
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
    var validy1 = _.filter(data, function(c){return c[y1] !== null;});
    var validy2 = _.filter(data, function(c){return c[y2] !== null;});
    var yscale = d3.scaleLinear().domain([0,_.max([
        Number(_.max(validy1, function(c){return Number(c[y1]);})[y1]),
        Number(_.max(validy2, function(c){return Number(c[y2]);})[y2])
    ])])
    .range([outerRadius - 50, outerRadius])
    .nice();
    var yticks = yscale.ticks(5);
    return {
        draw: function(elem) {
            var g = circular.append('g').attr('transform', centerTransform).attr('class','radial-line-chart ');
            for (var i=1; i<yticks.length; i++) {
                var t = yticks[i];
                g.append('circle').attr('x', 0).attr('y', 0).attr('r', yscale(t));
                var tc = coords(6.52*Math.PI/4, yscale(t-2));
                g.append('text').attr('x', tc[0]).attr('y', tc[1]).text(t + '%');
            }
            var loop = function(y) {
                return d3.lineRadial().curve(d3.curveCatmullRomClosed)
                    .angle(function(d,i) {
                        return i * arcLength + (0.53 * arcLength);
                    })
                    .radius(function(d,i) {
                        if (d[y] == null) {
                            return outerRadius-50;
                        }
                        var r = yscale(d[y]);
                        return r;
                    });
            }
            g.append('path').attr('d', loop(y1)(data)).attr('class', class1);
            g.append('path').attr('d', loop(y2)(data)).attr('class', class2);
        }
    }
}

var r = radialLineChart('health', 'education', 250, 'healthexp', 'eduexp');
r.draw(circular);

circular.select('.info').attr('transform', centerTransform);
circular.select('.annotations').attr('transform', centerTransform);

var legend = d3.select('#legend').attr('width', 490).attr('height', 53);
legend.selectAll('rect').attr('height', 3).attr('width', 10).attr('rx',2).attr('ry',2);
_.each(['b5','b4','b3','b2','b1','g1','g2','g3','g4','g5'], function(l,i){legend.selectAll('#l' + l + ' rect').attr('fill', colorPalette[i]);});
var lline = d3.line().curve(d3.curveCatmullRom);
function wave(start) {
    var arr = [];
    for (var i=0;i<3;i++) {
        arr.push([start, 13]);
        start += 7;
        arr.push([start, 5]);
        start += 7;
        arr.push([start, 13]);
        start += 7;
        arr.push([start, 21]);
        start += 7;
    }
    arr.push([start, 13]);
    return arr;
}
legend.select('#lhexp').attr('d',lline(wave(210))).style('fill','none');
legend.select('#leexp').attr('d',lline(wave(330))).style('fill','none');
