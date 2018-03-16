(function() {
	var latte_server = require("latte_webServer");
	var latte_lib = require("latte_lib");
	var Path = require("path");
	var lastTime;
	this.handle = function(path, data, callback) {
		var editor = latte_server.editor;
		var file = latte_lib.fs.writeFileSync(Path.resolve(editor.path ,'../' + path, data);
		callback();
	}
	this.method = "editor.saveFile";
}).call(module.exports);