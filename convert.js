/* Converter settings */
let settings = null;
const PROJECT_FILES_NEEDED = 5;

// Raw project files
let rawProjectFiles = {
  "js": null,
  "html": null
};

/* Output Containers */
let output = new JSZip();

/* JQuery Checks */
let hasParsedJS = false;
let needsJQueryFull = false;
const jQueryAnimateRegex = /[\'\"\.](animate|fadeIn|fadeTo|fadeToggle|finish|slideDown|slideToggle|slideUp)[\'\"\(]/;

/* Conversion strings */
const jQueryFull = `<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>`;
const jQuerySlim = `<script src="https://code.jquery.com/jquery-3.7.1.slim.min.js" integrity="sha256-kmHvs0B+OpCW5GVHUNjv9rOmY0IvSIRcf7zGUDTDQM8=" crossorigin="anonymous"></script>`;
const HTMLBase = `<!doctype html>
<html lang="en">
  <head>
  <!-- JQuery -->
  {JQUERY}
  
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

/*** HTML STATE ***/
function setButtonDisable(id, status) {
  document.getElementById(id).disabled = status;
}

function checkIfEnableDownload() {
  if (Object.keys(output.files).length >= PROJECT_FILES_NEEDED) {
    setButtonDisable("blob", false);
    pushToLog("<span class='ready'>Download ready!</span>");
  }
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

/*** LOGGING FUNCTIONS ***/
function pushToLog(line) {
  const newLog = document.createElement("p");
  newLog.innerHTML = line;
  document.getElementById("log").appendChild(newLog);
}

function pushErrorToLog(line) {
  pushToLog("<span class='bigtag error'>error</span> "+line);
}

/*** STATE SETTING ***/
function checkJQueryVersion(jsCode) {
  hasParsedJS = true;
  if (jsCode.match(jQueryAnimateRegex) !== null) {
    needsJQueryFull = true;
    pushToLog("Detected jQuery Full Library Needed, Including...");
  } else {
    needsJQueryFull = false;
    pushToLog("Detected jQuery Slim Library Used, Including...");
  }
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

/*** FILE MODIFICATIONS/BUNDLING ***/
function applySettings(data) {
  let curData = data;
  Object.entries(settings).forEach(([key, value]) => {
    const re = new RegExp(String.raw`(?<![\$])[{]+${key}[}]+`, "gm");
    curData = curData.replace(re, value);
  });
  return curData;
}

function handleTranslation(fileName, fileInternals) {
  let outFileName = fileName;
  const lowerFileName = fileName.toLowerCase();
  let fileData = fileInternals;

  // Silently skip anything that's not a full file.
  if (fileData === null) {
    return;
  }
  
  // Check if the internals are empty, this is a sign it didn't read properly or is an empty file.
  if (fileData.length == 0) {
    pushErrorToLog(`File ${fileName} is an empty file, this is likely incorrect!`);
    return;
  }

  // inject additional data to the html so that it handles everything correctly
  if (lowerFileName.includes(".htm")) {
    // Save the raw project file
    rawProjectFiles["html"] = fileData;
    // If we have the JS file, go ahead and process the correct output
    if (rawProjectFiles["js"] !== null) {
      outFileName = "widget.html";
      fileData = HTMLBase.replace("{SEHTML}", fileInternals).replace("{JQUERY}", (needsJQueryFull) ? jQueryFull : jQuerySlim);
      pushToLog("HTML Widget finished");
    } else {
      // Otherwise, wait until we see some js, it will call us back to add on in
      return;
    }

  } else {
    // remap paths
    if (lowerFileName.includes(".css"))
      outFileName = "streamelements.css";
    else if (lowerFileName.includes(".js") && !lowerFileName.includes(".json")) {
      rawProjectFiles["js"] = fileData;
      // Grab the JQuery Version
      checkJQueryVersion(fileData);
      // Update the HTML if we have it.
      handleTranslation("widget.html", rawProjectFiles["html"]);
      outFileName = "streamelements.js";
    } else {
      pushErrorToLog(`Skipping unrecognized file ${fileName}`);
      return;
    }
    pushToLog(`prepared ${fileName}!`);
  }
  
  // Convert the file and add it to the zip output.
  output.file(outFileName, applySettings(fileData));
  
  // Enable the download button
  checkIfEnableDownload();
}

/*** MAIN ***/
function setup() {
  // Make sure all file inputs are cleared upon start.
  const inputFiles = document.getElementsByTagName("input");
  for (input of inputFiles) {
    if (input.type == "file")
      input.value = "";
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
