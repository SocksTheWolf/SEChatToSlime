const storageUUID = crypto.randomUUID();
var SEBridge = `
function IsInOBS() {
	return (typeof(window.obsstudio) !== 'undefined');
}

if (!IsInOBS()) {
  let slime2CSS = document.createElement("link");
  slime2CSS.setAttribute("href", "https://cdn.jsdelivr.net/gh/zaytri/slime2@latest/release/slime2.css");
  slime2CSS.setAttribute("rel", "stylesheet");
  document.head.appendChild(slime2CSS);
}

const SE_API = {
  store: {
    set: function(keyName, obj) {
      if (obj === null)
        slime2.storage.del(keyName);
      else
        slime2.storage.set(keyName, obj);
    },
    get: function(keyName) {
      return slime2.storage.get(keyName);
    }
  },
  cheerFilter: async function(msg) {
    return new Promise((resolve, reject) => {
      let ret = "";
      if (typeof msg === 'string')
        ret = msg.replace(/cheer[0-9]+/gm, "");
      resolve(ret);
    });
  },
  getOverlayStatus: function() {
    const isOBS = (typeof(window.obsstudio) !== 'undefined');
    return {"isEditorMode": isOBS, "muted": false};
  },
  resumeQueue: function() { },
  sanitize: async function(msgObj) {
    return new Promise((resolve, reject) => {
      if (Object.hasOwn(msgObj, "message"))
        resolve({"result": {"message": msgObj.message}, "skip": false});
      else
        reject();
    });
  },
  counters: {
    get: async function(counterName) {
      return new Promise(async (resolve, reject) => {
        const counterValue = await SE_API.store.get(counterName);
        resolve({"counter": counterName, "value": counterValue});
      });
    }
  }, 
};

function seEmotesData(emote) {
  this.type = emote.source;
  this.name = emote.name;
  this.id = emote.id;
  this.gif = false;
  this.start = -1;
  this.end = -1;
  this.urls = {"1": emote["images"]["default"]["x1"], "2": emote["images"]["default"]["x2"], "4": emote["images"]["default"]["x4"]};
}

function seEventData(data, message, isAction) {
  const messageDefined = (message !== undefined);
  if (messageDefined && message.user !== undefined && message.user != null) {
	  let user = message.user;
    this.nick = user.userName;
    this.displayName = user.displayName;
    this.pronouns = user.pronouns;
    this.badges = user.badges;
    // map the objects to the same properties
    this.badges.forEach((badge, index) => {
      this.badges[index].url = this.badges[index].image;
      this.badges[index].id = this.badges[index].type;
    });
  }
  
  this.msgId = data.id;
  this.userId = data.userId;
  this.isAction = isAction;
  if (messageDefined && message != null) {
    this.text = message.text;
    this.tags = message.tags;
    // Attempt to create the emote parts
    this.emotes = new Array();
    for (const part of message.parts) {
      if (part.type === "emote") {
        this.emotes.push(new seEmotesData(part.emote));
      }
    }
  }
}

// wrapper for the bridge event, the event data is most of the work.
function seBridgeEvent(data) {
  let isAction = false;
  this.listener = data.type;
  
  // Handle message types and translations
  if (data.type === "remove-message")
    this.listener = "delete-message";
  else if (data.type === "clear-messages") {
    // Refresh widget on clear command
    document.location.reload();
  }
  else if (data.type === "remove-user")
    this.listener = "delete-messages";
  else if (data.type === "action") {
    this.listener = "message";
    isAction = true;
  }
  else if (data.type === "reply" || data.type === "basic" || data.type === "announcement" || data.type === "highlight" || data.type === "resub" || data.type === "cheer" || data.type === "click")
    this.listener = "message";
  this.event = {"data": new seEventData(data, data.message, isAction)};
}

function seSettings() {
  // Some old old systems in streamelements used to push channel usernames
  // don't think these are really grabbable in slime2
  this.channel = {"username":"", "id":0};
  this.currency = {"symbol":""};
  
  this.fieldData = seJsonConfig;
}

// Call the slime 
addEventListener("slime2:ready", () => {
  slime2.widget.loadPlatform("twitch");
  slime2.storage.use("${storageUUID}");
 
  // connect to our bridge and refire as necessary
  slime2.onEvent(ev => {
    const event = new CustomEvent("onEventReceived", { bubbles: true, cancelable: false, detail: new seBridgeEvent(ev)});
    window.dispatchEvent(event);
  });
  
  // Fire the event for streamelement listeners on startup.
  const loadedEvent = new CustomEvent("onWidgetLoad", {bubbles: true, cancelable: false, detail: new seSettings()});
  window.dispatchEvent(loadedEvent);
});

`;