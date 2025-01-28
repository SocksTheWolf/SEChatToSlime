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
	
    <!-- Slime JS -->
    <script
      type="module"
      crossorigin
      src="https://cdn.jsdelivr.net/gh/zaytri/slime2@latest/release/slime2.js"
    ></script>
	
    <!-- Original SE CSS -->
    <link href="streamelements.css" rel="stylesheet" />
	<!-- Slime CSS -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/zaytri/slime2@latest/release/slime2.css" />
  </head>
 
  <body>
    <slime2 id="slime2-root"></slime2>
	<!-- Original SE Widget HTML Start -->
	<!-- NOTE: If something seems off or goes wrong, copy all code from this section and put it after "Bridge JS Code End". -->
	{SEHTML}
	<!-- Original SE Widget HTML End -->
	
	<!-- Bridge JS Code Start -->
	<script src="seconfig.js"></script>
	<script src="sebridge.js"></script>
	<!-- Bridge JS Code End -->
	
	<!-- Original SE Widget JS -->
	<script src="streamelements.js"></script>
  </body>
 
  <!-- The code below is not actually used -->
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

function pushErrorToLog(line) {
	pushToLog("<span class='bigtag error'>error</span> "+line);
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
		
		pushToLog("Settings parsed! Ready for widget files");
	} else {
		pushErrorToLog("Settings file is malformed, and cannot be used, please make sure you copy the DATA section from the StreamElements widget editor exactly!");
	}
}

function applySettings(data) {
	let curData = data;
	Object.entries(settings).forEach(([key, value]) => {
		const re = new RegExp(String.raw`(?<![\$])[{]+${key}[}]+`, "gm");
		curData = curData.replace(re, value);
	});
	return curData;
}

function readFileAndParse(element, callback) {
	const elementHandle = document.getElementById(element);
	elementHandle.addEventListener("change", (event) => {
		// Shouldn't be possible, but make sure we have files.
		if (elementHandle.files.length == 0) {
			pushErrorToLog("No files selected!");
			return;
		}
		// All files that we do get, try to process them...
		for (const curFile of elementHandle.files) {
			const reader = new FileReader();
			reader.onload = (e) => callback(curFile.name, e.target.result);
			reader.readAsText(curFile);
		}
	});
}

function handleTranslation(fileName, fileInternals) {
	let outFileName = fileName;
	const lowerFileName = fileName.toLowerCase();
	let fileData = fileInternals;
	
	// Check if the internals are empty, this is a sign it didn't read properly or is an empty file.
	if (fileData.length == 0) {
		pushErrorToLog(`File ${fileName} is an empty file, this is likely incorrect!`);
		return;
	}
	// inject additional data to the html so that it handles everything correctly
	if (lowerFileName.includes(".htm")) {
		fileData = HTMLBase.replace("{SEHTML}", fileInternals);
		outFileName = "widget.html";
		pushToLog("HTML Widget finished");
	} else {
		// remap paths
		if (lowerFileName.includes(".css"))
			outFileName = "streamelements.css";
		else if (lowerFileName.includes(".js") && !lowerFileName.includes(".json"))
			outFileName = "streamelements.js";
		else {
			pushErrorToLog(`Skipping unrecognized file ${fileName}`);
			return;
		}
		pushToLog(`prepared ${fileName}!`);
	}
	
	// Convert the file and add it to the zip output.
	output.file(outFileName, applySettings(fileData));
	
	// Enable the download button
	if (Object.keys(output.files).length >= PROJECT_FILES_NEEDED) {
		setButtonDisable("blob", false);
		pushToLog("<span class='ready'>Download ready!</span>");
	}
}

function setup() {
	// Make sure all file inputs are cleared upon start.
	const inputFiles = document.getElementsByTagName("input");
	for (input of inputFiles) {
		if (input.type == "file")
		{
			//console.log(`cleared ${input.id}`);
			input.value = "";
		}
	}
	
	// reset all the buttons
	setButtonDisable("blob", true);
	setButtonDisable("filesBtn", true);
	setButtonDisable("settingsBtn", false);
	
	// Add the SE Bridge files to the output
	output.file("sebridge.js", SEBridge);
	pushToLog("Added SE Bridge Library");
	
	// Call all the starting functions.
	readFileAndParse("settings", settingsLoad);
	readFileAndParse("files", handleTranslation);
	
	// Hook up the download button.
	document.getElementById("blob").addEventListener("click", function () {
		output.generateAsync({type:"blob"}).then(function (blob) {
			saveAs(blob, "conversion.zip");
		}, function (err) {
			pushErrorToLog("Download error! "+err);
		});
	});
}

setup();
