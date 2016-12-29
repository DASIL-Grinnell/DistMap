var width = 1200;
var height = 600;

var colorScale = d3.scale.linear().domain([0,1]).range(["blue", "red"]);
	
var projection = d3.geo.albersUsa()
					.translate([width/2, height/2]);
					
var path = d3.geo.path().projection(projection);

var file = "VotingDataforD3AllYears.json";
var minYear = -1;
var maxYear = -1;

var data;

var svgNaming = ["gradient", "party"];

var slider;

function preProcess(){
	d3.json(file, function(error, json){	
		data = json;
		
		var size = data.features.length;
		for(var i = 0; i < size; ++i){
			var year = data.features[i].properties["RACEYEAR"];
			if(minYear < 0 || minYear > year){
				minYear = year;
			}
			if(maxYear < year){
				maxYear = year;
			}
		}
		
		load();
		dispYear(minYear);
		show(minYear);
	});
}

function show(year){
	var maps = document.getElementsByClassName("map");
	for(var i = 0; i < maps.length; ++i){
		maps[i].style.display = "none";
	}
	
	var drop = document.getElementById("dispType").value;
	
	var mySvg = document.getElementById(drop + year).style.display = "block";
}

function dropShow(){
	var maps = document.getElementsByClassName("map");
	for(var i = 0; i < maps.length; ++i){
		maps[i].style.display = "none";
	}
	
	var drop = document.getElementById("dispType").value;
	
	var mySvg = document.getElementById(drop + slider.value()).style.display = "block";
}

function dispYear(year){
	document.getElementById("year").innerHTML = year;
}

function load(){
	for(var type = 0; type < 2; ++type){
		for(var curYear = minYear; curYear <= maxYear; curYear += 2){
			var svg = d3.select("body").append("svg")
				.style("display", "none")
				.attr("id", svgNaming[type] + curYear)
				.attr("class", "map")
				.attr("width", width)
				.attr("height", height);
				
			var defs = svg.append("defs");
			
			var jsonFilt = svg.selectAll("path")
					.data(data.features.filter(function(d){return d.properties["RACEYEAR"] == curYear;}))
					.enter()
					.append("path")
					.attr("d", path)
					.attr("class", "shape")
					.style("fill", function(d){
						if(d.properties["PLURALITYP"] == "I"){
							return "yellow";
						}
						else{
							
							if(svgNaming[type] == "gradient"){
								var dem = parseInt(d.properties["VOTEDEM"]) || 0;
								var rep = parseInt(d.properties["VOTEREP"]) || 0;
								
								return colorScale(rep / (dem + rep));
							}
							else{
								if(d.properties["PLURALITYP"] == "D"){
									return colorScale(0);
								}
								else if(d.properties["PLURALITYP"] == "R"){
									return colorScale(1);
								}
							}
						}
					});
		}
	}

	//Setup slider
	var scale = d3.scale.linear()
					.domain([minYear, maxYear]);
					
	var myAxis = d3.svg.axis()
						.scale(scale)
						.tickFormat(d3.format("d"))
						.ticks((maxYear - minYear) / 2, "d");
					
	slider = d3.slider().scale(scale).axis(myAxis)
					.on("slide", function(evt, value, i){
						value = 2 * Math.round(value / 2); //Round to nearest even number
						slider.value(value);
						dispYear(value);
						show(value);
					})
					.on("slideend", function(evt, value, i){
						value = 2 * Math.round(value / 2); //Round to nearest even number
						slider.value(value);
						dispYear(value);
						show(value);
					});
	
	//Add slider to DOM
	d3.select("body")
		.append("div")
		.attr("id", "slider")
		.style("margin-top","5px")
		.style("margin-left","30px")
		.style("width", width-60 + "px")
		.call(slider);
	
}