let model;

var width = 300;
var height = 300;
var Stroke = "white";
var LineJoin = "round";
var Linewidth = 10;
var canvasBackgroundColor = "black";
var canvasId = "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

document.getElementById('chart_box').innerHTML = "";
document.getElementById('chart_box').style.display = "none";

// Create canvas
var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");

$("#canvas").mousedown(function(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX- rect.left;;
	var mouseY = e.clientY- rect.top;
	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();
});

canvas.addEventListener("touchstart", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}

	var rect = canvas.getBoundingClientRect();
	var touch = e.touches[0];

	var mouseX = touch.clientX - rect.left;
	var mouseY = touch.clientY - rect.top;

	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();

}, false);

$("#canvas").mousemove(function(e) {
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var mouseX = e.clientX- rect.left;;
		var mouseY = e.clientY- rect.top;
		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
});

canvas.addEventListener("touchmove", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var touch = e.touches[0];

		var mouseX = touch.clientX - rect.left;
		var mouseY = touch.clientY - rect.top;

		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
}, false);

$("#canvas").mouseup(function(e) {
	drawing = false;
});

canvas.addEventListener("touchend", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);

$("#canvas").mouseleave(function(e) {
	drawing = false;
});

canvas.addEventListener("touchleave", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);

function addUserGesture(x, y, dragging) {
	clickX.push(x);
	clickY.push(y);
	clickD.push(dragging);
}

function drawOnCanvas() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = Stroke;
	ctx.lineJoin    = LineJoin;
	ctx.lineWidth   = Linewidth;

	for (var i = 0; i < clickX.length; i++) {
		ctx.beginPath();
		if(clickD[i] && i) {
			ctx.moveTo(clickX[i-1], clickY[i-1]);
		} else {
			ctx.moveTo(clickX[i]-1, clickY[i]);
		}
		ctx.lineTo(clickX[i], clickY[i]);
		ctx.closePath();
		ctx.stroke();
	}
}

$("#clear-button").click(async function () {
    ctx.clearRect(0, 0, width, height);
	clickX = new Array();
	clickY = new Array();
	clickD = new Array();
	$(".prediction-text").empty();
	$("#result_box").addClass('d-none');
});

// loader for cnn model
async function loadModel() {
  console.log("model loading..");
  model = undefined;
  model = await tf.loadLayersModel("./models/model.json");
  console.log("model loaded..");
}
loadModel();

function preprocessCanvas(image) {
	// resize the input image to (1, 28, 28)
	let tensor = tf.browser.fromPixels(image)
		.resizeNearestNeighbor([28, 28])
		.mean(2)
		.expandDims(2)
		.expandDims()
		.toFloat();
	console.log(tensor.shape);
	return tensor.div(255.0);
}

$("#predict-button").click(async function () {
	var imageData = canvas.toDataURL();
	let tensor = preprocessCanvas(canvas);
	let predictions = await model.predict(tensor).data();
	let results = Array.from(predictions);
	$("#result_box").removeClass('d-none');
	displayLabel(results);
	console.log(results);
});

function displayLabel(data) {
	var max = data[0];
    var maxIndex = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
	$(".prediction-text").html("<h2>Recognized digit: <b>"+maxIndex+"</b><br>Accuracy: <b>"+Math.trunc( max*100 )+"%</b></h2>")
}