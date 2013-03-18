


// For logging information (no line numbers, call stack, etc.)
exports.log = function log(message) {
  try {
    var msg = "TabKit: " + message;
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
  }
  catch (ex) {
  }
};

// For minor/normal information that could still be interesting
exports.debug = function debug(message) {
  try {
    var msg = "TabKit Debug: " + message;
    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
  }
  catch (ex) {
  }
};

// For errors or warnings, with automatic line numbers, call stack, etc.
exports.dump = function dump(error, actualException) {
  try {
    var scriptError = Components.classes["@mozilla.org/scripterror;1"].
              createInstance(Components.interfaces.nsIScriptError);

    if (!actualException && typeof error == "object")
      actualException = error;
    var haveException = actualException ? true : false;
    if (haveException && actualException.stack) {
      var stack = actualException.stack;
    }
    else {
      var stack = new Error().stack; // Get call stack (could use Components.stack.caller instead)
      stack = stack.substring(stack.indexOf("\n", stack.indexOf("\n")+1)+1); // Remove the two lines due to calling this
    }
    var message = 'TabKit Error: "' + error + '"\nat:\u00A0' + stack.replace("\n@:0", "").replace(/\n/g, "\n    "); // \u00A0 is a non-breaking space
    var sourceName   = (haveException && "fileName"  in actualException && actualException.fileName)   ? actualException.fileName  : Components.stack.caller.filename;
    var sourceLine   = (haveException && "sourceLine"   in actualException && actualException.sourceLine)   ? actualException.sourceLine   : Components.stack.caller.sourceLine; // Unfortunately this is probably null
    var lineNumber   = (haveException && "lineNumber"   in actualException && actualException.lineNumber)   ? actualException.lineNumber   : Components.stack.caller.lineNumber; // error.lineNumber isn't always accurate, unfortunately - sometimes might be better to just ignore it
    var columnNumber = (haveException && "columnNumber" in actualException && actualException.columnNumber) ? actualException.columnNumber : 0;
    var flags = haveException ? scriptError.errorFlag : scriptError.warningFlag;
    var category = "JavaScript error"; // TODO-P6: TJS Check this
    scriptError.init(message, sourceName, sourceLine, lineNumber, columnNumber, flags, category);

    Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService).logMessage(scriptError);
  }
  catch (ex) {
  }
};
