var filterByNumPapers = true;
var sliderInitialized = false;
var defaultMin = 5;
var citations;

var fields = ['art', 'biology', 'business', 'chemistry', 'computer science', 'economics', 'engineering', 'environmental science', 'geography', 'geology', 'history', 'materials science', 'mathematics', 'medicine', 'philosophy', 'physics', 'political science', 'psychology', 'sociology'];
//var fields = ['art', 'biology', 'business', 'chemistry', 'computer science', 'economics', 'engineering', 'environmental science', 'geography', 'geology', 'history', 'materials science', 'mathematics', 'medicine', 'philosophy'];
var fieldHistograms = [];
var maxNumPapersArr = [];
var maxCareerLengthArr = [];
var selectedFields = ['physics']	

var sliderMaxValue;
var sliderMaxPosition;
var sliderLowerValue;
var sliderUpperValue;

var sliderIncrements = [ 1, 5, 10, 100, 500];
var numIncrements =    [20, 6,  5,   4,   3];

window.onload = function() {
	var fieldSelectorContainer = document.getElementById("fieldSelectorContainer");
	for (var index in fields) {
		var field = fields[index];
		fieldHistograms.push(getHistogramVarFromString(field));
		
		var checkboxContainer = document.createElement("div");
		checkboxContainer.id = field + "Container";
		
		var input = document.createElement("input");
		var inputId = field + "Checkbox";
		input.id = inputId;
		input.type = "checkbox";
		input.name = field;
		input.innerHTML = field;
		input.onchange = checkboxChange;
		if (selectedFields.indexOf(field) > -1) {
			input.checked = true;
		}
		
		var label = document.createElement("label");
		label.for = inputId;
		label.innerHTML = getFieldTitle(index);
		
		fieldSelectorContainer.appendChild(checkboxContainer);
		checkboxContainer.appendChild(input);
		checkboxContainer.appendChild(label);
	}
	
	for (var index in fieldHistograms) {
		fieldHistogram = fieldHistograms[index];
		
		var maxNumPapers = -1;
		var maxCareerLength = -1;
		
		citationsByNumPapers = fieldHistogram.citationsByNumPapers;
		for (var numPapers in citationsByNumPapers) {
			if (parseInt(numPapers) > maxNumPapers) {
				maxNumPapers = parseInt(numPapers);
			}
		}
		
		citationsByCareerLength = fieldHistogram.citationsByCareerLength;
		for (var careerLength in citationsByCareerLength) {
			if (parseInt(careerLength) > maxCareerLength) {
				maxCareerLength = parseInt(careerLength);
			}
		}
		
		maxNumPapersArr[index] = maxNumPapers;
		maxCareerLengthArr[index] = maxCareerLength;
	}
	
	sliderLowerValue = defaultMin;
	sliderUpperValue = getMaxNumPapers();
	if (!filterByNumPapers) {
		sliderUpperValue = getMaxCareerLength();
	}	
	updateSlider();
	updateHistogram();
};

function getFieldTitle(index, lineBreaks) {
	lineBreaks = lineBreaks || false;
	var histogramVar = fieldHistograms[index];
	var fieldName = fields[index];
	var authors = histogramVar['totalAuthors'];
	var papers = histogramVar['totalPapers'];
	if (lineBreaks) {
		return "<b>" + fieldName + ":</b>" + "<br>authors: " + authors + "<br>papers: " + papers;
	} else {
		return "<b>" + fieldName + " - </b>authors: " + authors + ", papers: " + papers;
	}
}

function getMaxNumPapers() {
	var maxNumPapers = -1;
	for (var index in selectedFields) {
		maxNumPapersField = maxNumPapersArr[fields.indexOf(selectedFields[index])];		
		if (maxNumPapersField > maxNumPapers) {
			maxNumPapers = maxNumPapersField;
		}
	}
	return maxNumPapers;
}

function getMaxCareerLength() {
	var maxCareerLength = -1;
	for (var index in selectedFields) {
		maxCareerLengthField = maxCareerLengthArr[fields.indexOf(selectedFields[index])];		
		if (maxCareerLengthField > maxCareerLength) {
			maxCareerLength = maxCareerLengthField;
		}
	}
	return maxCareerLength;
}

function checkboxChange(checkboxChangeEvent) {
	var field = checkboxChangeEvent.target.name;
	var index = selectedFields.indexOf(field);
	if (index > -1) {
		selectedFields.splice(index, 1);
	} else {
		selectedFields.push(field);
	}
	if (selectedFields.length > 0) {
		updateSlider();
		updateHistogram();
	}
}

function getHistogramVarFromString(fieldName) {
	var fieldNameArr = fieldName.split(" ");
	for (var i = 0; i < fieldNameArr.length; i++) {
		if (i > 0) {
			fieldNameArr[i] = fieldNameArr[i].charAt(0).toUpperCase() + fieldNameArr[i].slice(1);
		}
	}
	return window[fieldNameArr.join("") + 'Histogram']
}

function updateHistogram() {
	var maxCareerLength = getMaxCareerLength();	
	var numFields = selectedFields.length;	
	
	var scale = (Math.log(20 / 1)) / (50 - 100);
	
	var opacity = (100 + Math.log(numFields / 1) / scale) / 100;
	
	var x = [];
	for (var i = 0; i < maxCareerLength; i++) {
		x[i] = i+1;
	}
	
	y1 = [];
	y2 = [];
	textArr = [];
	count = [];
	data1 = [];
	data2 = [];
	data3 = [];
	for (var i = 0; i < numFields; i++) {
		y1[i] = [];
		y2[i] = [];
		textArr[i] = [];
		count[i] = [];
	
		field = selectedFields[i];
		fieldIndex = fields.indexOf(field);
		citations = fieldHistograms[fieldIndex]['citationsByNumPapers'];
		if (!filterByNumPapers) {
			citations = fieldHistograms[fieldIndex]['citationsByCareerLength'];
		}
	
		for (var numPapers in citations) {
			if (parseInt(numPapers) >= sliderLowerValue && parseInt(numPapers) <= sliderUpperValue) {
				for (var yearIntoCareer in citations[numPapers]['data']) {
					if (!y1[i][parseInt(yearIntoCareer) - 1]) {
						y1[i][parseInt(yearIntoCareer) - 1] = 0;
						y2[i][parseInt(yearIntoCareer) - 1] = 0;
						count[i][parseInt(yearIntoCareer) - 1] = 0;
					}
					
					y1[i][parseInt(yearIntoCareer) - 1] += citations[numPapers]['data'][yearIntoCareer]['citations'];
					y2[i][parseInt(yearIntoCareer) - 1] += citations[numPapers]['data'][yearIntoCareer]['citationsPercentRaw'];
					count[i][parseInt(yearIntoCareer) - 1] += citations[numPapers]['data'][yearIntoCareer]['papersCount'];
				}	
			}		
		}	
		
		for (var j = 0; j < y1[i].length; j++) {
			curCount = count[i][j];
			y1[i][j] = y1[i][j] / curCount
			y2[i][j] = y2[i][j] / curCount
			textArr[i][j] = curCount + " paper";
			if (curCount !== 1) {
				textArr[i][j] += "s";
			}
		}
		
		name = getFieldTitle(fieldIndex, true);
		
		data1.push({
			x: x,
			y: y1[i],
			text: textArr[i],
			type: 'bar',
			name: name
		});
		
		data2.push({
			x: x,
			y: y2[i],
			text: textArr[i],
			type: 'bar',
			histnorm: 'probability',
			name: name
		});
		
		data3.push({
			x: x,
			y: count[i],
			type: 'bar',
			name: name			
		})		
	}
	
	var layout1 = {
		title: 'Total citations for all authors by year',
		xaxis: {
			title: 'Year into career',
		},
		yaxis: {
			title: 'Average Citations'
		},
		showlegend: true
	}
	
	Plotly.newPlot(document.getElementById('histogram1'), data1, layout1);

	var layout2 = {
		title: 'Normalized total percentage by year into career',
		xaxis: {
			title: 'Year into career',
		},
		yaxis: {
			title: 'Average percentage of authors\' papers'
		},
		showlegend: true
	}
	
	Plotly.newPlot(document.getElementById('histogram2'), data2, layout2);
	
	var layout3 = {
		title: 'Total number of papers by year into career',
		xaxis: {
			title: 'Year into career',
		},
		yaxis: {
			title: 'Number of papers'
		},
		showlegend: true
	}
	
	Plotly.newPlot(document.getElementById('histogram3'), data3, layout3);
}

function updateSlider() {
	var updateSliderUpperValue = false;
	if (sliderInitialized && sliderMaxValue === getRealValue($("#slider-range").slider("values", 1))) {
		updateSliderUpperValue = true;
	}
	
	sliderMaxValue = getMaxNumPapers();
	if (!filterByNumPapers) {
		sliderMaxValue = getMaxCareerLength();
	}
	if (updateSliderUpperValue) {
		sliderUpperValue = sliderMaxValue;
	}
	
	sliderMaxPosition = getSliderMaxPosition(sliderMaxValue);
	
	$("#slider-range").slider({
		range: true,
		min: 0,
		max: sliderMaxPosition,
		values: [getSliderPosition(sliderLowerValue), getSliderPosition(sliderUpperValue)],
		slide: function (event, ui) {
			newMin = getRealValue($("#slider-range").slider("values", 0));
			newMax = getRealValue($("#slider-range").slider("values", 1));
			
			sliderLowerValue = newMin;
			sliderUpperValue = newMax;
			updateSliderText();
			updateTextInputMin(newMin);
			updateTextInputMax(newMax);
			updateHistogram();
		}
	});
	
	updateSliderText();
	updateTextInputMin(sliderLowerValue);
	updateTextInputMax(sliderUpperValue);
	sliderInitialized = true;
}

function updateSliderText() {
	var sliderText = "Number of papers per author: ";
	if (!filterByNumPapers) {
		sliderText = "Length of authors' careers: ";
	}
	
	document.getElementById("numPapersInput").innerHTML = sliderText + sliderLowerValue + " - " + sliderUpperValue;
}

function getSliderMaxPosition(maxValue) {
	var sliderMaxPosition = 0;
	var incrementCount = 0;
	while (maxValue > sliderIncrements[incrementCount] * numIncrements[incrementCount]) {
		maxValue -= sliderIncrements[incrementCount] * numIncrements[incrementCount];
		sliderMaxPosition += numIncrements[incrementCount];
		incrementCount++;
	}
	sliderMaxPosition += Math.floor(maxValue / sliderIncrements[incrementCount]);
	if (maxValue % sliderIncrements[incrementCount] !== 0) {
		sliderMaxPosition++;
	}	
	return sliderMaxPosition + 1;
}

function getRealValue(position) {
	if (position === sliderMaxPosition) {
		return sliderMaxValue;
	} else {
		var realValue = 0;	
		var incrementCount = 0;
		while (position > numIncrements[incrementCount]) {
			realValue += sliderIncrements[incrementCount] * numIncrements[incrementCount];
			position -= numIncrements[incrementCount];
			incrementCount++;
		}
		realValue += position * sliderIncrements[incrementCount];		
		return realValue;
	}
}

function getSliderPosition(value) {
	if (value === sliderMaxValue) {
		return sliderMaxPosition;
	} else {
		var sliderPosition = 0;
		var incrementCount = 0;
		while (value > sliderIncrements[incrementCount] * numIncrements[incrementCount]) {
			value -= sliderIncrements[incrementCount] * numIncrements[incrementCount];
			sliderPosition += numIncrements[incrementCount];
			incrementCount++;
		}
		sliderPosition += Math.floor(value / sliderIncrements[incrementCount]);
		if (value % sliderIncrements[incrementCount] !== 0) {
			sliderPosition++;
		}	
		return sliderPosition;
	}
}

function papersRadioClick() {
	filterByNumPapers = true;
	radioClick();
}

function careerRadioClick() {
	filterByNumPapers = false;
	radioClick();
}

function radioClick() {
	sliderLowerValue = defaultMin;
	sliderUpperValue = getMaxNumPapers();
	if (!filterByNumPapers) {
		sliderUpperValue = getMaxCareerLength();
	}
	updateSlider();
	updateHistogram();
}

function minInput() {
	el = document.getElementById("textInputMin");
	var newMin = el.value;
	if (!newMin || isNaN(newMin)) {
		el.className += " invalid";
	} else {
		el.className = "textInput";
		
		if (newMin < 1) {
			newMin = 1;
		}
		if (newMin > parseInt(sliderUpperValue)) {
			el.className += " invalid";
			return;
		}		
		updateSliderMin(newMin);
		updateSliderText();
		updateHistogram();
	}
}

function maxInput() {
	el = document.getElementById("textInputMax");
	var newMax = el.value;
	if (!newMax || isNaN(newMax)) {
		el.className += " invalid";
	} else {
		el.className = "textInput";
		
		if (newMax > sliderMaxValue) {
			newMax = sliderMaxValue;
		}
		if (newMax < parseInt(sliderLowerValue)) {
			el.className += " invalid";
			return;
		}		
		updateSliderMax(newMax);		
		updateSliderText();
		updateHistogram();
	}
}

function updateSliderMin(newMin) {
	sliderLowerValue = newMin;
	$("#slider-range").slider('values', 0, newMin);
}

function updateSliderMax(newMax) {
	sliderUpperValue = newMax;
	$("#slider-range").slider('values', 1, newMax);
}

function updateTextInputMin(newMin) {
	if (!isNaN(newMin)) {
		document.getElementById("textInputMin").value = newMin;
	}
}

function updateTextInputMax(newMax) {
	if (!isNaN(newMax)) {
		document.getElementById("textInputMax").value = newMax;
	}
}