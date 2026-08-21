let outputName = "";
let htmlData = "";

// ugly, evil but finds all script blocks
const scriptFinder = /(<script[\s\S]+?src=["']?(https:\/\/[^\s]\/\.js["'])?[\s\S]*?><\/script>)/igsm;

// updated code block to replace
const newCode = `<script type="module" crossorigin src="https://make.twitchauth.work/slime2/slime2.js"></script>`;

function handleWidgetChange(fileName, fileInternals) {
  outputName = fileName;
  htmlData = fileInternals.replace(scriptFinder, function(match) {
    console.log(match);
    if (match.includes("slime2.js")) {
      return newCode;
    }
    return match;
  });
  console.log("Finished widget change");
  setButtonDisable("blob", false);
}


function setup() {
  clearInput();

  readFileAndParse("filesBtn", handleWidgetChange);
}

document.getElementById("blob").addEventListener("click", function () {
  saveAs(htmlData, outputName);
});

setup();