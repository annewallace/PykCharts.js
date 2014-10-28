PykCharts.multiD.columnChart = function(options){
    var that = this;
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function () {
        that = new PykCharts.multiD.processInputs(that, options, "column");

        if(that.stop) 
            return;
        
        // that.grid_y_enable = options.chart_grid_y_enable ? options.chart_grid_y_enable : theme.stylesheet.chart_grid_y_enable;
        that.grid_color = options.chart_grid_color ? options.chart_grid_color.toLowerCase() : theme.stylesheet.chart_grid_color;

        if(that.mode === "default") {
           that.k.loading();
        }
        that.multiD = new PykCharts.multiD.configuration(that);
        d3.json(options.data, function(e, data){
            that.data = data.groupBy("column");
            that.compare_data = data.groupBy("column");
            $(that.selector+" #chart-loader").remove();
            that.render();
        });
    };

    this.refresh = function () {
        d3.json(options.data, function (e, data) {
            that.data = data.groupBy("column");
            that.refresh_data = data.groupBy("column");
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }      
            that.data = that.dataTransformation();
            that.data = that.emptygroups(that.data);

            var fD = that.flattenData();
            that.the_bars = fD[0];
            that.the_keys = fD[1];
            that.the_layers = that.buildLayers(that.the_bars);
            if(that.no_of_groups === 1) {
                that.legends_enable = "no";
            }
            that.map_group_data = that.multiD.mapGroup(that.data);
            that.optionalFeatures()
                    .createChart()
                    .legends();

            that.k.yAxis(that.svgContainer,that.yGroup,that.yScaleInvert)
                .yGrid(that.svgContainer,that.group,that.yScaleInvert);
        });
    };

    //----------------------------------------------------------------------------------------
    //4. Render function to create the chart
    //----------------------------------------------------------------------------------------
    this.render = function(){
        var that = this;
        that.map_group_data = that.multiD.mapGroup(that.data);
        that.data = that.dataTransformation();
        that.data = that.emptygroups(that.data);
        var fD = that.flattenData();
        that.the_bars = fD[0];
        that.the_keys = fD[1];
        that.the_layers = that.buildLayers(that.the_bars);
        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        that.mouseEvent1 = new PykCharts.multiD.mouseEvent(that);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);

        
        if(that.no_of_groups === 1) {
            that.legends_enable = "no";
        }
        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#svgcontainer","columnChart")
                .emptyDiv()
                .subtitle()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(1)
                .legendsContainer(1);
                

            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .legends()
                .createGroups(1)
                .createChart()
                .axisContainer()
                .highlightRect();

            that.k.yAxis(that.svgContainer,that.yGroup,that.yScaleInvert)
                 .yAxisTitle(that.yGroup)
                // .xAxis(that.svgContainer,that.xGroup,that.xScale)
                .yGrid(that.svgContainer,that.group,that.yScaleInvert);

        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#svgcontainer","columnChart")
                .emptyDiv()
                .makeMainDiv(that.selector,1);
                
            that.optionalFeatures().svgContainer(1)
                .legendsContainer(1)
                .createGroups(1)
                .createChart()
                .axisContainer();

            that.k.tooltip();
            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
            that.k.yAxis(that.svgContainer,that.yGroup,that.yScaleInvert)
                 .yAxisTitle(that.yGroup);
        }

        if(PykCharts.boolean(that.legends_enable)) {
            $(window).on("load", function () { return that.k.resize(that.svgContainer,"",that.legendsContainer); })
                .on("resize", function () { return that.k.resize(that.svgContainer,"",that.legendsContainer); });
        } else {
            $(window).on("load", function () { return that.k.resize(that.svgContainer,""); })
                .on("resize", function () { return that.k.resize(that.svgContainer,""); });
        }
    };

    this.optionalFeatures = function() {
        var that = this;
        var optional = {
            svgContainer: function (i) {
               $(that.selector).attr("class","PykCharts-twoD");
                that.svgContainer = d3.select(options.selector + " #tooltip-svg-container-" + i)
                    .append("svg:svg")
                    .attr("width",that.width )
                    .attr("height",that.height)
                    .attr("id","svgcontainer")
                    .attr("class","svgcontainer")
                    // .style("background-color",that.background_color)
                    .attr("preserveAspectRatio", "xMinYMin")
                    .attr("viewBox", "0 0 " + that.width + " " + that.height);

                // $(options.selector).colourBrightness();
                return this;
            },
            createGroups: function (i) {
                // console.log(that.legendsGroup_height,"hello");
                that.group = that.svgContainer.append("g")
                    .attr("id","svggroup")
                    .attr("class","svggroup")
                    .attr("transform","translate(" + that.margin_left + "," + (that.margin_top + that.legendsGroup_height) +")");

                if(PykCharts.boolean(that.grid_y_enable)) {
                    that.group.append("g")
                        .attr("id","ygrid")
                        .style("stroke",that.grid_color)
                        .attr("class","y grid-line");
                }
                return this;
            },
            legendsContainer: function (i) {

                if(PykCharts.boolean(that.legends_enable) && that.mode === "default") {
                  
                    that.legendsGroup = that.svgContainer.append("g")
                        .attr("id","legends")
                        .attr("class","legends")
                        .attr("transform","translate(0,10)");
                        
                } else {
                    that.legendsGroup_height = 0;
                }
                return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_x_enable)) {
                    var axis_line = that.group.selectAll(".axis-line")
                        .data(["line"]);

                    axis_line.enter()
                            .append("line");

                    axis_line.attr("class","axis-line")
                            .attr("x1",0)
                            .attr("y1",that.height-that.margin_top-that.margin_bottom-that.legendsGroup_height )
                            .attr("x2",that.width-that.margin_left-that.margin_right)
                            .attr("y2",that.height-that.margin_top-that.margin_bottom-that.legendsGroup_height)
                            .attr("stroke",that.axis_x_line_color);

                    axis_line.exit().remove();

                    if (that.axis_x_position === "bottom") {
                        that.xGroup = that.group.append("g")
                            .attr("id","xaxis")
                            .attr("class", "x axis")
                            .style("stroke","none")
                            .append("text")
                                .attr("x", (that.width - that.margin_left - that.margin_right)/2)
                                .attr("y", that.height -that.margin_bottom - that.margin_top - that.legendsGroup_height)
                                // .attr("dy", -8)
                                .attr("dy", that.margin_top + 10)
                                .style("fill", that.axis_x_label_color)
                                .style("text-anchor", "end")
                                .text(that.axis_x_title);
                    } else if(that.axis_x_position === "top") {
                        axis_line.attr("y1",0)
                            .attr("y2",0);

                        that.xGroup = that.group.append("g")
                            .attr("id","xaxis")
                            .attr("class", "x axis")
                            .style("stroke","none")
                            .append("text")
                            .attr("x", (that.width - that.margin_left - that.margin_right)/2)
                            .attr("y", -40)
                            // .attr("dy", -8)
                            .attr("dy", that.margin_top + that.legendsGroup_height + 10)
                            .style("fill", that.axis_x_label_color)
                            .style("text-anchor", "end")
                            .text(that.axis_x_title);
                    }                    
                }
                if(PykCharts.boolean(that.axis_y_enable)) {
                    that.yGroup = that.group.append("g")
                        .attr("id","yaxis")
                        .attr("class","y axis");
                }
                return this;
            },
            createChart: function() {
                var w = that.width - that.margin_left - that.margin_right;
                var h = that.height - that.margin_top - that.margin_bottom - that.legendsGroup_height,j=that.no_of_groups+1;

                var the_bars = that.the_bars;
                var keys = that.the_keys;
                that.groups= that.getGroups();
                var layers = that.the_layers;
                
                that.stack_layout = d3.layout.stack() // Create default stack
                    .values(function(d){ // The values are present deep in the array, need to tell d3 where to find it
                        return d.values;
                    })(layers);

                var y_data = [];
                layers.map(function(e, i){ // Get all values to create scale
                    for(i in e.values){
                        var d = e.values[i];
                        y_data.push(d.y + d.y0); // Adding up y0 and y to get total height
                    }
                });

                that.xScale = d3.scale.ordinal()
                    .domain(the_bars.map(function(e, i){
                        return e.id || i; // Keep the ID for bars and numbers for integers
                    }))
                    .rangeBands([0,w],0.1);
                that.highlight_y_positions = [];
                that.highlight_x_positions = [];
                y_domain = [0,d3.max(y_data)]
                y_domain = that.k._domainBandwidth(y_domain,1);
                that.yScale = d3.scale.linear().domain(y_domain).range([0, h]);
                that.yScaleInvert = d3.scale.linear().domain([y_domain[1],y_domain[0]]).range([0, h]); // For the yAxis
                var zScale = d3.scale.category10();

                var group_arr = [], g, x, totalWidth, i;
                var x_factor = 0, width_factor = 0;
                if(that.no_of_groups === 1) {
                    x_factor = that.xScale.rangeBand()/4;
                    width_factor = (that.xScale.rangeBand()/(2*that.no_of_groups));
                };

                for(i in that.groups){
                    g = that.groups[i];
                    x = that.xScale(g[0]);
                    totalWidth = that.xScale.rangeBand() * g.length;
                    x = x + (totalWidth/2);
                    group_arr.push({x: x, name: i});
                }
                var len = w/group_arr.length;
                var bars = that.group.selectAll(".bars")
                    .data(layers);

                bars.attr("class","bars");
                bars.enter()
                        .append("g")
                        .attr("class", "bars");
                that.domain = group_arr.map(function (d) {
                    return d.name;
                });
                var rect = bars.selectAll("rect")
                    .data(function(d,i){
                        return d.values;
                    });

                rect.enter()
                    .append("svg:rect")
                    .attr("class","rect");

                rect.attr("height", 0).attr("y", h)
                    .attr("fill", function(d){
                        if(that.no_of_groups === 1) {
                            return that.fillColor.colorPieMS(d);
                        } else {
                            return that.fillColor.colorGroup(d);
                        }
                    })
                    .attr("fill-opacity", function (d,i) {
                        if (that.color_mode === "saturation") {
                        // if(PykCharts.boolean(that.saturationEnable))     {
                            
                            if(j>1) {
                                j--;
                                return j/that.no_of_groups;
                            } else {
                                j = that.no_of_groups+1;
                                j--;
                                return j/that.no_of_groups;
                            }
                        }
                    })
                    .attr("stroke",that.border.color())
                    .attr("stroke-width",that.border.width())
                    .attr("stroke-dasharray", that.border.style())
                    .attr("stroke-opacity",1)
                    .on('mouseover',function (d) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(d.tooltip ? d.tooltip : d.y);
                            that.mouseEvent.axisHighlightShow(d.name,options.selector + " " + ".axis-text",that.domain,"column");
                        }
                    })
                    .on('mouseout',function (d) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipHide(d);
                            that.mouseEvent.axisHighlightHide(options.selector + " " + ".axis-text","column");
                        }
                     })
                    .on('mousemove', function (d) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    });

                rect
                    // .transition()
                    // .duration(that.transitions.duration())
                    .attr("x", function(d) {
                        if(that.highlight.toLowerCase() === d.name.toLowerCase()) {
                            that.highlight_x_positions.push(that.xScale(d.x) - x_factor);
                        }
                        return that.xScale(d.x) - x_factor;
                    })
                    .attr("width", function(d) {
                        return that.xScale.rangeBand()+width_factor;
                    })
                    .attr("height", function(d){
                        return that.yScale(d.y);
                    })
                    .attr("y", function(d){
                        if(that.highlight.toLowerCase() === d.name.toLowerCase()) {
                            that.highlight_y_positions.push(that.yScale(d.y0+d.y));
                        }
                        return h - that.yScale(d.y0 + d.y);
                    });

                bars.exit()
                    .remove();

                var xAxis_label = that.group.selectAll("text.axis-text")
                    .data(group_arr);
                var flag, length = group_arr.length,
                    largest = 0, rangeband = len;

                xAxis_label.enter()
                        .append("text")

                xAxis_label.attr("class", "axis-text")
                        .attr("x", function(d){
                            return d.x;
                        })
                        .attr("text-anchor", "middle")
                        .attr("fill",that.axis_x_labelColor)
                        .text(function(d){
                            return d.name;
                        })
                        .text(function (d) {
                            largest = (this.getBBox().width > largest) ? this.getBBox().width : largest;
                        });
                if (rangeband >= largest) { flag = 1; }
                else if (rangeband >= (largest*0.75) && rangeband < largest) { flag = 2; }
                else if (rangeband >= (largest*0.65) && rangeband < (largest*0.75)) { flag = 3; }
                else if (rangeband >= (largest*0.55) && rangeband < (largest*0.65)) { flag = 4; }
                else if (rangeband >= (largest*0.35) && rangeband < (largest*0.55)) { flag = 5; }
                else if (rangeband <= 20 || rangeband < (largest*0.35)) { flag = 0; }

                xAxis_label.text(function (d) {
                            if (flag === 0) {
                                return "";
                            }
                            else if (rangeband >= this.getBBox().width && flag === 1) {
                                return d.name;
                            }
                            else if (rangeband >= (this.getBBox().width*0.75) && rangeband < this.getBBox().width && flag === 2){
                                return d.name.substr(0,5) + "..";
                            }
                            else if (rangeband >= (this.getBBox().width*0.65) && rangeband < (this.getBBox().width*0.75) && flag === 3){
                                return d.name.substr(0,4) + "..";
                            }
                            else if (flag === 4){
                                return d.name.substr(0,3);
                            }
                            else if (flag === 5){
                                return d.name.substr(0,2);
                            }
                            else {
                                return d.name;
                            }
                        })
                        .on('mouseover',function (d) {
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(d.name);
                        })
                        .on('mouseout',function (d) {
                            that.mouseEvent.tooltipHide(d);
                        })
                        .on('mousemove', function (d) {
                            that.mouseEvent.tooltipPosition(d);
                        });

                xAxis_label.exit().remove();
                if(that.axis_x_position==="top") {
                    if(that.axis_x_pointer_position === "top") {
                        xAxis_label.attr("y", function () {
                            return -15;
                        });
                    } else if(that.axis_x_pointer_position === "bottom") {
                        xAxis_label.attr("y", function () {
                            return 15;
                        });
                    }
                }else {
                    if(that.axis_x_pointer_position === "top") {
                        xAxis_label.attr("y", function () {
                            return h-15;
                        });
                    } else if(that.axis_x_pointer_position === "bottom") {
                        xAxis_label.attr("y", function () {
                            return h+15;
                        });
                    }
                }
                return this;
            },
            highlightRect : function () {
                if(that.no_of_groups > 1 && PykCharts.boolean(that.highlight)) {
                    function ascending( a, b ) {
                        return a - b;
                    }
                    that.highlight_x_positions.sort(ascending)
                    that.highlight_y_positions.sort(ascending);

                    var x_len = that.highlight_x_positions.length,
                        y_len = that.highlight_y_positions.length,
                        x = that.highlight_x_positions[0] - 5,
                        y = (that.height - that.margin_bottom - that.margin_top - that.legendsGroup_height - that.highlight_y_positions[y_len - 1] - 5),
                        height = (that.highlight_y_positions[y_len - 1] + 10),
                        height;
                    if(PykCharts.boolean(that.highlight_y_positions[0])){
                        width = (that.highlight_x_positions[x_len - 1] - that.highlight_x_positions[0] + 10 + that.xScale.rangeBand());
                    } else {
                        width = (that.highlight_x_positions[x_len - 1] - that.highlight_x_positions[0] + 10);
                    }
                    that.group.append("rect")
                        .attr("class","highlight-rect")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("width", width)
                        .attr("height", height)
                        .attr("fill","none")
                        .attr("stroke", that.highlight_color)
                        .attr("stroke-width", "1.5")
                        .attr("stroke-dasharray", "5,5")
                        .attr("stroke-opacity",1);
                }
                return this;
            },
            legends: function () {
                if(PykCharts.boolean(that.legends_enable)) {
                    var params = that.getParameters(),color;
                    // console.log(params);
                    color = params.map(function (d) {
                        return d.color;
                    });
                    params = params.map(function (d) {
                        return d.name;
                    });

                    params = _.uniq(params);
                    // color = _.uniq(color);
                    var j = 0,k = 0;
                    j = params.length;
                    k = params.length;

                    if(that.legends_display === "vertical" ) {
                        that.legendsGroup.attr("height", (params.length * 30)+20);
                        that.legendsGroup_height = (params.length * 30)+20;

                        text_parameter1 = "x";
                        text_parameter2 = "y";
                        rect_parameter1 = "width";
                        rect_parameter2 = "height";
                        rect_parameter3 = "x";
                        rect_parameter4 = "y";
                        rect_parameter1value = 13;
                        rect_parameter2value = 13;
                        text_parameter1value = function (d,i) { return that.width - that.width/4 + 16; };
                        rect_parameter3value = function (d,i) { return that.width - that.width/4; };
                        var rect_parameter4value = function (d,i) { return i * 24 + 12;};
                        var text_parameter2value = function (d,i) { return i * 24 + 23;};
                    }
                    else if(that.legends_display === "horizontal") {
                        that.legendsGroup_height = 50;
                        text_parameter1 = "x";
                        text_parameter2 = "y";
                        rect_parameter1 = "width";
                        rect_parameter2 = "height";
                        rect_parameter3 = "x";
                        rect_parameter4 = "y";
                        var text_parameter1value = function (d,i) { j--;return that.width - (j*100 + 75); };
                        text_parameter2value = 30;
                        rect_parameter1value = 13;
                        rect_parameter2value = 13;
                        var rect_parameter3value = function (d,i) { k--;return that.width - (k*100 + 100); };
                        rect_parameter4value = 18;
                    }

                    var legend = that.legendsGroup.selectAll("rect")
                                    .data(params);

                    legend.enter()
                            .append("rect");

                    legend.attr(rect_parameter1, rect_parameter1value)
                        .attr(rect_parameter2, rect_parameter2value)
                        .attr(rect_parameter3, rect_parameter3value)
                        .attr(rect_parameter4, rect_parameter4value)
                        .attr("fill", function (d,i) {
                            if(that.color_mode === "color")
                                return color[i];
                            else return color[0];
                        })
                        .attr("fill-opacity", function (d,i) {
                            if (that.color_mode === "saturation") {
                            // if(PykCharts.boolean(that.saturationEnable)){
                                return (that.no_of_groups-i)/that.no_of_groups;
                            }
                        });

                    legend.exit().remove();

                    that.legends_text = that.legendsGroup.selectAll(".legends_text")
                        .data(params);

                    that.legends_text
                        .enter()
                        .append('text')
                        .attr("class","legends_text")
                        .attr("fill","#1D1D1D")
                        .attr("pointer-events","none")
                        .style("font-family", "'Helvetica Neue',Helvetica,Arial,sans-serif")
                        .attr("font-size",12);

                    that.legends_text.attr("class","legends_text")
                    .attr("fill","black")
                    .attr(text_parameter1, text_parameter1value)
                    .attr(text_parameter2, text_parameter2value)
                    .text(function (d) { return d; });

                    that.legends_text.exit()
                                    .remove();
                }
                return this;
            }
        }
        return optional;
    };

    //----------------------------------------------------------------------------------------
    // 6. Rendering groups:
    //----------------------------------------------------------------------------------------

    this.getGroups = function(){
        var groups = {};
        for(var i in that.the_bars){
            var bar = that.the_bars[i];
            if(!bar.id) continue;
            if(groups[bar.group]){
                groups[bar.group].push(bar.id);
            }else{
                groups[bar.group] = [bar.id];
            }
        }
        return groups;
    };

    //----------------------------------------------------------------------------------------
    // 10.Data Manuplation:
    //----------------------------------------------------------------------------------------

    // Data Helpers
    // Takes the flattened data and returns layers
    // Each layer is a separate category
    // The structure of the layer is made so that is plays well with d3.stack.layout()
    // Docs - https://github.com/mbostock/d3/wiki/Stack-Layout#wiki-values

    this.buildLayers = function(the_bars){
        var layers = [];

        function findLayer(l){
            for(var i in layers){
                // console.log(layers[i])
                var layer = layers[i];
                if (layer.name == l) return layer;
            }
            return addLayer(l);
        }

        function addLayer(l){
            var new_layer = {
                "name": l,
                "values": []
            };
            layers.push(new_layer);
            return new_layer;
        }

        for(var i in the_bars){
            // console.log(the_bars[i])
            var bar = the_bars[i];
            if(!bar.id) continue;
            var id = bar.id;
            for(var k in bar){
                if(k === "id") continue;
                var icings = bar[k];
                for(var j in icings){
                    var icing = icings[j];
                    if(!icing.name) continue;
                    var layer = findLayer(icing.name);
                    var index_group = that.unique_group.indexOf(that.keys[id])
                    layer.values.push({
                        "x": id,
                        "y": icing.val,
                        "group": that.keys[id],
                        "color": icing.color,
                        "tooltip": icing.tooltip,
                        "name": bar.group
                        // "highlight": icing.highlight
                    });
                }
            }
        }
        return layers;
    };

    // Traverses the JSON and returns an array of the 'bars' that are to be rendered
    this.flattenData = function(){
        var the_bars = [-1];
        that.keys = {};
        for(var i in that.data){
            var d = that.data[i];
            for(var cat_name in d){
                for(var j in d[cat_name]){
                    var id = "i" + i + "j" + j;
                    if(typeof d[cat_name][j] !== "object"){
                        continue;
                    }
                    var key = Object.keys(d[cat_name][j])[0];
                    that.keys[id] = key;
                    d[cat_name][j].id = id;
                    d[cat_name][j].group = cat_name;

                    the_bars.push(d[cat_name][j]);
                }
                the_bars.push(i); // Extra seperator element for gaps in segments
            }
        }
        return [the_bars, that.keys];
    };

    this.getParameters = function () {
        var p = [];
        for(var i in  that.the_layers){
            // console.log(that.the_layers[i]);
            if(!that.the_layers[i].name) continue;
            for(var j in that.the_layers[i].values) {
                if(!PykCharts.boolean(that.the_layers[i].values[j].y)) continue;
                var name = that.the_layers[i].values[j].group, color;
                if(that.color_mode === "saturation") {
                    color = that.saturation_color;
                } else if(that.color_mode === "color" && that.the_layers[0].values[j].color){
                    color = that.the_layers[0].values[j].color;
                }
                p.push({
                    "name": name,
                    "color": color
                });
            }
        }
        return p;
    }
    this.emptygroups = function (data) {
        that.no_of_groups = d3.max(data,function (d){
            var value = _.values(d);
            return value[0].length;
        });

        var new_data = _.map(data,function (d,i){
            var value = _.values(d);
            while(value[0].length < that.no_of_groups) {
                var key = _.keys(d);
                var stack = { "name": "stack", "tooltip": "null", "color": "white", "val": 0/*, highlight: false*/ };
                var group = {"group3":[stack]};
                data[i][key[0]].push(group);
                value = _.values(d);
            }
        });
        // console.log(data,"new_data");
        return data;
    };

    this.dataTransformation = function () {

        var data_tranform = [];
        that.barName = [];
        var data_length = that.data.length;
        that.unique_group = that.data.map(function (d) {
            return d.group;
        });
        that.unique_group = _.uniq(that.unique_group);
        
        for(var i=0; i < data_length; i++) {
            var group = {},
                bar = {},
                stack;

            if(!that.data[i].group) {
                that.data[i].group = "group" + i;
            }

            if(!that.data[i].stack) {
                that.data[i].stack = "stack";
            }

            that.barName[i] = that.data[i].group;
            group[that.data[i].x] = [];
            bar[that.data[i].group] = [];
            stack = { "name": that.data[i].stack, "tooltip": that.data[i].tooltip, "color": that.data[i].color, "val": that.data[i].y/*, highlight: that.data[i].highlight */};

            if(i === 0) {
                data_tranform.push(group);
                data_tranform[i][that.data[i].x].push(bar);
                data_tranform[i][that.data[i].x][i][that.data[i].group].push(stack);
            } else {
                var data_tranform_lenght = data_tranform.length;
                var j=0;
                for(j=0;j < data_tranform_lenght; j++) {
                    if ((_.has(data_tranform[j], that.data[i].x))) {
                        var barr = data_tranform[j][that.data[i].x],
                            barLength = barr.length,
                            k = 0;

                        for(k =0; k<barLength;k++) {
                            if(_.has(data_tranform[j][that.data[i].x][k],that.data[i].group)) {
                                break;
                            }
                        }
                        if(k < barLength) {
                            data_tranform[j][that.data[i].x][k][that.data[i].group].push(stack);
                        } else {
                            data_tranform[j][that.data[i].x].push(bar);
                            data_tranform[j][that.data[i].x][k][that.data[i].group].push(stack);
                        }
                        break;
                    }
                }
                if(j === data_tranform_lenght) {
                    data_tranform.push(group);
                    data_tranform[j][that.data[i].x].push(bar);
                    data_tranform[j][that.data[i].x][0][that.data[i].group].push(stack);
                }
            }
        }
        that.barName = _.unique(that.barName);
        return data_tranform;
    };
    return this;
};
