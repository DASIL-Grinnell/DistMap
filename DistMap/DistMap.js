var width = window.innerWidth < 1200 ? window.innerWidth : 1200;
var height = width / 2;

var colorScale = d3.scale.linear().domain([0,1]).range(["blue", "red"]);
	
var projection = d3.geo.albersUsa()
					.scale(width-175)
					.translate([width/2, height/2]);
					
var path = d3.geo.path().projection(projection);

var file = "new1968_2014.json";
var minYear = -1;
var maxYear = -1;
var myYear;

var data;

var svgNaming = ["gradient", "party"];

var slider;
var interval;

function preProcess(){
	var size = Math.floor(window.innerWidth / 50);
	if(size < 28){ //If the screen width less than 1400
		d3.select("#tooltip").style("width", 450 - (50 * (28 - size)));
		d3.select(".text3").style("font-size", 16 - (1 * (28 - size)/2));
	}
	
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
	
	document.onkeypress = function (e){
		e = e || window.event;
		keyPress(e.keyCode);
	}
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
				.attr("height", height)
				.attr("transform", "translate(175,0)");
				
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
							var result;
							if(d.properties["PLURALITYP"] == "D"){
								result = colorScale(0);
							}
							else if(d.properties["PLURALITYP"] == "R"){
								result = colorScale(1);
							}
							
							if(svgNaming[type] == "gradient"){
								var dem = parseInt(d.properties["VOTEDEM"]) || 0;
								var rep = parseInt(d.properties["VOTEREP"]) || 0;
								
								if(dem + rep > 0){
									result = colorScale(rep / (dem + rep));
								}
							}
							return result;
						}
					})
					.on("mouseover", function(d){fillInfo(d.properties)});
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
	interval = setInterval(animate,1500);
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
	
	var i = 0;
	var offset = 0;
	var colors = ["blue", "red", "yellow", "black"];
	var categories = ["Democrat", "Republican", "Independant", "No Data"];
	
	var numCats = 4;
	
	var drop = document.getElementById("dispType").value;

	if(drop == "gradient"){
		numCats = 6;
	}
	
	var svg = d3.select("body").append("svg")
			.attr("id", "legend")
			.style("position", "absolute")
			.style("top", "15%")
			.style("left", 20)
			.style("height", numCats * ySpacing)
			.style("width", 175);
			
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", numCats * ySpacing)
		.attr("width", 125);
	
	if(drop == "gradient"){
		i = 2;
		offset = 2;
		
		var grad = legend.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");
		grad.append("stop").attr("offset", "0%").attr("stop-color", "#0000FF").attr("stop-opacity", 1);
		grad.append("stop").attr("offset", "100%").attr("stop-color", "#FF0000").attr("stop-opacity", 1);
		
		legend.append("text").attr("x", boxSize + 8).attr("y", 16).text("Democrat");
		legend.append("text").attr("x", boxSize + 8).attr("y", (numCats - 3) * ySpacing + 16).text("Republican");
		
		legend.append("rect").attr("width", boxSize).attr("height", ((numCats - 2) * ySpacing - (ySpacing - boxSize))).style("fill", "url(#gradient)");//.attr("transform", "translate(0,10)");
		
	}
	console.log(categories.length);
	for(i; i < categories.length; ++i){
		console.log(i);
		legend.append("rect")
			.attr("x", 0)
			.attr("y", function(){
				return ySpacing * (i + offset);
			},i)
			.attr("width", boxSize)
			.attr("height", boxSize)
			.style("fill", colors[i]);
			
		legend.append("text")
			.attr("x", boxSize+8)
			.attr("y", function(){
				return ySpacing * (i + offset) + 16;
			},i)
			.text(function(){return categories[i]});
	}
}

function redrawLegend(){
	d3.select("#legend").remove();
	drawLegend();
}

function fillInfo(prop){
	document.getElementById("tooltip").style.display = "block";
	document.getElementById("distName").innerHTML = prop["STATE"] + " District "/* + prop["DISTRICT1"]*/;
	var winner = prop["PLURALITYP"];
	var demPer = prop["DEMVOTEPRO"];
	var repPer = prop["REPVOTEPRO"];
	var demCan = prop["DEMCANDIDA"];
	var repCan = prop["REPCANDIDA"];
	var demStat = prop["DEMSTATUS"];
	var repStat = prop["REPSTATUS"];
	
	document.getElementById("demWin").innerHTML = "Lost";
	document.getElementById("repWin").innerHTML = "Lost";
	document.querySelector(".rep").style.backgroundColor = "#ffffff";
	document.querySelector(".dem").style.backgroundColor = "#ffffff";
	
	if(winner == "R"){
		document.getElementById("repWin").innerHTML = "Won";
		document.querySelector(".rep").style.backgroundColor = "#ffb3b3";
	}
	if(winner == "D"){
		document.getElementById("demWin").innerHTML = "Won";
		document.querySelector(".dem").style.backgroundColor = "#b3b3ff";
	}
	
	document.getElementById("demPer").innerHTML = demPer;
	document.getElementById("repPer").innerHTML = repPer;
	
	document.getElementById("demCan").innerHTML = demCan;
	document.getElementById("repCan").innerHTML = repCan;
	
	document.getElementById("demStat").innerHTML = demStat;
	document.getElementById("repStat").innerHTML = repStat;
	
}

function keyPress(key){
	if(key == 0){
		togglePlay();
	}
}