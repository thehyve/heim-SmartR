<!DOCTYPE html>
<style>
	.text {
	    font-family: 'Roboto', sans-serif;
        fill: black;
	}

    .point {
        stroke: black;
        stroke-width: 1px;
    }

    .axis path,
    .axis line {
        fill: none;
        stroke: black;
        shape-rendering: crispEdges;
    }

    .tooltip {
        position: absolute;
        text-align: center;
        display: inline-block;
        padding: 0px;
        font-size: 12px;
        font-weight: bold;
        color: black;
        background: white;
        pointer-events: none;
    }

    .pLine {
        stroke: red;
        stroke-width: 2px;
    }

    .logFCLine {
        stroke: #0000FF;
        stroke-width: 2px;
    }

    .axisText {
        font-size: 14px;
    }
</style>

<link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
<g:javascript src="resource/d3.js"/>

<div id="visualization">
    <div id="controls" style='float: left; padding-right: 10px'></div>
    <div id="volcanoplot" style='float: left; padding-right: 10px'></div>
</div>

<script>
    var animationDuration = 1000;
    var tmpAnimationDuration = animationDuration;
    function switchAnimation(checked) {
        if (! checked) {
            tmpAnimationDuration = animationDuration;
            animationDuration = 0;
        } else {
            animationDuration = tmpAnimationDuration;
        }
    }

	var results = ${raw(results)};
    var probes = results.probes;
    var geneSymbols = results.geneSymbols;
    var pValues = results.pValues;
    var logFCs = results.logFCs;
    var points = jQuery.map(pValues, function(d, i) {
        return {pValue: pValues[i],
                logFC: logFCs[i],
                probe: probes[i],
                geneSymbol: geneSymbols[i],
                uid: i
        };
    });

    var margin = {top: 100, right: 100, bottom: 100, left: 100};
    var width = 1200 - margin.left - margin.right;
    var height = 800 - margin.top - margin.bottom;

    var volcanoplot = d3.select("#volcanoplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var controls = d3.select("#controls").append("svg")
    .attr("width", 220)
    .attr("height", height * 2);

    var x = d3.scale.linear()
    .domain(d3.extent(logFCs))
    .range([0, width]);

    var y = d3.scale.linear()
    .domain(d3.extent(pValues))
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    volcanoplot.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    volcanoplot.append("g")
    .attr("class", "axis")
    .call(yAxis);

    volcanoplot.append('text')
    .attr('class', 'axisText')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .text('Log2 Fold Change');

    volcanoplot.append('text')
    .attr('class', 'axisText')
    .attr('text-anchor', 'middle')
    .attr("transform", "translate(" + (-40) + "," + (height / 2) + ")rotate(-90)")
    .text('Negative Log10 p-Value');

    var tooltip = d3.select('#volcanoplot').append("div")
    .attr("class", "tooltip text")
    .style("visibility", "hidden");

    volcanoplot.append('line')
    .attr('class', 'pLine')
    .attr('x1', 0)
    .attr('y1', y(- Math.log10(0.05)))
    .attr('x2', width)
    .attr('y2', y(- Math.log10(0.05)));

    volcanoplot.append('line')
    .attr('class', 'logFCLine')
    .attr('x1', x(-0.5))
    .attr('y1', height)
    .attr('x2', x(-0.5))
    .attr('y2', 0);

    volcanoplot.append('line')
    .attr('class', 'logFCLine')
    .attr('x1', x(0.5))
    .attr('y1', height)
    .attr('x2', x(0.5))
    .attr('y2', 0);

    volcanoplot.append('text')
    .attr('x', width + 5)
    .attr('y', y(- Math.log10(0.05)))
    .attr('dy', '0.35em')
    .attr("text-anchor", "start")
    .text('p = 0.05')
    .style('fill', 'red');

    volcanoplot.append('text')
    .attr('x', x(-0.5))
    .attr('y', - 15)
    .attr('dy', '0.35em')
    .attr("text-anchor", "middle")
    .text('log2FC = -0.5')
    .style('fill', '#0000FF');

    volcanoplot.append('text')
    .attr('x', x(0.5))
    .attr('y', - 15)
    .attr('dy', '0.35em')
    .attr("text-anchor", "middle")
    .text('log2FC = 0.5')
    .style('fill', '#0000FF');

    function customColorSet() {
        var colorSet = [];
        var NUM = 100;
        var i = NUM;
        while(i--) {
            colorSet.push(d3.rgb(0, (255 * (NUM - i)) / NUM, 0));
        }
        return colorSet;
    }

    var absLogFCs = jQuery.map(logFCs, function(d) { return Math.abs(d); });
    var pValuesMinMax = d3.extent(pValues);
    var logFCsMinMax = d3.extent(absLogFCs);
    var colorScale = d3.scale.quantile()
    .domain([pValuesMinMax[0] * logFCsMinMax[0], pValuesMinMax[1] * logFCsMinMax[1]])
    .range(customColorSet());

    var oo5p = - Math.log10(0.05);
    function updateVolcano() {
        var point = volcanoplot.selectAll(".point")
        .data(points, function(d) { return d.uid; });

        point.enter()
        .append("circle")
        .attr("class", function(d) { return "point probe-" + d.probe; })
        .attr("cx", function(d) { return x(d.logFC); })
        .attr("cy", function(d) { return y(d.pValue); })
        .attr("r", 4)
        // .attr('visibility', function(d) {
        //     if (d.pValue < oo5p && Math.abs(d.logFC) < 0.5) {
        //         return 'hidden';
        //     } else {
        //         return 'visible';
        //     }
        // })
        .style("fill", function(d) {
            if (d.pValue < oo5p && Math.abs(d.logFC) < 0.5) {
                return '#000000';
            } else if (d.pValue >= oo5p && Math.abs(d.logFC) < 0.5) {
                return '#FF0000';
            } else if (d.pValue >= oo5p && Math.abs(d.logFC) >= 0.5) {
                return '#00FF00';
            } else {
                return '#0000FF';
            }
        })
        .on("mouseover", function(d) {
            tooltip.style("visibility", "visible")
            .html("- Log10 p-Value: " + d.pValue + "<br/>" + "Real p-Value:" + (Math.pow(10, - d.pValue)).toFixed(4) + "<br/>" + "Log2FC: " + d.logFC + "<br/>" + "Gene: " + d.geneSymbol + "<br/>" + "ProbeID: " + d.probe)
            .style("left", mouseX() + "px")
            .style("top", mouseY() + "px");
        })
        .on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });

        point.exit()
        .transition()
        .duration(animationDuration)
        .attr("r", 0)
        .remove();
    }

    updateVolcano();

	var buttonWidth = 200;
    var buttonHeight = 40;
    var padding = 5;

    createD3Switch({
        location: controls,
        onlabel: 'Animation ON',
        offlabel: 'Animation OFF',
        x: 2,
        y: 2 + padding * 0 + buttonHeight * 0,
        width: buttonWidth,
        height: buttonHeight,
        callback: switchAnimation,
        checked: true
    });
</script>
