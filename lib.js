function resetStatus() {
  zeronetStarted = false
  console.log("Reseting status");
}

function isZeronetStartedFetch() { 
  //console.log("Function isZeronetStartedFetch()")
  return new Promise(resolve => {
    //fetching hello page
    $.get("http://127.0.0.1:43110/1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D", {})
    .fail(function( jqXHR, textStatus ) {
      //console.log("failed: "+textStatus+JSON.stringify(jqXHR));
      resp = JSON.stringify(jqXHR)
      //Looking for a zeronet tag in http error response
      var n = resp.search("version_zeronet");
      //console.log(n)
      if (n<0) {
        //console.log("zeronet tag not found");
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function onResponse(response) {
  console.log("Received " + response);
}

function onError(error) {
  console.log(`Error: ${error}`);
}
function setTabForReload(newTabUrl) {
    //Saving current tab id for later reload
    var gettingActiveTab = chrome.tabs.query({currentWindow: true, active: true},function(tabInfo) {
      currentTabId = tabInfo[0].id;
      currentTabUrl = tabInfo[0].url;
      console.log(currentTabUrl)
      if (/^http:\/\/127\.0\.0\.1:43110(\/.*)?$/.test(currentTabUrl)) {
        setTimeout(function(){
          //Reloading page after time for a gracefull zeronet startup
            chrome.tabs.update(currentTabId, {url: newTabUrl});
            console.log("currentTabId: "+currentTabId);
            console.log("requestDetails: "+currentTabUrl);
           }, 3000);
      }

    });
}

function startZN() {
  console.log("Function:  startZN()");
  var gettingPlatformCallback = function(info) {
    if (info.os == "android") {
      var creating = chrome.tabs.create({
        url: "https://play.app.goo.gl/?link=https://play.google.com/store/apps/details?id%3Dnet.mkg20001.zeronet%26ddl%3D1%26pcampaignid%3Dweb_ddl_1"
      });
    } else {
      //sending message to native application
      var port = chrome.runtime.connectNative("zeronet_helper");
      port.onMessage.addListener(function(msg) {
        console.log("Received" + msg.content);
        port.disconnect();
      });
      port.postMessage('start');
    }
    console.log(info.os);
  }
  var gettingInfo = chrome.runtime.getPlatformInfo(gettingPlatformCallback);
}

function notify(message) {
  var creating = chrome.notifications.create(id, {
    "type": "basic",
    "title": "Zeronet Helper",
    "message": message
  }, function() {
      setTimeout(function () {
        chrome.notifications.clear(id)
    }, 4000) 
  });
}