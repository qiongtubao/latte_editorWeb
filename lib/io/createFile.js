(function() {
	var latte_server = require("latte_webServer");
	var latte_lib = require("latte_lib");
	var Path = require("path");
	var lastTime;
	this.handle = function(path, callback) {
		var editor = latte_server.editor;
		path = Path.resolve(editor.path ,'../' + path);
		var file = latte_lib.fs.writeFileSync(path, '');
		callback();
	}
	this.method = "editor.createFile";
}).call(module.exports);