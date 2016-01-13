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
        color: #FFFFFF;
        background: #123456;
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

    .brush .extent {
        fill: blue;
        opacity: .25;
        shape-rendering: crispEdges;
    }

    .mytable, .myth, .mytd {
        border: 1px solid black;
        border-collapse: collapse;
    }

    .myth, .mytd {
        padding: 5px;
    }
</style>

<link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
<g:javascript src="resource/d3.js"/>

<div id="visualization">
    <div id="volcanocontrols" style='float: left; padding-right: 10px'></div>
    <div id="volcanoplot" style='float: left; padding-right: 10px'></div><br/>
    <div id="volcanotable" style='float: left; padding-right: 10px'></div>
</div>

<script>
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
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

	var results = ${results};
    var uids = results.uids;
    var pValues = results.pValues;
    var negativeLog10PValues = results.negativeLog10PValues;
    var logFCs = results.logFCs;
    var patientIDs = results.patientIDs;
    var zScoreMatrix = results.zScoreMatrix;

    var points = jQuery.map(negativeLog10PValues, function(d, i) {
        return {uid: uids[i],
                pValue: pValues[i],
                negativeLog10PValues: negativeLog10PValues[i],
                logFC: logFCs[i]
        };
    });

    var margin = {top: 100, right: 100, bottom: 100, left: 100};
    var width = 1200 - margin.left - margin.right;
    var height = 800 - margin.top - margin.bottom;

    var volcanotable = d3.select("#volcanotable").append("table")
    .attr("width", width)
    .attr("height", height);

    var volcanoplot = d3.select("#volcanoplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var controls = d3.select("#volcanocontrols").append("svg")
    .attr("width", 220)
    .attr("height", height * 2);

    var x = d3.scale.linear()
    .domain(d3.extent(logFCs))
    .range([0, width]);

    var y = d3.scale.linear()
    .domain(d3.extent(negativeLog10PValues))
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
    .text('log2 FC');

    volcanoplot.append('text')
    .attr('class', 'axisText')
    .attr('text-anchor', 'middle')
    .attr("transform", "translate(" + (-40) + "," + (height / 2) + ")rotate(-90)")
    .text('- log10 p');

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

    var brush = d3.svg.brush()
    .x(d3.scale.identity().domain([-20, width + 20]))
    .y(d3.scale.identity().domain([-20, height + 20]))
    .on("brushend", function() {
        updateSelection();
    });

    volcanoplot.append("g")
    .attr("class", "brush")
    .on("mousedown", function(){
        if(d3.event.button === 2){
            d3.event.stopImmediatePropagation();
        }
    })
    .call(brush);

    function updateSelection() {
        var selection = [];
        d3.selectAll('.point')
        .classed('brushed', false);

        var extent = brush.extent();
        var left = extent[0][0],
            top = extent[0][1],
            right = extent[1][0],
            bottom = extent[1][1];

        d3.selectAll('.point').each(function(d) {
            var point = d3.select(this);
            if (y(d.negativeLog10PValues) >= top && y(d.negativeLog10PValues) <= bottom && x(d.logFC) >= left && x(d.logFC) <= right) {
                point
                .classed('brushed', true);
                selection.push(d);
            }
        });
        drawVolcanotable(selection);
    }

    var absLogFCs = jQuery.map(logFCs, function(d) { return Math.abs(d); });
    var negativeLog10PValuesMinMax = d3.extent(negativeLog10PValues);
    var logFCsMinMax = d3.extent(absLogFCs);

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
        if (point.negativeLog10PValues < oo5p && Math.abs(point.logFC) < 0.5) {
            return '#000000';
        }
        if (point.negativeLog10PValues >= oo5p && Math.abs(point.logFC) < 0.5) {
            return '#FF0000';
        }
        if (point.negativeLog10PValues >= oo5p && Math.abs(point.logFC) >= 0.5) {
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
        var entry;
        for (var i = 0; i < zScoreMatrix.length; i++) {
            entry = zScoreMatrix[i];
            if (entry.uid === point.uid) {
                break;
            }
        }

        var square = miniHeatmap.selectAll('.square')
        .data(patientIDs, function(d) { return d; });

        square
        .enter()
        .append("rect")
        .attr('class', 'square')
        .attr("x", 0)
        .attr("y", height + 10)
        .attr("width", gridFieldWidth)
        .attr("height", gridFieldHeight)
        .style("fill", function(patientID) {
            return colorScale(1 / (1 + Math.pow(Math.E, - entry[patientID])));
        });

        square
        .transition()
        .duration(animationDuration)
        .attr("x", function(d) {
            return patientIDs.indexOf(d) * gridFieldWidth;
        });

        var miniHeatmapText = miniHeatmap.selectAll('.miniHeatmapText')
        .data(patientIDs, function(d) { return d; });

        miniHeatmapText
        .enter()
        .append("text")
        .attr('class', 'text miniHeatmapText')
        .attr("transform", "translate(" + 0  + "," + height + ")rotate(-45)")
        .attr('dy', '0.35em')
        .attr("text-anchor", "start")
        .text(function(d) { return d; });

        miniHeatmapText
        .transition()
        .duration(animationDuration)
        .attr("transform", function(d) { return "translate(" + (gridFieldWidth / 2 + patientIDs.indexOf(d) * gridFieldWidth) + "," + height + ")rotate(-45)"; });

        miniHeatmap.moveToFront();
    }

    function resetVolcanotable() {
        d3.select('#volcanotable').selectAll('*').remove();
    }

    function drawVolcanotable(points) {
        resetVolcanotable();
        if (!points.length) {
            return;
        }
        var columns = ["uid", "logFC", "negativeLog10PValues", 'pValue'];
        var HEADER = ["ID", "log2 FC", "- log10 p", "p"];
        var table = d3.select('#volcanotable').append("table")
        .attr('class', 'mytable');
        var thead = table.append("thead");
        var tbody = table.append("tbody");

        thead.append("tr")
        .attr('class', 'mytr')
        .selectAll("th")
        .data(HEADER)
        .enter()
        .append("th")
        .attr('class', 'myth')
        .text(function(d) { return d; });

        var rows = tbody.selectAll("tr")
        .data(points)
        .enter()
        .append("tr")
        .attr('class', 'mytr');

        var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .attr('class', 'mytd')
        .text(function(d) { return d.value; });
    }

    var oo5p = - Math.log10(0.05);
    function updateVolcano() {
        var point = volcanoplot.selectAll(".point")
        .data(points, function(d) { return d.uid; });

        point.enter()
        .append("circle")
        .attr("class", function(d) { return "point uid-" + d.uid; })
        .attr("cx", function(d) { return x(d.logFC); })
        .attr("cy", function(d) { return y(d.negativeLog10PValues); })
        .attr("r", 3)
        .style("fill", function(d) { return getColor(d); })
        .on("mouseover", function(d) {
            // drawMiniHeatmap(d);
            var html = "p-value:" + d.pValue + "<br/>" + "-log10 p: " + d.negativeLog10PValues + "<br/>" + "log2FC: " + d.logFC + "<br/>" + "ID: " + d.uid;

            tooltip
            .style("visibility", "visible")
            .html(html)
            .style("left", mouseX() + 10 + "px")
            .style("top", mouseY() + 10 + "px");
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
