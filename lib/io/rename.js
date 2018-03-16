(function() {
	var latte_server = require("latte_webServer");
	var latte_lib = require("latte_lib");
	var Path = require("path");
	var lastTime;
	this.handle = function(oldPath, nowPath, callback) {
		var editor = latte_server.editor;
		oldPath = Path.resolve(editor.path ,'../' + oldPath);
		nowPath = Path.resolve(editor.path, '../' + nowPath);
		var file = latte_lib.fs.renameSync(oldPath, nowPath);
		callback();
	}
	this.method = "editor.rename";
}).call(module.exports);