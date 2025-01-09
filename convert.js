let settings = null;
let output = new JSZip();
const PROJECT_FILES_NEEDED = 5;
const HTMLBase = `<!doctype html>
<html lang="en">
  <head>
    <!-- JQuery -->
    <script
      src="https://code.jquery.com/jquery-3.7.1.slim.min.js"
      integrity="sha256-kmHvs0B+OpCW5GVHUNjv9rOmY0IvSIRcf7zGUDTDQM8="
      crossorigin="anonymous"
    ></script>
	
    <!-- Slime -->
    <script
      type="module"
      crossorigin
      src="https://cdn.jsdelivr.net/gh/zaytri/slime2@latest/release/slime2.js"
    ></script>
	
    <!-- CSS -->
    <link href="streamelements.css" rel="stylesheet" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/zaytri/slime2@latest/release/slime2.css" />
  </head>
 
  <body>
    <main id="slime2-root"></main>
	{SEHTML}
	<!-- Bridge Code -->
	<script src="seconfig.js"></script>
	<script src="sebridge.js"></script>
	<!-- widget JS -->
	<script src="streamelements.js"></script>
  </body>
 
  <template id="message-template">
    <div class="message"></div>
  </template>
</html>
`;

function setButtonDisable(id, status) {
	document.getElementById(id).disabled = status;
}

function pushToLog(line) {
	const newLog = document.createElement("p");
	newLog.innerHTML = line;
	document.getElementById("log").appendChild(newLog);
}

function settingsLoad(filename, data) {
	let parsedData = null;
	try {
		parsedData = JSON.parse(data);
	} catch (ex) {
		console.error(ex);
	}
	if (parsedData != null) {
		settings = parsedData;
		// Take the configs passed in and recreate a file for them
		// so they can be used live instead.
		const configData = `const seJsonConfig = ${data};`;
		output.file("seconfig.js", configData);
		// Toggle button usage
		setButtonDisable("filesBtn", false);
		setButtonDisable("settingsBtn", true);
		
		pushToLog("Settings parsed and ready");
	} else {
		pushToLog("<b>ERROR</b>: Settings file is malformed, and cannot be used, please make sure you copy the DATA section from the StreamElements widget editor exactly!");
	}
}

function applySettings(data) {
	let curData = data;
	Object.entries(settings).forEach(([key, value]) => {
		const re = new RegExp(String.raw`(?<![\$]){${key}}`, "gm");
		curData = curData.replace(re, value);
	});
	return curData;
}

function readFileAndParse(element, callback) {
	const elementHandle = document.getElementById(element);
	elementHandle.addEventListener("change", (event) => {
		for (const curFile of elementHandle.files) {
			const reader = new FileReader();
			reader.onload = (e) => callback(curFile.name, e.target.result);
			reader.readAsText(curFile);
		}
	});
}

function handleTranslation(fileName, fileInternals) {
	const lowerFileName = fileName.toLowerCase();
	let fileData = fileInternals;
	// inject additional data to the html so that it handles everything correctly
	if (lowerFileName.includes(".htm")) {
		fileData = HTMLBase.replace("{SEHTML}", fileInternals);
		fileName = "widget.html";
		pushToLog("HTML Widget finished");
	} else {
		// remap paths
		if (lowerFileName.includes(".css"))
			fileName = "streamelements.css";
		else if (lowerFileName.includes(".js"))
			fileName = "streamelements.js";
		pushToLog(`prepared ${fileName}!`);
	}
	console.log(fileData);
	output.file(fileName, applySettings(fileData));
	
	if (Object.keys(output.files).length >= PROJECT_FILES_NEEDED) {
		setButtonDisable("blob", false);
		pushToLog("<b>Download ready!</b>");
	}
}

function hookUpDownload() {
	document.getElementById("blob").addEventListener("click", function () {
		output.generateAsync({type:"blob"}).then(function (blob) {
			saveAs(blob, "conversion.zip");
		}, function (err) {
			pushToLog("Download error! "+err);
		});
	});
}

function addSEBridgeFile() {
	output.file("sebridge.js", SEBridge);
	pushToLog("Added SE Bridge Library");	
}

addSEBridgeFile();
readFileAndParse("settings", settingsLoad);
readFileAndParse("files", handleTranslation);
hookUpDownload();
