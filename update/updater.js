let outputName = "";
let htmlData = "";

// ugly, evil but finds all script blocks
const scriptFinder = /(<script[\s\S]+?src=["']?(https:\/\/[^\s]\/\.js["'])?[\s\S]*?><\/script>)/igsm;

const slime2NameCheck = /slime2\.(?:min\.)?js/gi;

// updated code block to replace
const newCode = `<script type="module" crossorigin src="https://make.twitchauth.work/slime2/slime2.js"></script>`;

function handleWidgetChange(fileName, fileInternals) {
  if (fileInternals.length < 10) {
    alert("bro there's no way the file be that small, be srs dawg");
    return;
  }
  outputName = fileName;
  htmlData = fileInternals.replace(scriptFinder, function(match) {
    if (slime2NameCheck.test(match)) {
      return newCode;
    }
    return match;
  });
  console.log("Finished widget change, ready for download");
  setButtonDisable("blob", false);
}


function setup() {
  clearInput();
  readFileAndParse("files", handleWidgetChange);
}

document.getElementById("blob").addEventListener("click", function () {
  const blobber = new Blob([htmlData], {type: "text/html;charset=utf-8"});
  saveAs(blobber, outputName);
});

setup();