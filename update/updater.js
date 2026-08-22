const authInput = document.getElementById("authKey");

let outputName = "";
let htmlData = "";

// ugly, evil but finds all script blocks
const scriptFinder = /(<script[\s\S]+?src=["']?(https:\/\/[^\s]\/\.js["'])?[\s\S]*?><\/script>)/igsm;

const slime2NameCheck = /slime2\.(?:min\.)?js/i;

// updated code block to replace
const newCode = `<script type="module" crossorigin src="https://make.twitchauth.work/slime2/slime2.js"></script>`;

function handleWidgetChange(fileName, fileInternals) {
  if (fileInternals.length < 10) {
    alert("bro there's no way the file be that small, be srs dawg");
    return;
  }
  let madeChange = false;
  htmlData = fileInternals.replace(scriptFinder, function(match) {
    if (slime2NameCheck.test(match)) {
      madeChange = true;
      return newCode;
    }
    return match;
  });
  if (!madeChange) {
    alert("slime2 code could not be found, your widget is missing a reference to slime2.js/min.js");
    htmlData = "";
  } else {
    outputName = fileName;
    // yeah throw that right into the code block, woo
    document.getElementById("origName").innerText = fileName;
    setButtonDisable("blob", false);
  }
}

function setup() {
  clearInput();
  setButtonDisable("getAuth", true);
  setButtonDisable("blob", true);
  setButtonDisable("getAuth", true);
  readFileAndParse("files", handleWidgetChange);
}

authInput.addEventListener("change", () => {
  setButtonDisable("getAuth", (authInput.value.length == 0));
});

document.getElementById("getAuth").addEventListener("click", () => {
  if (authInput.value.length == 0) {
    alert("Key is missing!");
    return;
  }
  const authKeyValue = `slime2.setKey('twitch', '${authInput.value}')`;
  const authBlob = new Blob([authKeyValue], {type: "text/javascript"});
  saveAs(authBlob, "SLIME2_TWITCH_KEY.js");
})

document.getElementById("blob").addEventListener("click", function () {
  const blobber = new Blob([htmlData], {type: "text/html;charset=utf-8"});
  saveAs(blobber, outputName);
});

setup();