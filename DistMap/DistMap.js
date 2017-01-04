var width = 1200;
var height = 600;

var colorScale = d3.scale.linear().domain([0,1]).range(["blue", "red"]);
	
var projection = d3.geo.albersUsa()
					.translate([width/2, height/2]);
					
var path = d3.geo.path().projection(projection);

var file = "VotingDataforD3AllYears.json";
var minYear = -1;
var maxYear = -1;
var myYear;

var data;

var svgNaming = ["gradient", "party"];

var slider;
var interval;

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
		setYear(minYear);
		document.getElementById("load").style.display = "none";
	});
}

function setYear(year){
	myYear = year;
	dispYear(year);
	show(year);
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
			//document.getElementById("loadText").innerHTML = "Loading... (" + curYear*(type+1) + "/" + (maxYear * 2) + ")";
		}
	}
	
	//Add legend
	drawLegend();
	
	//Setup play button
	d3.select("body") //Sets up and initializes the play button
	.append("div")
	.attr("id", "playContent")
	.style("width", width+"px")
	.style("margin-left", "15px")
		.append("div")
		.attr("id", "play")
		.attr("onclick", "togglePlay();")
			.append("img")
			.attr("id", "playImg")
			.attr("src", "img/play.png")
			.attr("data-status", "paused");

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
						//slider.value(value);
						setYear(value);
					})
					.on("slideend", function(evt, value, i){
						value = 2 * Math.round(value / 2); //Round to nearest even number
						slider.value(value);
						setYear(value);
					});
	
	//Add slider to DOM
	d3.select("body")
		.append("div")
		.attr("id", "slider")
		.style("margin-top","5px")
		.style("margin-left","80px")
		.style("width", width-120 + "px")
		.call(slider);
}

function togglePlay(){
	var btn = document.getElementById("play");
	var img = play.getElementsByTagName("img")[0];
	var playStatus = img.getAttribute("data-status");
	
	if(playStatus == "paused"){
		img.setAttribute("data-status", "playing");
		img.src = "img/pause.png";
		playAnimation();
	}
	else{
		img.setAttribute("data-status", "paused");
		img.src = "img/play.png";
		pauseAnimation();
	}
}

function playAnimation(){
	animate();
	interval = setInterval(animate,1000);
}

function pauseAnimation(){
	clearInterval(interval);
}

function animate(){
	myYear += 2;
	if(myYear > maxYear){
		myYear -= 2;
	}
	else{
		setYear(myYear);
		slider.value(myYear);
	}
	
	if(myYear == maxYear){
		togglePlay();
	}
}

function drawLegend(){
	var ySpacing = 30;
	var boxSize = 22;
	
	var colors = ["blue", "red", "yellow", "black"];
	var categories = ["Democrat", "Republican", "Independant", "No Data"];
	
	var svg = d3.select("body").append("svg")
				.style("position", "absolute")
				.style("top", "15%")
				.style("left", width - 20);
	
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", categories.length * ySpacing)
		.attr("width", 125)
		.attr('transform', "translate("+(0)+",30)");
		
	for(var i = 0; i < categories.length; ++i){
		legend.append("rect")
			.attr("x", 0)
			.attr("y", function(){
				return ySpacing * i;
			},i)
			.attr("width", boxSize)
			.attr("height", boxSize)
			.style("fill", colors[i]);
			
		legend.append("text")
			.attr("x", boxSize+8)
			.attr("y", function(){
				return ySpacing * i + 16;
			},i)
			.text(function(){return categories[i]});
	}
}