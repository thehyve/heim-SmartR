<!DOCTYPE html>
<style>
	.text {
	    font-family: 'Roboto', sans-serif;
        fill: black;
	}

    .point {

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

    .square {

    }

    .pLine {
        stroke: red;
        stroke-width: 2px;
        shape-rendering: crispEdges;
    }

    .logFCLine {
        stroke: #0000FF;
        stroke-width: 2px;
        shape-rendering: crispEdges;
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
    var animationDuration = 500;
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
    var patientIDs = results.patientIDs;
    var points = jQuery.map(pValues, function(d, i) {
        return {pValue: pValues[i],
                logFC: logFCs[i],
                probe: probes[i],
                geneSymbol: geneSymbols[i],
                uid: i
        };
    });
    var zScoreMatrix = results.zScoreMatrix;
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

    function redGreen() {
        var colorSet = [];
        var NUM = 100;
        var i = NUM;
        while(i--) {
            colorSet.push(d3.rgb((255 * i) / NUM, 0, 0));
        }
        i = NUM;
        while(i--) {
            colorSet.push(d3.rgb(0, (255 * (NUM - i)) / NUM, 0));
        }
        return colorSet;
    }

    var colorScale = d3.scale.quantile()
    .domain([0, 1])
    .range(redGreen());

    function getColor(point) {
        if (point.pValue < oo5p && Math.abs(point.logFC) < 0.5) {
            return '#000000';
        }
        if (point.pValue >= oo5p && Math.abs(point.logFC) < 0.5) {
            return '#FF0000';
        }
        if (point.pValue >= oo5p && Math.abs(point.logFC) >= 0.5) {
            return '#00FF00';
        }
        return '#0000FF';
    }

    var miniHeatmap = volcanoplot.append("g");
    function resetMiniHeatmap() {
        miniHeatmap.selectAll('*').remove();
    }

    function drawMiniHeatmap(point) {
        var gridFieldWidth = 20;
        var gridFieldHeight = 20;

        var square = miniHeatmap.selectAll('.square')
        .data(patientIDs, function(d) { return d; });

        square
        .enter()
        .append("rect")
        .attr('class', 'square')
        .attr("x", function(d) {
            return x(point.logFC);
        })
        .attr("y", function() {
            return y(point.pValue) - gridFieldHeight;
        })
        .attr("width", gridFieldWidth)
        .attr("height", gridFieldHeight)
        .style("fill", function(patientID) {
            var entry;
            for (var i = 0; i < zScoreMatrix.length; i++) {
                entry = zScoreMatrix[i];
                if (entry.PROBE === point.probe) {
                    break;
                }
            }
            return colorScale(1 / (1 + Math.pow(Math.E, - entry[patientID])));
        });

        square
        .transition()
        .duration(animationDuration)
        .attr("x", function(d) {
            return x(point.logFC) + patientIDs.indexOf(d) * gridFieldWidth;
        });

        var miniHeatmapText = miniHeatmap.selectAll('.miniHeatmapText')
        .data(patientIDs, function(d) { return d; });

        miniHeatmapText
        .enter()
        .append("text")
        .attr('class', 'text miniHeatmapText')
        .attr("transform", "translate(" + (x(point.logFC) + gridFieldWidth / 2) + "," + (y(point.pValue) - gridFieldHeight - 8) + ")rotate(-45)")
        .attr('dy', '0.35em')
        .attr("text-anchor", "start")
        .text(function(d) { return d; });

        miniHeatmapText
        .transition()
        .duration(animationDuration)
        .attr("transform", function(d) { return "translate(" + (x(point.logFC) + gridFieldWidth / 2 + patientIDs.indexOf(d) * gridFieldWidth) + "," + (y(point.pValue) - gridFieldHeight - 8) + ")rotate(-45)"; });
    }

    var oo5p = - Math.log10(0.05);
    function updateVolcano() {
        var point = volcanoplot.selectAll(".point")
        .data(points, function(d) { return d.uid; });

        point.enter()
        .append("circle")
        .attr("class", function(d) { return "point probe-" + d.probe; })
        .attr("cx", function(d) { return x(d.logFC); })
        .attr("cy", function(d) { return y(d.pValue); })
        .attr("r", 3)
        .style("fill", function(d) { return getColor(d); })
        .on("mouseover", function(d) {
            drawMiniHeatmap(d);

            var html = "- Log10 p-Value: " + d.pValue + "<br/>" + "Real p-Value:" + (Math.pow(10, - d.pValue)).toFixed(4) + "<br/>" + "Log2FC: " + d.logFC + "<br/>" + "Gene: " + d.geneSymbol + "<br/>" + "ProbeID: " + d.probe;

            tooltip
            .style("visibility", "visible")
            .html(html)
            .style("left", mouseX() + "px")
            .style("top", mouseY() + "px");
        })
        .on("mouseout", function(d) {
            resetMiniHeatmap();
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
