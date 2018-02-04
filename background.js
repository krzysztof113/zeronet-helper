zeronetStarted = false
id = "notification-id"
function lhUrlMatchCallback(requestDetails) {
	//Check if request is on zeronet port
  if(/^http:\/\/127\.0\.0\.1:43110(\/.*)?$/.test(requestDetails.url)) {
    console.log("Zeronet url match");
    if (!zeronetStarted) {
	  //Flag set to avoid checking with each request and concurent starting, resets after 10sec
      zeronetStarted = true
      setTimeout(resetStatus, 10000); 
		
      isZeronetStartedFetch().then(function(isStarted) {
        console.log("From fetch: "+isStarted);
        if (isStarted) {
          console.log("Zeronet already started");
        } else {
          setTabForReload(requestDetails.url)
          notify("Starting Zeronet")
          startZN()
        }
      });
    }
    console.log("++++++++++ Loading: zeronetStarted: "+zeronetStarted + requestDetails.url);
  } else {
    console.log("Not a Zeronet URL");
  }
}
//Listener triggered on 127.0.0.1 request
chrome.webRequest.onBeforeRequest.addListener(
  lhUrlMatchCallback,
  {urls: ["http://127.0.0.1/*"],  types: ["main_frame"]},
  ["blocking"]
);

chrome.browserAction.onClicked.addListener(() => {
  notify("Starting Zeronet")
  startZN()
});

function handleInstalled(details) {
  console.log(details.reason);
  if (details.reason == "install" || details.reason == "update") {
      var creating = chrome.tabs.create({
    url: chrome.runtime.getURL("options.html")
  });
  }
}

chrome.runtime.onInstalled.addListener(handleInstalled);

