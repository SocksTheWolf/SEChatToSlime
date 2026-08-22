function clearInput() {
  // Make sure all file inputs are cleared upon start.
  const inputFiles = document.querySelectorAll("input");
  for (input of inputFiles) {
    input.value = "";
    input.checked = false;
  }
}

function setButtonDisable(id, status) {
  if (status)
    document.getElementById(id).setAttribute("disabled", true);
  else
    document.getElementById(id).removeAttribute("disabled");
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