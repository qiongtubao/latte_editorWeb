(function() {
	var latte_server = require("latte_webServer");
	var latte_lib = require("latte_lib");
	var Path = require("path");
	
	this.handle = function(path,callback) {
		var editor = latte_server.editor; 
		var file = latte_lib.fs.readFileSync(Path.resolve(editor.path ,'../' + path));
		callback(null, file);
	}
	this.method = "editor.readFile";
}).call(module.exports);