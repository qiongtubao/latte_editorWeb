(function() {
	var latte_server = require("latte_webServer");
	var latte_lib = require("latte_lib");
	var Path = require("path");
	var readDir = function(name, basename) {
		var result = {
			name: Path.basename(name),
			path: Path.relative(basename, name),
			type: "dir",
			children: []
		};
		var files = latte_lib.fs.readdirSync(name);
		files.forEach(function(file) {
			var stat = latte_lib.fs.statSync(name + "/" + file);
			if(stat.isFile()) {
				result.children.push({
					path: Path.relative(basename, name + "/" + file),
					name: file,
					type: "file"
				});
			}else if(stat.isDirectory()) {
				result.children.push(readDir(name + "/" + file, basename));
			}
		});
		return result;
	}
	this.handle = function(callback) {
		var editor = latte_server.editor;
		var files = readDir(editor.path, Path.resolve(editor.path, '../'));
		callback(null, files);
	}
	this.method = "editor.readDir";
}).call(module.exports);