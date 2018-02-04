async function connectZN() {
  var isStartedSelector = $("#zeronet_started_check")
  isStartedSelector.text("...")
  isStartedPromise = isZeronetStartedFetch();
  isStartedPromise.then(function(isStarted) {
    console.log("Options: isStarted"+isStarted);
    isStartedSelector.removeClass("button-success")
    isStartedSelector.removeClass("button-warning")
    if (isStarted) {
      isStartedSelector.text("ZN connected")
      isStartedSelector.addClass("button-success")
    } else {
      isStartedSelector.text("ZN not started")
      isStartedSelector.addClass("button-warning")
    }
  });

}
function checkNativeMessaging() {
  //console.log("Function:  checkNativeMessaging()");
  var isStartedSelector = $("#native_messaging_check")
  isStartedSelector.removeClass("button-success")
  isStartedSelector.removeClass("button-warning")
  isStartedSelector.text("...")
  //sending message to native application

  var port = chrome.runtime.connectNative("zeronet_helper");
  port.onMessage.addListener(function(msg) {
    console.log("Received");
    onNatMesResponse(msg)
    port.disconnect()
  });
  port.onDisconnect.addListener(function(p) {
    if (p.error) {
      console.log(`Disconnected due to an error: ${p.error.message}`);
      onNatMesError(p.error.message)
    } else if (chrome.runtime.lastError) {
      console.log(`Disconnected due to an error: ${chrome.runtime.lastError.message}`);
      onNatMesError(chrome.runtime.lastError.message)
    }
    console.log("onDisconnect");
  })
  console.log("Post 0");
  port.postMessage('test');
  console.log("Post 1");
}
function onNatMesResponse(response) {
  console.log("onNatMesResponse"+JSON.stringify(response));
  responseContent = response.content.replace(/"/g, '');
  var lastError = chrome.runtime.lastError
  if (lastError != null) {
    console.log("runtime.lastError " + chrome.runtime.lastError.message);
    onNatMesError(chrome.runtime.lastError.message)
  } else {
    console.log("response.content "+responseContent);
    if (responseContent == "OK") {
      console.log("Result OK Nat Mess");
      var isStartedSelector = $("#native_messaging_check")
      isStartedSelector.text("OK")
      isStartedSelector.addClass("button-success")
    } else {
      console.log("Result Error Nat Mess");
      onNatMesError(JSON.stringify(response))
    }

    //console.log("Response " + responseContent);
  }
}
function onNatMesError(error) {
  console.log("onNatMesError");
  var isStartedSelector = $("#native_messaging_check")
  isStartedSelector.text("Incomplete")  
  isStartedSelector.addClass("button-warning")
  isStartedSelector.prop('title', error);
  console.log(`Error: ${error}`);
}

function startupActions() {
  
  $("#downloadButton").on("click", function() {window.open('res/browser_helper.py')})
  chrome.runtime.getPlatformInfo(
    function(info) {
      //$("#download_windows").hide()
      //$("#download_linux").hide()
      // $("#download_android").hide()
      // $("#script_windows").hide()
      // $("#script_linux").hide()
      // $("#step_2").hide()
  
      if (info.os == "win") {
        $("#download_windows").removeClass("hidden")
        $("#script_windows").removeClass("hidden")
        $("#step_2").removeClass("hidden")
        
        $("#zeronet_started_check").on("click", connectZN);
        $("#native_messaging_check").on("click", checkNativeMessaging);
        connectZN()
        checkNativeMessaging()
      } else if (info.os == "linux") {
        $("#download_linux").removeClass("hidden")
        $("#script_linux").removeClass("hidden")
        $("#step_2").removeClass("hidden")
        connectZN()
        checkNativeMessaging()
    
        $("#zeronet_started_check").on("click", connectZN);
        $("#native_messaging_check").on("click", checkNativeMessaging);
      } else if (info.os == "android") {
        $("#download_android").removeClass("hidden")
        //$("#script_linux").show()
        connectZN()
        //checkNativeMessaging()
    
        $("#zeronet_started_check").on("click", connectZN);
        //$("#native_messaging_check").on("click", checkNativeMessaging);
      }
      //console.log(info.os);
    }

  );
}


document.addEventListener("DOMContentLoaded", startupActions);
