function setTabReadOnTabSelect (e) {
  var tab = e.target;
  setTabRead(tab);
}

function setTabRead (tab) {
  tab.setAttribute("read", "true");
}

function setTabUnread (tab) {
  tab.removeAttribute("read");
}

function initTabUnread(window) {
  setTabRead(window.gBrowser.selectedTab);

  sessionStore.persistTabAttribute("read");

  window.gBrowser.tabContainer.addEventListener("TabSelect", setTabReadOnTabSelect, true);
  unload(function() window.gBrowser.tabContainer.removeEventListener("TabSelect", setTabReadOnTabSelect));
}
