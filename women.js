var margin = {top: 50, right: 140, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%dT00:00:00").parse
var formatTime = d3.time.format("%e %B, %Y");
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.idx); });

var line2 = d3.svg.line();

// Define the div for the tooltip
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var draw_viz = function(title, json) {
    svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .attr("y", -15)
        .text(title)


    d3.json(json, function(error, data) {
        if (error) throw error;
        data.forEach(function(doctor) {
            doctor.degrees.forEach(function(degree) {
                degree.date = parseDate(degree.date);
            })
        });
        var dates = data.map(function(d) {
            return d.degrees.map(function(d2) {
                return d2.date;
            })
        })
        dates = _.flatten(dates)
        x.domain(d3.extent(dates));
        y.domain([0, data.length])

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        var doctors = data.map(function(degrees, idx) {
            return {
                name: degrees.name,
                gender: degrees.gender,
                values: degrees.degrees.map(function(d) {
                return {
                    date: d.date,
                    idx: idx + 1,
                    degree: d.degree
                };
              })
            };
        });

        var doctor = svg.selectAll(".doctor")
            .data(doctors)
            .enter().append("g")
              .attr("class", "doctor")
              .attr("id", function(el, idx) {
                return "doctor-" + idx;
              });

        doctor.append("path")
            .attr("class", function(d) {
                console.log(d);
                if (d["gender"] == "male")
                    return "line male";
                else
                    return "line female";
            })
            .attr("d", function(d) {
                return line(d.values);
            })

        doctor.append("g")
            .attr("class", "dot")
            .each(function(d) {
                d3.select(this).selectAll("circle")
                    .data(d.values)
                    .enter()
                    .append("circle")
                        .attr("cx", function(d2) { return x(d2.date); })
                        .attr("cy", function(d2) { return y(d2.idx); })
                        .attr("r", 3)
                        .on("mouseover", function(d2) {      
                            div.transition()        
                                .duration(200)      
                                .style("opacity", .9);      
                            div.html("<strong>Name:</strong> " + d.name + "<br/><strong>Date:</strong> " + formatTime(d2.date) + "<br/><strong>Degree:</strong> "  + d2.degree)  
                                .style("left", (d3.event.pageX) + "px")     
                                .style("top", (d3.event.pageY - 28) + "px");    
                        })                  
                        .on("mouseout", function(d) {       
                            div.transition()        
                                .duration(500)      
                                .style("opacity", 0);   
                        })
                        .attr("class", function(d2) {
                            return "degree_other"
                        })
            })

        doctor.append("text")
            .attr("class", "name")
            .attr("x", function(d) { var arr = d.values; return x(arr[arr.length - 1].date); })
            .attr("y", function(d) { var arr = d.values; return y(arr[0].idx); })
            .attr("dx", "1.2em")
            .attr("dy", "0.3em")
            .style("text-anchor", "start")
            .text(function(d) {
                if (d.gender == "female")
                    return d.name;
            });

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (650) + ", " + (520) + ")")

        legend
            .append("path")
            .attr("class", "line male")
            .attr("d", function(d) {
                return line2([[0, 30], [50, 30]]);
            })

        legend
            .append("text")
            .style("text-anchor", "start")
            .attr("transform", "translate(50, 30)")
            .attr("dx", "0.8em")
            .attr("dy", "0.4em")
            .text("Male doctor")

        legend
            .append("path")
            .attr("class", "line female")
            .attr("d", function(d) {
                return line2([[0, 45], [50, 45]]);
            })

        legend
            .append("text")
            .style("text-anchor", "start")
            .attr("transform", "translate(50, 45)")
            .attr("dx", "0.8em")
            .attr("dy", "0.4em")
            .text("Female doctor")

        legend
            .append("circle")
            .attr("class", "degree_other")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 5)
            .attr("transform", "translate(46, 65)")

        legend
            .append("text")
            .style("text-anchor", "start")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("dx", "0.8em")
            .attr("dy", "0.4em")
            .text("Qualification")
            .attr("transform", "translate(50, 65)")
    })
}
