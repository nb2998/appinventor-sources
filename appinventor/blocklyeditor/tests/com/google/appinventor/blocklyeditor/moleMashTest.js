/**
 *  * User: Edwin Zhang (ehzhang@mit.edu)
 */

var fs = require('fs'); //Always required to read from files
var path = fs.absolute('.');
var system = require('system');
var args = system.args;

//Read files from filesystem
var expected = fs.read(path + '/blocklyeditor/tests/com/google/appinventor/blocklyeditor/data/moleMash/MoleMashExpected.yail');
var formJson = fs.read(path + '/blocklyeditor/tests/com/google/appinventor/blocklyeditor/data/moleMash/Screen1.scm');
formJson = formJson.substring(9, formJson.length-2);
var blocks = fs.read(path + '/blocklyeditor/tests/com/google/appinventor/blocklyeditor/data/moleMash/Screen1.bky');

// PhantomJS page object to open and load an URL
var page = require('webpage').create();
// Some debugging from PhantomJS
page.onConsoleMessage = function (msg) { console.log(msg); };
page.onError = function (msg, trace) {
  console.log(msg);
  trace.forEach(function(item) {
    console.log('  ', item.file, ':', item.line);
  })
}

// Open the actual page and load all the JavaScript in it
// if success is true, all went well
page.open('blocklyeditor/src/demos/yail/yail_testing_index.html', function(status) {
  // The evaluate function has arguments passed after the callback
  // in this case, we are passing in the yail files.

  if (status != 'success') {
    console.log('load unsuccessful');
  }

  // Evaluate the following:
  var passed = page.evaluate(function(){

    // Get the expected Yail from Classic
    var expected = arguments[0];

    // Functions in yail_testing_index.html
      processVersion(arguments[3], arguments[4]);
    processForm(arguments[1]);
    processBlocks(arguments[1], arguments[2]); // [lyn, 2015/01/01] Changed to handle upgrader

    var newblocks = toAppYail();

    return doTheyMatch(expected, newblocks);


  }, expected, formJson, blocks, args[1], args[2]); // args[1] and args[2] are blocks Version and YaV

  // Assert that the block position of the global variable matches the pre-upgraded position.
  passed = passed && page.evaluate(function() {
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    for (var i = 0, block; i < topBlocks.length; i++) {
      block = topBlocks[i];
      if (block.type === 'global_declaration') {
        return block.x === 16 && block.y === 182;
      }
    }
    return false;
  });

  //This is the actual result of the test
  console.log(passed);
  //Exit the phantom process
  phantom.exit();
});


