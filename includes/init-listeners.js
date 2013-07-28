var postInitListeners = [];

// Some listeners need the window to get gBrowser, tabContainer
function runPostInitListeners(window) {
  window.setTimeout(function () {
    try {
      // Run module specific late initialisation code (after all init* listeners, and after most extensions):
      for each (var listener in postInitListeners) {
        listener(window);
      }
    }
    catch (ex) {
      // Run again if something is not ready yet
      runPostInitListeners(window);
    }
  }, 100);
}
