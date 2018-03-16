(function() {
if(window.latte && window.latte.define) {
	return;
}
var LATTE_NAMESPACE = "latte";
var global = (function() {
    return this;
})();
if (!LATTE_NAMESPACE && typeof requirejs !== "undefined")
return;

var _define = function(module, deps, payload) {
    if (typeof module !== 'string') {
        if (_define.original)
            _define.original.apply(window, arguments);
        else {
            console.error('dropping module because define wasn\'t a string.');
            console.trace();
        }
        return;
    }

    if (arguments.length == 2)
        payload = deps;

    if (!_define.modules) {
        _define.modules = {};
        _define.payloads = {};
    }
    
    _define.payloads[module] = payload;
    _define.modules[module] = null;
};

var _require = function(parentId, module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
        var params = [];
        for (var i = 0, l = module.length; i < l; ++i) {
            var dep = lookup(parentId, module[i]);
            if (!dep && _require.original)
                return _require.original.apply(window, arguments);
            params.push(dep);
        }
        if (callback) {
            callback.apply(null, params);
        }
    }
    else if (typeof module === 'string') {
        var payload = lookup(parentId, module);
        if (!payload && _require.original)
            return _require.original.apply(window, arguments);

        if (callback) {
            callback();
        }

        return payload;
    }
    else {
        if (_require.original)
            return _require.original.apply(window, arguments);
    }
};

var resolve = function(parentId, moduleName) {
    if(moduleName.charAt(0) == ".") {
        var ps = parentId.split("/");
        var base = ps.pop();
        //var paths = ps.join("/");
        var ms = moduleName.split("/");
        var n ;
        while((n = ms.shift())) {
          if(n == "..") {
            ps.pop();
          }else if(n != "."){
            ps.push(n);
          }
        }
        return ps.join("/");
    }
    return moduleName;

}

var normalizeModule = function(parentId, moduleName) {
    // normalize plugin requires
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return normalizeModule(parentId, chunks[0]) + "!" + normalizeModule(parentId, chunks[1]);
    }
    // normalize relative requires
    /*if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = base + "/" + moduleName;
        while(moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }*/
    //console.log(parentId, moduleName);
    name = resolve(parentId, moduleName);
    //console.log(parentId, moduleName, name);
    return name;
};
var lookup = function(parentId, moduleName) {

    moduleName = normalizeModule(parentId, moduleName);

    var module = _define.modules[moduleName];
    if (!module) {
        module = _define.payloads[moduleName];
        if (typeof module === 'function') {
            var exports = {};
            var mod = {
                id: moduleName,
                uri: '',
                exports: exports,
                packaged: true
            };

            var req = function(module, callback) {
                return _require(moduleName, module, callback);
            };
            var fms = moduleName.split('/');
            fms.pop();
            var returnValue = module(req, exports, mod, global, moduleName, fms.join('/'));
            exports = returnValue || mod.exports;
            _define.modules[moduleName] = exports;
            delete _define.payloads[moduleName];
            module = exports
        }
        if(!module && moduleName.indexOf(".js") == -1) {
            module =  lookup(parentId, moduleName + ".js");
        }
        if(!module && moduleName.indexOf("/index") == -1) {
            module =  lookup(parentId, moduleName+"/index");
        }
        if(!module && moduleName.indexOf("/index.js") == -1) {
            module =  lookup(parentId, moduleName+"/index.js");
        }

    }
    if(!module) {
       //console.log("unload error",parentId, moduleName);
    }
    return module;
};

function exportWindow(ns) {
    var require = function(module, callback) {
        return _require("", module, callback);
    };    

    var root = global;
    if (ns) {
        if (!global[ns])
            global[ns] = {};
        root = global[ns];
    }

    if (!root.define || !root.define.packaged) {
        _define.original = root.define;
        root.define = _define;
        root.define.packaged = true;
    }

    if (!root.require || !root.require.packaged) {
        _require.original = root.require;
        root.require = require;
        root.require.packaged = true;
        root.require.find = function(path, all, type) {
            var pathStrNum = path.length;
            var callbackArray = [];
            Object.keys(_define.modules).forEach(function(p) {
                if(p.indexOf(path) == 0) {
                    var nPath = p.substring(pathStrNum);
                    if(all) {
                        callbackArray.push(nPath);
                    }else{
                        if(nPath.indexOf("/") == -1) {
                            callbackArray.push(nPath);
                        }
                    }
                    
                }
            });
            console.log(callbackArray);
            return callbackArray;
        }
    }
}

exportWindow(LATTE_NAMESPACE);
    //window._require = require;
    
})();
window.latte.global = this;
this.define = latte.define;

window.latte.config = {};
(function() {
    this.config = {};
}).call(window.latte);


(function(define) {'use strict'
	define("latte_lib/basic/array.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
			var latte_lib = require("./lib.js")
				, events = require("./events.js")
				, LatteObject = require("./object");
				/*
					相关的splice 等返回事件  请返回latteObject 而不是Object对象   现在还没全修改完
					2016-7-7
				*/
			var LatteArray = function(data) {
				var self = this;
				this.data = [];
					var doEvent = function(name, value, oldValue) {
						var index = self.data.indexOf(this);
						if(index != -1) {
							self.emit(index + "." + name, value, oldValue, data);
							self.emit("change", index + "." + name, value, oldValue, data);
						}else{
							removeEvent(this);
						}
						
					};
					var addEvent = function(value) {
						
						value.on("change", doEvent);
						
					};
					var removeEvent = function(value) {
						if(LatteObject.isLatteObject(value)) {
							value.off("change", doEvent);
						}
					};
				(function init() {
					data.forEach(function(o, i) {
						var n = LatteObject.create(o);
						if(n) {
							addEvent(n);
							self.data[i] = n;
						}else{
							self.data[i] = o;
						}
					});
				})();
		
				/**
					var data = latte_lib.object.create({
						list: []
					});
					data.on("list", function(value, list) {
						
					});
					data.set("list", [1,2,3]);
				*/
				var set = function(key, value, mode) {
					if(!latte_lib.isArray(key)) {
						key = key.toString().split(".");
					}
					if(key.length == 1) {
						var k = key[0];
						var ov = self.data[k];
						var od = data[k];
						var nv;
						switch(mode) {
							case 1:
								
							break;
							default:
								removeEvent(ov);
								var nv = LatteObject.create(value);
								if(nv) {
									addEvent(nv);
								}else{
									nv = value;
								}
								self.data[k] = nv;
								data[k] = value;
								return {
									ov: ov,
									nv: nv
								};
							break;
						}
		
					}else{
						var k = key.pop();
						var o = self;
						var parent;
						for(var i = 0, len = key.length ; i < len; i++) {
							parent = o;
							o = o.get(key[i]);
							if(!o) {
								o = new LatteObject({});
								parent.set(key[i], o);
							}
						}
						return self.get(key).set(k, value, mode);
					}
				};
				this._set = set;
		
				this.set = function(key, value, mode) {
					if(mode) {
						if(LatteObject.isLatteObject(this.get(key)) && !LatteObject.isLatteObject(value) && !latte_lib.isArray(value)) {
							 var old = this.get(key);
							 for(var i in value) {
							 	this.set(key + "." + i, (value[i]))
							 }
							 this.emit("set", key, this.get(key), old);
							 return {
							 	nv: this.get(key),
							 	old: old
							 };
						}
					}
					
					var result = set(key, value , mode);
		
					if(key.indexOf(".") == -1) {
						self.emit("change", key, result.nv, result.ov);
						
						self.emit(key, result.nv, result.ov);
					}
					self.emit("set", key, result.nv, result.ov);
					
					return result;
				}
		
				this.get = function(key) {
					if(key == "this" &&  !self.data[key]) {
						return self;
					}
					if(latte_lib.isNumber(key)) {
						return self.data[key];
					}
					if(!latte_lib.isArray(key)) {
						key = key.toString().split(".");
					}
					
					var v = self;
					if(key.length == 1) {
						var v = self.data[key[0]];
						if(latte_lib.isFunction(v)) {
							return v.bind(self);
						}
						return v;
					}else{
						var k = key.shift();
						return self.data[k].get(key);
					}
				}
				/**
					@method push
					@param o {any}
				*/
				this.push = function(o) {
					var key = self.data.length;
					var data = set(key, o);
					self.emit("splice", key, [], [data.nv]);
					self.emit("change", key, data.nv);
				}
		
				this.pop = function() {
					var data = set(self.length - 1, null);
					self.data.pop();
					self.emit("splice", self.length, [data.ov], []);
				}
				/**
					var data = latte_lib.object.create({
						a: [{
							c:1
						}],
						b:[1]
					});
					data.get("a").on("splice", function(index, removeArray, addArray) {
						
					});
					data.get("a").shift();
		
					data.get("b").on("splice", function(index, removeArray, addArray) {
						
					});
					data.get("b").shift();
				*/
				this.shift = function() {
					var old = self.data.shift();
					removeEvent(old);
					self.emit("splice", 0, [old],[]);
					for(var i = 0, len = self.data.length; i < len; i++) {
						self.emit("change", i, self.data[i]);
					}
					self.emit("change", self.data.length, null);
				}
		
				this.unshift = function() {
					var args = Array.prototype.map.call(arguments, function(value) {
						var o = LatteObject.create(value);
						if(o) {
							o.on("change", doEvent);
						}
						return o || value;
					});
					self.data.unshift.apply(self.data, args);
					self.emit("splice", 0, [], args);
		
					for(var i = 0, len = self.data.length; i < len; i++) {
						self.emit("change", i, self.data[i]);
					}
				}
		
				this.splice = function(startIndex, num) {
					var oLength = self.data.length;
					var adds = Array.prototype.splice.call(arguments, 2).map(function(o) {
						var n = LatteObject.create(o);
						if(n) {
							n.on("change", doEvent);
						}
						return n || o;
					});	
					var olds = [];
					for(var i = 0; i < num; i++) {
						var old = self.get(startIndex+i);
						if(old){
							removeEvent(old);
							olds.push(old);
						}
						
					}
					self.data.splice.apply(self.data, [startIndex, num].concat(adds));
					self.emit("splice", startIndex, olds, adds);
					for(var i = 0, len = Math.max(oLength, self.data.length); i < len; i++) {
						self.emit("change", i, self.data[i]);
					}
				}
		
				this.toJSON = function() {
					return self.data;
				}
		
				this.indexOf = function(data) {
					return self.data.indexOf(data);
				}
				this.forEach = function(callback) {
					self.data.forEach(callback);
				};
		
				this.map = function(callback) {
					return self.data.map(callback);
				}
		
				this.filter = function(callback) {
					return self.data.filter(callback);
				}
				this.removeValue = function(value, num) {
		
					if(num == null) {
						var index ;
						while((index = self.indexOf(value)) != -1) {
							self.splice(index, 1);
						}
					}else{
						var index;
						for(var i = 0; i < num; i++) {
							if((index = self.indexOf(value)) != -1) {
								self.splice(index, 1);
							}
						}
					}
				}
				
				Object.defineProperty(self, "length", {
					get: function() {
						return self.data.length;
					},
					set: function(value) {
						throw new Error("暂时没处理")
					}
				});
		
		
				this.getKeys = function() {
					return Object.keys(self.data);
				}
		
			};
			latte_lib.inherits(LatteArray, events);
			(function() {
				
			}).call(LatteArray);
			module.exports = LatteArray;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/basic/async.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		
				var latte_lib = require("./lib.js");
				if(!latte_lib) {
					console.log("no load lib");
				}
				/**
				*	@class async
				*	@namespace latte_lib
				*	@module basic
				*/
				(function() {
					var _self = this;
					this.setImmediate = latte_lib.setImmediate;
					/**
					*	单次执行
					*	@method only_once
					*	@static
					*	@param    {function}  fn   只执行一次的函数
					*	@public
					*	@async
					*	@since 0.0.1
					*	@example
		
							var async = require("latte_lib").async;
							var f = async.only_once(function(data) {
								log(data);
							});
							f("a");
							f("b");
							//"a"
							//error  callback was already called.
					*/
					var only_once = this.only_once = function(fn) {
						var called = false;
						return function() {
							if (called) throw new Error("Callback was already called.");
							called = true;
							fn.apply(_self, arguments);
						}
					};
					/**
					*	并行执行
					*	@method forEach
					*	@static
					*	@param   arr   {array}  需要被执行函数的数组
					*	@param   iterator  {function}  执行函数
					*	@param   callback  {function}  回调函数
					*	@async
					*	@since 0.0.1
					*	@example
		
							var async = require("latte_lib").async;
							var result = [];
							async.forEach([1,2,3,4], function(data, callback) {
								if(data == 3) {
									callback("is 3");
								}else{
									result.push(data * 2);
									callback();
								}
							}, function(err, data) {
								log(err); //is 3
								log(result);// [2,4]
							});
		
							var result2 = [];
							async.forEach([1,2,3,4], function(data, callback) {
								if(data == 3) {
									setTimeout(function() {
										callback("is 3");
									}, 1);
								}else{
									result2.push(data * 2);
									callback();
								}
							}, function(err, data) {
								log(err); //is 3
								log(result2);// [2,4,8]
							});
					*
					*/
					this.forEach = this.each = function(arr, iterator, callback) {
						callback = callback || function(){};
						if(!arr.length) {
							return callback();
						}
						var completed = 0;
						latte_lib.forEach(arr, function (x) {
				            iterator(x, only_once(done) );
				        });
				        function done(err) {
				          if (err) {
				              callback(err);
				              callback = function () {};
				          }
				          else {
				              completed += 1;
				              if (completed >= arr.length) {
				                  callback();
				              }
				          }
				        }
					};
		
					/**
						串行执行
						@method forEachSeries
						@static
						@param   arr   {array}  需要被执行函数的数组
						@param   iterator  {function}  执行函数
						@param   callback  {function}  回调函数
						@sync
						@since 0.0.1
						@example
							var async = require("latte_lib").async;
							var result = [];
							async.forEachSeries([1,2,3,4], function(data, callback) {
								if(data == 3) {
									callback("is 3");
								}else{
									result.push(data * 2);
									callback();
								}
							}, function(err, data) {
								log(err); //is 3
								log(result);// [2,4]
							});
		
							var result2 = [];
							async.forEachSeries([1,2,3,4], function(data, callback) {
								if(data == 3) {
									setTimeout(function() {
										callback("is 3");
									}, 1);
								}else{
									result2.push(data * 2);
									callback();
								}
							}, function(err, data) {
								log(err); //is 3
								log(result2);// [2,4,8]
							});
					*/
					this.forEachSeries = this.eachSeries = function(arr, iterator, callback) {
						callback = callback || function() {};
						if (!arr.length) {
				            return callback();
				        }
				        var completed = 0;
				        (function iterate() {
				            iterator(arr[completed], function (err) {
				                if (err) {
				                    callback(err);
				                    callback = function () {};
				                }
				                else {
				                    completed += 1;
				                    if (completed >= arr.length) {
				                        callback();
				                    }
				                    else {
				                        iterate();
				                    }
				                }
				            });
				        })();
					};
		
					this.forEachLimit = this.eachLimit = function(arr, limit, iterator, callback) {
						var fn = _eachLimit(limit);
			        	fn.apply(null, [arr, iterator, callback]);
					};
		
					var _eachLimit = function(limit) {
						return function(arr, iterator, callback) {
							callback = callback || function() {};
							if (!arr.length || limit <= 0) {
				                return callback();
				            }
				            var completed = 0;
				            var started = 0;
				            var running = 0;
			             	(function replenish () {
				                if (completed >= arr.length) {
				                    return callback();
				                }
		
				                while (running < limit && started < arr.length) {
				                    started += 1;
				                    running += 1;
				                    iterator(arr[started - 1], function (err) {
				                        if (err) {
				                            callback(err);
				                            callback = function () {};
				                        }
				                        else {
				                            completed += 1;
				                            running -= 1;
				                            if (completed >= arr.length) {
				                                callback();
				                            }
				                            else {
				                                replenish();
				                            }
				                        }
				                    });
				                }
				            })();
						};
					};
		
					var doParallel = function (fn) {
				        return function () {
				            var args = Array.prototype.slice.call(arguments);
				            return fn.apply(null, [_self.each].concat(args));
				        };
				    };
		
				    var doParallelLimit = function(limit, fn) {
				        return function () {
				            var args = Array.prototype.slice.call(arguments);
				            return fn.apply(null, [_eachLimit(limit)].concat(args));
				        };
				    };
		
				    var doSeries = function (fn) {
				        return function () {
				            var args = Array.prototype.slice.call(arguments);
				            return fn.apply(null, [_self.eachSeries].concat(args));
				        };
				    };
		
				    var _asyncMap = function(eachfn, arr, iterator, callback) {
				    	arr = latte_lib.map(arr, function(x, i) {
				    		return {
				    			index: i,
				    			value: x
				    		};
				    	});
				    	if (!callback) {
				            eachfn(arr, function (x, callback) {
				                iterator(x.value, function (err) {
				                    callback(err);
				                });
				            });
				        } else {
				            var results = [];
				            eachfn(arr, function (x, callback) {
				                iterator(x.value, function (err, v) {
				                    results[x.index] = v;
				                    callback(err);
				                });
				            }, function (err) {
				                callback(err, results);
				            });
				        }
				    };
		
				    this.map = doParallel(_asyncMap);
				    this.mapSeries = doSeries(_asyncMap);
		
				    var _mapLimit = function(limit) {
				        return doParallelLimit(limit, _asyncMap);
				    };
		
				    this.mapLimit = function(arr, limit, iterator, callback) {
				    	return _mapLimit(limit)(arr, iterator, callback);
				    };
		
				    this.inject = this.foldl = this.reduce = function(arr, memo, iterator, callback) {
				    	_self.eachSeries(arr, function(x, callback) {
				    		iterator(memo, x, function (err, v) {
				                memo = v;
				                callback(err);
				            });
				    	}, function (err) {
				            callback(err, memo);
				        });
				    };
		
				    this.foldr = this.reduceRight = function (arr, memo, iterator, callback) {
				        var reversed = latte_lib.map(arr, function (x) {
				            return x;
				        }).reverse();
				        _self.reduce(reversed, memo, iterator, callback);
				    };
				    var _filter = function (eachfn, arr, iterator, callback) {
				        var results = [];
				        arr = latte_lib.map(arr, function (x, i) {
				            return {index: i, value: x};
				        });
				        eachfn(arr, function (x, callback) {
				            iterator(x.value, function (v) {
				                if (v) {
				                    results.push(x);
				                }
				                callback();
				            });
				        }, function (err) {
				            callback(latte_lib.map(results.sort(function (a, b) {
				                return a.index - b.index;
				            }), function (x) {
				                return x.value;
				            }));
				        });
				    };
		
				    this.select = this.filter = doParallel(_filter);
			    	this.selectSeries = this.filterSeries = doSeries(_filter);
		
			    	var _reject = function (eachfn, arr, iterator, callback) {
				        var results = [];
				        arr = latte_lib.map(arr, function (x, i) {
				            return {index: i, value: x};
				        });
				        eachfn(arr, function (x, callback) {
				            iterator(x.value, function (v) {
				                if (!v) {
				                    results.push(x);
				                }
				                callback();
				            });
				        }, function (err) {
				            callback(latte_lib.map(results.sort(function (a, b) {
				                return a.index - b.index;
				            }), function (x) {
				                return x.value;
				            }));
				        });
				    };
		
				    this.reject = doParallel(_reject);
			 		this.rejectSeries = doSeries(_reject);
		
			 		var _detect = function (eachfn, arr, iterator, main_callback) {
				        eachfn(arr, function (x, callback) {
				            iterator(x, function (result) {
				                if (result) {
				                    main_callback(x);
				                    main_callback = function () {};
				                }
				                else {
				                    callback();
				                }
				            });
				        }, function (err) {
				            main_callback();
				        });
				    };
		
				    this.detect = doParallel(_detect);
				 	this.detectSeries = doSeries(_detect);
		
				 	this.any = this.some = function(arr, iterator, main_callback) {
				 		_self.each(arr, function (x, callback) {
				            iterator(x, function (v) {
				                if (v) {
				                    main_callback(true);
				                    main_callback = function () {};
				                }
				                callback();
				            });
				        }, function (err) {
				            main_callback(false);
				        });
				 	};
		
				 	this.all = this.every = function (arr, iterator, main_callback) {
				        _self.each(arr, function (x, callback) {
				            iterator(x, function (v) {
				                if (!v) {
				                    main_callback(false);
				                    main_callback = function () {};
				                }
				                callback();
				            });
				        }, function (err) {
				            main_callback(true);
				        });
				    };
		
				    this.sortBy = function (arr, iterator, callback) {
				        _self.map(arr, function (x, callback) {
				            iterator(x, function (err, criteria) {
				                if (err) {
				                    callback(err);
				                }
				                else {
				                    callback(null, {value: x, criteria: criteria});
				                }
				            });
				        }, function (err, results) {
				            if (err) {
				                return callback(err);
				            }
				            else {
				                var fn = function (left, right) {
				                    var a = left.criteria, b = right.criteria;
				                    return a < b ? -1 : a > b ? 1 : 0;
				                };
				                callback(null, latte_lib.map(results.sort(fn), function (x) {
				                    return x.value;
				                }));
				            }
				        });
				    };
				    /**
				    	自动 并行 如果有依赖的话等依赖好了在执行
				    	@method auto
				    	@static
				    	@param {json} tasks
						@param {function} callback
						@async
						@since 0.0.1
						@example
		
							var async = require("latte_lib").async;
							async.auto({
								a: ["c",function(callback) {
									log("a");
									callback(null,3);
								}],
								b: function(callback) {
									log("b");
									callback(null, 1);
								},
								c: function(callback) {
									log("c");
									callback(null, 2);
								},
								d: ["a", function(callback) {
									log("d");
									callback(null, 4);
								}]
							}, function(err, results) {
								log("err:",err);
								log("results:", results);// {"b":1,"c":2,"a":3,"d":4}
							});
		
		
							async.auto({
								a: ["c",function(callback) {
									log("a");
									callback("is 3", 3);
								}],
								b: function(callback) {
									log("b");
									callback(null, 1);
								},
								c: function(callback) {
									log("c");
									callback(null, 2);
								},
								d: ["a", function(callback) {
									log("d");
									callback(null, 4);
								}]
							}, function(err, results) {
								log("err:",err);	// is 3
								log("results:", results);// {"b":1,"c":2, "a":3}
							});
				    */
				    this.auto = function (tasks, callback) {
				        callback = callback || function () {};
				        var keys = latte_lib.keys(tasks);
				        var remainingTasks = keys.length
				        if (!remainingTasks) {
				            return callback();
				        }
		
				        var results = {};
		
				        var listeners = [];
				        var addListener = function (fn) {
				            listeners.unshift(fn);
				        };
				        var removeListener = function (fn) {
				            for (var i = 0; i < listeners.length; i += 1) {
				                if (listeners[i] === fn) {
				                    listeners.splice(i, 1);
				                    return;
				                }
				            }
				        };
				        var taskComplete = function () {
				            remainingTasks--
				            latte_lib.forEach(listeners.slice(0), function (fn) {
				                fn();
				            });
				        };
		
				        addListener(function () {
				            if (!remainingTasks) {
				                var theCallback = callback;
				                // prevent final callback from calling itself if it errors
				                callback = function () {};
		
				                theCallback(null, results);
				            }
				        });
		
				        latte_lib.forEach(keys, function (k) {
				            var task = latte_lib.isArray(tasks[k]) ? tasks[k]: [tasks[k]];
				            var taskCallback = function (err) {
				                var args = Array.prototype.slice.call(arguments, 1);
				                if (args.length <= 1) {
				                    args = args[0];
				                }
				                if (err) {
				                    var safeResults = {};
				                    latte_lib.forEach(latte_lib.keys(results), function(rkey) {
				                        safeResults[rkey] = results[rkey];
				                    });
				                    safeResults[k] = args;
				                    callback(err, safeResults);
				                    // stop subsequent errors hitting callback multiple times
				                    callback = function () {};
				                }
				                else {
				                    results[k] = args;
				                    latte_lib.setImmediate(taskComplete);
				                }
				            };
				            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
				            var ready = function () {
				                return latte_lib.reduce(requires, function (a, x) {
				                    return (a && results.hasOwnProperty(x));
				                }, true) && !results.hasOwnProperty(k);
				            };
				            if (ready()) {
				                task[task.length - 1](taskCallback, results);
				            }
				            else {
				                var listener = function () {
				                    if (ready()) {
				                        removeListener(listener);
				                        task[task.length - 1](taskCallback, results);
				                    }
				                };
				                addListener(listener);
				            }
				        });
				    };
		
				    this.retry = function(times, task, callback) {
				        var DEFAULT_TIMES = 5;
				        var attempts = [];
				        // Use defaults if times not passed
				        if (typeof times === 'function') {
				            callback = task;
				            task = times;
				            times = DEFAULT_TIMES;
				        }
				        // Make sure times is a number
				        times = parseInt(times, 10) || DEFAULT_TIMES;
				        var wrappedTask = function(wrappedCallback, wrappedResults) {
				            var retryAttempt = function(task, finalAttempt) {
				                return function(seriesCallback) {
				                    task(function(err, result){
				                        seriesCallback(!err || finalAttempt, {err: err, result: result});
				                    }, wrappedResults);
				                };
				            };
				            while (times) {
				                attempts.push(retryAttempt(task, !(times-=1)));
				            }
				            _self.series(attempts, function(done, data){
				                data = data[data.length - 1];
				                (wrappedCallback || callback)(data.err, data.result);
				            });
				        }
				        // If a callback is passed, run this as a controll flow
				        return callback ? wrappedTask() : wrappedTask
				    };
		
				    this.waterfall = function (tasks, callback) {
				        callback = callback || function () {};
				        if (!latte_lib.isArray(tasks)) {
				          var err = new Error('First argument to waterfall must be an array of functions');
				          return callback(err);
				        }
				        if (!tasks.length) {
				            return callback();
				        }
				        var wrapIterator = function (iterator) {
				            return function (err) {
				                if (err) {
				                    callback.apply(null, arguments);
				                    callback = function () {};
				                }
				                else {
				                    var args = Array.prototype.slice.call(arguments, 1);
				                    var next = iterator.next();
				                    if (next) {
				                        args.push(wrapIterator(next));
				                    }
				                    else {
				                        args.push(callback);
				                    }
				                    latte_lib.setImmediate(function () {
				                        iterator.apply(null, args);
				                    });
				                }
				            };
				        };
				        wrapIterator(_self.iterator(tasks))();
				    };
		
				    var _parallel = function(eachfn, tasks, callback) {
				        callback = callback || function () {};
				        if (latte_lib.isArray(tasks)) {
				            eachfn.map(tasks, function (fn, callback) {
				                if (fn) {
				                    fn(function (err) {
				                        var args = Array.prototype.slice.call(arguments, 1);
				                        if (args.length <= 1) {
				                            args = args[0];
				                        }
				                        callback.call(null, err, args);
				                    });
				                }
				            }, callback);
				        }
				        else {
				            var results = {};
				            eachfn.each(latte_lib.keys(tasks), function (k, callback) {
				                tasks[k](function (err) {
				                    var args = Array.prototype.slice.call(arguments, 1);
				                    if (args.length <= 1) {
				                        args = args[0];
				                    }
				                    results[k] = args;
				                    callback(err);
				                });
				            }, function (err) {
				                callback(err, results);
				            });
				        }
				    };
				    /**
				    	并行
				    	@method parallel
				    	@async
						@param {function[]} tasks
						@param {function} callback
						@example
		
							var async = require("latte_lib").async;
							async.parallel([
								function(cb) {
									cb(null, 1);
								},
								function(cb) {
									setTimeout(function() {
										cb("is 2");
									}, 1);
								},
								function(cb) {
									cb(null, 3);
								}
							],function(err, result) {
								log(err);  //is 2
								log(result);//[1,null,3]
							});
				    */
		
				    this.parallel = function (tasks, callback) {
				        _parallel({ map: _self.map, each: _self.each }, tasks, callback);
				    };
		
				    this.parallelLimit = function(tasks, limit, callback) {
				        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
				    };
				    /**
				    	@method series
				    	@async
						@param {function[]} tasks
						@param {function} callback
						@example
		
							var async = require("latte_lib").async;
							async.series([
								function(cb) {
									cb(null, 1);
								},
								function(cb) {
									setTimeout(function() {
										cb("is 2");
									}, 1);
								},
								function(cb) {
									cb(null, 3);
								}
							],function(err, result) {
								log(err);  //is 2
								log(result);//[1,null]
							});
				    */
				    this.series = function (tasks, callback) {
				        callback = callback || function () {};
				        if (latte_lib.isArray(tasks)) {
				            _self.mapSeries(tasks, function (fn, callback) {
				                if (fn) {
				                    fn(function (err) {
				                        var args = Array.prototype.slice.call(arguments, 1);
				                        if (args.length <= 1) {
				                            args = args[0];
				                        }
				                        callback.call(null, err, args);
				                    });
				                }
				            }, callback);
				        }
				        else {
				            var results = {};
				            _self.eachSeries(_keys(tasks), function (k, callback) {
				                tasks[k](function (err) {
				                    var args = Array.prototype.slice.call(arguments, 1);
				                    if (args.length <= 1) {
				                        args = args[0];
				                    }
				                    results[k] = args;
				                    callback(err);
				                });
				            }, function (err) {
				                callback(err, results);
				            });
				        }
				    };
		
				    this.iterator = function (tasks) {
				        var makeCallback = function (index) {
				            var fn = function () {
				                if (tasks.length) {
				                    tasks[index].apply(null, arguments);
				                }
				                return fn.next();
				            };
				            fn.next = function () {
				                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
				            };
				            return fn;
				        };
				        return makeCallback(0);
				    };
		
				    this.apply = function (fn) {
				        var args = Array.prototype.slice.call(arguments, 1);
				        return function () {
				            return fn.apply(
				                null, args.concat(Array.prototype.slice.call(arguments))
				            );
				        };
				    };
		
				    var _concat = function (eachfn, arr, fn, callback) {
				        var r = [];
				        eachfn(arr, function (x, cb) {
				            fn(x, function (err, y) {
				                r = r.concat(y || []);
				                cb(err);
				            });
				        }, function (err) {
				            callback(err, r);
				        });
				    };
				    this.concat = doParallel(_concat);
			    	this.concatSeries = doSeries(_concat);
			    	this.whilst = function (test, iterator, callback) {
				        if (test()) {
				            iterator(function (err) {
				                if (err) {
				                    return callback(err);
				                }
				                _self.whilst(test, iterator, callback);
				            });
				        }
				        else {
				            callback();
				        }
				    };
		
				    this.doWhilst = function (iterator, test, callback) {
				        iterator(function (err) {
				            if (err) {
				                return callback(err);
				            }
				            var args = Array.prototype.slice.call(arguments, 1);
				            if (test.apply(null, args)) {
				                _self.doWhilst(iterator, test, callback);
				            }
				            else {
				                callback();
				            }
				        });
				    };
		
				    this.until = function(test, iterator, callback) {
				    	if (!test()) {
				            iterator(function (err) {
				                if (err) {
				                    return callback(err);
				                }
				                _self.until(test, iterator, callback);
				            });
				        }
				        else {
				            callback();
				        }
				    };
		
				    this.doUntil = function (iterator, test, callback) {
				        iterator(function (err) {
				            if (err) {
				                return callback(err);
				            }
				            var args = Array.prototype.slice.call(arguments, 1);
				            if (!test.apply(null, args)) {
				                _self.doUntil(iterator, test, callback);
				            }
				            else {
				                callback();
				            }
				        });
				    };
		
				    this.queue = function (worker, concurrency) {
				        if (concurrency === undefined) {
				            concurrency = 1;
				        }
				        function _insert(q, data, pos, callback) {
				          if (!q.started){
				            q.started = true;
				          }
				          if (!_isArray(data)) {
				              data = [data];
				          }
				          if(data.length == 0) {
				             // call drain immediately if there are no tasks
				             return latte_lib.setImmediate(function() {
				                 if (q.drain) {
				                     q.drain();
				                 }
				             });
				          }
				          latte_lib.forEach(data, function(task) {
				              var item = {
				                  data: task,
				                  callback: typeof callback === 'function' ? callback : null
				              };
		
				              if (pos) {
				                q.tasks.unshift(item);
				              } else {
				                q.tasks.push(item);
				              }
		
				              if (q.saturated && q.tasks.length === q.concurrency) {
				                  q.saturated();
				              }
				              latte_lib.setImmediate(q.process);
				          });
				        }
		
				        var workers = 0;
				        var q = {
				            tasks: [],
				            concurrency: concurrency,
				            saturated: null,
				            empty: null,
				            drain: null,
				            started: false,
				            paused: false,
				            push: function (data, callback) {
				              _insert(q, data, false, callback);
				            },
				            kill: function () {
				              q.drain = null;
				              q.tasks = [];
				            },
				            unshift: function (data, callback) {
				              _insert(q, data, true, callback);
				            },
				            process: function () {
				                if (!q.paused && workers < q.concurrency && q.tasks.length) {
				                    var task = q.tasks.shift();
				                    if (q.empty && q.tasks.length === 0) {
				                        q.empty();
				                    }
				                    workers += 1;
				                    var next = function () {
				                        workers -= 1;
				                        if (task.callback) {
				                            task.callback.apply(task, arguments);
				                        }
				                        if (q.drain && q.tasks.length + workers === 0) {
				                            q.drain();
				                        }
				                        q.process();
				                    };
				                    var cb = only_once(next);
				                    worker(task.data, cb);
				                }
				            },
				            length: function () {
				                return q.tasks.length;
				            },
				            running: function () {
				                return workers;
				            },
				            idle: function() {
				                return q.tasks.length + workers === 0;
				            },
				            pause: function () {
				                if (q.paused === true) { return; }
				                q.paused = true;
				                q.process();
				            },
				            resume: function () {
				                if (q.paused === false) { return; }
				                q.paused = false;
				                q.process();
				            }
				        };
				        return q;
				    };
		
				    this.priorityQueue = function(worker, concurrency) {
				    	function _compareTasks(a, b){
			          return a.priority - b.priority;
			        };
		
			        function _binarySearch(sequence, item, compare) {
			          var beg = -1,
			              end = sequence.length - 1;
			          while (beg < end) {
			            var mid = beg + ((end - beg + 1) >>> 1);
			            if (compare(item, sequence[mid]) >= 0) {
			              beg = mid;
			            } else {
			              end = mid - 1;
			            }
			          }
			          return beg;
			        }
		
			        function _insert(q, data, priority, callback) {
						if (!q.started){
							q.started = true;
						}
						if (!_isArray(data)) {
							data = [data];
						}
						if(data.length == 0) {
						// call drain immediately if there are no tasks
							return latte_lib.setImmediate(function() {
								if (q.drain) {
									q.drain();
								}
							});
						}
						  latte_lib.forEach(data, function(task) {
						      var item = {
						          data: task,
						          priority: priority,
						          callback: typeof callback === 'function' ? callback : null
						      };
		
						      q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);
		
						      if (q.saturated && q.tasks.length === q.concurrency) {
						          q.saturated();
						      }
						      latte_lib.setImmediate(q.process);
						  });
						}
		
				        // Start with a normal queue
				        var q = _self.queue(worker, concurrency);
		
				        // Override push to accept second parameter representing priority
				        q.push = function (data, priority, callback) {
				          _insert(q, data, priority, callback);
				        };
		
				        // Remove unshift function
				        delete q.unshift;
		
				        return q;
				    };
		
				    this.cargo = function (worker, payload) {
				        var working     = false,
				            tasks       = [];
		
				        var cargo = {
				            tasks: tasks,
				            payload: payload,
				            saturated: null,
				            empty: null,
				            drain: null,
				            drained: true,
				            push: function (data, callback) {
				                if (!latte_lib.isArray(data)) {
				                    data = [data];
				                }
				                latte_lib.forEach(data, function(task) {
				                    tasks.push({
				                        data: task,
				                        callback: typeof callback === 'function' ? callback : null
				                    });
				                    cargo.drained = false;
				                    if (cargo.saturated && tasks.length === payload) {
				                        cargo.saturated();
				                    }
				                });
				                latte_lib.setImmediate(cargo.process);
				            },
				            process: function process() {
				                if (working) return;
				                if (tasks.length === 0) {
				                    if(cargo.drain && !cargo.drained) cargo.drain();
				                    cargo.drained = true;
				                    return;
				                }
		
				                var ts = typeof payload === 'number'
				                            ? tasks.splice(0, payload)
				                            : tasks.splice(0, tasks.length);
		
				                var ds = latte_lib.map(ts, function (task) {
				                    return task.data;
				                });
		
				                if(cargo.empty) cargo.empty();
				                working = true;
				                worker(ds, function () {
				                    working = false;
		
				                    var args = arguments;
				                    latte_lib.forEach(ts, function (data) {
				                        if (data.callback) {
				                            data.callback.apply(null, args);
				                        }
				                    });
		
				                    process();
				                });
				            },
				            length: function () {
				                return tasks.length;
				            },
				            running: function () {
				                return working;
				            }
				        };
				        return cargo;
				    };
		
				    var _console_fn = function (name) {
				        return function (fn) {
				            var args = Array.prototype.slice.call(arguments, 1);
				            fn.apply(null, args.concat([function (err) {
				                var args = Array.prototype.slice.call(arguments, 1);
				                if (typeof console !== 'undefined') {
				                    if (err) {
				                        if (console.error) {
				                            console.error(err);
				                        }
				                    }
				                    else if (console[name]) {
				                        latte_lib.forEach(args, function (x) {
				                            console[name](x);
				                        });
				                    }
				                }
				            }]));
				        };
				    };
				    this.log = _console_fn('log');
			 		this.dir = _console_fn('dir');
		
			 		this.memoize = function (fn, hasher) {
				        var memo = {};
				        var queues = {};
				        hasher = hasher || function (x) {
				            return x;
				        };
				        var memoized = function () {
				            var args = Array.prototype.slice.call(arguments);
				            var callback = args.pop();
				            var key = hasher.apply(null, args);
				            if (key in memo) {
				                latte_lib.nextTick(function () {
				                    callback.apply(null, memo[key]);
				                });
				            }
				            else if (key in queues) {
				                queues[key].push(callback);
				            }
				            else {
				                queues[key] = [callback];
				                fn.apply(null, args.concat([function () {
				                    memo[key] = arguments;
				                    var q = queues[key];
				                    delete queues[key];
				                    for (var i = 0, l = q.length; i < l; i++) {
				                      q[i].apply(null, arguments);
				                    }
				                }]));
				            }
				        };
				        memoized.memo = memo;
				        memoized.unmemoized = fn;
				        return memoized;
				    };
		
				    this.unmemoize = function (fn) {
						return function () {
							return (fn.unmemoized || fn).apply(null, arguments);
						};
				    };
		
				    this.times = function (count, iterator, callback) {
				        var counter = [];
				        for (var i = 0; i < count; i++) {
				            counter.push(i);
				        }
				        return _self.map(counter, iterator, callback);
				    };
		
				    this.timesSeries = function (count, iterator, callback) {
				        var counter = [];
				        for (var i = 0; i < count; i++) {
				            counter.push(i);
				        }
				        return _self.mapSeries(counter, iterator, callback);
				    };
		
				    /**
				    	@method seq
				    	@static
				    	@async
				    	@param  {function[]}     functions
				    	@return {function}
				    	@since 0.0.1
						@example
		
							var async = require("latte_lib").async;
							var fun = async.seq(function(a, callback) {
								log("1",a);//2
								callback(null, a+1, a-1);
							}, function(data1, data2, callback) {
								log("2",data1,data2);//3,1
								callback("is 2", (data1 + data2 + 2) / (data1- data2 + 2) );
							});
							fun(2, function(err,b,c) {
								log(err ,b,c);//is 2, 1.5
							});
		
				    */
		
				    this.seq = function (/* functions... */) {
				        var fns = arguments;
				        return function () {
				            var that = this;
				            var args = Array.prototype.slice.call(arguments);
				            var callback = args.pop();
				            _self.reduce(fns, args, function (newargs, fn, cb) {
				                fn.apply(that, newargs.concat([function () {
				                    var err = arguments[0];
				                    var nextargs = Array.prototype.slice.call(arguments, 1);
				                    cb(err, nextargs);
				                }]))
				            },
				            function (err, results) {
				                callback.apply(that, [err].concat(results));
				            });
				        };
				    };
		
				    this.compose = function (/* functions... */) {
				    	//颠倒参数
				      return _self.seq.apply(null, Array.prototype.reverse.call(arguments));
				    };
		
				    var _applyEach = function (eachfn, fns /*args...*/) {
				        var go = function () {
				            var that = this;
				            var args = Array.prototype.slice.call(arguments);
				            var callback = args.pop();
				            return eachfn(fns, function (fn, cb) {
				                fn.apply(that, args.concat([cb]));
				            },
				            callback);
				        };
				        if (arguments.length > 2) {
				            var args = Array.prototype.slice.call(arguments, 2);
				            return go.apply(this, args);
				        }
				        else {
				            return go;
				        }
				    };
				    this.applyEach = doParallel(_applyEach);
			    	this.applyEachSeries = doSeries(_applyEach);
		
			    	/**
			    		循环执行出现错误停止
		
			    		@method forever
						@static
						@param   fn   {function}  循环执行到函数
						@param   callback  {function}  循环执行出现错误之后回调函数
						@example
		
							var async = require("latte_lib").async;
							var i = 0;
							async.forever(function(next) {
								if(++i == 3)  {
									next("is 3");
								}else{
									log("forever", i);
									next();
								};
		
							}, function(err) {
								log(err);
							});
			    	*/
			    	this.forever = function (fn, callback) {
				        function next(err) {
				            if (err) {
				                if (callback) {
				                    return callback(err);
				                }
				                throw err;
				            }
				            fn(next);
				        }
				        next();
				    };
				}).call(module.exports);
			
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/basic/events.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		
				var events;
				var latte_lib = require("./lib.js");
				if( latte_lib.isWindow) {
					/**
						@class events
						@namespace latte_lib
						@module basic
					*/
					var events = function() {
						this._events = this._events || {};
					};
					(events.interface = function() {
						/**
							@method on
							@public
							@param {String} event
							@param {Function} fn
							@return {events} this
							@example
		
								var Events = require("latte_lib").events;
								var events = new Events();
								events.on("hello", function() {
									log("latte");
								});
								events.emit("hello");
						*/
						this.on = this.addEventListener = function(event , fn) {
							this._events = this._events || {};
							(this._events[event] = this._events[event] || [])
								.push(fn);
							return this;
						};
						/**
							@method once
							@public
							@param {String} event
							@param {Function} fn
							@return {EventEmitter} this
							@example
		
								var Events = require("latte_lib").events;
								var events = new Events();
								events.once("hello", function() {
									log("latte");
								});
								events.emit("hello");
								events.emit("hello");
						*/
						this.once = function(event, fn) {
							var self = this;
							this._events = this._events || {};
		
							function on() {
								self.off(event, on);
								fn.apply(this, arguments);
							}
		
							on.fn = fn;
							this.on(event, on);
							return this;
						};
						/**
							@method off
							@public
							@param {String} event
							@param {Function} fn
							@return {EventEmitter} this
							@example
		
								var Events = require("latte_lib").events;
								var events = new Events();
								var fun = function() {
									log("latte");
								};
								events.once("hello", fun);
								events.emit("hello", fun);
						*/
						this.off =
						this.removeListener =
						this.removeAllListeners =
						this.removeEventListener = function(event, fn){
						  this._events = this._events || {};
		
						  // all
						  if (0 == arguments.length) {
						    this._events = {};
						    return this;
						  }
		
						  // specific event
						  var callbacks = this._events[event];
						  if (!callbacks) return this;
		
						  // remove all handlers
						  if (1 == arguments.length) {
						    delete this._events[event];
						    return this;
						  }
		
						  // remove specific handler
						  var cb;
						  for (var i = 0; i < callbacks.length; i++) {
						    cb = callbacks[i];
						    if (cb === fn || cb.fn === fn) {
						      callbacks.splice(i, 1);
						      break;
						    }
						  }
						  return this;
						};
						/**
							@method emit
							@public
							@param {String} event
							@return {EventEmitter} this
							@example
		
								var Events = require("latte_lib").events;
								var events = new Events();
								var fun = function() {
									log("latte");
								};
								events.on("hello", fun);
								event.emit("hello")
						*/
						this.emit = function(event){
							this._events = this._events || {};
							var args = [].slice.call(arguments, 1)
							, callbacks = this._events[event];
							if (callbacks) {
								callbacks = callbacks.slice(0);
								for (var i = 0, len = callbacks.length; i < len; ++i) {
								  callbacks[i].apply(this, args);
								}
							}
		
							return this;
						};
						/**
							@method listeners
							@public
							@param {String} event
							@return {Function[]}
							@example
		
								var Events = require("latte_lib").events;
								var events = new Events();
								var fun = function() {
									log("latte");
								};
								log(events.listeners("hello"));
						*/
						this.listeners = function(event){
							this._events = this._events || {};
							return this._events[event] || [];
						};
						/**
							@method hasListeners
							@public
							@param {String} event
							@return {Bool}
							@example
		
								var Events = require("latte_lib").events;
								var events = new Events();
								var fun = function() {
									log("latte");
								};
								log(events.hasListeners("hello"));
						*/
						
						this.hasEvent = function(event, func) {
							return this.listeners(event).indexOf(func) != -1;
						}
					}).call(events.prototype);
				}else{
					events = require("events").EventEmitter;
					events.prototype.off = events.prototype.removeListener;
				}
				(function() {
					this.hasListeners = function(event){
						return !! this.listeners(event).length;
					};
				}).call(events.prototype);
				module.exports = events;
			
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/basic/format.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		
				var latte_lib = require("./lib.js");
				/**
					@namespace latte_lib
					@class format
					@module basic
				*/
				(function() {
					var _self = this;
					/**
							@property ISO8601_FORMAT
							@type String
					*/
					this.ISO8601_FORMAT = "yyyy-MM-dd hh:mm:ss.SSS";
					/**
						@property ISO8601_WITH_TZ_OFFSET_FORMAT
						@type String
					*/
					this.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ssO";
					/**
						@property DATETIME_FORMAT
						@type String
					*/
					this.DATETIME_FORMAT = "hh:mm:ss.SSS";
						function padWithZeros(vNumber, width) {
							var numAsString =  vNumber + "";
							while(numAsString.length < width) {
								numAsString = "0" + numAsString;
							}
							return numAsString;
						}
						function addZero(vNumber) {
							return padWithZeros(vNumber, 2);
						}
						function offset(date) {
							var os = Math.abs(date.getTimezoneOffset());
							var h = String(Math.floor(os/60));
							var m = String(os%60);
							if(h.length == 1) {
								h = "0" + h;
							}
							if(m.length == 1) {
								m = "0" + m;
							}
							return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
						}
						/**
							@method getDateReplace
							@public
							@static
							@sync
							@param {Date} date
							@return {Object}
							@example
								var Format = require("latte_lib").format;
								var date = new Date();
								log(Format.getDateReplace(date));
						*/
						this.getDateReplace = function(date, prefix, postfix) {
							prefix = prefix ||  "";
							postfix = postfix || "";
							var vDay = addZero(date.getDate());
							var vMonth = addZero(date.getMonth() + 1);
							var vYearLong = addZero(date.getFullYear());
							var vYearShort = addZero(date.getFullYear().toString().substring(2,4));
							//var vYear = (format.indexOf("yyyy") > -1 ? vYearLong: vYearShort);
							var vHour = addZero(date.getHours());
							var vMinute = addZero(date.getMinutes());
							var vSecond = addZero(date.getSeconds());
							var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
							var vTimeZone = offset(date);
		
							var result = {};
							result[prefix + "dd" + postfix] = vDay;
							result[prefix + "MM" + postfix] = vMonth;
							result[prefix + "yyyy" + postfix] = vYearLong;
							result[prefix + "y{1,4}" + postfix] = vYearShort;
							result[prefix + "hh" + postfix] = vHour;
							result[prefix + "mm" + postfix] = vMinute;
							result[prefix + "ss" + postfix] = vSecond;
							result[prefix + "SSS" + postfix] = vMillisecond;
							result[prefix + "O" + postfix] = vTimeZone;
							return result;
						}
						/**
							@method dateFormat
							@public
							@static
							@sync
							@param {String} format
							@param {Date} date
							@return {String} formatted
							@example
								var Format = require("latte_lib").format;
								var date = new Date();
								log(Format.dateFormat(Format.ISO8601_FORMAT, date));
						*/
					this.dateFormat = function(format, date, prefix, postfix) {
						if(!date) {
							date = format || new Date();
							format = exports.ISO8601_FORMAT;
						}
						var formatted = format;
						var json = _self.getDateReplace(date, prefix, postfix);
						latte_lib.jsonForEach(json, function(key, value) {
							formatted = formatted.replace(new RegExp(key,"g"), value);
						});
						return formatted;
					}
						var repeatStr = function(str, times) {
							var newStr = [];
							if(times > 0) {
								for(var i = 0; i < times; i++) {
									newStr.push(str);
								}
							}
							return newStr.join("");
						}
						var objFormat = function(object, level, jsonUti, isInArray) {
							var tab = isInArray ? repeatStr(jsonUti.t, level - 1): "";
							if(object === null || object === undefined) {
								return tab + "null";
							}
							switch(latte_lib.getClassName(object)) {
								case "array":
									var paddingTab = repeatStr(jsonUti.t , level - 1);
									var temp = [ jsonUti.n + paddingTab + "[" + jsonUti.n];
									var tempArrValue = [];
									for(var i = 0 , len = object.length; i < len; i++ ) {
										tempArrValue.push(objFormat(object[i], level + 1, jsonUti, true));
									}
									temp.push(tempArrValue.join("," + jsonUti.n));
									temp.push(jsonUti.n + paddingTab + "] ");
									return temp.join("");
								break;
								case "object":
									var currentObjStrings = [];
									for(var key in object) {
										if(object[key] == undefined) {
											continue;
										}
										var temp = [];
										var paddingTab = repeatStr(jsonUti.t, level);
										temp.push(paddingTab);
										temp.push("\"" + key +"\" : ");
										var value = object[key];
										temp.push(objFormat(value, level + 1, jsonUti));
										currentObjStrings.push(temp.join(""));
									}
									return (level > 1 && !isInArray ? jsonUti.n : "")
										+ repeatStr(jsonUti.t, level - 1) + "{" + jsonUti.n
										+ currentObjStrings.join("," + jsonUti.n)
										+ jsonUti.n + repeatStr(jsonUti.t , level - 1) + "}";
								break;
								case "number":
									return tab + object.toString();
								break;
								case "boolean":
									return tab + object.toString().toLowerCase();
								break;
								case "function":
									return object.toString();
								break;
								default:
									return tab + ("\"" + object.toString() + "\"");
								break;
							}
						}
					/**
						@method jsonFormat
						@public
						@static
						@param {Object}
						@param {Object} default { n: "\n", t: "\t"}
						@return {String}
						@example
							var Format = require("latte_lib").format;
							log(Format.jsonFormat({
								a: "1",
								b: 2,
								c: [3],
								d: {
									e: 4
							}
						}));
		
					*/
						var defaultUti = { n: "\n", t: "\t"};
					this.jsonFormat = function(object, jsonUti) {
						jsonUti = latte_lib.merger(defaultUti, jsonUti);
						try {
							return objFormat(object, 1, jsonUti);
						}catch(e) {
							throw object;
							return JSON.stringify(object);
						}
					}
					/**
					 * @method templateStringFormat
						 @sync
						 @public
						 @param {String} template
						 @param  {Object} options
						 @return {String} data
						 @example
								var Format = require("latte_lib").format;
								log(Format.templateStringFormat("hello, {{name}}", { name: "latte"}));
					 */
					this.templateStringFormat = function(template, options) {
						//1
						var data = template;
						for(var i in options) {
							data = data.replace(new RegExp("{{"+i+"}}","igm"), options[i]);
						}
						/**
							正则表达替换
							return template.replace(/{{([-\w]{2,})(?:\[([^\]]+)\])?}}/g, function(_, name, replace) {
								return options[name];
							});
						*/
		
						return data;
					}
					this.templateJsonFormat = function(template, options) {
								var template = JSON.stringify(template);
								var data = _self.templateStringFormat(template, options);
								return JSON.parse(data);
					}
					
						var styles = {
							"bold":      [1, 22],
							"italic":    [2, 23],
							"underline": [4, 24],
							"inverse":   [7, 27],
							"white":     [37,39],
							"grey":      [90,39],
							"black":     [90,39],
							"blue":      [34,39],
							"cyan":      [36,39],
							"green":     [32,39],
							"magenta":   [35,39],
							"red":       [31,39],
							"yellow":    [33,39]
						};
						function colorizeStart(style) {
							return style ? "\x1B[" + styles[style][0] + "m": "";
						}
						function colorizeEnd(style) {
							return style ? "\x1B[" + styles[style][1] + "m": "";
						}
						var color = function(data, style) {
							return  colorizeStart(style) + data + colorizeEnd(style);
						}
					this.colorFormat = function(data, style) {
						return  colorizeStart(style) + data + colorizeEnd(style);
					}
				}).call(module.exports);
		  
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/basic/lib.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		/**
				*	@namespace latte_lib
				*	@class lib
					@module basic
				*
				*/
				(function() {
					this.env = (function() {
						try {
							if(window) {
								return "web";
							}
						}catch(e) {
		
						}
						try {
							if(process) {
								return "node";
							}
						}catch(e) {
		
						}
						return "other";
		
					})();
					this.isWindow = (function() {
						try {
							if(window) {
								return true;
							}
						}catch(e) {
							return false;
						}
						try {
							if(process) {
								return false;
							}
						}catch(e) {
							return true;
						}
						
		
						return false;
					})();
					var _self = this;
						function getFunctionName(func) {
						    if ( typeof func == 'function' || typeof func == 'object' ) {
						        var name = ('' + func).match(/function\s*([\w\$]*)\s*\(/);
						    }
						    return name && name[1];
						}
						_self.trace = console.trace || function trace (count) {        
							var caller = arguments.callee.caller;        
							var i = 0;        
							count = count || 10;        
							console.log("***----------------------------------------  ** " + (i + 1));        
							while (caller && i < count) {
							    console.log(caller.toString());
							    caller = caller.caller;            
							    i++;            
							    console.log("***----------------------------------------  ** " + (i + 1));        
							}    
						}
					
					/**
					*	@method nextTick
					*	@param {function} callback
					*	@async
					*	@static
					*	@all
					*	@example
							(function() {
								require("latte_lib").nextTick(function(){
									console.log("a");
								});
								console.log("b");
							})();
							//b
							//a
					*/
					this.setImmediate = this.nextTick = (function() {
						if(typeof process === "undefined" || !(process.nextTick)) {
			                if(window && typeof window.setImmediate === "function") {
			                    return window.setImmediate;
			                }else {
			                    return function(fn) {
			                        setTimeout(fn, 0);
			                    }
			                }
			            } else {
			                return process.nextTick;
			            }
					})();
					/**
					*
					*	@method inherits
					*	@param {class} ctor     class
					*	@param {class} superCtor    parentClass
					*	@sync
					*	@all
					*	@static
					*	@public
					*	@since 0.0.1
					*	@example
							var latte_lib = require("latte_lib");
							var A = function() {
								this.name = "a";
							};
							(function() {
								this.getName = function() {
									return this.name;
								}
							}).call(A.prototype);
							var B = function() {
								this.name = "b";
							}
							latte_lib.inherits(B, A);
							var b = new B();
							var a = new A();
							log(b.getName());//"b"
							log(a.getName());//"a";
					*/
					this.inherits = this.extends = function(ctor, superCtor) {
						if(typeof Object.create === "function") {
			                ctor.super_ = superCtor
			                ctor.prototype = Object.create(superCtor.prototype, {
			                  constructor: {
			                    value: ctor,
			                    enumerable: false,
			                    writable: true,
			                    configurable: true
			                  }
			                });
			            } else {
			                ctor.super_ = superCtor
			                var TempCtor = function () {}
			                TempCtor.prototype = superCtor.prototype
			                ctor.prototype = new TempCtor()
			                ctor.prototype.constructor = ctor
			            }
			            if(arguments.length > 2) {
			            	var args = Array.prototype.slice.call(arguments, 2);
			            	args.forEach(function(arg) {
			            		for(var key in arg) {
			            			ctor.prototype[key] = arg[key];
			            		}
			            	});
			            }
					}
					/**
					*	@method forEach
					*	@static
					* 	@sync
					*	@all
					*	@since 0.0.1
					*	@public
					*	@param {class} ctor     class
					*	@param {class} superCtor    parentClass
					*	@example
							var latte_lib = require("latte_lib");
							var array = [1,2,3,4];
							var all = 0;
							latte_lib.forEach(array, function(key) {
									all += key;
							});
							log(all);//20
					*/
					this.forEach = function(arr, iterator) {
						if(arr.forEach) {
							return arr.forEach(iterator);
						}
						for(var i = 0 ,len = arr.length; i < len; i++) {
							iterator(arr[i], i, arr);
						}
					}
					/**
					*	@method keys
					*	@static
					*	@sync
					*	@all
					*	@since 0.0.1
					*	@public
					*	@param   {object} obj
					*	@return  {string[]} stringArray
					*	@example
							var latte_lib = require("latte_lib");
							var obj = { a: "a", b: "b"};
							var keys = latte_lib.keys(obj);
							log(keys);//["a","b"]
					*/
					this.keys = function(obj) {
						if(Object.keys) {
							return Object.keys(obj);
						}
						var keys = [];
						for(var k in obj) {
							if(obj.hasOwnProperty(k)) {
								keys.push(k);
							}
						}
						return keys;
					}
		
					/**
					* 	@method copyArray
					* 	@static
					*	@param {array} arr
					*	@return {array}
					*	@sync
					*	@public
					*	@since 0.0.1
					*
					*	@example
							var latte_lib = require("latte_lib");
							var array = ["1", "a"];
							var cArray = latte_lib.copyArray(array);
							log(cArray);//["1", "a"]
					*/
					this.copyArray = function(arr) {
						return arr.concat([]);
					}
		
					/**
					* 	@method indexOf
					* 	@static
					*	@param {object[] || string} arr
					*	@param {object}  obj
					*	@return {int}
					*	@sync
					*	@public
					*	@since 0.0.1
					*
					*	@example
							var latte_lib = require("latte_lib");
							var array = ["1", "a"];
							var cArray = latte_lib.indexOf(array, "1");
							log(cArray);//0
					*/
					this.indexOf = function(arr, obj) {
						if(arr.indexOf) return arr.indexOf(obj);
						for(var i = 0, len = arr.length; i < len; i++) {
							if(arr[i] === obj) return i;
						}
						return -1;
					}
					/**
						@method removeArray
						@static
						@param {object[]} 	arr
						@param {int}   start      0 start
						@param {int}	end
						@public
						@since 0.0.1
						@sync
						@return {object[]}  as
						@example
		
							var latte_lib = require("latte_lib");
							var arr = [1,2,3,4,5];
							var as = latte_lib.removeArray(arr, 2,3);
							log(as);//[1,2,5]
							log(arr);//[1,2,3,4,5]
					*/
					this.removeArray = function(arr, start, end) {
						var as = _self.copyArray(arr);
						_self.removeLocalArray(as, start, end);
						return as;
					}
		
					/**
					* 	@method removeLocalArray
					* 	@static
					*	@param {object[]} arr
					*	@param {int} start
					*	@param {int} end
					*	@public
					*	@since 0.0.1
					*	@sync
					*	@return {object[]} arr
						@example
							var latte_lib = require("latte_lib");
							var arr = [1,2,3,4,5];
							var as = latte_lib.removeLocalArray(arr, 2,3);
							log(as);//[1,2,5]
							log(arr);//[1,2,5]
					*/
					this.removeLocalArray = function(arr, start, end) {
						/**
							var rest = array.slice((end || start)+1);
							array.length = start < 0? array.length + start : start;
							return array;
						*/
						end = end || start;
						arr.splice(start , end - start+1);
						return arr;
					}
					/**
						@method inserLocalArray
						@static
						@public
						@sync
						@since 0.0.1
						@param {object[]} arr
						@param {int} index
						@param {object} obj
						@return {object[]} arr
						@example
		
							var latte_lib = require("latte_lib");
							var arr = [1,2,3,4,5];
							var as = latte_lib.inserLocalArray(arr, 2, 9);
							log(as);//[1,2,9,3,4,5]
							log(arr);//[1,2,9,3,4,5]
					*/
					this.inserLocalArray = function(arr, index, obj) {
						/*
							var rest = [node].concat(array.slice(index));
							array.length = index < 0? array.length + index: index;
							array.push.apply(array, rest);
							return array;
						*/
						arr.splice(index , 0 , obj);
						return arr;
					}
		
					/**
						@method copy
						@static
						@public
						@sync
						@since 0.0.1
						@param {object} obj
						@return {object} obj
						@example
		
							var latte_lib = require("latte_lib");
							var copy = latte_lib.copy({
								a: function() {
		
								},
								b: "1"
							});
							console.log(copy);
							//{ b : "1" }
					*/
					this.copy = function(obj) {
						return JSON.parse(JSON.stringify(obj));
					}
					/**
						@method clone
						@static
						@public
						@sync
						@since 0.0.1
						@param {object} obj
						@return {object} obj
						@example
		
							var latte_lib = require("latte_lib");
							var o = {
								a: function() {
		
								},
								b: "1"
							};
							var clone = latte_lib.clone(o);
							o.b = "2";
							console.log(clone);//{ a: function(){}, b: "1"}
							console.log(o);    //{ a: function(){}, b: "2"}
					*/
					this.clone = function(obj) {
						var o ;
						if(_self.isString(obj) || _self.isNumber(obj) || _self.isFunction(obj) || _self.isBoolean(obj)) {
							return obj;
						}
						if(_self.isArray(obj)) {
							o = [];
						}else{
							o = {};
						}
						for(var i in obj) {
							if(obj.hasOwnProperty(i)) {
								o[i] = obj[i];
							}
						}
						return o;
					}
					/**
						@method reduce
						@static
						@public
						@sync
						@since 0.0.1
						@param {object[]} arr
						@param {function} iterator
						@param {obj}  memo
						@return {obj} memo
						@example
		
							var latte_lib = require("latte_lib");
							var array = [1,2,3,4];
							var c = 0;
							var d = latte_lib.reduce(array, function(c, x, i, a) {
								return c + x;
							}, c);
							log(d);//10;
							log(c);//0;
		
					*/
					this.reduce = function(arr, iterator, memo) {
						if(arr.reduce) {
							return arr.reduce(iterator, memo);
						}
						_self.forEach(arr, function(x, i, a) {
							memo = iterator(memo, x, i, a);
						});
						return memo;
					}
		
					/**
						@method map
						@static
						@public
						@sync
						@param {object[]} arr
						@param {function} iterator
						@return {object[]} results;
						@since 0.0.1
						@example
		
							var latte_lib = require("latte_lib");
							var arr = [1,2,3,4];
							var as = latte_lib.map(arr, function(o) {
								return o+1;
							});
							log(as);//[2,3,4,5]
					*/
					this.map = function(arr, iterator) {
						if(arr.map) {
							return arr.map(iterator);
						}
						var results = [];
						_self.forEach(arr, function(x, i, a) {
							results.push(iterator(x, i, a));
						});
						return results;
					}
					/**
						@method jsonForEach
						@param {json} data
						@param {function} iterator
						@static
						@public
						@example
							var latte_lib = require("latte_lib");
							var data = {
								a: 1,
								b: "c",
								c: [1,2,3]
							};
							latte_lib.jsonForEach(data, function(key, value) {
								log(key, value);
							});
							//a   1
							//b   c
							//c   [1,2,3]
					*/
					this.jsonForEach = function(data, iterator) {
						this.keys(data).forEach(function(key) {
							iterator(key, data[key]);
						});
					}
					/**
						@method getChar
						@param {string} str
						@param {int} index
						@return  {string}
						@sync
						@public
						@static
						@example
		
							var latte_lib = require("latte_lib");
							var str = "abcde";
							var char = latte_lib.getChar(str, 1);
							log(char);//b
					*/
					this.getChar = function(str, index) {
						var strs = str.split("");
						return strs[index];
					}
					if(!Function.prototype.bind) {
						Function.prototype.bind = function(thisArg) {
							var args = Array.prototype.slice.call(arguments, 1);
							var self = this;
							return function() {
								self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
							}
						}
					}
					this.isObject = function(obj) {
						if(!obj) { return false; }
						return obj.constructor == Object;
					}
					/**
						@method	isArray
						@public
						@static
						@sync
						@param {objct}  obj
						@return {bool}
						@example
		
							var latte_lib = require("latte_lib");
							log( latte_lib.isArray(1) ); //false
							log( latte_lib.isArray([1,2,3]) ); //true
					*/
					this.isArray = function(obj) {
						if(Array.isArray) {
							return Array.isArray(obj);
						}else{
							throw "no handle isArray";
						}
					};
		
					/**
						@method isDate
						@static
						@public
						@sync
						@param {objct}  obj
						@return {bool}
						@example
		
							var latte_lib = require("latte_lib");
							log( latte_lib.isDate(1) ); //false
							var date = new Date();
							log( latte_lib.isDate(date) );	//true
					*/
					this.isDate = function(obj) {
						return obj.constructor == Date;
					};
		
		
		
					["String", "Function", "Boolean", "Number"].forEach(function(className) {
						_self["is"+className] = function(obj) {
			        		return typeof(obj) == className.toLowerCase();
			        	}
					});
		
					this.isPromise = function(obj) {
						return _self.isFunction(obj.then);
					}
		
					this.getClassName = function(obj) {
						if(!obj) {
							return undefined;
						}
						var allClass = ["Array", "String", "Number", "Date", "Boolean","Function"];
						for(var i = 0, len = allClass.length; i < len; i++) {
							if(_self["is"+allClass[i]](obj)) {
								return allClass[i].toLowerCase();
							}
						}
						return "object";
					}
		
		
					/**
						@method merger
						@sync
						@static
						@public
						@param {object} master
						@param {...object} arguments{1, -1}
						@return {object} master
						@example
		
							var latte_lib = require("latte_lib");
							var a = latte_lib.merger({
								a: 1
							}, {
								b: 2
							});
							log(a);// {a: 1, b: 2}
					*/
					this.merger = function(master) {
						var master = _self.clone(master);
						Array.prototype.slice.call(arguments, 1).forEach(function(child) {
							if(!child) { return; }
							Object.keys(child).forEach(function(key) {
								master[key] = child[key];
							});
						});
						return master;
					}
					this.getErrorString = function(err) {
						if(err.stack) {
							return err.stack.toString();
						}else if(latte_lib.isString(err)) {
							return err.toString();
						}else{
								var errorString;
								try {
										errorString = JSON.stringify(err);
								}catch(e){
										var Util = require("util");
										errorString = Util.inspect(err);
								}
								return errorString;
						}
					}
					this.defineProperties = Object.defineProperties || function(obj, properties) {
						function convertToDescriptor(desc)
						  {
						    function hasProperty(obj, prop)
						    {
						      return Object.prototype.hasOwnProperty.call(obj, prop);
						    }
		
						    function isCallable(v)
						    {
						      // 如果除函数以外,还有其他类型的值也可以被调用,则可以修改下面的语句
						      return typeof v === "function";
						    }
		
						    if (typeof desc !== "object" || desc === null)
						      throw new TypeError("不是正规的对象");
		
						    var d = {};
						    if (hasProperty(desc, "enumerable"))
						      d.enumerable = !!obj.enumerable;
						    if (hasProperty(desc, "configurable"))
						      d.configurable = !!obj.configurable;
						    if (hasProperty(desc, "value"))
						      d.value = obj.value;
						    if (hasProperty(desc, "writable"))
						      d.writable = !!desc.writable;
						    if (hasProperty(desc, "get"))
						    {
						      var g = desc.get;
						      if (!isCallable(g) && g !== "undefined")
						        throw new TypeError("bad get");
						      d.get = g;
						    }
						    if (hasProperty(desc, "set"))
						    {
						      var s = desc.set;
						      if (!isCallable(s) && s !== "undefined")
						        throw new TypeError("bad set");
						      d.set = s;
						    }
		
						    if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
						      throw new TypeError("identity-confused descriptor");
		
						    return d;
						  }
		
						  if (typeof obj !== "object" || obj === null)
						    throw new TypeError("不是正规的对象");
		
						  properties = Object(properties);
						  var keys = Object.keys(properties);
						  var descs = [];
						  for (var i = 0; i < keys.length; i++)
						    descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);
						  for (var i = 0; i < descs.length; i++)
						    Object.defineProperty(obj, descs[i][0], descs[i][1]);
		
						  return obj;
					};
					/**
						Object.defineProperty(obj, prop, descriptor)
		
						obj
						需要定义属性的对象。
						prop
						需被定义或修改的属性名。
						descriptor
						需被定义或修改的属性的描述符。
		
		
						该方法允许精确添加或修改对象的属性。一般情况下，我们为对象添加属性是通过赋值来创建并显示在属性枚举中（for...in 或 Object.keys 方法）， 但这种方式添加的属性值可以被改变，也可以被删除。而使用 Object.defineProperty() 则允许改变这些额外细节的默认设置。例如，默认情况下，使用  Object.defineProperty() 增加的属性值是不可改变的。
		
						对象里目前存在的属性描述符有两种主要形式：数据描述符和存取描述符。数据描述符是一个拥有可写或不可写值的属性。存取描述符是由一对 getter-setter 函数功能来描述的属性。描述符必须是两种形式之一；不能同时是两者。
		
						数据描述符和存取描述符均具有以下可选键值：
		
						configurable
						当且仅当该属性的 configurable 为 true 时，该属性才能够被改变，也能够被删除。默认为 false。
						enumerable
						当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。
						数据描述符同时具有以下可选键值：
		
						value
						该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。
						writable
						当且仅当仅当该属性的writable为 true 时，该属性才能被赋值运算符改变。默认为 false。
						存取描述符同时具有以下可选键值：
		
						get
						一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。该方法返回值被用作属性值。默认为undefined。
						set
						一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为undefined。
						记住，这些选项不一定是自身属性，如果是继承来的也要考虑。为了确认保留这些默认值，你可能要在这之前冻结Object.prototype，明确指定所有的选项，或者将__proto__属性指向null。
					
						//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
					*/
					this.arrayRmObj = function(array, obj, orderly) {
						
						var n = 0;
						for(var i = 0, len = array.length; i < len; i++ ) {
							if(array[i] == orderly) {
								n++;
							}else{
								array[i - n] = array[i];
							}
						}
						array.length -= n;
						
					}
				}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/basic/object.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
			var latte_lib = require("./lib.js")
				, events = require("./events.js");
		
			var LatteObject = function(data) {
				var self = this;
				this.childEvents = {};
				self.data = {};
					var addEvent = function(key, value) {
						self.childEvents[key] = function(name, value, oldValue) {
							self.emit(key+"."+name, value, oldValue, data);
							self.emit("change", key+"."+name, value, oldValue, data);
						};
						value.on("change", self.childEvents[key]);
					};
					var removeEvent = function(key, value) {
						if(LatteObject.isLatteObject(value)) {
							value.off("change", self.childEvents[key]);
							delete self.childEvents[key];
						}
					};
				(function init() {
					for(var i in data) {
						var l = LatteObject.create(data[i]);
						if(l) {
							addEvent(i, l);
							self.data[i] = l;
						}else{
							self.data[i] = data[i];
						}
					}
					
				})();
		
		
				var set = function (key, value, mode) {
					if(!latte_lib.isArray(key)) {
						key = key.toString().split(".");
					}
					if(key.length == 1) {
						var k = key[0];
						var ov = self.data[k];
						var od = data[k];
						var nv;
						switch(mode) {
							case 1:
							break;
							default:
								removeEvent(k, ov);
								var nv = LatteObject.create(value);
								if(nv) {
									addEvent(k, nv);
								}else{
									nv = value;
								}
								if(value == null) {
									delete self.data[k];
									delete data[k];
								}else{
									self.data[k] = nv;
									data[k] = value;
								}
								
								return {
									ov: ov,
									nv: nv
								};
							break;
						}
					}else{
						var k = key.pop();
						var o = self;
						var parent;
						for(var i = 0, len = key.length ; i < len; i++) {
							parent = o;
							o = o.get(key[i]);
							if(!o) {
								o = new LatteObject({});
								parent.set(key[i], o);
							}
						}
						return self.get(key).set(k, value, mode);
					}
				}
				this._set = set;
				this.merge = function(value) {
					for(var i in value) {
						self.set(i, value[i]);
					}
				}
				this.set = function(key, value, mode) {
					if(mode) {
						//debugger;
						if(LatteObject.isLatteObject(this.get(key)) && !LatteObject.isLatteObject(value) && !latte_lib.isArray(value) && latte_lib.isObject(value)) {
						 	var old = this.get(key);
							 for(var i in value) {
							 	this.set(key + "." + i, (value[i]), mode)
							 }
							 self.emit(key, this.get(key), old);
							 console.log(key + '.' + i, value[i], mode);
						 	return {
							 	nv: this.get(key),
							 	old: old
							 };
		
						}
					}
					
					
					var result = set(key, value);
					
					if(key.indexOf(".") == -1) {
						self.emit("change", key, result.nv, result.ov);
					}
					
					self.emit(key, result.nv, result.ov);
					
					return result;
				}
		
				this.get = function(key) {
					if(key == ".") {
						return self.data[key];
					}
					if(key == "this" &&  !self.data[key]) {
						return self;
					}
					if(latte_lib.isNumber(key)) {
						return self.data[key];
					}
					if(self.data[key]) {
						return self.data[key];
					}
					if(!latte_lib.isArray(key)) {
						key = key.toString().split(".");
					}else{
						if(self.data[key.join(".")]) {
							return self.data[key.join(".")];
						}
					}
					
					var v = self;
					if(key.length == 1) {
						var v = self.data[key[0]];
						if(latte_lib.isFunction(v)) {
							return v.bind(self);
						}
						return v;
					}else{
						var k = key.shift();
						return self.data[k].get(key);
					}
				}
		
				this.toJSON = function() {
					return data;
				}
				
				this.getKeys = function() {
					return Object.keys(self.data);
				}
			};
			(function() {
				this.mergeDefault = function(now, old, reset) {
		
					if(old._events) {
						now._events  = now._events || {};
						for(var key in old._events) {
							now._events[key] = now._events[key] || [];
							now._events[key] = now._events[key].concat(old._events[key]);
						}
					}
					if(!old.getKeys) {
						debugger;
					}
					old.getKeys().forEach(function(i) {
						var v = now.get(i);
						var ov = old.get(i);
						if(LatteObject.isLatteObject(ov)) {
							if(v == null) {
								if(LatteObject.isLatteArray(ov)) {
									now.set(i, [], 1);
								}else{
									now.set(i, {}, 1);
								}
								LatteObject.mergeDefault(now.get(i), ov, reset);
							}else{
								LatteObject.mergeDefault(v, ov, reset);
							}
							if(reset) {
								now.set(i, now.get(i) , 1);
							}
							
							
						}else{
							if(v == null) {
								now.set(i, latte_lib.clone(ov), 1);
							}else if(reset){
								
								now.set(i, now.get(i), 1);
							}
						}
						
					})
					
					
				}
				this.isLatteArray= function(data) {
					var LatteArray = require("./array");
					return data.constructor == LatteArray;
				};
				this.isLatteObject = function(data) {
					var LatteArray = require("./array");
					return data && (
						data.constructor == LatteObject || 
						data.constructor == require("./array")
					);
				};
				this.getType = function(data) {
					if(LatteObject.isLatteObject(data)) {
						return "LatteObject";
					}
					if(Array.isArray(data)) {
						return "Array";
					}
					if(data && data.constructor == Object) {
						return "Object";
					}
				};
		
				this.create = function(data) {
					var LatteArray = require("./array");
					switch(LatteObject.getType(data)) {
						case "LatteObject":
							return data;
						break;
						case "Array":
							return new LatteArray(data);
						break;
						case "Object":
							return new LatteObject(data);
						break;
						default:
							return null;
						break;
					}
				};
				
				this.equal = function(a, b) {
					if(a == null && b == null) {
						return true;
					}
					if( (a == null && b!= null)  || (a != null && b == null)) {
						return false;
					}
					//console.log(a, b);
					if(a.constructor != b.constructor) {
						return false;
					}
					if(latte_lib.isArray(a) ){
						if(a.length != b.length) {
							return false;
						}
						for(var i =0 ,len = a.length; i < len; i++) {
							if(!equal(a[i], b[i])) {
								return false;
							}
						}
						return true;
					}
					if(LatteObject.isLatteArray(a) ) {
						if(a.length != b.length) {
							return false;
						}
						for(var i =0 ,len = a.length; i < len; i++) {
							if(!equal(a.get(i), b.get(i))) {
								return false;
							}
						}
						return true;
					}
					if(LatteObject.isLatteObject(a)) {
						return a.toJSON() == b.toJSON();
					}
					return a == b;
				};
			}).call(LatteObject);
			latte_lib.inherits(LatteObject, events);
			module.exports = LatteObject;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/basic/vm.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		(function() {
			this.script = function(data, opts) {
				
		
			}
			this.func = function(data, self, params) {
				var func= new Function('latte_func' + Date.now(), data);
				func.apply(self, params);
			}
		
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		module.exports = require("./basic/lib");
		(function() {
			this.async = require("./basic/async");
			this.object = require("./basic/object");
			this.format = require("./basic/format");
			this.events = require("./basic/events");
			this.xhr = require("./test/xhr");
			if(this.env != "web") {
				this.fs = require("./test/fs");
			}
			this.promise = require("./test/promise");
			this.debug = require("./test/debug");
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/test/debug.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		(function() {
			this.disabled = true;
			var format = require("../basic/format");
			var getLocation = function(str) {
				var at = str.toString().split("\n")[2];
				var data ;
				if(at.indexOf("(") != -1) {
					data = at.substring(at.indexOf("(")+1, at.indexOf(")"));
				}else{
					data = at.substring(at.indexOf("at ") + 3);
				}
				
				return data;
			};
			var self = this;
			var types = {
				log: "blue",
				info: "green",
				warn: "yellow",
				error: "red",
			};
			
			Object.keys(types).forEach(function(type) {
				self[type] = function() {
					if(self.disabled) {
						return;
					}
					var debug = new Error("debug");
					var date = new Date();
					//console[type].apply( console[type], [ getLocation(debug.stack)].concat( Array.prototype.slice.call(arguments)));
					console[type].apply(console[type], [
						format.colorFormat(getLocation(debug.stack), types[type]),
						"-",
						format.colorFormat(format.dateFormat("yyyy-MM-dd hh:mm:ss", date), types[type]),
						":"
					].concat(Array.prototype.slice.call(arguments)));
				}
			});
		
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/test/fs.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		
		      var Fs = require("fs")
		        , Path = require("path");
		        /**
		          @class fs
		          @namespace latte_lib
		          @module old
		        */
		      (function() {
		        var self = this;
		    		for(var i in Fs) {
		    			self[i] = Fs[i]
		    		};
		        this.exists = function(path, callback) {
		          return Fs.exists(path, callback);
		        }
		        /**
		        *  @method existsSync
		        *  @static
		        *  @public
		        *  @sync
		        *  @param {String} path 文件地址字符串
		        *  @return {Bool}  exists   是否存在   存在为true；不存在为false
		        *  @nodejs
		          @example
		
		            //@nodejs
		            var Fs  = require("latte_lib");
		            var exists = Fs.existsSync("./test.js");
		            log(exists);
		        */
		        this.existsSync = function(path) {
		          return Fs.existsSync(path);
		        }
		        /**
		        *  @method mkdirSync
		        *  @static
		        *  @public
		        *  @sync
		        *  @param {String} path
		        *  @param {Object} options
		        *  @return {Error} error
		        *  @nodejs
		           @example
		              //nodejs
		
		
		        */
		        this.mkdirSync = function(path, options) {
		            if( self.existsSync(path)) {
		              return null;
		            }
		            if(!self.existsSync(Path.dirname(path))) {
		              var error = self.mkdirSync(Path.dirname(path), options);
		              if(error) { return error; }
		            }
		            return Fs.mkdirSync(path, options);
		        }
		        var rmdirSync = this.rmdirSync = function(path) {
		          var files = self.readdirSync(path);
		          files.forEach(function(file) {
		            var stat = self.statSync(path + "/" + file)
		            if(stat.isDirectory()) {
		              self.rmdirSync(path + "/" + file);
		            }else if(stat.isFile()) {
		              self.deleteFileSync(path + "/" + file);
		            }
		          });
		          
		          var err = Fs.rmdirSync(path);
		          console.log("delete Dir ", path, err);
		        }
		        /**
		        *  @method writeFileSync
		        *  @static
		        *  @public
		        *  @sync
		        *  @param {String} path
		        *  @param {String} data
		        *  @return {Error} error
		        *  @example
		            //@nodejs
		
		        */
		        this.writeFileSync = function(path, data) {
		          var error = self.mkdirSync(Path.dirname(path));
		          if(error) { return error; }
		          return Fs.writeFileSync(path, data, {encoding: "utf8"});
		        }
		        /**
		          @method writeFile
		          @static
		          @public
		          @sync
		          @param {String} path
		          @param {String} data
		          @param {Function} callback
		          @example
		            //@nodejs
		            var Fs = require("latte_lib").fs;
		            Fs.writeFile("./test", test);
		        */
		        this.writeFile = function(path, data, callback) {
		          self.mkdir(Path.dirname(path), null, function() {
		  					Fs.writeFile(path, data, {encoding: "utf8"}, callback);
		  				});
		        }
		        this.readFile = function(path, callback) {
		          return Fs.readFile(path, function(err, buffer) {
		              callback(err, buffer? buffer.toString(): null);
		          });
		        }
		        this.readFileSync = function(path) {
		          return Fs.readFileSync(path).toString();
		        }
		        this.mkdir = function(path, options, callback) {
		          self.exists(path, function(exists) {
		              if(exists) {
		                callback(null, path);
		              }else{
		                self.mkdir(Path.dirname(path), options, function(err) {
		                  if(err) { return callback(err); }
		                  Fs.mkdir(path, options, callback);
		                });
		              }
		          });
		        }
		        this.copyFile = function(fromPath, toPath, callback) {
		          //@finding best function
		          try {
		            var from = Fs.createReadStream(fromPath);
		            self.mkdir(Path.dirname(toPath), null, function(error) {
		              var to = Fs.createWriteStream(toPath);
		              from.pipe(to);
		              callback(null);
		            });
		          }catch(e) {
		            callback(e);
		          }
		        }
		
		        this.copyDir = function(fromPath, toPath, callback) {
		
		        }
		        this.fileType = function(path) {
		          return Path.extname(path).substring(1);
		        }
		        this.lstatSync = function(path) {
		          return Fs.lstatSync(path);
		        }
		        this.readdirSync = function(path) {
		          return Fs.readdirSync(path);
		        }
		        this.realpathSync = function(path, cache) {
		          return Fs.realpathSync(path, cache);
		        }
		        this.appendFile = function(filename, data, options, callback) {
		          return Fs.appendFile(filename, data, options, callback);
		        }
		        this.appendFileSync = function(filename, data, options) {
		          return Fs.appendFile(filename, data, options);
		        }
		        /**
		          @method deleteFileSync
		          @static
		          @sync
		          @param {String} filename
		          @param {Function} callback
		          @example
		
		            var Fs = require("latte_lib").fs;
		            Fs.deleteFile("test", function(error) {
		              console.log(error);
		            });
		        */
		        this.deleteFile = function(filename, callback) {
		          Fs.unlink(filename, callback);
		        }
		        /**
		          @method deleteFileSync
		          @static
		          @sync
		          @param {String} path
		          @return {Error} error
		          @example
		
		            var Fs = require("latte_lib").fs;
		            Fs.deleteFileSync("test");
		        */
		        this.deleteFileSync = function(path) {
		            return Fs.unlinkSync(path);
		        }
		        this.stat = function(path, callback) {
		            return Fs.stat(path, callback);
		        }
		        this.createReadStream = function(path, options) {
		            return Fs.createReadStream(path, options);
		        }
		        this.createWriteStream = function(path, options) {
		            var error = self.mkdirSync(Path.dirname(path));
		            return Fs.createWriteStream(path, options);
		        }
		
		        this.rename = function(oldPath, newPath, callback) {
		            return Fs.rename(oldPath, newPath, callback);
		        }
		        this.renameSync = function(oldPath, newPath) {
		           return Fs.renameSync(oldPath, newPath);
		        }
		        this.watch = function(filename, options, listener) {
		            return Fs.watch(filename, options, listener);
		        }
		        this.statSync = function(filename) {
		            return Fs.statSync(filename);
		        }
		        this.WriteStream = Fs.WriteStream;
		
		        this.getTimeSort = function(dirName) {
		          var files = Fs.readdirSync(dirName).map(function(o) {
		            var stat = Fs.lstatSync(dirName+o);
		            return {
		              time: stat.ctime.getTime(),
		              obj: dirName+o
		            };
		          });
		          files.sort(function(a, b) {
		            return a.time > b.time;
		          });
		          return files.map(function(o) {
		            return o.obj;
		          });
		          
		        }
		
		      }).call(module.exports);
		  
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/test/md5.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var add32 = function (a, b) {
			return (a + b) & 0xFFFFFFFF;
		},
		hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
		cmn = function(q, a, b, x, s, t) {
			a = add32(add32(a, q), add32(x, t));
		    return add32((a << s) | (a >>> (32 - s)), b);
		},
		md5cycle = function (x, k) {
			        var a = x[0],
		            b = x[1],
		            c = x[2],
		            d = x[3];
		
		        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
		        a  = (a << 7 | a >>> 25) + b | 0;
		        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
		        d  = (d << 12 | d >>> 20) + a | 0;
		        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
		        c  = (c << 17 | c >>> 15) + d | 0;
		        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
		        b  = (b << 22 | b >>> 10) + c | 0;
		        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
		        a  = (a << 7 | a >>> 25) + b | 0;
		        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
		        d  = (d << 12 | d >>> 20) + a | 0;
		        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
		        c  = (c << 17 | c >>> 15) + d | 0;
		        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
		        b  = (b << 22 | b >>> 10) + c | 0;
		        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
		        a  = (a << 7 | a >>> 25) + b | 0;
		        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
		        d  = (d << 12 | d >>> 20) + a | 0;
		        c += (d & a | ~d & b) + k[10] - 42063 | 0;
		        c  = (c << 17 | c >>> 15) + d | 0;
		        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
		        b  = (b << 22 | b >>> 10) + c | 0;
		        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
		        a  = (a << 7 | a >>> 25) + b | 0;
		        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
		        d  = (d << 12 | d >>> 20) + a | 0;
		        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
		        c  = (c << 17 | c >>> 15) + d | 0;
		        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
		        b  = (b << 22 | b >>> 10) + c | 0;
		
		        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
		        a  = (a << 5 | a >>> 27) + b | 0;
		        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
		        d  = (d << 9 | d >>> 23) + a | 0;
		        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
		        c  = (c << 14 | c >>> 18) + d | 0;
		        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
		        b  = (b << 20 | b >>> 12) + c | 0;
		        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
		        a  = (a << 5 | a >>> 27) + b | 0;
		        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
		        d  = (d << 9 | d >>> 23) + a | 0;
		        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
		        c  = (c << 14 | c >>> 18) + d | 0;
		        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
		        b  = (b << 20 | b >>> 12) + c | 0;
		        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
		        a  = (a << 5 | a >>> 27) + b | 0;
		        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
		        d  = (d << 9 | d >>> 23) + a | 0;
		        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
		        c  = (c << 14 | c >>> 18) + d | 0;
		        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
		        b  = (b << 20 | b >>> 12) + c | 0;
		        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
		        a  = (a << 5 | a >>> 27) + b | 0;
		        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
		        d  = (d << 9 | d >>> 23) + a | 0;
		        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
		        c  = (c << 14 | c >>> 18) + d | 0;
		        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
		        b  = (b << 20 | b >>> 12) + c | 0;
		
		        a += (b ^ c ^ d) + k[5] - 378558 | 0;
		        a  = (a << 4 | a >>> 28) + b | 0;
		        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
		        d  = (d << 11 | d >>> 21) + a | 0;
		        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
		        c  = (c << 16 | c >>> 16) + d | 0;
		        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
		        b  = (b << 23 | b >>> 9) + c | 0;
		        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
		        a  = (a << 4 | a >>> 28) + b | 0;
		        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
		        d  = (d << 11 | d >>> 21) + a | 0;
		        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
		        c  = (c << 16 | c >>> 16) + d | 0;
		        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
		        b  = (b << 23 | b >>> 9) + c | 0;
		        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
		        a  = (a << 4 | a >>> 28) + b | 0;
		        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
		        d  = (d << 11 | d >>> 21) + a | 0;
		        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
		        c  = (c << 16 | c >>> 16) + d | 0;
		        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
		        b  = (b << 23 | b >>> 9) + c | 0;
		        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
		        a  = (a << 4 | a >>> 28) + b | 0;
		        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
		        d  = (d << 11 | d >>> 21) + a | 0;
		        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
		        c  = (c << 16 | c >>> 16) + d | 0;
		        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
		        b  = (b << 23 | b >>> 9) + c | 0;
		
		        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
		        a  = (a << 6 | a >>> 26) + b | 0;
		        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
		        d  = (d << 10 | d >>> 22) + a | 0;
		        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
		        c  = (c << 15 | c >>> 17) + d | 0;
		        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
		        b  = (b << 21 |b >>> 11) + c | 0;
		        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
		        a  = (a << 6 | a >>> 26) + b | 0;
		        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
		        d  = (d << 10 | d >>> 22) + a | 0;
		        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
		        c  = (c << 15 | c >>> 17) + d | 0;
		        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
		        b  = (b << 21 |b >>> 11) + c | 0;
		        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
		        a  = (a << 6 | a >>> 26) + b | 0;
		        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
		        d  = (d << 10 | d >>> 22) + a | 0;
		        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
		        c  = (c << 15 | c >>> 17) + d | 0;
		        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
		        b  = (b << 21 |b >>> 11) + c | 0;
		        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
		        a  = (a << 6 | a >>> 26) + b | 0;
		        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
		        d  = (d << 10 | d >>> 22) + a | 0;
		        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
		        c  = (c << 15 | c >>> 17) + d | 0;
		        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
		        b  = (b << 21 | b >>> 11) + c | 0;
		
		        x[0] = a + x[0] | 0;
		        x[1] = b + x[1] | 0;
		        x[2] = c + x[2] | 0;
		        x[3] = d + x[3] | 0;
		},
		md5blk = function (s) {
			var md5blks = [];
			for(var i = 0; i < 64; i += 4) {
				 md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
			}
			return md5blks;
		},
		md5blk_array = function (a) {
			var md5blks = [];
			for(var i = 0; i < 64; i += 4) {
				md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
			}
			return md5blks;
		},
		md51 = function(s) {
			var n = s.length,
				state = [1732584193, -271733879, -1732584194, 271733878],
				i,
				length,
				tail,
				tmp,
				lo,
				hi;
			for (i = 64; i <= n; i+= 64) {
				md5cycle(state, md5blk(s.substring(i - 64, i)));
			}
			s = s.substring(i - 64);
		    length = s.length;
		    tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		    for (i = 0; i < length; i += 1) {
		        tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
		    }
		    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
		    if (i > 55) {
		        md5cycle(state, tail);
		        for (i = 0; i < 16; i += 1) {
		            tail[i] = 0;
		        }
		    }
		    tmp = n * 8;
		    tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
		    lo = parseInt(tmp[2], 16);
		    hi = parseInt(tmp[1], 16) || 0;
		
		    tail[14] = lo;
		    tail[15] = hi;
		
		    md5cycle(state, tail);
		    return state;
		},
		md51_array = function (a) {
			var n = a.length,
		        state = [1732584193, -271733879, -1732584194, 271733878],
		        i,
		        length,
		        tail,
		        tmp,
		        lo,
		        hi;
		
		    for (i = 64; i <= n; i += 64) {
		        md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
		    }
		
		    // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
		    // containing the last element of the parent array if the sub array specified starts
		    // beyond the length of the parent array - weird.
		    // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
		    a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);
		
		    length = a.length;
		    tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		    for (i = 0; i < length; i += 1) {
		        tail[i >> 2] |= a[i] << ((i % 4) << 3);
		    }
		
		    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
		    if (i > 55) {
		        md5cycle(state, tail);
		        for (i = 0; i < 16; i += 1) {
		            tail[i] = 0;
		        }
		    }
		
		    // Beware that the final length might not fit in 32 bits so we take care of that
		    tmp = n * 8;
		    tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
		    lo = parseInt(tmp[2], 16);
		    hi = parseInt(tmp[1], 16) || 0;
		
		    tail[14] = lo;
		    tail[15] = hi;
		
		    md5cycle(state, tail);
		
		    return state;
		},
		rhex = function (n) {
			var s = "",
				j;
			for (j = 0; j < 4; j += 1) {
				s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F]
			}
			return s;
		} ,
		hex = function (x) {
			var i;
			for ( i = 0; i < x.length; i += 1) {
				x[i] = rhex(x[i]);
			}
			return x.join("");
		};
		
		if(hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592") {
			add32 = function(x,y) {
				var lsw = (x & 0xFFFF) + (y & 0xFFFF),
				msw = (x >> 16) + (y >> 16) + (lsw >> 16);
				return (msw << 16) | (lsw & 0xFFFF);
			};
		}
		
		if(typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
			(function() {
				function clamp(val, length) {
					val = (val | 0) || 0;
					if (val < 0) {
						return Math.max(val + length, 0);
					}
					return Math.min(val, length);
				}
				ArrayBuffer.prototype.slice = function (from, to) {
					var length = this.byteLength,
						begin = clamp(from, length),
						end = length,
						num,
						target,
						targetArray,
						sourceArray;
					if (to !== undefined) {
						end = clamp(to, length);
					}
		
					if (begin > end) {
						return new ArrayBuffer(0);
					}
		
					num = end - begin;
					target = new ArrayBuffer(num);
					targetArray = new Uint8Array(target);
		
					sourceArray = new Uint8Array(this, begin, num);
					targetArray.set(sourceArray);
					return target;
		
				}
			})();
		}
		
		function toUtf8(str) {
			if (/[\u0080-\uFFFF]/.test(str)) {
				str = unescape(encodeURIComponent(str));
			}
			return str;
		}
		
		function utf8Str2ArrayBuffer(str, returnUInt8Array) {
			var length = str.length,
				buffer = new ArrayBuffer(length),
				arr = new Uint8Array(buff),
				i;
			for (i = 0; i < length; i += 1) {
				arr[i] = str.charCodeAt(i);
			}
			return returnUInt8Array ? arr : buff;
		}
		function arrayBuffer2Utf8Str(buff) {
			return String.fromCharCode.apply(null, new Uint8Array(buff));
		}
		function concatenateArrayBuffers(first, second, returnUInt8Array) {
			var result = new Uint8Array(first.byteLength + second.byteLength);
			result.set(new Uint8Array(first));
			result.set(new Uint8Array(second), first.byteLength);
			return returnUInt8Array ? result : result.buffer;
		}
		function hexToBinaryString(hex) {
			var bytes = [],
				length = hex.length,
				x;
			for (x = 0; x < length - 1; x += 2) {
				bytes.push(parseInt(hex.substr(x, 2), 16));
			}
			return String.fromCharCode.apply(String, bytes);
		}
		
		var MD5 = function () {
			this.reset();
		};
		(function() {
			this.append = function(str) {
				this.appendBinary(toUtf8(str));
				return this;
			}
			this.appendBinary = function(contents) {
				this._buffer += contents;
				this._length += contents.length;
				var length = this._buff.length,
					i;
				for (i = 64; i <= length; i += 64) {
					md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
				}
				this._buff = this._buff.substring( i - 64 );
				return this;
			}
			this.end = function(raw) {
				var buff = this._buff,
					length = buff.length,
					i,
					tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					ret;
				for (i = 0; i < length; i += 1) {
					tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
				}
				this._finish(tail, length);
				ret = hex(this._hash);
				if (raw) {
					ret = hexToBinaryString(ret);
				}
				this.reset();
				return ret;
			}
			this.reset = function() {
				this._buff = '';
		        this._length = 0;
		        this._hash = [1732584193, -271733879, -1732584194, 271733878];
		
		        return this;
			}
			this.getState = function() {
				return {
					buff: this._buff,
					length: this._length,
					hash: this._hash
				};
			}
			this.setState = function(state) {
				this._buff = state.buff;
				this._length = state.length;
				this._hash = state.hash;
				return this;
			}
			this.destroy = function() {
				delete this._hash;
				delete this._buff;
				delete this._length;
			}
			this._finish = function(tail, length) {
				var i = length,
		            tmp,
		            lo,
		            hi;
		
		        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
		        if (i > 55) {
		            md5cycle(this._hash, tail);
		            for (i = 0; i < 16; i += 1) {
		                tail[i] = 0;
		            }
		        }
		
		        // Do the final computation based on the tail and length
		        // Beware that the final length may not fit in 32 bits so we take care of that
		        tmp = this._length * 8;
		        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
		        lo = parseInt(tmp[2], 16);
		        hi = parseInt(tmp[1], 16) || 0;
		
		        tail[14] = lo;
		        tail[15] = hi;
		        md5cycle(this._hash, tail);
			}
		
		
		}).call(MD5.prototype);
		(function() {
			this.hash = function(str, raw) {
				return MD5.hashBinary(toUtf8(str), raw);
			}
			this.hashBinary = function(content, raw) {
				var hash = md51(content),
					ret = hex(hash);
				return raw ? hexToBinaryString(ret) : ret;
			}
			var ArrayBuffer = function() {
				this.reset();
			};
			(function() {
				this.append = function(arr) {
					var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
			            length = buff.length,
			            i;
		
			        this._length += arr.byteLength;
		
			        for (i = 64; i <= length; i += 64) {
			            md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
			        }
		
			        this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
		
			        return this;	
				}
				this.end = function(raw) {
					var buff = this._buff,
			            length = buff.length,
			            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			            i,
			            ret;
		
			        for (i = 0; i < length; i += 1) {
			            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
			        }
		
			        this._finish(tail, length);
			        ret = hex(this._hash);
		
			        if (raw) {
			            ret = hexToBinaryString(ret);
			        }
		
			        this.reset();
		
			        return ret;
				}
				this.reset = function() {
					this._buff = new Uint8Array(0);
					this._length = 0;
					this._hash = [1732584193, -271733879, -1732584194, 271733878];
					return this;
				}
				this.getState = function() {
					var state = MD5.prototype.getState.call(this);
					state.buff = arrayBuffer2Utf8Str(state.buff);
					return state;
				}
				this.setState = function(state) {
					state.buff = utf8Str2ArrayBuffer(state.buff, true);
					return MD5.prototype.setState.call(this, state);
				}
				this.destroy = MD5.prototype.destroy;
				this._finish = MD5.prototype._finish;
			}).call(ArrayBuffer.prototype);
			(function() {
				this.hash = function(arr, raw) {
					var hash = md5blk_array(new Uint8Array(arr)),
						ret = hex(hash);
					return raw ? hexToBinaryString(ret) : ret;
				}
			}).call(ArrayBuffer);
		}).call(MD5);
		
		module.exports = MD5;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/test/promise.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		module.exports = Promise || (function() {
			function Promise() {
				this._callbacks = [];
			};
			(function() {
				this.then = function(func, context) {
					var p;
					if(this._isdone) {
						p = func.apply(context, this.result);
					}else{
						p = new Promise();
						this._callbacks.push(function() {
							var res = func.apply(context, arguments);
							if(res && typeof res.then === "function") {
								res.then(p.done, p);
							}
						});
					}
					return p;
				};
				this.done = function() {
					this.result = arguments;
					this._isdone = true;
					for(var i = 0, len = this._callbacks.length; i < len; i++) {
						this._callbacks[i].apply(null, arguments);
					}
					this._callbacks = [];
				};
				
		
			}).call(Promise.prototype);
			return Promise;
		})();
		(function() {
			this.join = function(promises) {
				var p = new Promise();
				var results = [];
				if(!promises || !promises.length) {
					p.done(results);
					return p;
				}
				var numdone = 0;
				var total = promises.length;
				function notifier(i) {
					return function() {
						numdone += 1;
						results[i] = Array.prototype.slice.call(arguments);
						if(numdone === total) {
							p.done(results);
						}
					}
				};
				for(var i = 0; i < total; i++) {
					promises[i].then(notifier(i));
				}
				return p;
			} 
				this.chain = function(funcs, args) {
					var p = new Promise();
					if (funcs.length === 0) {
						p.done.apply(p, args);
					} else {
						funcs[0].apply(null, args).then(function() {
							funcs.splice(0, 1);
							chain(funcs, arguments).then(function() {
								p.done.apply(p, arguments);
							});
						});
					}
					return p;
				}
				
			    var slice = Array.prototype.slice;
			    function isGenerator(obj) {
		  			return 'function' == typeof obj.next && 'function' == typeof obj.throw;
				}
			    function isPromise(obj) {
				  	return 'function' == typeof obj.then;
				}
			    var arrayToPromise = function(obj) {
				  	return Promise.all(obj.map(toPromise, this));
				}
		    	var objectToPromise = function(obj){
				  var results = new obj.constructor();
				  var keys = Object.keys(obj);
				  var promises = [];
				  for (var i = 0; i < keys.length; i++) {
				    var key = keys[i];
				    var promise = toPromise.call(this, obj[key]);
				    if (promise && isPromise(promise)) defer(promise, key);
				    else results[key] = obj[key];
				  }
				  return Promise.all(promises).then(function () {
				    return results;
				  });
		
				  function defer(promise, key) {
				    // predefine the key in the result
				    results[key] = undefined;
				    promises.push(promise.then(function (res) {
				      results[key] = res;
				    }));
				  }
				}
				function isGeneratorFunction(obj) {
				  var constructor = obj.constructor;
				  if (!constructor) return false;
				  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
				  return isGenerator(constructor.prototype);
				}
				var thunkToPromise = this.thunkToPromise = function (fn) {
			        var self = this;
			        return new Promise(function (resolve, reject) {
			            fn.call(self, function (err, res) {
			                if (err) return reject(err);
			                if (arguments.length > 2) res = slice.call(arguments, 1);
			                resolve(res);
			            });
			        });
			    };
			    var functionToPromise = this.functionToPromise = function (fn) {
			        var self = this;
			        var args = slice.call(arguments, 1);
			        return thunkToPromise(function (cb) {
			            args.push(cb);
			            fn.apply(self, args);
			        });
			    };
				var toPromise = this.toPromise = function(obj) {
				  if (!obj) return obj;
				  if (isPromise(obj)) return obj;
				  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
				  if ('function' == typeof obj) return functionToPromise.apply(this, slice.call(arguments,0));
				  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
				  if (isObject(obj)) return objectToPromise.call(this, obj);
				  return obj;
				}
		
		
			    var latte_lib = require("../basic/lib.js");
				this.co = function(gen) {
					var ctx = this;
					var args = slice.call(arguments, 1);
					return new Promise(function(resolve, reject) {
						if(latte_lib.isFunction(gen)) {
							gen = gen.apply(ctx, args);
						}
						if(!gen || !latte_lib.isFunction(gen.next)) {
							return resolve(gen);
						}
						onFulfilled();
		
						function onFulfilled(res) {
							var ret ;
							try {
								ret = gen.next(res);
							}catch(e) {
								return reject(e);
							}
							next(ret);
						}
		
						function onRejected(err) {
							var ret ;
							try {
								ret = gen.throw(err);
							}catch(e) {
								return reject(e);
							}
							next(ret);
						}
		
						function next(ret) {
							if(ret.done) return resolve(ret.value);
							var value = toPromise.call(ctx, ret.value);
							if(value  && isPromise(value)) {
								return value.then(onFulfilled, onRejected);
							}
							return onRejected(new Error("You may only yield a function,promise, generator, array, or object, "+
								"but the following object was passwed: \"" + String(ret.value)+ "\""));
						}
					});
				};
		}).call(module.exports);
		
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/test/xhr.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		(function() {
				//class Request
				var latte_lib = require("../basic/lib.js");
				var events = require("../basic/events.js");
		
				var utils = {
					type: function(str) {
						return str.split(/ *; */).shift();
					},
					params: function(str) {
						return str.split(/ *; */).reduce(function(obj, str){
						    var parts = str.split(/ *= */);
						    var key = parts.shift();
						    var val = parts.shift();
		
						    if (key && val) obj[key] = val;
						    return obj;
						  }, {});
					},
					parseLinks: function(str) {
						return str.split(/ *, */).reduce(function(obj, str){
						    var parts = str.split(/ *; */);
						    var url = parts[0].slice(1, -1);
						    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
						    obj[rel] = url;
						    return obj;
					  	}, {});
					}
				};
				var Response;
				var STATUS_CODES = { '100': 'Continue',
				  '101': 'Switching Protocols',
				  '102': 'Processing',
				  '200': 'OK',
				  '201': 'Created',
				  '202': 'Accepted',
				  '203': 'Non-Authoritative Information',
				  '204': 'No Content',
				  '205': 'Reset Content',
				  '206': 'Partial Content',
				  '207': 'Multi-Status',
				  '208': 'Already Reported',
				  '226': 'IM Used',
				  '300': 'Multiple Choices',
				  '301': 'Moved Permanently',
				  '302': 'Found',
				  '303': 'See Other',
				  '304': 'Not Modified',
				  '305': 'Use Proxy',
				  '307': 'Temporary Redirect',
				  '308': 'Permanent Redirect',
				  '400': 'Bad Request',
				  '401': 'Unauthorized',
				  '402': 'Payment Required',
				  '403': 'Forbidden',
				  '404': 'Not Found',
				  '405': 'Method Not Allowed',
				  '406': 'Not Acceptable',
				  '407': 'Proxy Authentication Required',
				  '408': 'Request Timeout',
				  '409': 'Conflict',
				  '410': 'Gone',
				  '411': 'Length Required',
				  '412': 'Precondition Failed',
				  '413': 'Payload Too Large',
				  '414': 'URI Too Long',
				  '415': 'Unsupported Media Type',
				  '416': 'Range Not Satisfiable',
				  '417': 'Expectation Failed',
				  '418': 'I\'m a teapot',
				  '421': 'Misdirected Request',
				  '422': 'Unprocessable Entity',
				  '423': 'Locked',
				  '424': 'Failed Dependency',
				  '425': 'Unordered Collection',
				  '426': 'Upgrade Required',
				  '428': 'Precondition Required',
				  '429': 'Too Many Requests',
				  '431': 'Request Header Fields Too Large',
				  '451': 'Unavailable For Legal Reasons',
				  '500': 'Internal Server Error',
				  '501': 'Not Implemented',
				  '502': 'Bad Gateway',
				  '503': 'Service Unavailable',
				  '504': 'Gateway Timeout',
				  '505': 'HTTP Version Not Supported',
				  '506': 'Variant Also Negotiates',
				  '507': 'Insufficient Storage',
				  '508': 'Loop Detected',
				  '509': 'Bandwidth Limit Exceeded',
				  '510': 'Not Extended',
				  '511': 'Network Authentication Required'
				};
				var Request = function(method, url) {
					this.method = method;
					this.url = url;
					//对外保存的小写头属性
					this._headers = {};
					//保存原来header头属性
					this.headers = {};
				};
				latte_lib.extends(Request, events);
				(function() {
					var self = this;
					var setsMap = {
						type: "Content-type",
						accept: "Accept"
					};
					
					Object.keys(setsMap).forEach(function(i) {
						self[i] = function(type) {
							this.set(setsMap[i], request.types[type] || type);
							return this;
						};
					});
					//设置头文件
					this.set = this.setHeader= function(field, val) {
						if(latte_lib.isObject(field)) {
							for(var key in field) {
								this.set(key, field[key]);
							}
							return this;
						}
						this._headers[field.toLowerCase()] = val;
						this.headers[field] = val;
					}
					this.get  = this.getHeader = function(field) {
						this._headers[field.toLowerCase()];
					}
		
							var escape = function(str) {
			                  	return encodeURIComponent(str);
			              	}	
			              	var stringifyPrimitive = function(v) {
												
			                  	switch(typeof v) {
									case "string":
									return v;
									case "boolean":
									return v? "true": "false";
									case "number":
									return isFinite(v)? v: "";
									case "object":
									return JSON.stringify(v);
									default:
									return "";
			                  	}
			              	}
			              	var serialize  = function(obj, sep, eq) {
								sep = sep || "&";
								eq = eq || "=";
								if(obj === null) {
									obj = undefined;
								}
								if(typeof obj === "object") {
									return Object.keys(obj).map(function(k) {
										var ks = escape(stringifyPrimitive(k)) + eq;
										if(Array.isArray(obj[k])) {
											return ks + escape(JSON.stringify(obj[k]));
										} else {
											return ks + escape(stringifyPrimitive(obj[k]));
										}
									}).join(sep);
								}
			              	}
						var serialize = function() {
							if(!latte_lib.isObject(obj)) return obj;
							var pairs = [];
							for(var key in obj) {
								pushEncodeKeyValuePair(pairs, key, object[key]);
							}
							return pairs.join("&");
						}
					this.query = function(val) {
						if(!latte_lib.isString(val)) {
							val = serialize(val);
						}
						if(val) {
							this._query.push(val);
						}
						return this;
					}
		
					this.send = function(data) {
						var isObj = latte_lib.isObject(data);
						var type = this._headers["content-type"];
						if (this._formData) {
							console.error(".send() can't be used if .attach() or .field() is used. Please use only\
								 .send() or only .field() &.attach()");
						}
						if (isObj && !this._data) {
							if(Array.isArray(data)) {
								this._data = [];
							}else if(!this._isHost(data)){
								this._data = {};
							}
						}else if(data && this._data && this._isHost(this.data)) {
							throw Error("Can't merge these send calls");
						}
						if(isObj && latte_lib.isObject(this._data)) {
							for(var key in data) {
								this._data[key] = data[key];
							}
						}else if(latte_lib.isString(data)) {
							if(!type) {
								this.type("form");
							}
							type = this._headers["content-type"];
							if("application/x-www-form-urlencoded" == type) {
								this._data = this._data ? this._data + "&" + data : data;
							}else {
								this._data = (this._data || "") + data;
							}
						}else{
							this._data = data;
						}
						if(!isObj || this._isHost(data)) {
							return this;
						}
						if(!type) {
							this.type("json");
						}
						return this;
					}
					this.end = function(fn) {
						if(this._endCalled) {
							console.warn("Warning: .end() was called twice. This is not supported in superagent");
						}
						this._endCalled = true;
						this._callback = fn || noop;
						this._appendQueryString();
						return this._end();
					}
		
							var escape = function(str) {
			                  	return encodeURIComponent(str);
			              	}
			              	var stringifyPrimitive = function(v) {
													
								switch(typeof v) {
									case "string":
										return v;
									case "boolean":
										return v? "true": "false";
									case "number":
										return isFinite(v)? v: "";
									case "object":
										return JSON.stringify(v);
									default:
										return "";
								}
			              	}
						
		
					this._appendQueryString = function() {
						this._queryString = urlencode(this.qs);
		
					}
					this._setTimeouts = function() {
						var self = this;
						if(this._timeout && !this._timer) {
							this._timer = setTimeout(function() {
								self._timeoutError('Timeout of ', self._timeout, 'ETIME');
							}, this._timeout);
						}
						if(this._responseTimeout && !this._responseTimeoutTimer) {
							this._responseTimeoutTimer = setTimeout(function() {
								self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
							}, this._responseTimeout);
						}
					}
		
					this.callback = function(err, res) {
						if(this._maxRedirects && this._retries ++ < this._maxRedirects && shouldRetry(err, res)) {
							return this._retry();
						}
						var fn = this._callback || noop;
						this.clearTimeout();
						if(this.called) {
							return console.warn("superagent: double callback bug");
						}
						this.called = true;
						if(!err) {
							if(this._isResponseOK(res)) {
								return fn(err, res);
							}
							var msg = "Unsuccessful HTTP response";
							if(res) {
								msg = STATUS_CODES[res.status] || msg;
							}
							err = new Error(msg);
							err.status = res ? res.status : undefined;
						}
						err.response = res;
						if(this._maxRedirects) {
							err.retries = this._retries - 1;
						}
						if(err && this.hasListeners("error")) {
							this.emit("error", err);
						}
						fn(err, res);
					}
					this.clearTimeout = function() {
						clearTimeout(this._timer);
						clearTimeout(this._responseTimeout);
						delete this._timer;
						delete this._responseTimeoutTimer;
						return;
					}
					this._isResponseOK = function(res) {
						if(!res) {
							return false;
						}
						if(this._okCallback) {
							return this._okCallback(res);
						}
						return res.status >= 200 && res.status < 300;
					}
				}).call(Request.prototype);
			var urlencode = function(obj, sep, eq) {
				sep = sep || "&";
				eq = eq || "=";
				if(obj === null) {
					obj = undefined;
				}
				if(typeof obj === "object") {
					return Object.keys(obj).map(function(k) {
						var ks = escape(stringifyPrimitive(k)) + eq;
						if(Array.isArray(obj[k])) {
							return ks + escape(JSON.stringify(obj[k]));
						} else {
							return ks + escape(stringifyPrimitive(obj[k]));
						}
					}).join(sep);
				}
		  	}
			var request = function(method, url) {
				if(latte_lib.isFunction(url)) {
					return new Request("GET", method).end(url);
				}
				if(1 == arguments.length) {
					return new Request(method, url);
				}
				return new Request(method, url);
			};
			request.types = {
			  html: 'text/html',
			  json: 'application/json',
			  xml: 'application/xml',
			  urlencoded: 'application/x-www-form-urlencoded',
			  'form': 'application/x-www-form-urlencoded',
			  'form-data': 'application/x-www-form-urlencoded',
			  text:"text/plain"
			};
			var self = this;
			this.request = function(method, url, data, fn) {
				var req = request(method, url);
				if(latte_lib.isFunction(data)) {
					fn = data;
					data = null;
				}
				if(data) {
					req.send(data);
				}
				if(fn) {
					req.end(fn);
				}
				return req;
			};
			["HEAD","GET", "POST", "PUT","PATCH", "DELETE"].forEach(function(o) {
				self[o.toLocaleLowerCase()] = function() {
					var args = Array.prototype.concat.call([o], Array.prototype.slice.call(arguments, 0));
					return self.request.apply(self, args);
				};
			});
			var mimeTypeV = {
				isJSON: function(mime) {
					return /[\/+]json\b/.test(mime);
				},
				isText: function(mime) {
					var parts = mime.split('/');
					var type = parts[0];
					var subtype = parts[1];
		
					return 'text' == type
					|| 'x-www-form-urlencoded' == subtype;
				},
				isImageOrVide: function(mime) {
					var type = mime.split('/')[0];
		  			return 'image' == type || 'video' == type;
				}
			}
			var serializes = {
				"application/x-www-form-urlencoded": urlencode,
				"application/json" : JSON.stringify
			};
			function isRedirect(code) {
		  		return ~[301, 302, 303, 305, 307, 308].indexOf(code);
			};
			if(latte_lib.env == "web" ) {
				(function() {
						var getXHR = function() {
							return new XMLHttpRequest();
						}
						var trim = "".trim? function(s) {
							return s.trim();
						}: function(s) {
							return s.replace(/(^\s*|\s*$)/g, "");
						}
						var parses = {
							"application/x-www-form-urlencoded": urlencode,
							"application/json": JSON.parse
						}
						var parseHeader = function(str) {
							var lines = str.split(/\r?\n/);
							var fields = {};
							var index;
							var line;
							var field;
							var val;
							lines.pop();
							for(var i = 0, len = lines.length; i < len; ++i) {
								line = lines[i];
								index = line.indexOf(":");
								field = line.slice(0, index).toLowerCase();
								val = trim(line.slice(index + 1));
								fields[field] = val;
							}
							return fields;
						};
						Response = function(req) {
							this.req = req;
							this.xhr = this.req.xhr;
							this.text = ((this.req.method != "HEAD") && (this.xhr.responseType === "" || this.xhr.responseType === "text" || typeof this.xhr.responseType === 'undefined')) 
								? this.xhr.responseText : null;
							this.statusText = this.req.xhr.statusText;
							var status = this.xhr.status;
							if(status == 1223) {
								status = 204;
							}
							this._setStatusProperties(status);
							this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
							this.header["content-type"] = this.xhr.getResponseHeader("content-type");
							this._setHeaderProperties(this.header);
							if(null === this.text && req._responseType) {
								this.body = this.xhr.response;
							} else {
								this.body = this.req.method != "HEAD" ? 
									this._parseBody(this.text ? this.text : this.xhr.response) : null;
							}
						};
		
						(function() {
		
							this._parseBody = function(str) {
								var parse = parses[this.type];
								if(this.req._parser) {
									return this.req._parser(this, str);
								}
								if(!parse && mimeTypeV.isJSON(this.type)) {
									parse = parses["application/json"];
								}
								if(parse && str && (str.length || str instanceof Object)) {
									try {
										return parse(str)
									}catch(err) {
										if(parse == parses["application/json"]) {
											str = str.replace(/\[,/img,"[null,").replace(/,\]/img, ",null]").replace(/,,/igm,",null,").replace(/,,/img,",null,");
											return parse(str);
										}
									}
								}else{
									return null;
								}
								
								
		 					}
						}).call(Response.prototype);
					this._end = function() {
						var self = this;
						this.once("end", function() {
							var err = null;
							var res = null;
							try {
								res = new Response(self);
							}catch(err) {
								//err = new Error("Parser is unable to parse the response");
								err.parse = true;
								//err.original = e;
								if(self.xhr) {
									err.rawResponse = typeof self.xhr.responseType == "undefined" ? self.xhr.responseText : self.xhr.response;
									err.status = self.xhr.status ? self.xhr.status : null;
									err.statusCode = err.status;
								} else {
									err.rawResponse = null;
									err.status = null;
								}
								return self.callback(err);
							}
							self.emit("response", res);
							var new_err;
							try {
								if(!self._isResponseOK(res)) {
									new_err = new Error(res.statusText || "Unsuccessful HTTP response");
									new_err.original = err;
									new_err.response = res;
									new_err.status = res.status;
								}
							}catch(e) {
								new_err = e;
							}
							if(new_err) {
								self.callback(new_err, res);
							}else{
								self.callback(null, res);
							}
						});
						var xhr = this.xhr = getXHR();
						var data = this._formData || this._data;
						this._setTimeouts();
						xhr.onreadystatechange = function() {
							var readyState = xhr.readyState;
							if(readyState >= 2 && self._responseTimeoutTimer) {
								clearTimeout(self._responseTimeoutTimer);
							}
							if(4 != readyState) {
								return;
							}
							var status;
							try {
								status = xhr.status;
							}catch(e) {
								status = 0;
							}
							if(!status) {
								if(self.timeout || self._aborted) {
									return;
								}
								return self.crossDomainError();
							}
							self.emit("end");
						};
						var handleProgress = function(direction, e) {
							if(e.total > 0) {
								e.percent = e.loaded / e.total * 100;
							}
							e.direction = direction;
							self.emit("progress", e);
						}
						if(this.hasListeners("progress")) {
							try {
								xhr.onprogress = handleProgress.bind(null, "download");
								if(xhr.upload) {
									xhr.upload.onprogress = handleProgress.bind(null, "upload");
								}
							}catch(e) {
		
							}
						}
						try {
							if(this.username && this.password) {
								xhr.open(this.method, this.url, true, this.username, this.password);
							}else{
								xhr.open(this.method, this.url, true);
							}
						}catch(err) {
							return this.callback(err);
						}
						if(this._withCredentials) {
							xhr.withCredentials = true;
						}
						if(!this._formData && "GET" != this.method && "HEAD" != this.method 
								&& "string" != typeof data && !this._isHost(data)) {
							var contentType = this._headers["content-type"];
							var serialize = this._serializer || serializes[contentType ? contentType.split(";")[0]:""];
							if(!serialize && mimeTypeV.isJSON(contentType)) {
								serialize = serializes["application/json"];
							}
							if(serialize) {
								data = serialize(data);
							}
						}
						for(var field in this.headers) {
							if(null == this.headers[field]) {
								continue;
							}
		
							xhr.setRequestHeader(field, this.headers[field]);
						}
						if(this._responseType) {
							xhr.responseType = this._responseType;
						}
						this.emit("request", this);
						xhr.send(typeof data !== "undefined" ? data: null);
						return this;
					}
					this.crossDomainError = function() {
						var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
						err.crossDomain = true;
		
						err.status = this.status;
						err.method = this.method;
						err.url = this.url;
		
						this.callback(err);
					}
					this._isHost = function _isHost(obj) {
					  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
					  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
					}
				}).call(Request.prototype);
			}else{
				var binary = function(res, fn) {
					var data = [];
					res.on("data", function(chunk) {
						data.push(chunk);
					});
					res.on("end", function() {
						fn(null, Buffer.concat(data));
					});
				};
				var qs = require("querystring");
				var parses = {
					"application/x-www-form-urlencoded": function(res, fn) {
						res.text = "";
						res.setEncoding("ascii");
						res.on("data", function(chunk) {
							res.text += chunk;
		;				});
						res.on("end", function() {
							try {
								fn(null, qs.parse(res.text));
							}catch(err) {
								fn(err);
							}
						});
					},
					"application/json": function(res, fn) {
						res.text = "";
						res.setEncoding("utf8");
						res.on("data", function(chunk) {
							res.text += chunk;
						});
						res.on("end", function() {
							try {
								var body = res.text && JSON.parse(res.text);
							}catch(e) {
								var err = e;
								err. rawResponse = res.text || null;
								err.statusCode = res.statusCode;
							} finally {
								fn(err, body);
							}
						});
					},
					"text": function(res, fn) {
						res.text = "";
						res.setEncoding("utf8");
						res.on("data", function(chunk) {
							res.text += chunk;
						});
						res.on("end", fn);
					},
					"application/octet-stream": binary,
					"image": binary
				};
				(function() {
					var protocols = {
						"http:":require("http"),
						"https:": require("https")
					};
					Response = function(req) {
						
						var res = this.res = req.res;
						this.request = req;
						this.req = req.req;
						this.text = res.text;
						this.body = res.body != undefined ? res.body: {};
						this.header = this.headers = res.headers;
						this.files = res.files || {};
						this._setStatusProperties(res.statusCode);
						this._setHeaderProperties(this.header);
					};
					(function() {
						
						
					}).call(Response.prototype);
					this._emitResponse = function(body, files) {
						var response = new Response(this);
						this.response = response;
						response.redirects = this._redirectList;
						if(undefined !== body) {
							response.body = body;
						}
						response.files = files;
						this.emit("response", response);
						return response;
					}
					this.createReq = function() {
						if(this.req) {
							return this.req;
						}
						var self = this;
						var options = {};
						var url = this.url;
						var retres = this._retries;
						if( 0 != url.indexOf("http")) {
							url = "http://" + url;
						}
						url = require("url").parse(url);
						if(/^https?\+unix:/.test(url.protocol) === true) {
							url.protocol = url.protocol.split("+")[0] + ":";
							options.socketPath = unixParts[1].replace(/%2F/g, '/');
						 	url.pathname = unixParts[2];
						}
						options.method = this.method;
						options.port = url.port;
						options.path = url.pathname;
						options.host = url.hostname;
						options.ca = this._ca;
						options.key = this._key;
						options.pfx = this._pfx;
						options.cert = this._cert;
						options.agent = this._agent;
						var mod = protocols[url.protocol];
						var req = this.req = mod.request(options);
						if("HEAD" != options.method) {
							req.setHeader('Accept-Encoding', 'gzip, deflate');
						}
						this.protocol = url.protocol;
						this.host = url.host;
						req.once("drain", function() {
							self.emit('drain'); 
						});
						req.once("error", function(e) {
							if (self._aborted) return;
						    if (self._retries !== retries) return;
						    if (self.response) return;
						    self.callback(err);
						});
						if(url.auth) {
							var auth = url.auth.split(":");
							this.auth(auth[0], auth[1]);
						}
						//if(url.search) {
						//	this.query(url.search.substr(1));
						//}
						if(this.cookies) {
							req.setHeader('Cookie', this.cookies);
						}
						for(var key in this.headers) {
							req.setHeader(key, this.headers[key]);
						}
		
						try {
							this._appendQueryString(req);
						}catch(e) {
							return this.emit("error", e);
						}		
						return req;
					}
					this._shouldUnzip = function(res) {
						if (res.statusCode === 204 || res.statusCode === 304) {
						    // These aren't supposed to have any body
						    return false;
					  	}
					  	if("0" == res.headers["content-length"]) {
					  		return false;
					  	}
					  	return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
					}
					var URL = require("url");
					
					this._end = function() {
						var self = this;
						var data = this._data;
						this.createReq();
						var req = this.req;
						var buffer = this._buffer;
						var method = this.method;
						//设置定时器
						this._setTimeouts();
						//创建发送器
						
						//感觉这里可以放在end 函数里面
						//查看发送方式  不是head 和headerSent
						if ("HEAD" != method && !req.headerSent) {
							//判断data
							if(!latte_lib.isString(data)) {
								var contentType =  req.getHeader("Content-Type");
								if(contentType) {
									contentType = contentType.split(';')[0]
								}
								var serialize = serializes[contentType];
								if (!serialize && mimeTypeV.isJSON(contentType)) {
									serialize = serializes['application/json'];
								}
								if (serialize) data = serialize(data);
							}
							//设置length
							if(data && !req.getHeader("Content-Length")) {
								req.setHeader("Content-Length",  Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
							}
						}
						req.once("response", function(res) {
							if(self._responseTimeoutTimer) {
								clearTimeout(self._responseTimeoutTimer);
							}
		
							if(self.piped) {
								return;
							}
							//重定向次数
							var max = self._maxRedirects;
							//mime 类型
							var mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
							var type = mime.split("/")[0];
							var multipart = "multipart" == type;
							//判断是否为重定项
							var redirect = isRedirect(res.statusCode);
							//重定向
							if (redirect && self._redirects++ != max) {
								return self._redirect(res);
							}
							var parser = self._parser;
							if("HEAD" == self.method) {
								self.emit("end");
								self.callback(null, self._emitResponse());
							}
							//暂时不支持unzip
							//if(self._shouldUnzip(res)) {
							//	unzip(req, res);
							//}
							if(!parser) {
								if(this._responseType) {
									parser = parses.image;
									buffer = true;
								} else if (multipart) {
									var form = new formidable.IncomingForm();
									parser = form.parse.bind(form);
									buffer = true;
								} else if(mimeTypeV.isImageOrVide(mime)) {
									parser = parses.image;
									buffer = true;
								} else if(parses[mime]) {
									parser = parses[mime];
								} else if("text" == type) {
									parser = parses.text;
									buffer = (buffer !== false);
								} else if(mimeTypeV.isJSON(mime)) {
									parser = parses["application/json"];
									buffer = (buffer !== false);
								} else if(buffer) {
									parser = parses.text;
								}
							}
							//判断mime类型 设置buffer
							if(undefined === buffer && isText(mime)  || mimeTypeV.isJSON(mime)) {
								buffer = true;
							} 
		
							var parserHandlesEnd = false;
							if(parser) {
								try {
									parserHandlesEnd = buffer;
									//解析
									parser(res, function(err, obj, files) {
										if(self.timedout) {
											return;
										} 
										if(err && !self._aborted) {
											return self.callback(err);
										}
										if(parserHandlesEnd) {
											self.emit("end");
											self.callback(null, self._emitResponse(obj, files));
										}
									});
								}catch(err) {
									self.callback(err);
									return;
								}
							}
		
							self.res = res;
							if(!buffer) {
								self.callback(null, self._emitResponse());
								if(multipart) return;
								res.once("end", function() {
									self.emit("end");
								});
								return;
							}
							res.once("error", function(err) {
								self.callback(err, null);
							});
							if(!parserHandlesEnd) {
								res.once("end", function() {
									self.emit("end");
									self.callback(null, self._emitResponse());
								});
							}
						});
						this.emit("request", this);
						var formData = this._formData;
						//formData 是个对象 暂时还没弄清楚是个什么对象
						if(formData) {
							var headers = formData.getHeaders();
							for(var i in headers) {
								req.setHeader(i, headers[i]);
							}
							formData.getLength(function(err, length) {
								//设置content -length
								if("number" == typeof length) {
									req.setHeader("Content-Length", length);
								}
								var getProgressMonitor = function() {
									var lengthComputable = true;
									var total = req.getHeader("Content-Length");
									var loaded = 0;
									var progress = new Stream.Transform();
									progress._transform = function(chunk, encoding, cb) {
										loaded += chunk.length;
										self.emit("progress", {
											direction: "upload",
											lengthComputable: lengthComputable,
											loaded: loaded,
											total: total
										});
										cb(null, chunk);
									};
									return progress;
								};
								formData.pipe(getProgressMonitor()).pipe(req);
							});
		
						}else {
							req.end(data);
						}
					}	
		
				}).call(Request.prototype);
			};	
			(function() {
				this._setHeaderProperties = function(header) {
					
					var ct = header["content-type"] || "";
					this.type = utils.type(ct);
					var params = utils.params(ct);
					for(var key in params) {
						this[key] = params[key];
					}
					this.links = {};
					try {
						if(header.link) {
							this.links = utils.parseLinks(header.link);
						}
					}catch(err) {
		
					}
				}
				this._setStatusProperties = function(status){
				    var type = status / 100 | 0;
		
				    // status / class
				    this.status = this.statusCode = status;
				    this.statusType = type;
		
				    // basics
				    this.info = 1 == type;
				    this.ok = 2 == type;
				    this.redirect = 3 == type;
				    this.clientError = 4 == type;
				    this.serverError = 5 == type;
				    this.error = (4 == type || 5 == type)
				        ? this.toError()
				        : false;
		
				    // sugar
				    this.accepted = 202 == status;
				    this.noContent = 204 == status;
				    this.badRequest = 400 == status;
				    this.unauthorized = 401 == status;
				    this.notAcceptable = 406 == status;
				    this.forbidden = 403 == status;
				    this.notFound = 404 == status;
				};
				this.toError = function(){
				  var req = this.req;
				  var method = req.method;
				  var url = req.url;
		
				  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
				  var err = new Error(msg);
				  err.status = this.status;
				  err.method = method;
				  err.url = url;
		
				  return err;
				};
			}).call(Response.prototype);
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });