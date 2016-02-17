
console.log('Loading volcanoPlot...');
window.smartRApp.directive('volcanoPlot', ['smartRUtils', 'rServeService', function(smartRUtils, rServeService) {

    return {
        restrict: 'E',
        scope: {
            data: '=',
            width: '@',
            height: '@'
        },
        link: function (scope, element) {

            /**
             * Watch data model (which is only changed by ajax calls when we want to (re)draw everything)
             */
            scope.$watch('data', function () {
                $(element[0]).empty();
                if (scope.data) {
                    createVolcanoplot(scope, element[0]);
                }
            });
        }
    };

    function createVolcanoplot(scope, root) {
        var uids = results.uids
        var pValues = results.pValues
        var negativeLog10PValues = results.negativeLog10PValues
        var logFCs = results.logFCs
        var patientIDs = results.patientIDs
        var zScoreMatrix = results.zScoreMatrix

        var points = negativeLog10PValues.map(function (d, i) {
            return {
                uid: uids[i],
                pValue: pValues[i],
                negativeLog10PValues: negativeLog10PValues[i],
                logFC: logFCs[i]
            }
        })

        var currentLogFC = 0.5
        var currentNegLog10P = -Math.log10(0.05)

        var margin = {top: 100, right: 100, bottom: 100, left: 100}
        var width = 1200 - margin.left - margin.right
        var height = 800 - margin.top - margin.bottom

        var volcanotable = d3.select('#volcanotable').append('table')
            .attr('width', width)
            .attr('height', height)

        var volcanoplot = d3.select('#volcanoplot').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        var x = d3.scale.linear()
            .domain([-d3.max(logFCs), d3.max(logFCs)])
            .range([0, width])

        var y = d3.scale.linear()
            .domain(d3.extent(negativeLog10PValues))
            .range([height, 0])

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')

        volcanoplot.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

        volcanoplot.append('g')
            .attr('class', 'axis')
            .call(yAxis)

        volcanoplot.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, 0)')
            .call(d3.svg.axis()
                .scale(x)
                .ticks(10)
                .tickFormat('')
                .innerTickSize(height)
                .orient('bottom'))

        volcanoplot.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + width + ',' + 0 + ')')
            .call(d3.svg.axis()
                .scale(y)
                .ticks(10)
                .tickFormat('')
                .innerTickSize(width)
                .orient('left'))

        volcanoplot.append('text')
            .attr('class', 'text axisText')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .text('log2 FC')

        volcanoplot.append('text')
            .attr('class', 'text axisText')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(' + (-40) + ',' + (height / 2) + ')rotate(-90)')
            .text('- log10 p')

        var tooltip = d3.select('#volcanoplot').append('div')
            .attr('class', 'tooltip text')
            .style('visibility', 'hidden')

        function pDragged() {
            var yPos = d3.event.y
            if (yPos < 0) {
                yPos = 0
            }
            if (yPos > height) {
                yPos = height
            }

            d3.selectAll('.pLine')
                .attr('y1', yPos)
                .attr('y2', yPos)

            d3.selectAll('.pHandle')
                .attr('y', yPos - 6)

            d3.selectAll('.pText')
                .attr('y', yPos)
                .text('p = ' + (1 / Math.pow(10, y.invert(yPos))).toFixed(5))

            currentNegLog10P = y.invert(yPos)

            d3.selectAll('.point')
                .style('fill', function (d) {
                    return getColor(d)
                })

            drawVolcanotable(getTopRankedPoints().data())
        }

        var pDrag = d3.behavior.drag()
            .on('drag', pDragged)

        volcanoplot.append('line')
            .attr('class', 'pLine')
            .attr('x1', 0)
            .attr('y1', y(currentNegLog10P))
            .attr('x2', width)
            .attr('y2', y(currentNegLog10P))

        volcanoplot.append('rect')
            .attr('class', 'pHandle')
            .attr('x', 0)
            .attr('y', y(currentNegLog10P) - 6)
            .attr('width', width)
            .attr('height', 12)
            .call(pDrag)

        volcanoplot.append('text')
            .attr('class', 'text pText')
            .attr('x', width + 5)
            .attr('y', y(currentNegLog10P))
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .text('p = 0.0500')
            .style('fill', 'red')

        function lFCDragged() {
            var xPos = d3.event.x

            if (xPos < 0) {
                xPos = 0
            }
            if (xPos > width) {
                xPos = width
            }

            var logFC = x.invert(xPos)

            d3.selectAll('.logFCLine.left')
                .attr('x1', x(-Math.abs(logFC)))
                .attr('x2', x(-Math.abs(logFC)))
            d3.selectAll('.logFCHandle.left')
                .attr('x', x(-Math.abs(logFC)) - 6)
            d3.selectAll('.logFCText.left')
                .attr('x', x(-Math.abs(logFC)))
                .text('log2FC = ' + (-Math.abs(logFC)).toFixed(2))

            d3.selectAll('.logFCLine.right')
                .attr('x1', x(Math.abs(logFC)))
                .attr('x2', x(Math.abs(logFC)))
            d3.selectAll('.logFCHandle.right')
                .attr('x', x(Math.abs(logFC)) - 6)
            d3.selectAll('.logFCText.right')
                .attr('x', x(Math.abs(logFC)))
                .text('log2FC = ' + Math.abs(logFC).toFixed(2))

            currentLogFC = Math.abs(logFC)

            d3.selectAll('.point')
                .style('fill', function (d) {
                    return getColor(d)
                })

            drawVolcanotable(getTopRankedPoints().data())
        }

        var lFCDrag = d3.behavior.drag()
            .on('drag', lFCDragged)

        volcanoplot.append('line')
            .attr('class', 'left logFCLine')
            .attr('x1', x(-currentLogFC))
            .attr('y1', height)
            .attr('x2', x(-currentLogFC))
            .attr('y2', 0)

        volcanoplot.append('rect')
            .attr('class', 'left logFCHandle')
            .attr('x', x(-currentLogFC) - 6)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', height)
            .call(lFCDrag)

        volcanoplot.append('text')
            .attr('class', 'text left logFCText')
            .attr('x', x(-currentLogFC))
            .attr('y', -15)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .text('log2FC = ' + (-currentLogFC))
            .style('fill', '#0000FF')

        volcanoplot.append('line')
            .attr('class', 'right logFCLine')
            .attr('x1', x(currentLogFC))
            .attr('y1', height)
            .attr('x2', x(currentLogFC))
            .attr('y2', 0)

        volcanoplot.append('rect')
            .attr('class', 'right logFCHandle')
            .attr('x', x(currentLogFC) - 6)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', height)
            .call(lFCDrag)

        volcanoplot.append('text')
            .attr('class', 'text right logFCText')
            .attr('x', x(currentLogFC))
            .attr('y', -15)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .text('log2FC = ' + currentLogFC)
            .style('fill', '#0000FF')

        function getTopRankedPoints() {
            return d3.selectAll('.point').filter(function (d) {
                return d.negativeLog10PValues > currentNegLog10P && Math.abs(d.logFC) > currentLogFC
            })
        }

        function getColor(point) {
            if (point.negativeLog10PValues < currentNegLog10P && Math.abs(point.logFC) < currentLogFC) {
                return '#000000'
            }
            if (point.negativeLog10PValues >= currentNegLog10P && Math.abs(point.logFC) < currentLogFC) {
                return '#FF0000'
            }
            if (point.negativeLog10PValues >= currentNegLog10P && Math.abs(point.logFC) >= currentLogFC) {
                return '#00FF00'
            }
            return '#0000FF'
        }

        function resetVolcanotable() {
            d3.select('#volcanotable').selectAll('*').remove()
        }

        function drawVolcanotable(points) {
            resetVolcanotable()
            if (!points.length) {
                return
            }
            var columns = ['uid', 'logFC', 'negativeLog10PValues', 'pValue']
            var HEADER = ['ID', 'log2 FC', '- log10 p', 'p']
            var table = d3.select('#volcanotable').append('table')
                .attr('class', 'mytable')
            var thead = table.append('thead')
            var tbody = table.append('tbody')

            thead.append('tr')
                .attr('class', 'mytr')
                .selectAll('th')
                .data(HEADER)
                .enter()
                .append('th')
                .attr('class', 'myth')
                .text(function (d) {
                    return d
                })

            var rows = tbody.selectAll('tr')
                .data(points)
                .enter()
                .append('tr')
                .attr('class', 'mytr')

            rows.selectAll('td')
                .data(function (row) {
                    return columns.map(function (column) {
                        return {column: column, value: row[column]}
                    })
                })
                .enter()
                .append('td')
                .attr('class', 'text mytd')
                .text(function (d) {
                    return d.value
                })
        }

        function launchKEGGPWEA() {
            var genes = getTopRankedPoints().data().map(function (d) {
                var split = d.uid.split('--')
                return split[split.length - 1]
            })

            $.ajax({
                url: 'http://biocompendium.embl.de/cgi-bin/biocompendium.cgi',
                type: 'POST',
                timeout: '10000',
                async: false,
                data: {
                    section: 'upload_gene_lists_general',
                    primary_org: 'human',
                    background: 'whole_genome',
                    Category1: 'human',
                    gene_list_1: 'gene_list_1',
                    SubCat1: 'hgnc_symbol',
                    attachment1: genes.join(' ')
                }
            }).done(function (response) {
                var sessionID = response.match(/tmp_\d+/)[0]
                var url = 'http://biocompendium.embl.de/cgi-bin/biocompendium.cgi?section=pathway&pos=0&background=whole_genome&session=' + sessionID + '&list=gene_list_1__1&list_size=15&org=human'
                window.open(url)
            }).fail(function () {
                alert('An error occured. Maybe the external resource is unavailable.')
            })
        }

        function updateVolcano() {
            var point = volcanoplot.selectAll('.point')
                .data(points, function (d) {
                    return d.uid
                })

            point.enter()
                .append('rect')
                .attr('class', 'point uid-' + d.uid)
                .attr('x', function (d) {
                    return x(d.logFC) - 2
                })
                .attr('y', function (d) {
                    return y(d.negativeLog10PValues) - 2
                })
                .attr('width', 4)
                .attr('height', 4)
                .style('fill', function (d) {
                    return getColor(d)
                })
                .on('mouseover', function (d) {
                    var html = 'ID: ' + d.uid + '<br/>p-value: ' + d.pValue + '<br/>-log10 p: ' + d.negativeLog10PValues + '<br/>log2FC: ' + d.logFC
                    tooltip.html(html)
                        .style('visibility', 'visible')
                        .style('left', mouseX() + 10 + 'px')
                        .style('top', mouseY() + 10 + 'px')
                })
                .on('mouseout', function () {
                    tooltip.style('visibility', 'hidden')
                })

            point.exit()
                .attr('r', 0)
                .remove()
        }

        updateVolcano()
        drawVolcanotable(getTopRankedPoints().data())

        var buttonWidth = 200
        var buttonHeight = 40
        var keggButton = createD3Button({
            location: volcanoplot,
            label: 'Find KEGG Pathway',
            x: 0,
            y: -buttonHeight - 5,
            width: buttonWidth,
            height: buttonHeight,
            callback: launchKEGGPWEA
        })

        keggButton
            .on('mouseover', function () {
                getTopRankedPoints().style('stroke', '#FF0000')
            })
            .on('mouseout', function () {
                getTopRankedPoints().style('stroke', null)
            })
    }

}]);