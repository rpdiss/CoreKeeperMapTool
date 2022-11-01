const updatemap = () => { drawMap(tilelist) };

let tilelist = [];

document.addEventListener('alpine:init', function () {

	const canWatchFile = typeof window.showOpenFilePicker !== "undefined";

	Alpine.store('data', {
		mapLoaded: false,
		firstTimeLoaded: false,
		isExampleMap: false,
		canWatchFile,

		arcSlidersPrefilled: false,

		showArcs: false,
		showChunkGrid: false,
		showMobGrid: false,
		showCustomRing: false,
		showMazeHoles: false,
		manualArcRotation: false,
		cropRingsToBiome: false,

		innerSlider: 0,
		outerSlider: 0,
		ringTransparency: 50,
		biomeTransparency: 50,
		gridTransparency: 30,
		customRing: 25,
	});
});

window.addEventListener('DOMContentLoaded', () => {
	const fileupload = document.getElementById("mapupload");
	const mapCanvas = document.getElementById("mapcanvas");
	const uploadButton = document.getElementById("uploadbutton");
	fileupload?.addEventListener('change', function handleFile(event) {
		Alpine.store('data').isExampleMap = false;
		Alpine.store('data').mapLoaded = false;
		uploadButton.value = fileupload.files[0].name;
		resetMap();
		loadMapFile(fileupload, tilelist, updatemap);
	});
	panZoomElem = Panzoom(mapCanvas, {
		maxScale: MAX_ZOOM,
		canvas: true,
	});

	mapCanvas.parentElement.addEventListener('wheel', zoomWithMouseWheel);
	mapCanvas.addEventListener('mousemove', updateCoordinates);
	mapCanvas.addEventListener('panzoomend', storeCoreRelativeOffset);
	mapCanvas.addEventListener('panzoomend', () => { MapMonitor.isPanning = false; });
	mapCanvas.addEventListener('panzoomstart', () => { MapMonitor.isPanning = true; });

	const menuheaders = document.querySelectorAll(".collapsable-menu");
	const mnuclick = function (event) {
		let menu_ul = document.getElementById(this.getAttribute("label-for"));
		const cssObj = window.getComputedStyle(menu_ul, null);

		let menu_visible = cssObj.getPropertyValue("display");
		//let menu_visible = menu_ul.style.display;
		menu_ul.style.display = (menu_visible == "none") ? "block" : "none";
	};
	for (let mnu of menuheaders) {
		if (mnu.innerHTML.trim() == "Clear") continue;
		mnu.onclick = mnuclick;
	}

	setFilterTop();

}, false);

function loadExample() {
	Alpine.store('data').isExampleMap = true;
	Alpine.store('data').mapLoaded = false;
	resetMap();
	loadStandardFile(tilelist, updatemap);
}

function resetMap() {
	tilelist = [];
	HIGHEST_STONE = 0;
	HIGHEST_WILDERNESS = 0;
	document.getElementById('showArcs').checked = false;
}

function setFilterTop() {
	let filterdiv = document.getElementById("tilefilter");
	let navdiv = document.getElementById("navdiv").getBoundingClientRect();
	filterdiv.style.top = navdiv.bottom;
}

function redrawDebounce(event) {
	event.target.setAttribute("disabled", "true");

	redrawMap();

	setTimeout(() => {
		event.target.removeAttribute("disabled");
	}, 10);
}

// ON CHANGE EVENTS

function onChangeInnerArc(event) {
	redrawMap();
}

function onChangeOuterArc(event) {
	redrawMap();
}

function onChangeRingTransparency(event) {
	redrawMap();
}

function onChangeBiomeTransparency(event) {
	redrawMap();
}

function onChangeGridTransparency(event) {
	redrawMap();
}

function onChangeShowCustomRing(event) {
	redrawDebounce(event);
}

function onChangeCustomRing(event) {
	redrawMap();
}

function onChangeShowChunkGrid(event) {
	redrawDebounce(event);
}

function onChangeShowMobGrid(event) {
	redrawDebounce(event);
}

function onChangeShowMazeHoles(event) {
	redrawDebounce(event);
}

function onChangeShowArcs(event) {
	const checked = event.target.checked;
	event.target.setAttribute("disabled", "true");

	if (checked) {
		const canvas = document.getElementById("mapcanvas");
		const myImage = _global_ctx.getImageData(0, 0, canvas.width, canvas.height);
		findStone(myImage.data, canvas.width);
		findWilderness(myImage.data, canvas.width);
	}

	redrawMap();

	setTimeout(() => {
		event.target.removeAttribute("disabled");
	}, 10);
}

function onChangeManualArcRotation(event) {
	const checked = event.target.checked;
	event.target.setAttribute("disabled", "true");

	if (checked && Alpine.store('data').arcSlidersPrefilled === false) {
		Alpine.store('data').innerSlider = Math.round(stoneArc.start * 180 / Math.PI);
		Alpine.store('data').outerSlider = Math.round(wildernessArc.start * 180 / Math.PI);

		if (Alpine.store('data').innerSlider !== 0 && Alpine.store('data').outerSlider !== 0)
			Alpine.store('data').arcSlidersPrefilled = true;
	}

	setTimeout(() => {
		redrawMap();
	}, 10)

	setTimeout(() => {
		event.target.removeAttribute("disabled");
	}, 10);
}

function toggleDarkMode() {
	const offcanvas = document.getElementById("offcanvas");

	const legendAccordion = document.getElementById("legendAccordion");
	const legendItems = document.querySelector("#legendAccordion .accordion-item");
	const legendButton = document.querySelector("#legendAccordion button");

	if (offcanvas.classList.contains("text-bg-dark")) {
		// ele.style.backgroundColor = "white";
		offcanvas.classList.remove("text-bg-dark");
		// offcanvasRight.classList.remove("text-bg-dark");
		legendItems.classList.remove("text-bg-dark");
		legendButton.classList.remove("text-bg-dark");
	} else {
		// ele.style.backgroundColor = "black";
		offcanvas.classList.add("text-bg-dark");
		// offcanvasRight.classList.add("text-bg-dark");
		legendItems.classList.add("text-bg-dark");
		legendButton.classList.add("text-bg-dark");
	}
}