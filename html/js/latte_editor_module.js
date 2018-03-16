

(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/coffee/coffee_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		    var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		    oop.inherits(CoffeeHighlightRules, TextHighlightRules);
		
		    function CoffeeHighlightRules() {
		        var identifier = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*";
		
		        var keywords = (
		            "this|throw|then|try|typeof|super|switch|return|break|by|continue|" +
		            "catch|class|in|instanceof|is|isnt|if|else|extends|for|own|" +
		            "finally|function|while|when|new|no|not|delete|debugger|do|loop|of|off|" +
		            "or|on|unless|until|and|yes"
		        );
		
		        var langConstant = (
		            "true|false|null|undefined|NaN|Infinity"
		        );
		
		        var illegal = (
		            "case|const|default|function|var|void|with|enum|export|implements|" +
		            "interface|let|package|private|protected|public|static|yield"
		        );
		
		        var supportClass = (
		            "Array|Boolean|Date|Function|Number|Object|RegExp|ReferenceError|String|" +
		            "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|" +
		            "SyntaxError|TypeError|URIError|"  +
		            "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|" +
		            "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray"
		        );
		
		        var supportFunction = (
		            "Math|JSON|isNaN|isFinite|parseInt|parseFloat|encodeURI|" +
		            "encodeURIComponent|decodeURI|decodeURIComponent|String|"
		        );
		
		        var variableLanguage = (
		            "window|arguments|prototype|document"
		        );
		
		        var keywordMapper = this.createKeywordMapper({
		            "keyword": keywords,
		            "constant.language": langConstant,
		            "invalid.illegal": illegal,
		            "language.support.class": supportClass,
		            "language.support.function": supportFunction,
		            "variable.language": variableLanguage
		        }, "identifier");
		
		        var functionRule = {
		            token: ["paren.lparen", "variable.parameter", "paren.rparen", "text", "storage.type"],
		            regex: /(?:(\()((?:"[^")]*?"|'[^')]*?'|\/[^\/)]*?\/|[^()"'\/])*?)(\))(\s*))?([\-=]>)/.source
		        };
		
		        var stringEscape = /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|[0-2][0-7]{0,2}|3[0-6][0-7]?|37[0-7]?|[4-7][0-7]?|.)/;
		
		        this.$rules = {
		            start : [
		                {
		                    token : "constant.numeric",
		                    regex : "(?:0x[\\da-fA-F]+|(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:[eE][+-]?\\d+)?)"
		                }, {
		                    stateName: "qdoc",
		                    token : "string", regex : "'''", next : [
		                        {token : "string", regex : "'''", next : "start"},
		                        {token : "constant.language.escape", regex : stringEscape},
		                        {defaultToken: "string"}
		                    ]
		                }, {
		                    stateName: "qqdoc",
		                    token : "string",
		                    regex : '"""',
		                    next : [
		                        {token : "string", regex : '"""', next : "start"},
		                        {token : "paren.string", regex : '#{', push : "start"},
		                        {token : "constant.language.escape", regex : stringEscape},
		                        {defaultToken: "string"}
		                    ]
		                }, {
		                    stateName: "qstring",
		                    token : "string", regex : "'", next : [
		                        {token : "string", regex : "'", next : "start"},
		                        {token : "constant.language.escape", regex : stringEscape},
		                        {defaultToken: "string"}
		                    ]
		                }, {
		                    stateName: "qqstring",
		                    token : "string.start", regex : '"', next : [
		                        {token : "string.end", regex : '"', next : "start"},
		                        {token : "paren.string", regex : '#{', push : "start"},
		                        {token : "constant.language.escape", regex : stringEscape},
		                        {defaultToken: "string"}
		                    ]
		                }, {
		                    stateName: "js",
		                    token : "string", regex : "`", next : [
		                        {token : "string", regex : "`", next : "start"},
		                        {token : "constant.language.escape", regex : stringEscape},
		                        {defaultToken: "string"}
		                    ]
		                }, {
		                    regex: "[{}]", onMatch: function(val, state, stack) {
		                        this.next = "";
		                        if (val == "{" && stack.length) {
		                            stack.unshift("start", state);
		                            return "paren";
		                        }
		                        if (val == "}" && stack.length) {
		                            stack.shift();
		                            this.next = stack.shift() || "";
		                            if (this.next.indexOf("string") != -1)
		                                return "paren.string";
		                        }
		                        return "paren";
		                    }
		                }, {
		                    token : "string.regex",
		                    regex : "///",
		                    next : "heregex"
		                }, {
		                    token : "string.regex",
		                    regex : /(?:\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)(?:[imgy]{0,4})(?!\w)/
		                }, {
		                    token : "comment",
		                    regex : "###(?!#)",
		                    next : "comment"
		                }, {
		                    token : "comment",
		                    regex : "#.*"
		                }, {
		                    token : ["punctuation.operator", "text", "identifier"],
		                    regex : "(\\.)(\\s*)(" + illegal + ")"
		                }, {
		                    token : "punctuation.operator",
		                    regex : "\\.{1,3}"
		                }, {
		                    //class A extends B
		                    token : ["keyword", "text", "language.support.class",
		                     "text", "keyword", "text", "language.support.class"],
		                    regex : "(class)(\\s+)(" + identifier + ")(?:(\\s+)(extends)(\\s+)(" + identifier + "))?"
		                }, {
		                    //play = (...) ->
		                    token : ["entity.name.function", "text", "keyword.operator", "text"].concat(functionRule.token),
		                    regex : "(" + identifier + ")(\\s*)([=:])(\\s*)" + functionRule.regex
		                }, 
		                functionRule, 
		                {
		                    token : "variable",
		                    regex : "@(?:" + identifier + ")?"
		                }, {
		                    token: keywordMapper,
		                    regex : identifier
		                }, {
		                    token : "punctuation.operator",
		                    regex : "\\,|\\."
		                }, {
		                    token : "storage.type",
		                    regex : "[\\-=]>"
		                }, {
		                    token : "keyword.operator",
		                    regex : "(?:[-+*/%<>&|^!?=]=|>>>=?|\\-\\-|\\+\\+|::|&&=|\\|\\|=|<<=|>>=|\\?\\.|\\.{2,3}|[!*+-=><])"
		                }, {
		                    token : "paren.lparen",
		                    regex : "[({[]"
		                }, {
		                    token : "paren.rparen",
		                    regex : "[\\]})]"
		                }, {
		                    token : "text",
		                    regex : "\\s+"
		                }],
		
		
		            heregex : [{
		                token : "string.regex",
		                regex : '.*?///[imgy]{0,4}',
		                next : "start"
		            }, {
		                token : "comment.regex",
		                regex : "\\s+(?:#.*)?"
		            }, {
		                token : "string.regex",
		                regex : "\\S+"
		            }],
		
		            comment : [{
		                token : "comment",
		                regex : '###',
		                next : "start"
		            }, {
		                defaultToken : "comment"
		            }]
		        };
		        this.normalizeRules();
		    }
		
		    exports.CoffeeHighlightRules = CoffeeHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/coffee/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var Rules = require("./coffee_highlight_rules").CoffeeHighlightRules;
		var Outdent = require("../matching_brace_outdent").MatchingBraceOutdent;
		var FoldMode = require("../folding/coffee").FoldMode;
		var Range = require("../../range").Range;
		var TextMode = require("../text").Mode;
		var WorkerClient = require("../../worker/worker_client").WorkerClient;
		var oop = require("../../lib/oop");
		
		function Mode() {
		    this.HighlightRules = Rules;
		    this.$outdent = new Outdent();
		    this.foldingRules = new FoldMode();
		}
		
		oop.inherits(Mode, TextMode);
		
		(function() {
		    
		    /*:
		      [({[=:]        # Opening parentheses or brackets
		     |[-=]>          # OR single or double arrow
		     |\b(?:          # OR one of these words:
		       else          #    else
		      |try           # OR try
		      |(?:swi|ca)tch # OR catch, optionally followed by:
		        (?:\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)?  # a variable
		      |finally       # OR finally
		     ))\s*$          # all as the last thing on a line (allowing trailing space)
		    |                # ---- OR ---- :
		    ^\s*             # a line starting with optional space
		    (else\b\s*)?     # followed by an optional "else"
		    (?:              # followed by one of the following:
		       if            #    if
		      |for           # OR for
		      |while         # OR while
		      |loop          # OR loop
		    )\b              #    (as a word)
		    (?!.*\bthen\b)   # ... but NOT followed by "then" on the line
		    */
		    var indenter = /(?:[({[=:]|[-=]>|\b(?:else|try|(?:swi|ca)tch(?:\s+[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)?|finally))\s*$|^\s*(else\b\s*)?(?:if|for|while|loop)\b(?!.*\bthen\b)/;
		    
		    this.lineCommentStart = "#";
		    this.blockComment = {start: "###", end: "###"};
		    
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
		    
		        if (!(tokens.length && tokens[tokens.length - 1].type === 'comment') &&
		            state === 'start' && indenter.test(line))
		            indent += tab;
		        return indent;
		    };
		    
		    this.checkOutdent = function(state, line, input) {
		        return this.$outdent.checkOutdent(line, input);
		    };
		    
		    this.autoOutdent = function(state, doc, row) {
		        this.$outdent.autoOutdent(doc, row);
		    };
		    
		    this.createWorker = function(session) {
		        var worker = new WorkerClient(["ace"], "ace/mode/coffee_worker", "Worker");
		        worker.attachToDocument(session.getDocument());
		        
		        worker.on("annotate", function(e) {
		            session.setAnnotations(e.data);
		        });
		        
		        worker.on("terminate", function() {
		            session.clearAnnotations();
		        });
		        
		        return worker;
		    };
		
		    this.$id = "ace/mode/coffee";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/css/css_completions.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var propertyMap = {
		    "background": {"#$0": 1},
		    "background-color": {"#$0": 1, "transparent": 1, "fixed": 1},
		    "background-image": {"url('/$0')": 1},
		    "background-repeat": {"repeat": 1, "repeat-x": 1, "repeat-y": 1, "no-repeat": 1, "inherit": 1},
		    "background-position": {"bottom":2, "center":2, "left":2, "right":2, "top":2, "inherit":2},
		    "background-attachment": {"scroll": 1, "fixed": 1},
		    "background-size": {"cover": 1, "contain": 1},
		    "background-clip": {"border-box": 1, "padding-box": 1, "content-box": 1},
		    "background-origin": {"border-box": 1, "padding-box": 1, "content-box": 1},
		    "border": {"solid $0": 1, "dashed $0": 1, "dotted $0": 1, "#$0": 1},
		    "border-color": {"#$0": 1},
		    "border-style": {"solid":2, "dashed":2, "dotted":2, "double":2, "groove":2, "hidden":2, "inherit":2, "inset":2, "none":2, "outset":2, "ridged":2},
		    "border-collapse": {"collapse": 1, "separate": 1},
		    "bottom": {"px": 1, "em": 1, "%": 1},
		    "clear": {"left": 1, "right": 1, "both": 1, "none": 1},
		    "color": {"#$0": 1, "rgb(#$00,0,0)": 1},
		    "cursor": {"default": 1, "pointer": 1, "move": 1, "text": 1, "wait": 1, "help": 1, "progress": 1, "n-resize": 1, "ne-resize": 1, "e-resize": 1, "se-resize": 1, "s-resize": 1, "sw-resize": 1, "w-resize": 1, "nw-resize": 1},
		    "display": {"none": 1, "block": 1, "inline": 1, "inline-block": 1, "table-cell": 1},
		    "empty-cells": {"show": 1, "hide": 1},
		    "float": {"left": 1, "right": 1, "none": 1},
		    "font-family": {"Arial":2,"Comic Sans MS":2,"Consolas":2,"Courier New":2,"Courier":2,"Georgia":2,"Monospace":2,"Sans-Serif":2, "Segoe UI":2,"Tahoma":2,"Times New Roman":2,"Trebuchet MS":2,"Verdana": 1},
		    "font-size": {"px": 1, "em": 1, "%": 1},
		    "font-weight": {"bold": 1, "normal": 1},
		    "font-style": {"italic": 1, "normal": 1},
		    "font-variant": {"normal": 1, "small-caps": 1},
		    "height": {"px": 1, "em": 1, "%": 1},
		    "left": {"px": 1, "em": 1, "%": 1},
		    "letter-spacing": {"normal": 1},
		    "line-height": {"normal": 1},
		    "list-style-type": {"none": 1, "disc": 1, "circle": 1, "square": 1, "decimal": 1, "decimal-leading-zero": 1, "lower-roman": 1, "upper-roman": 1, "lower-greek": 1, "lower-latin": 1, "upper-latin": 1, "georgian": 1, "lower-alpha": 1, "upper-alpha": 1},
		    "margin": {"px": 1, "em": 1, "%": 1},
		    "margin-right": {"px": 1, "em": 1, "%": 1},
		    "margin-left": {"px": 1, "em": 1, "%": 1},
		    "margin-top": {"px": 1, "em": 1, "%": 1},
		    "margin-bottom": {"px": 1, "em": 1, "%": 1},
		    "max-height": {"px": 1, "em": 1, "%": 1},
		    "max-width": {"px": 1, "em": 1, "%": 1},
		    "min-height": {"px": 1, "em": 1, "%": 1},
		    "min-width": {"px": 1, "em": 1, "%": 1},
		    "overflow": {"hidden": 1, "visible": 1, "auto": 1, "scroll": 1},
		    "overflow-x": {"hidden": 1, "visible": 1, "auto": 1, "scroll": 1},
		    "overflow-y": {"hidden": 1, "visible": 1, "auto": 1, "scroll": 1},
		    "padding": {"px": 1, "em": 1, "%": 1},
		    "padding-top": {"px": 1, "em": 1, "%": 1},
		    "padding-right": {"px": 1, "em": 1, "%": 1},
		    "padding-bottom": {"px": 1, "em": 1, "%": 1},
		    "padding-left": {"px": 1, "em": 1, "%": 1},
		    "page-break-after": {"auto": 1, "always": 1, "avoid": 1, "left": 1, "right": 1},
		    "page-break-before": {"auto": 1, "always": 1, "avoid": 1, "left": 1, "right": 1},
		    "position": {"absolute": 1, "relative": 1, "fixed": 1, "static": 1},
		    "right": {"px": 1, "em": 1, "%": 1},
		    "table-layout": {"fixed": 1, "auto": 1},
		    "text-decoration": {"none": 1, "underline": 1, "line-through": 1, "blink": 1},
		    "text-align": {"left": 1, "right": 1, "center": 1, "justify": 1},
		    "text-transform": {"capitalize": 1, "uppercase": 1, "lowercase": 1, "none": 1},
		    "top": {"px": 1, "em": 1, "%": 1},
		    "vertical-align": {"top": 1, "bottom": 1},
		    "visibility": {"hidden": 1, "visible": 1},
		    "white-space": {"nowrap": 1, "normal": 1, "pre": 1, "pre-line": 1, "pre-wrap": 1},
		    "width": {"px": 1, "em": 1, "%": 1},
		    "word-spacing": {"normal": 1},
		
		    // opacity
		    "filter": {"alpha(opacity=$0100)": 1},
		
		    "text-shadow": {"$02px 2px 2px #777": 1},
		    "text-overflow": {"ellipsis-word": 1, "clip": 1, "ellipsis": 1},
		
		    // border radius
		    "-moz-border-radius": 1,
		    "-moz-border-radius-topright": 1,
		    "-moz-border-radius-bottomright": 1,
		    "-moz-border-radius-topleft": 1,
		    "-moz-border-radius-bottomleft": 1,
		    "-webkit-border-radius": 1,
		    "-webkit-border-top-right-radius": 1,
		    "-webkit-border-top-left-radius": 1,
		    "-webkit-border-bottom-right-radius": 1,
		    "-webkit-border-bottom-left-radius": 1,
		
		    // dropshadows
		    "-moz-box-shadow": 1,
		    "-webkit-box-shadow": 1,
		
		    // transformations
		    "transform": {"rotate($00deg)": 1, "skew($00deg)": 1},
		    "-moz-transform": {"rotate($00deg)": 1, "skew($00deg)": 1},
		    "-webkit-transform": {"rotate($00deg)": 1, "skew($00deg)": 1 }
		};
		
		var CssCompletions = function() {
		
		};
		
		(function() {
		
		    this.completionsDefined = false;
		
		    this.defineCompletions = function() {
		        //fill in missing properties
		        if (document) {
		            var style = document.createElement('c').style;
		
		            for (var i in style) {
		                if (typeof style[i] !== 'string')
		                    continue;
		
		                var name = i.replace(/[A-Z]/g, function(x) {
		                    return '-' + x.toLowerCase();
		                });
		
		                if (!propertyMap.hasOwnProperty(name))
		                    propertyMap[name] = 1;
		            }
		        }
		
		        this.completionsDefined = true;
		    }
		
		    this.getCompletions = function(state, session, pos, prefix) {
		        if (!this.completionsDefined) {
		            this.defineCompletions();
		        }
		
		        var token = session.getTokenAt(pos.row, pos.column);
		
		        if (!token)
		            return [];
		        if (state==='ruleset'){
		            //css attribute value
		            var line = session.getLine(pos.row).substr(0, pos.column);
		            if (/:[^;]+$/.test(line)) {
		                /([\w\-]+):[^:]*$/.test(line);
		
		                return this.getPropertyValueCompletions(state, session, pos, prefix);
		            } else {
		                return this.getPropertyCompletions(state, session, pos, prefix);
		            }
		        }
		
		        return [];
		    };
		
		    this.getPropertyCompletions = function(state, session, pos, prefix) {
		        var properties = Object.keys(propertyMap);
		        return properties.map(function(property){
		            return {
		                caption: property,
		                snippet: property + ': $0',
		                meta: "property",
		                score: Number.MAX_VALUE
		            };
		        });
		    };
		
		    this.getPropertyValueCompletions = function(state, session, pos, prefix) {
		        var line = session.getLine(pos.row).substr(0, pos.column);
		        var property = (/([\w\-]+):[^:]*$/.exec(line) || {})[1];
		
		        if (!property)
		            return [];
		        var values = [];
		        if (property in propertyMap && typeof propertyMap[property] === "object") {
		            values = Object.keys(propertyMap[property]);
		        }
		        return values.map(function(value){
		            return {
		                caption: value,
		                snippet: value,
		                meta: "property value",
		                score: Number.MAX_VALUE
		            };
		        });
		    };
		
		}).call(CssCompletions.prototype);
		
		exports.CssCompletions = CssCompletions;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/css/css_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var lang = require("../../lib/lang");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		
		/* Exports are for Stylus and Less highlighters */
		var supportType = exports.supportType = "align-content|align-items|align-self|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|border|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-collapse|border-color|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-shadow|box-sizing|caption-side|clear|clip|color|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|content|counter-increment|counter-reset|cursor|direction|display|empty-cells|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|font|font-family|font-size|font-size-adjust|font-stretch|font-style|font-variant|font-weight|hanging-punctuation|height|justify-content|left|letter-spacing|line-height|list-style|list-style-image|list-style-position|list-style-type|margin|margin-bottom|margin-left|margin-right|margin-top|max-height|max-width|min-height|min-width|nav-down|nav-index|nav-left|nav-right|nav-up|opacity|order|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-x|overflow-y|padding|padding-bottom|padding-left|padding-right|padding-top|page-break-after|page-break-before|page-break-inside|perspective|perspective-origin|position|quotes|resize|right|tab-size|table-layout|text-align|text-align-last|text-decoration|text-decoration-color|text-decoration-line|text-decoration-style|text-indent|text-justify|text-overflow|text-shadow|text-transform|top|transform|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|unicode-bidi|vertical-align|visibility|white-space|width|word-break|word-spacing|word-wrap|z-index";
		var supportFunction = exports.supportFunction = "rgb|rgba|url|attr|counter|counters";
		var supportConstant = exports.supportConstant = "absolute|after-edge|after|all-scroll|all|alphabetic|always|antialiased|armenian|auto|avoid-column|avoid-page|avoid|balance|baseline|before-edge|before|below|bidi-override|block-line-height|block|bold|bolder|border-box|both|bottom|box|break-all|break-word|capitalize|caps-height|caption|center|central|char|circle|cjk-ideographic|clone|close-quote|col-resize|collapse|column|consider-shifts|contain|content-box|cover|crosshair|cubic-bezier|dashed|decimal-leading-zero|decimal|default|disabled|disc|disregard-shifts|distribute-all-lines|distribute-letter|distribute-space|distribute|dotted|double|e-resize|ease-in|ease-in-out|ease-out|ease|ellipsis|end|exclude-ruby|fill|fixed|georgian|glyphs|grid-height|groove|hand|hanging|hebrew|help|hidden|hiragana-iroha|hiragana|horizontal|icon|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space|ideographic|inactive|include-ruby|inherit|initial|inline-block|inline-box|inline-line-height|inline-table|inline|inset|inside|inter-ideograph|inter-word|invert|italic|justify|katakana-iroha|katakana|keep-all|last|left|lighter|line-edge|line-through|line|linear|list-item|local|loose|lower-alpha|lower-greek|lower-latin|lower-roman|lowercase|lr-tb|ltr|mathematical|max-height|max-size|medium|menu|message-box|middle|move|n-resize|ne-resize|newspaper|no-change|no-close-quote|no-drop|no-open-quote|no-repeat|none|normal|not-allowed|nowrap|nw-resize|oblique|open-quote|outset|outside|overline|padding-box|page|pointer|pre-line|pre-wrap|pre|preserve-3d|progress|relative|repeat-x|repeat-y|repeat|replaced|reset-size|ridge|right|round|row-resize|rtl|s-resize|scroll|se-resize|separate|slice|small-caps|small-caption|solid|space|square|start|static|status-bar|step-end|step-start|steps|stretch|strict|sub|super|sw-resize|table-caption|table-cell|table-column-group|table-column|table-footer-group|table-header-group|table-row-group|table-row|table|tb-rl|text-after-edge|text-before-edge|text-bottom|text-size|text-top|text|thick|thin|transparent|underline|upper-alpha|upper-latin|upper-roman|uppercase|use-script|vertical-ideographic|vertical-text|visible|w-resize|wait|whitespace|z-index|zero";
		var supportConstantColor = exports.supportConstantColor = "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen";
		var supportConstantFonts = exports.supportConstantFonts = "arial|century|comic|courier|cursive|fantasy|garamond|georgia|helvetica|impact|lucida|symbol|system|tahoma|times|trebuchet|utopia|verdana|webdings|sans-serif|serif|monospace";
		
		var numRe = exports.numRe = "\\-?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))";
		var pseudoElements = exports.pseudoElements = "(\\:+)\\b(after|before|first-letter|first-line|moz-selection|selection)\\b";
		var pseudoClasses  = exports.pseudoClasses =  "(:)\\b(active|checked|disabled|empty|enabled|first-child|first-of-type|focus|hover|indeterminate|invalid|last-child|last-of-type|link|not|nth-child|nth-last-child|nth-last-of-type|nth-of-type|only-child|only-of-type|required|root|target|valid|visited)\\b";
		
		var CssHighlightRules = function() {
		
		    var keywordMapper = this.createKeywordMapper({
		        "support.function": supportFunction,
		        "support.constant": supportConstant,
		        "support.type": supportType,
		        "support.constant.color": supportConstantColor,
		        "support.constant.fonts": supportConstantFonts
		    }, "text", true);
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    this.$rules = {
		        "start" : [{
		            include : ["strings", "url", "comments"]
		        }, {
		            token: "paren.lparen",
		            regex: "\\{",
		            next:  "ruleset"
		        }, {
		            token: "paren.rparen",
		            regex: "\\}"
		        }, {
		            token: "string",
		            regex: "@",
		            next:  "media"
		        }, {
		            token: "keyword",
		            regex: "#[a-z0-9-_]+"
		        }, {
		            token: "keyword",
		            regex: "%"
		        }, {
		            token: "variable",
		            regex: "\\.[a-z0-9-_]+"
		        }, {
		            token: "string",
		            regex: ":[a-z0-9-_]+"
		        }, {
		            token : "constant.numeric",
		            regex : numRe
		        }, {
		            token: "constant",
		            regex: "[a-z0-9-_]+"
		        }, {
		            caseInsensitive: true
		        }],
		        
		        "media": [{
		            include : ["strings", "url", "comments"]
		        }, {
		            token: "paren.lparen",
		            regex: "\\{",
		            next:  "start"
		        }, {
		            token: "paren.rparen",
		            regex: "\\}",
		            next:  "start"
		        }, {
		            token: "string",
		            regex: ";",
		            next:  "start"
		        }, {
		            token: "keyword",
		            regex: "(?:media|supports|document|charset|import|namespace|media|supports|document"
		                + "|page|font|keyframes|viewport|counter-style|font-feature-values"
		                + "|swash|ornaments|annotation|stylistic|styleset|character-variant)"
		        }],
		
		        "comments" : [{
		            token: "comment", // multi line comment
		            regex: "\\/\\*",
		            push: [{
		                token : "comment",
		                regex : "\\*\\/",
		                next : "pop"
		            }, {
		                defaultToken : "comment"
		            }]
		        }],
		
		        "ruleset" : [{
		            regex : "-(webkit|ms|moz|o)-",
		            token : "text"
		        }, {
		            token : "paren.rparen",
		            regex : "\\}",
		            next : "start"
		        }, {
		            include : ["strings", "url", "comments"]
		        }, {
		            token : ["constant.numeric", "keyword"],
		            regex : "(" + numRe + ")(ch|cm|deg|em|ex|fr|gd|grad|Hz|in|kHz|mm|ms|pc|pt|px|rad|rem|s|turn|vh|vm|vw|%)"
		        }, {
		            token : "constant.numeric",
		            regex : numRe
		        }, {
		            token : "constant.numeric",  // hex6 color
		            regex : "#[a-f0-9]{6}"
		        }, {
		            token : "constant.numeric", // hex3 color
		            regex : "#[a-f0-9]{3}"
		        }, {
		            token : ["punctuation", "entity.other.attribute-name.pseudo-element.css"],
		            regex : pseudoElements
		        }, {
		            token : ["punctuation", "entity.other.attribute-name.pseudo-class.css"],
		            regex : pseudoClasses
		        }, {
		            include: "url"
		        }, {
		            token : keywordMapper,
		            regex : "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*"
		        }, {
		            caseInsensitive: true
		        }],
		        
		        url: [{
		            token : "support.function",
		            regex : "(?:url(:?-prefix)?|domain|regexp)\\(",
		            push: [{
		                token : "support.function",
		                regex : "\\)",
		                next : "pop"
		            }, {
		                defaultToken: "string"
		            }]
		        }],
		        
		        strings: [{
		            token : "string.start",
		            regex : "'",
		            push : [{
		                token : "string.end",
		                regex : "'|$",
		                next: "pop"
		            }, {
		                include : "escapes"
		            }, {
		                token : "constant.language.escape",
		                regex : /\\$/,
		                consumeLineEnd: true
		            }, {
		                defaultToken: "string"
		            }]
		        }, {
		            token : "string.start",
		            regex : '"',
		            push : [{
		                token : "string.end",
		                regex : '"|$',
		                next: "pop"
		            }, {
		                include : "escapes"
		            }, {
		                token : "constant.language.escape",
		                regex : /\\$/,
		                consumeLineEnd: true
		            }, {
		                defaultToken: "string"
		            }]
		        }],
		        escapes: [{
		            token : "constant.language.escape",
		            regex : /\\([a-fA-F\d]{1,6}|[^a-fA-F\d])/
		        }]
		        
		    };
		
		    this.normalizeRules();
		};
		
		oop.inherits(CssHighlightRules, TextHighlightRules);
		
		exports.CssHighlightRules = CssHighlightRules;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/css/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var CssHighlightRules = require("./css_highlight_rules").CssHighlightRules;
		var MatchingBraceOutdent = require("../matching_brace_outdent").MatchingBraceOutdent;
		var WorkerClient = require("../../worker/worker_client").WorkerClient;
		var CssCompletions = require("./css_completions").CssCompletions;
		var CssBehaviour = require("../behaviour/css").CssBehaviour;
		var CStyleFoldMode = require("../folding/cstyle").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = CssHighlightRules;
		    this.$outdent = new MatchingBraceOutdent();
		    this.$behaviour = new CssBehaviour();
		    this.$completer = new CssCompletions();
		    this.foldingRules = new CStyleFoldMode();
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.foldingRules = "cStyle";
		    this.blockComment = {start: "/*", end: "*/"};
		
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		
		        // ignore braces in comments
		        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
		        if (tokens.length && tokens[tokens.length-1].type == "comment") {
		            return indent;
		        }
		
		        var match = line.match(/^.*\{\s*$/);
		        if (match) {
		            indent += tab;
		        }
		
		        return indent;
		    };
		
		    this.checkOutdent = function(state, line, input) {
		        return this.$outdent.checkOutdent(line, input);
		    };
		
		    this.autoOutdent = function(state, doc, row) {
		        this.$outdent.autoOutdent(doc, row);
		    };
		
		    this.getCompletions = function(state, session, pos, prefix) {
		        return this.$completer.getCompletions(state, session, pos, prefix);
		    };
		
		    this.createWorker = function(session) {
		        var worker = new WorkerClient(["ace"], "ace/mode/css_worker", "Worker");
		        worker.attachToDocument(session.getDocument());
		
		        worker.on("annotate", function(e) {
		            session.setAnnotations(e.data);
		        });
		
		        worker.on("terminate", function() {
		            session.clearAnnotations();
		        });
		
		        return worker;
		    };
		
		    this.$id = "ace/mode/css";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/html/html_completions.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var TokenIterator = require("../../token_iterator").TokenIterator;
		
		var commonAttributes = [
		    "accesskey",
		    "class",
		    "contenteditable",
		    "contextmenu",
		    "dir",
		    "draggable",
		    "dropzone",
		    "hidden",
		    "id",
		    "inert",
		    "itemid",
		    "itemprop",
		    "itemref",
		    "itemscope",
		    "itemtype",
		    "lang",
		    "spellcheck",
		    "style",
		    "tabindex",
		    "title",
		    "translate"
		];
		
		var eventAttributes = [
		    "onabort",
		    "onblur",
		    "oncancel",
		    "oncanplay",
		    "oncanplaythrough",
		    "onchange",
		    "onclick",
		    "onclose",
		    "oncontextmenu",
		    "oncuechange",
		    "ondblclick",
		    "ondrag",
		    "ondragend",
		    "ondragenter",
		    "ondragleave",
		    "ondragover",
		    "ondragstart",
		    "ondrop",
		    "ondurationchange",
		    "onemptied",
		    "onended",
		    "onerror",
		    "onfocus",
		    "oninput",
		    "oninvalid",
		    "onkeydown",
		    "onkeypress",
		    "onkeyup",
		    "onload",
		    "onloadeddata",
		    "onloadedmetadata",
		    "onloadstart",
		    "onmousedown",
		    "onmousemove",
		    "onmouseout",
		    "onmouseover",
		    "onmouseup",
		    "onmousewheel",
		    "onpause",
		    "onplay",
		    "onplaying",
		    "onprogress",
		    "onratechange",
		    "onreset",
		    "onscroll",
		    "onseeked",
		    "onseeking",
		    "onselect",
		    "onshow",
		    "onstalled",
		    "onsubmit",
		    "onsuspend",
		    "ontimeupdate",
		    "onvolumechange",
		    "onwaiting"
		];
		
		var globalAttributes = commonAttributes.concat(eventAttributes);
		
		var attributeMap = {
		    "html": {"manifest": 1},
		    "head": {},
		    "title": {},
		    "base": {"href": 1, "target": 1},
		    "link": {"href": 1, "hreflang": 1, "rel": {"stylesheet": 1, "icon": 1}, "media": {"all": 1, "screen": 1, "print": 1}, "type": {"text/css": 1, "image/png": 1, "image/jpeg": 1, "image/gif": 1}, "sizes": 1},
		    "meta": {"http-equiv": {"content-type": 1}, "name": {"description": 1, "keywords": 1}, "content": {"text/html; charset=UTF-8": 1}, "charset": 1},
		    "style": {"type": 1, "media": {"all": 1, "screen": 1, "print": 1}, "scoped": 1},
		    "script": {"charset": 1, "type": {"text/javascript": 1}, "src": 1, "defer": 1, "async": 1},
		    "noscript": {"href": 1},
		    "body": {"onafterprint": 1, "onbeforeprint": 1, "onbeforeunload": 1, "onhashchange": 1, "onmessage": 1, "onoffline": 1, "onpopstate": 1, "onredo": 1, "onresize": 1, "onstorage": 1, "onundo": 1, "onunload": 1},
		    "section": {},
		    "nav": {},
		    "article": {"pubdate": 1},
		    "aside": {},
		    "h1": {},
		    "h2": {},
		    "h3": {},
		    "h4": {},
		    "h5": {},
		    "h6": {},
		    "header": {},
		    "footer": {},
		    "address": {},
		    "main": {},
		    "p": {},
		    "hr": {},
		    "pre": {},
		    "blockquote": {"cite": 1},
		    "ol": {"start": 1, "reversed": 1},
		    "ul": {},
		    "li": {"value": 1},
		    "dl": {},
		    "dt": {},
		    "dd": {},
		    "figure": {},
		    "figcaption": {},
		    "div": {},
		    "a": {"href": 1, "target": {"_blank": 1, "top": 1}, "ping": 1, "rel": {"nofollow": 1, "alternate": 1, "author": 1, "bookmark": 1, "help": 1, "license": 1, "next": 1, "noreferrer": 1, "prefetch": 1, "prev": 1, "search": 1, "tag": 1}, "media": 1, "hreflang": 1, "type": 1},
		    "em": {},
		    "strong": {},
		    "small": {},
		    "s": {},
		    "cite": {},
		    "q": {"cite": 1},
		    "dfn": {},
		    "abbr": {},
		    "data": {},
		    "time": {"datetime": 1},
		    "code": {},
		    "var": {},
		    "samp": {},
		    "kbd": {},
		    "sub": {},
		    "sup": {},
		    "i": {},
		    "b": {},
		    "u": {},
		    "mark": {},
		    "ruby": {},
		    "rt": {},
		    "rp": {},
		    "bdi": {},
		    "bdo": {},
		    "span": {},
		    "br": {},
		    "wbr": {},
		    "ins": {"cite": 1, "datetime": 1},
		    "del": {"cite": 1, "datetime": 1},
		    "img": {"alt": 1, "src": 1, "height": 1, "width": 1, "usemap": 1, "ismap": 1},
		    "iframe": {"name": 1, "src": 1, "height": 1, "width": 1, "sandbox": {"allow-same-origin": 1, "allow-top-navigation": 1, "allow-forms": 1, "allow-scripts": 1}, "seamless": {"seamless": 1}},
		    "embed": {"src": 1, "height": 1, "width": 1, "type": 1},
		    "object": {"param": 1, "data": 1, "type": 1, "height" : 1, "width": 1, "usemap": 1, "name": 1, "form": 1, "classid": 1},
		    "param": {"name": 1, "value": 1},
		    "video": {"src": 1, "autobuffer": 1, "autoplay": {"autoplay": 1}, "loop": {"loop": 1}, "controls": {"controls": 1}, "width": 1, "height": 1, "poster": 1, "muted": {"muted": 1}, "preload": {"auto": 1, "metadata": 1, "none": 1}},
		    "audio": {"src": 1, "autobuffer": 1, "autoplay": {"autoplay": 1}, "loop": {"loop": 1}, "controls": {"controls": 1}, "muted": {"muted": 1}, "preload": {"auto": 1, "metadata": 1, "none": 1 }},
		    "source": {"src": 1, "type": 1, "media": 1},
		    "track": {"kind": 1, "src": 1, "srclang": 1, "label": 1, "default": 1},
		    "canvas": {"width": 1, "height": 1},
		    "map": {"name": 1},
		    "area": {"shape": 1, "coords": 1, "href": 1, "hreflang": 1, "alt": 1, "target": 1, "media": 1, "rel": 1, "ping": 1, "type": 1},
		    "svg": {},
		    "math": {},
		    "table": {"summary": 1},
		    "caption": {},
		    "colgroup": {"span": 1},
		    "col": {"span": 1},
		    "tbody": {},
		    "thead": {},
		    "tfoot": {},
		    "tr": {},
		    "td": {"headers": 1, "rowspan": 1, "colspan": 1},
		    "th": {"headers": 1, "rowspan": 1, "colspan": 1, "scope": 1},
		    "form": {"accept-charset": 1, "action": 1, "autocomplete": 1, "enctype": {"multipart/form-data": 1, "application/x-www-form-urlencoded": 1}, "method": {"get": 1, "post": 1}, "name": 1, "novalidate": 1, "target": {"_blank": 1, "top": 1}},
		    "fieldset": {"disabled": 1, "form": 1, "name": 1},
		    "legend": {},
		    "label": {"form": 1, "for": 1},
		    "input": {
		        "type": {"text": 1, "password": 1, "hidden": 1, "checkbox": 1, "submit": 1, "radio": 1, "file": 1, "button": 1, "reset": 1, "image": 31, "color": 1, "date": 1, "datetime": 1, "datetime-local": 1, "email": 1, "month": 1, "number": 1, "range": 1, "search": 1, "tel": 1, "time": 1, "url": 1, "week": 1},
		        "accept": 1, "alt": 1, "autocomplete": {"on": 1, "off": 1}, "autofocus": {"autofocus": 1}, "checked": {"checked": 1}, "disabled": {"disabled": 1}, "form": 1, "formaction": 1, "formenctype": {"application/x-www-form-urlencoded": 1, "multipart/form-data": 1, "text/plain": 1}, "formmethod": {"get": 1, "post": 1}, "formnovalidate": {"formnovalidate": 1}, "formtarget": {"_blank": 1, "_self": 1, "_parent": 1, "_top": 1}, "height": 1, "list": 1, "max": 1, "maxlength": 1, "min": 1, "multiple": {"multiple": 1}, "name": 1, "pattern": 1, "placeholder": 1, "readonly": {"readonly": 1}, "required": {"required": 1}, "size": 1, "src": 1, "step": 1, "width": 1, "files": 1, "value": 1},
		    "button": {"autofocus": 1, "disabled": {"disabled": 1}, "form": 1, "formaction": 1, "formenctype": 1, "formmethod": 1, "formnovalidate": 1, "formtarget": 1, "name": 1, "value": 1, "type": {"button": 1, "submit": 1}},
		    "select": {"autofocus": 1, "disabled": 1, "form": 1, "multiple": {"multiple": 1}, "name": 1, "size": 1, "readonly":{"readonly": 1}},
		    "datalist": {},
		    "optgroup": {"disabled": 1, "label": 1},
		    "option": {"disabled": 1, "selected": 1, "label": 1, "value": 1},
		    "textarea": {"autofocus": {"autofocus": 1}, "disabled": {"disabled": 1}, "form": 1, "maxlength": 1, "name": 1, "placeholder": 1, "readonly": {"readonly": 1}, "required": {"required": 1}, "rows": 1, "cols": 1, "wrap": {"on": 1, "off": 1, "hard": 1, "soft": 1}},
		    "keygen": {"autofocus": 1, "challenge": {"challenge": 1}, "disabled": {"disabled": 1}, "form": 1, "keytype": {"rsa": 1, "dsa": 1, "ec": 1}, "name": 1},
		    "output": {"for": 1, "form": 1, "name": 1},
		    "progress": {"value": 1, "max": 1},
		    "meter": {"value": 1, "min": 1, "max": 1, "low": 1, "high": 1, "optimum": 1},
		    "details": {"open": 1},
		    "summary": {},
		    "command": {"type": 1, "label": 1, "icon": 1, "disabled": 1, "checked": 1, "radiogroup": 1, "command": 1},
		    "menu": {"type": 1, "label": 1},
		    "dialog": {"open": 1}
		};
		
		var elements = Object.keys(attributeMap);
		
		function is(token, type) {
		    return token.type.lastIndexOf(type + ".xml") > -1;
		}
		
		function findTagName(session, pos) {
		    var iterator = new TokenIterator(session, pos.row, pos.column);
		    var token = iterator.getCurrentToken();
		    while (token && !is(token, "tag-name")){
		        token = iterator.stepBackward();
		    }
		    if (token)
		        return token.value;
		}
		
		function findAttributeName(session, pos) {
		    var iterator = new TokenIterator(session, pos.row, pos.column);
		    var token = iterator.getCurrentToken();
		    while (token && !is(token, "attribute-name")){
		        token = iterator.stepBackward();
		    }
		    if (token)
		        return token.value;
		}
		
		var HtmlCompletions = function() {
		
		};
		
		(function() {
		
		    this.getCompletions = function(state, session, pos, prefix) {
		        var token = session.getTokenAt(pos.row, pos.column);
		
		        if (!token)
		            return [];
		
		        // tag name
		        if (is(token, "tag-name") || is(token, "tag-open") || is(token, "end-tag-open"))
		            return this.getTagCompletions(state, session, pos, prefix);
		
		        // tag attribute
		        if (is(token, "tag-whitespace") || is(token, "attribute-name"))
		            return this.getAttributeCompletions(state, session, pos, prefix);
		            
		        // tag attribute values
		        if (is(token, "attribute-value"))
		            return this.getAttributeValueCompletions(state, session, pos, prefix);
		            
		        // HTML entities
		        var line = session.getLine(pos.row).substr(0, pos.column);
		        if (/&[a-z]*$/i.test(line))
		            return this.getHTMLEntityCompletions(state, session, pos, prefix);
		
		        return [];
		    };
		
		    this.getTagCompletions = function(state, session, pos, prefix) {
		        return elements.map(function(element){
		            return {
		                value: element,
		                meta: "tag",
		                score: Number.MAX_VALUE
		            };
		        });
		    };
		
		    this.getAttributeCompletions = function(state, session, pos, prefix) {
		        var tagName = findTagName(session, pos);
		        if (!tagName)
		            return [];
		        var attributes = globalAttributes;
		        if (tagName in attributeMap) {
		            attributes = attributes.concat(Object.keys(attributeMap[tagName]));
		        }
		        return attributes.map(function(attribute){
		            return {
		                caption: attribute,
		                snippet: attribute + '="$0"',
		                meta: "attribute",
		                score: Number.MAX_VALUE
		            };
		        });
		    };
		
		    this.getAttributeValueCompletions = function(state, session, pos, prefix) {
		        var tagName = findTagName(session, pos);
		        var attributeName = findAttributeName(session, pos);
		        
		        if (!tagName)
		            return [];
		        var values = [];
		        if (tagName in attributeMap && attributeName in attributeMap[tagName] && typeof attributeMap[tagName][attributeName] === "object") {
		            values = Object.keys(attributeMap[tagName][attributeName]);
		        }
		        return values.map(function(value){
		            return {
		                caption: value,
		                snippet: value,
		                meta: "attribute value",
		                score: Number.MAX_VALUE
		            };
		        });
		    };
		
		    this.getHTMLEntityCompletions = function(state, session, pos, prefix) {
		        var values = ['Aacute;', 'aacute;', 'Acirc;', 'acirc;', 'acute;', 'AElig;', 'aelig;', 'Agrave;', 'agrave;', 'alefsym;', 'Alpha;', 'alpha;', 'amp;', 'and;', 'ang;', 'Aring;', 'aring;', 'asymp;', 'Atilde;', 'atilde;', 'Auml;', 'auml;', 'bdquo;', 'Beta;', 'beta;', 'brvbar;', 'bull;', 'cap;', 'Ccedil;', 'ccedil;', 'cedil;', 'cent;', 'Chi;', 'chi;', 'circ;', 'clubs;', 'cong;', 'copy;', 'crarr;', 'cup;', 'curren;', 'Dagger;', 'dagger;', 'dArr;', 'darr;', 'deg;', 'Delta;', 'delta;', 'diams;', 'divide;', 'Eacute;', 'eacute;', 'Ecirc;', 'ecirc;', 'Egrave;', 'egrave;', 'empty;', 'emsp;', 'ensp;', 'Epsilon;', 'epsilon;', 'equiv;', 'Eta;', 'eta;', 'ETH;', 'eth;', 'Euml;', 'euml;', 'euro;', 'exist;', 'fnof;', 'forall;', 'frac12;', 'frac14;', 'frac34;', 'frasl;', 'Gamma;', 'gamma;', 'ge;', 'gt;', 'hArr;', 'harr;', 'hearts;', 'hellip;', 'Iacute;', 'iacute;', 'Icirc;', 'icirc;', 'iexcl;', 'Igrave;', 'igrave;', 'image;', 'infin;', 'int;', 'Iota;', 'iota;', 'iquest;', 'isin;', 'Iuml;', 'iuml;', 'Kappa;', 'kappa;', 'Lambda;', 'lambda;', 'lang;', 'laquo;', 'lArr;', 'larr;', 'lceil;', 'ldquo;', 'le;', 'lfloor;', 'lowast;', 'loz;', 'lrm;', 'lsaquo;', 'lsquo;', 'lt;', 'macr;', 'mdash;', 'micro;', 'middot;', 'minus;', 'Mu;', 'mu;', 'nabla;', 'nbsp;', 'ndash;', 'ne;', 'ni;', 'not;', 'notin;', 'nsub;', 'Ntilde;', 'ntilde;', 'Nu;', 'nu;', 'Oacute;', 'oacute;', 'Ocirc;', 'ocirc;', 'OElig;', 'oelig;', 'Ograve;', 'ograve;', 'oline;', 'Omega;', 'omega;', 'Omicron;', 'omicron;', 'oplus;', 'or;', 'ordf;', 'ordm;', 'Oslash;', 'oslash;', 'Otilde;', 'otilde;', 'otimes;', 'Ouml;', 'ouml;', 'para;', 'part;', 'permil;', 'perp;', 'Phi;', 'phi;', 'Pi;', 'pi;', 'piv;', 'plusmn;', 'pound;', 'Prime;', 'prime;', 'prod;', 'prop;', 'Psi;', 'psi;', 'quot;', 'radic;', 'rang;', 'raquo;', 'rArr;', 'rarr;', 'rceil;', 'rdquo;', 'real;', 'reg;', 'rfloor;', 'Rho;', 'rho;', 'rlm;', 'rsaquo;', 'rsquo;', 'sbquo;', 'Scaron;', 'scaron;', 'sdot;', 'sect;', 'shy;', 'Sigma;', 'sigma;', 'sigmaf;', 'sim;', 'spades;', 'sub;', 'sube;', 'sum;', 'sup;', 'sup1;', 'sup2;', 'sup3;', 'supe;', 'szlig;', 'Tau;', 'tau;', 'there4;', 'Theta;', 'theta;', 'thetasym;', 'thinsp;', 'THORN;', 'thorn;', 'tilde;', 'times;', 'trade;', 'Uacute;', 'uacute;', 'uArr;', 'uarr;', 'Ucirc;', 'ucirc;', 'Ugrave;', 'ugrave;', 'uml;', 'upsih;', 'Upsilon;', 'upsilon;', 'Uuml;', 'uuml;', 'weierp;', 'Xi;', 'xi;', 'Yacute;', 'yacute;', 'yen;', 'Yuml;', 'yuml;', 'Zeta;', 'zeta;', 'zwj;', 'zwnj;'];
		
		        return values.map(function(value){
		            return {
		                caption: value,
		                snippet: value,
		                meta: "html entity",
		                score: Number.MAX_VALUE
		            };
		        });
		    };
		
		}).call(HtmlCompletions.prototype);
		
		exports.HtmlCompletions = HtmlCompletions;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/html/html_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var lang = require("../../lib/lang");
		var CssHighlightRules = require("../css/css_highlight_rules").CssHighlightRules;
		var JavaScriptHighlightRules = require("../javascript/javascript_highlight_rules").JavaScriptHighlightRules;
		var XmlHighlightRules = require("../xml/xml_highlight_rules").XmlHighlightRules;
		
		var tagMap = lang.createMap({
		    a           : 'anchor',
		    button 	    : 'form',
		    form        : 'form',
		    img         : 'image',
		    input       : 'form',
		    label       : 'form',
		    option      : 'form',
		    script      : 'script',
		    select      : 'form',
		    textarea    : 'form',
		    style       : 'style',
		    table       : 'table',
		    tbody       : 'table',
		    td          : 'table',
		    tfoot       : 'table',
		    th          : 'table',
		    tr          : 'table'
		});
		
		var HtmlHighlightRules = function() {
		    XmlHighlightRules.call(this);
		
		    this.addRules({
		        attributes: [{
		            include : "tag_whitespace"
		        }, {
		            token : "entity.other.attribute-name.xml",
		            regex : "[-_a-zA-Z0-9:.]+"
		        }, {
		            token : "keyword.operator.attribute-equals.xml",
		            regex : "=",
		            push : [{
		                include: "tag_whitespace"
		            }, {
		                token : "string.unquoted.attribute-value.html",
		                regex : "[^<>='\"`\\s]+",
		                next : "pop"
		            }, {
		                token : "empty",
		                regex : "",
		                next : "pop"
		            }]
		        }, {
		            include : "attribute_value"
		        }],
		        tag: [{
		            token : function(start, tag) {
		                var group = tagMap[tag];
		                return ["meta.tag.punctuation." + (start == "<" ? "" : "end-") + "tag-open.xml",
		                    "meta.tag" + (group ? "." + group : "") + ".tag-name.xml"];
		            },
		            regex : "(</?)([-_a-zA-Z0-9:.]+)",
		            next: "tag_stuff"
		        }],
		        tag_stuff: [
		            {include : "attributes"},
		            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : "start"}
		        ]
		    });
		
		    this.embedTagRules(CssHighlightRules, "css-", "style");
		    this.embedTagRules(new JavaScriptHighlightRules({jsx: false}).getRules(), "js-", "script");
		
		    if (this.constructor === HtmlHighlightRules)
		        this.normalizeRules();
		};
		
		oop.inherits(HtmlHighlightRules, XmlHighlightRules);
		
		exports.HtmlHighlightRules = HtmlHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/html/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var lang = require("../../lib/lang");
		var TextMode = require("../text").Mode;
		var JavaScriptMode = require("../javascript").Mode;
		var CssMode = require("../css").Mode;
		var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
		var XmlBehaviour = require("../behaviour/xml").XmlBehaviour;
		var HtmlFoldMode = require("../folding/html").FoldMode;
		var HtmlCompletions = require("./html_completions").HtmlCompletions;
		var WorkerClient = require("../../worker/worker_client").WorkerClient;
		
		// http://www.w3.org/TR/html5/syntax.html#void-elements
		var voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "menuitem", "param", "source", "track", "wbr"];
		var optionalEndTags = ["li", "dt", "dd", "p", "rt", "rp", "optgroup", "option", "colgroup", "td", "th"];
		
		var Mode = function(options) {
		    this.fragmentContext = options && options.fragmentContext;
		    this.HighlightRules = HtmlHighlightRules;
		    this.$behaviour = new XmlBehaviour();
		    this.$completer = new HtmlCompletions();
		    
		    this.createModeDelegates({
		        "js-": JavaScriptMode,
		        "css-": CssMode
		    });
		    
		    this.foldingRules = new HtmlFoldMode(this.voidElements, lang.arrayToMap(optionalEndTags));
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.blockComment = {start: "<!--", end: "-->"};
		
		    this.voidElements = lang.arrayToMap(voidElements);
		
		    this.getNextLineIndent = function(state, line, tab) {
		        return this.$getIndent(line);
		    };
		
		    this.checkOutdent = function(state, line, input) {
		        return false;
		    };
		
		    this.getCompletions = function(state, session, pos, prefix) {
		        return this.$completer.getCompletions(state, session, pos, prefix);
		    };
		
		    this.createWorker = function(session) {
		        if (this.constructor != Mode)
		            return;
		        var worker = new WorkerClient(["ace"], "ace/mode/html_worker", "Worker");
		        worker.attachToDocument(session.getDocument());
		
		        if (this.fragmentContext)
		            worker.call("setOptions", [{context: this.fragmentContext}]);
		
		        worker.on("error", function(e) {
		            session.setAnnotations(e.data);
		        });
		
		        worker.on("terminate", function() {
		            session.clearAnnotations();
		        });
		
		        return worker;
		    };
		
		    this.$id = "ace/mode/html";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/ini/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var IniHighlightRules = require("./ini_highlight_rules").IniHighlightRules;
		// TODO: pick appropriate fold mode
		var FoldMode = require("../folding/ini").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = IniHighlightRules;
		    this.foldingRules = new FoldMode();
		    this.$behaviour = this.$defaultBehaviour;
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		    this.lineCommentStart = ";";
		    this.blockComment = null;
		    this.$id = "ace/mode/ini";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/ini/ini_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text_highlight_rules").TextHighlightRules;
		
		var escapeRe = "\\\\(?:[\\\\0abtrn;#=:]|x[a-fA-F\\d]{4})";
		
		var IniHighlightRules = function() {
		    this.$rules = {
		        "start" : [
		            {
		                token : "variable", // single line
		                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
		            }, {
		                token : "string", // single line
		                regex : '"',
		                next  : "string"
		            }, {
		                token : "constant.numeric", // hex
		                regex : "0[xX][0-9a-fA-F]+\\b"
		            }, {
		                token : "constant.numeric", // float
		                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
		            }, {
		                token : "constant.language.boolean",
		                regex : "(?:true|false)\\b"
		            }, {
		                token : "text", // single quoted strings are not allowed
		                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
		            }, {
		                token : "comment", // comments are not allowed, but who cares?
		                regex : "\\/\\/.*$"
		            }, {
		                token : "comment.start", // comments are not allowed, but who cares?
		                regex : "\\/\\*",
		                next  : "comment"
		            }, {
		                token : "paren.lparen",
		                regex : "[[({]"
		            }, {
		                token : "paren.rparen",
		                regex : "[\\])}]"
		            }, {
		                token : "text",
		                regex : "\\s+"
		            }
		        ],
		        "string" : [
		            {
		                token : "constant.language.escape",
		                regex : /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/
		            }, {
		                token : "string",
		                regex : '"|$',
		                next  : "start"
		            }, {
		                defaultToken : "string"
		            }
		        ],
		        "comment" : [
		            {
		                token : "comment.end", // comments are not allowed, but who cares?
		                regex : "\\*\\/",
		                next  : "start"
		            }, {
		                defaultToken: "comment"
		            }
		        ]
		    };
		
		    this.normalizeRules();
		};
		
		IniHighlightRules.metaData = {
		    fileTypes: ['lade'],
		    keyEquivalent: '^~I',
		    name: 'Ini',
		    scopeName: 'source.ini'
		};
		
		
		oop.inherits(IniHighlightRules, TextHighlightRules);
		
		exports.IniHighlightRules = IniHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/jade/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var JadeHighlightRules = require("./jade_highlight_rules").JadeHighlightRules;
		var FoldMode = require("../folding/coffee").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = JadeHighlightRules;
		    this.foldingRules = new FoldMode();
		    this.$behaviour = this.$defaultBehaviour;
		};
		oop.inherits(Mode, TextMode);
		
		(function() { 
			this.lineCommentStart = "//";
		    this.$id = "ace/mode/jade";
		}).call(Mode.prototype);
		exports.Mode = Mode;
		
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/jade/jade_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		var MarkdownHighlightRules = require("../markdown/markdown_highlight_rules").MarkdownHighlightRules;
		var SassHighlightRules = require("../scss/scss_highlight_rules").ScssHighlightRules;
		var LessHighlightRules = require("../less/less_highlight_rules").LessHighlightRules;
		var CoffeeHighlightRules = require("../coffee/coffee_highlight_rules").CoffeeHighlightRules;
		var JavaScriptHighlightRules = require("../javascript/javascript_highlight_rules").JavaScriptHighlightRules;
		
		function mixin_embed(tag, prefix) {
		    return { 
		        token : "entity.name.function.jade",
		        regex : "^\\s*\\:" + tag,
		        next  : prefix + "start"
		    };
		}
		
		var JadeHighlightRules = function() {
		
		    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
		        "u[0-9a-fA-F]{4}|" + // unicode
		        "[0-2][0-7]{0,2}|" + // oct
		        "3[0-6][0-7]?|" + // oct
		        "37[0-7]?|" + // oct
		        "[4-7][0-7]?|" + //oct
		        ".)";
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    this.$rules = 
		        {
		    "start": [
		        {
		            token: "keyword.control.import.include.jade",
		            regex: "\\s*\\binclude\\b"
		        },
		        {
		            token: "keyword.other.doctype.jade",
		            regex: "^!!!\\s*(?:[a-zA-Z0-9-_]+)?"
		        },
		        {
		            onMatch: function(value, currentState, stack) {
		                stack.unshift(this.next, value.length - 2, currentState);
		                return "comment";
		            },
		            regex: /^\s*\/\//,
		            next: "comment_block"
		        },
		        mixin_embed("markdown", "markdown-"),
		        mixin_embed("sass", "sass-"),
		        mixin_embed("less", "less-"),
		        mixin_embed("coffee", "coffee-"),
		        /*
		        {
		            token: {
		                "2": {
		                    "name": "entity.name.function.jade"
		                }
		            },
		            regex: "^(\\s*)(\\:cdata)",
		            next: "state_9"
		        },*/
		        // match stuff like: mixin dialog-title-desc(title, desc)
		        {
		            token: [ "storage.type.function.jade",
		                       "entity.name.function.jade",
		                       "punctuation.definition.parameters.begin.jade",
		                       "variable.parameter.function.jade",
		                       "punctuation.definition.parameters.end.jade"
		                    ],
		            regex: "^(\\s*mixin)( [\\w\\-]+)(\\s*\\()(.*?)(\\))"
		        },
		        // match stuff like: mixin dialog-title-desc
		        {
		            token: [ "storage.type.function.jade", "entity.name.function.jade"],
		            regex: "^(\\s*mixin)( [\\w\\-]+)"
		        },
		        {
		            token: "source.js.embedded.jade",
		            regex: "^\\s*(?:-|=|!=)",
		            next: "js-start"
		        },
		        /*{
		            token: "entity.name.tag.script.jade",
		            regex: "^\\s*script",
		            next: "js_code_tag"
		        },*/
		        {
		            token: "string.interpolated.jade",
		            regex: "[#!]\\{[^\\}]+\\}"
		        },
		        // Match any tag, id or class. skip AST filters
		        {
		            token: "meta.tag.any.jade",
		            regex: /^\s*(?!\w+:)(?:[\w-]+|(?=\.|#)])/,
		            next: "tag_single"
		        },
		        {
		            token: "suport.type.attribute.id.jade",
		            regex: "#\\w+"
		        },
		        {
		            token: "suport.type.attribute.class.jade",
		            regex: "\\.\\w+"
		        },
		        {
		            token: "punctuation",
		            regex: "\\s*(?:\\()",
		            next: "tag_attributes"
		        }
		    ],
		    "comment_block": [
		        {regex: /^\s*(?:\/\/)?/, onMatch: function(value, currentState, stack) {
		            if (value.length <= stack[1]) {
		                if (value.slice(-1) == "/") {
		                    stack[1] = value.length - 2;
		                    this.next = "";
		                    return "comment";
		                }
		                stack.shift();
		                stack.shift();
		                this.next = stack.shift();
		                return "text";
		            } else {
		                this.next = "";
		                return "comment";
		            }
		        }, next: "start"},
		        {defaultToken: "comment"}
		    ],
		    /*
		    
		    "state_9": [
		        {
		            token: "TODO",
		            regex: "^(?!\\1\\s+)",
		            next: "start"
		        },
		        {
		            token: "TODO",
		            regex: ".+",
		            next: "state_9"
		        }
		    ],*/
		    /*"js_code": [
		        {
		            token: "keyword.control.js",
		            regex: "\\beach\\b"
		        },
		        {
		            token: "text",
		            regex: "$",
		            next: "start"
		        }
		    ],*/
		    /*"js_code_tag": [
		        {
		            "include": "source.js"
		        },
		        {
		            token: "TODO",
		            regex: "^((?=(\\1)([\\w#\\.]|$\\n?))|^$\\n?)",
		            next: "start"
		        }
		    ],*/
		    "tag_single": [
		        {
		            token: "entity.other.attribute-name.class.jade",
		            regex: "\\.[\\w-]+"
		        },
		        {
		            token: "entity.other.attribute-name.id.jade",
		            regex: "#[\\w-]+"
		        },
		        {
		            token: ["text", "punctuation"],
		            regex: "($)|((?!\\.|#|=|-))",
		            next: "start"
		        }
		    ],
		    "tag_attributes": [ 
		        {
		            token : "string",
		            regex : "'(?=.)",
		            next  : "qstring"
		        }, 
		        {
		            token : "string",
		            regex : '"(?=.)',
		            next  : "qqstring"
		        },
		        {
		            token: ["entity.other.attribute-name.jade", "punctuation"],
		            regex: "([a-zA-Z:\\.-]+)(=)?",
		            next: "attribute_strings"
		        },
		        {
		            token: "punctuation",
		            regex: "\\)",
		            next: "start"
		        }
		    ],
		    "attribute_strings": [
		        {
		            token : "string",
		            regex : "'(?=.)",
		            next  : "qstring"
		        }, 
		        {
		            token : "string",
		            regex : '"(?=.)',
		            next  : "qqstring"
		        },
		        {
		            token : "string",
		            regex : '(?=\\S)',
		            next  : "tag_attributes"
		        }
		    ],
		    "qqstring" : [
		        {
		            token : "constant.language.escape",
		            regex : escapedRe
		        }, {
		            token : "string",
		            regex : '[^"\\\\]+'
		        }, {
		            token : "string",
		            regex : "\\\\$",
		            next  : "qqstring"
		        }, {
		            token : "string",
		            regex : '"|$',
		            next  : "tag_attributes"
		        }
		    ],
		    "qstring" : [
		        {
		            token : "constant.language.escape",
		            regex : escapedRe
		        }, {
		            token : "string",
		            regex : "[^'\\\\]+"
		        }, {
		            token : "string",
		            regex : "\\\\$",
		            next  : "qstring"
		        }, {
		            token : "string",
		            regex : "'|$",
		            next  : "tag_attributes"
		        }
		    ]
		};
		
		    this.embedRules(JavaScriptHighlightRules, "js-", [{
		        token: "text",
		        regex: ".$",
		        next: "start"
		    }]);
		/*
		    this.embedRules(MarkdownHighlightRules, "markdown-", [{
		       token : "support.function",
		       regex : "^\\1\\s+",
		       captures: "1",
		       next  : "start"
		    }]);
		    this.embedRules(SassHighlightRules, "sass-", [{
		       token : "support.function",
		       regex : "^(?!\\1\\s+)",
		       captures: "1",
		       next  : "start"
		    }]);
		    this.embedRules(LessHighlightRules, "less-", [{
		       token : "support.function",
		       regex : "^(?!\\1\\s+)",
		       captures: "1",
		       next  : "start"
		    }]);
		    this.embedRules(CoffeeHighlightRules, "coffee-", [{
		       token : "support.function",
		       regex : "^(?!\\1\\s+)",
		       captures: "1",
		       next  : "start"
		    }]);
		    this.embedRules(JavaScriptHighlightRules, "js-", [{
		       token : "support.function",
		       regex : "$",
		       captures: "1",
		       next  : "start"
		    }]); */
		};
		
		oop.inherits(JadeHighlightRules, TextHighlightRules);
		
		exports.JadeHighlightRules = JadeHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/javascript/doc_comment_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text_highlight_rules").TextHighlightRules;
		
		var DocCommentHighlightRules = function() {
		    this.$rules = {
		        "start" : [ {
		            token : "comment.doc.tag",
		            regex : "@[\\w\\d_]+" // TODO: fix email addresses
		        }, 
		        DocCommentHighlightRules.getTagRule(),
		        {
		            defaultToken : "comment.doc",
		            caseInsensitive: true
		        }]
		    };
		};
		
		oop.inherits(DocCommentHighlightRules, TextHighlightRules);
		
		DocCommentHighlightRules.getTagRule = function(start) {
		    return {
		        token : "comment.doc.tag.storage.type",
		        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
		    };
		}
		
		DocCommentHighlightRules.getStartRule = function(start) {
		    return {
		        token : "comment.doc", // doc comment
		        regex : "\\/\\*(?=\\*)",
		        next  : start
		    };
		};
		
		DocCommentHighlightRules.getEndRule = function (start) {
		    return {
		        token : "comment.doc", // closing comment
		        regex : "\\*\\/",
		        next  : start
		    };
		};
		
		
		exports.DocCommentHighlightRules = DocCommentHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/javascript/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
		var MatchingBraceOutdent = require("../matching_brace_outdent").MatchingBraceOutdent;
		var Range = require("../../range").Range;
		var WorkerClient = require("../../worker/worker_client").WorkerClient;
		var CstyleBehaviour = require("../behaviour/cstyle").CstyleBehaviour;
		var CStyleFoldMode = require("../folding/cstyle").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = JavaScriptHighlightRules;
		    
		    this.$outdent = new MatchingBraceOutdent();
		    this.$behaviour = new CstyleBehaviour();
		    this.foldingRules = new CStyleFoldMode();
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.lineCommentStart = "//";
		    this.blockComment = {start: "/*", end: "*/"};
		
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		
		        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
		        var tokens = tokenizedLine.tokens;
		        var endState = tokenizedLine.state;
		
		        if (tokens.length && tokens[tokens.length-1].type == "comment") {
		            return indent;
		        }
		
		        if (state == "start" || state == "no_regex") {
		            var match = line.match(/^.*(?:\bcase\b.*\:|[\{\(\[])\s*$/);
		            if (match) {
		                indent += tab;
		            }
		        } else if (state == "doc-start") {
		            if (endState == "start" || endState == "no_regex") {
		                return "";
		            }
		            var match = line.match(/^\s*(\/?)\*/);
		            if (match) {
		                if (match[1]) {
		                    indent += " ";
		                }
		                indent += "* ";
		            }
		        }
		
		        return indent;
		    };
		
		    this.checkOutdent = function(state, line, input) {
		        return this.$outdent.checkOutdent(line, input);
		    };
		
		    this.autoOutdent = function(state, doc, row) {
		        this.$outdent.autoOutdent(doc, row);
		    };
		
		    this.createWorker = function(session) {
		        var worker = new WorkerClient(["ace"], "ace/mode/javascript_worker", "JavaScriptWorker");
		        worker.attachToDocument(session.getDocument());
		
		        worker.on("annotate", function(results) {
		            session.setAnnotations(results.data);
		        });
		
		        worker.on("terminate", function() {
		            session.clearAnnotations();
		        });
		
		        return worker;
		    };
		
		    this.$id = "ace/mode/javascript";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/javascript/javascript_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var DocCommentHighlightRules = require("../doc_comment_highlight_rules").DocCommentHighlightRules;
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		// TODO: Unicode escape sequences
		var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
		
		var JavaScriptHighlightRules = function(options) {
		    // see: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects
		    var keywordMapper = this.createKeywordMapper({
		        "variable.language":
		            "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|"  + // Constructors
		            "Namespace|QName|XML|XMLList|"                                             + // E4X
		            "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|"   +
		            "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|"                    +
		            "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|"   + // Errors
		            "SyntaxError|TypeError|URIError|"                                          +
		            "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
		            "isNaN|parseFloat|parseInt|"                                               +
		            "JSON|Math|"                                                               + // Other
		            "this|arguments|prototype|window|document"                                 , // Pseudo
		        "keyword":
		            "const|yield|import|get|set|async|await|" +
		            "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
		            "if|in|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
		            // invalid or reserved
		            "__parent__|__count__|escape|unescape|with|__proto__|" +
		            "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",
		        "storage.type":
		            "const|let|var|function",
		        "constant.language":
		            "null|Infinity|NaN|undefined",
		        "support.function":
		            "alert",
		        "constant.language.boolean": "true|false"
		    }, "identifier");
		
		    // keywords which can be followed by regular expressions
		    var kwBeforeRe = "case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";
		
		    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
		        "u[0-9a-fA-F]{4}|" + // unicode
		        "u{[0-9a-fA-F]{1,6}}|" + // es6 unicode
		        "[0-2][0-7]{0,2}|" + // oct
		        "3[0-7][0-7]?|" + // oct
		        "[4-7][0-7]?|" + //oct
		        ".)";
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    this.$rules = {
		        "no_regex" : [
		            DocCommentHighlightRules.getStartRule("doc-start"),
		            comments("no_regex"),
		            {
		                token : "string",
		                regex : "'(?=.)",
		                next  : "qstring"
		            }, {
		                token : "string",
		                regex : '"(?=.)',
		                next  : "qqstring"
		            }, {
		                token : "constant.numeric", // hex
		                regex : /0(?:[xX][0-9a-fA-F]+|[bB][01]+)\b/
		            }, {
		                token : "constant.numeric", // float
		                regex : /[+-]?\d[\d_]*(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/
		            }, {
		                // Sound.prototype.play =
		                token : [
		                    "storage.type", "punctuation.operator", "support.function",
		                    "punctuation.operator", "entity.name.function", "text","keyword.operator"
		                ],
		                regex : "(" + identifierRe + ")(\\.)(prototype)(\\.)(" + identifierRe +")(\\s*)(=)",
		                next: "function_arguments"
		            }, {
		                // Sound.play = function() {  }
		                token : [
		                    "storage.type", "punctuation.operator", "entity.name.function", "text",
		                    "keyword.operator", "text", "storage.type", "text", "paren.lparen"
		                ],
		                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                // play = function() {  }
		                token : [
		                    "entity.name.function", "text", "keyword.operator", "text", "storage.type",
		                    "text", "paren.lparen"
		                ],
		                regex : "(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                // Sound.play = function play() {  }
		                token : [
		                    "storage.type", "punctuation.operator", "entity.name.function", "text",
		                    "keyword.operator", "text",
		                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
		                ],
		                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                // function myFunc(arg) { }
		                token : [
		                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
		                ],
		                regex : "(function)(\\s+)(" + identifierRe + ")(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                // foobar: function() { }
		                token : [
		                    "entity.name.function", "text", "punctuation.operator",
		                    "text", "storage.type", "text", "paren.lparen"
		                ],
		                regex : "(" + identifierRe + ")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                // : function() { } (this is for issues with 'foo': function() { })
		                token : [
		                    "text", "text", "storage.type", "text", "paren.lparen"
		                ],
		                regex : "(:)(\\s*)(function)(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                token : "keyword",
		                regex : "(?:" + kwBeforeRe + ")\\b",
		                next : "start"
		            }, {
		                token : ["support.constant"],
		                regex : /that\b/
		            }, {
		                token : ["storage.type", "punctuation.operator", "support.function.firebug"],
		                regex : /(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/
		            }, {
		                token : keywordMapper,
		                regex : identifierRe
		            }, {
		                token : "punctuation.operator",
		                regex : /[.](?![.])/,
		                next  : "property"
		            }, {
		                token : "keyword.operator",
		                regex : /--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?\:|[!$%&*+\-~\/^]=?/,
		                next  : "start"
		            }, {
		                token : "punctuation.operator",
		                regex : /[?:,;.]/,
		                next  : "start"
		            }, {
		                token : "paren.lparen",
		                regex : /[\[({]/,
		                next  : "start"
		            }, {
		                token : "paren.rparen",
		                regex : /[\])}]/
		            }, {
		                token: "comment",
		                regex: /^#!.*$/
		            }
		        ],
		        property: [{
		                token : "text",
		                regex : "\\s+"
		            }, {
		                // Sound.play = function play() {  }
		                token : [
		                    "storage.type", "punctuation.operator", "entity.name.function", "text",
		                    "keyword.operator", "text",
		                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
		                ],
		                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()",
		                next: "function_arguments"
		            }, {
		                token : "punctuation.operator",
		                regex : /[.](?![.])/
		            }, {
		                token : "support.function",
		                regex : /(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/
		            }, {
		                token : "support.function.dom",
		                regex : /(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/
		            }, {
		                token :  "support.constant",
		                regex : /(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/
		            }, {
		                token : "identifier",
		                regex : identifierRe
		            }, {
		                regex: "",
		                token: "empty",
		                next: "no_regex"
		            }
		        ],
		        // regular expressions are only allowed after certain tokens. This
		        // makes sure we don't mix up regexps with the divison operator
		        "start": [
		            DocCommentHighlightRules.getStartRule("doc-start"),
		            comments("start"),
		            {
		                token: "string.regexp",
		                regex: "\\/",
		                next: "regex"
		            }, {
		                token : "text",
		                regex : "\\s+|^$",
		                next : "start"
		            }, {
		                // immediately return to the start mode without matching
		                // anything
		                token: "empty",
		                regex: "",
		                next: "no_regex"
		            }
		        ],
		        "regex": [
		            {
		                // escapes
		                token: "regexp.keyword.operator",
		                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
		            }, {
		                // flag
		                token: "string.regexp",
		                regex: "/[sxngimy]*",
		                next: "no_regex"
		            }, {
		                // invalid operators
		                token : "invalid",
		                regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/
		            }, {
		                // operators
		                token : "constant.language.escape",
		                regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/
		            }, {
		                token : "constant.language.delimiter",
		                regex: /\|/
		            }, {
		                token: "constant.language.escape",
		                regex: /\[\^?/,
		                next: "regex_character_class"
		            }, {
		                token: "empty",
		                regex: "$",
		                next: "no_regex"
		            }, {
		                defaultToken: "string.regexp"
		            }
		        ],
		        "regex_character_class": [
		            {
		                token: "regexp.charclass.keyword.operator",
		                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
		            }, {
		                token: "constant.language.escape",
		                regex: "]",
		                next: "regex"
		            }, {
		                token: "constant.language.escape",
		                regex: "-"
		            }, {
		                token: "empty",
		                regex: "$",
		                next: "no_regex"
		            }, {
		                defaultToken: "string.regexp.charachterclass"
		            }
		        ],
		        "function_arguments": [
		            {
		                token: "variable.parameter",
		                regex: identifierRe
		            }, {
		                token: "punctuation.operator",
		                regex: "[, ]+"
		            }, {
		                token: "punctuation.operator",
		                regex: "$"
		            }, {
		                token: "empty",
		                regex: "",
		                next: "no_regex"
		            }
		        ],
		        "qqstring" : [
		            {
		                token : "constant.language.escape",
		                regex : escapedRe
		            }, {
		                token : "string",
		                regex : "\\\\$",
		                next  : "qqstring"
		            }, {
		                token : "string",
		                regex : '"|$',
		                next  : "no_regex"
		            }, {
		                defaultToken: "string"
		            }
		        ],
		        "qstring" : [
		            {
		                token : "constant.language.escape",
		                regex : escapedRe
		            }, {
		                token : "string",
		                regex : "\\\\$",
		                next  : "qstring"
		            }, {
		                token : "string",
		                regex : "'|$",
		                next  : "no_regex"
		            }, {
		                defaultToken: "string"
		            }
		        ]
		    };
		    
		    
		    if (!options || !options.noES6) {
		        this.$rules.no_regex.unshift({
		            regex: "[{}]", onMatch: function(val, state, stack) {
		                this.next = val == "{" ? this.nextState : "";
		                if (val == "{" && stack.length) {
		                    stack.unshift("start", state);
		                }
		                else if (val == "}" && stack.length) {
		                    stack.shift();
		                    this.next = stack.shift();
		                    if (this.next.indexOf("string") != -1 || this.next.indexOf("jsx") != -1)
		                        return "paren.quasi.end";
		                }
		                return val == "{" ? "paren.lparen" : "paren.rparen";
		            },
		            nextState: "start"
		        }, {
		            token : "string.quasi.start",
		            regex : /`/,
		            push  : [{
		                token : "constant.language.escape",
		                regex : escapedRe
		            }, {
		                token : "paren.quasi.start",
		                regex : /\${/,
		                push  : "start"
		            }, {
		                token : "string.quasi.end",
		                regex : /`/,
		                next  : "pop"
		            }, {
		                defaultToken: "string.quasi"
		            }]
		        });
		        
		        if (!options || !options.noJSX)
		            JSX.call(this);
		    }
		    
		    this.embedRules(DocCommentHighlightRules, "doc-",
		        [ DocCommentHighlightRules.getEndRule("no_regex") ]);
		    
		    this.normalizeRules();
		};
		
		oop.inherits(JavaScriptHighlightRules, TextHighlightRules);
		
		function JSX() {
		    var tagRegex = identifierRe.replace("\\d", "\\d\\-");
		    var jsxTag = {
		        onMatch : function(val, state, stack) {
		            var offset = val.charAt(1) == "/" ? 2 : 1;
		            if (offset == 1) {
		                if (state != this.nextState)
		                    stack.unshift(this.next, this.nextState, 0);
		                else
		                    stack.unshift(this.next);
		                stack[2]++;
		            } else if (offset == 2) {
		                if (state == this.nextState) {
		                    stack[1]--;
		                    if (!stack[1] || stack[1] < 0) {
		                        stack.shift();
		                        stack.shift();
		                    }
		                }
		            }
		            return [{
		                type: "meta.tag.punctuation." + (offset == 1 ? "" : "end-") + "tag-open.xml",
		                value: val.slice(0, offset)
		            }, {
		                type: "meta.tag.tag-name.xml",
		                value: val.substr(offset)
		            }];
		        },
		        regex : "</?" + tagRegex + "",
		        next: "jsxAttributes",
		        nextState: "jsx"
		    };
		    this.$rules.start.unshift(jsxTag);
		    var jsxJsRule = {
		        regex: "{",
		        token: "paren.quasi.start",
		        push: "start"
		    };
		    this.$rules.jsx = [
		        jsxJsRule,
		        jsxTag,
		        {include : "reference"},
		        {defaultToken: "string"}
		    ];
		    this.$rules.jsxAttributes = [{
		        token : "meta.tag.punctuation.tag-close.xml", 
		        regex : "/?>", 
		        onMatch : function(value, currentState, stack) {
		            if (currentState == stack[0])
		                stack.shift();
		            if (value.length == 2) {
		                if (stack[0] == this.nextState)
		                    stack[1]--;
		                if (!stack[1] || stack[1] < 0) {
		                    stack.splice(0, 2);
		                }
		            }
		            this.next = stack[0] || "start";
		            return [{type: this.token, value: value}];
		        },
		        nextState: "jsx"
		    }, 
		    jsxJsRule,
		    comments("jsxAttributes"),
		    {
		        token : "entity.other.attribute-name.xml",
		        regex : tagRegex
		    }, {
		        token : "keyword.operator.attribute-equals.xml",
		        regex : "="
		    }, {
		        token : "text.tag-whitespace.xml",
		        regex : "\\s+"
		    }, {
		        token : "string.attribute-value.xml",
		        regex : "'",
		        stateName : "jsx_attr_q",
		        push : [
		            {token : "string.attribute-value.xml", regex: "'", next: "pop"},
		            {include : "reference"},
		            {defaultToken : "string.attribute-value.xml"}
		        ]
		    }, {
		        token : "string.attribute-value.xml",
		        regex : '"',
		        stateName : "jsx_attr_qq",
		        push : [
		            {token : "string.attribute-value.xml", regex: '"', next: "pop"},
		            {include : "reference"},
		            {defaultToken : "string.attribute-value.xml"}
		        ]
		    },
		    jsxTag
		    ];
		    this.$rules.reference = [{
		        token : "constant.language.escape.reference.xml",
		        regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
		    }];
		}
		
		function comments(next) {
		    return [
		        {
		            token : "comment", // multi line comment
		            regex : /\/\*/,
		            next: [
		                DocCommentHighlightRules.getTagRule(),
		                {token : "comment", regex : "\\*\\/", next : next || "pop"},
		                {defaultToken : "comment", caseInsensitive: true}
		            ]
		        }, {
		            token : "comment",
		            regex : "\\/\\/",
		            next: [
		                DocCommentHighlightRules.getTagRule(),
		                {token : "comment", regex : "$|^", next : next || "pop"},
		                {defaultToken : "comment", caseInsensitive: true}
		            ]
		        }
		    ];
		}
		exports.JavaScriptHighlightRules = JavaScriptHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/json/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		"use strict";
		
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var HighlightRules = require("./json_highlight_rules").JsonHighlightRules;
		var MatchingBraceOutdent = require("../matching_brace_outdent").MatchingBraceOutdent;
		var CstyleBehaviour = require("../behaviour/cstyle").CstyleBehaviour;
		var CStyleFoldMode = require("../folding/cstyle").FoldMode;
		var WorkerClient = require("../../worker/worker_client").WorkerClient;
		
		var Mode = function() {
		    this.HighlightRules = HighlightRules;
		    this.$outdent = new MatchingBraceOutdent();
		    this.$behaviour = new CstyleBehaviour();
		    this.foldingRules = new CStyleFoldMode();
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		
		        if (state == "start") {
		            var match = line.match(/^.*[\{\(\[]\s*$/);
		            if (match) {
		                indent += tab;
		            }
		        }
		
		        return indent;
		    };
		
		    this.checkOutdent = function(state, line, input) {
		        return this.$outdent.checkOutdent(line, input);
		    };
		
		    this.autoOutdent = function(state, doc, row) {
		        this.$outdent.autoOutdent(doc, row);
		    };
		
		    this.createWorker = function(session) {
		        var worker = new WorkerClient(["ace"], "ace/mode/json_worker", "JsonWorker");
		        worker.attachToDocument(session.getDocument());
		
		        worker.on("annotate", function(e) {
		            session.setAnnotations(e.data);
		        });
		
		        worker.on("terminate", function() {
		            session.clearAnnotations();
		        });
		
		        return worker;
		    };
		
		
		    this.$id = "ace/mode/json";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/json/json_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		"use strict";
		
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		var JsonHighlightRules = function() {
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		    this.$rules = {
		        "start" : [
		            {
		                token : "variable", // single line
		                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'
		            }, {
		                token : "string", // single line
		                regex : '"',
		                next  : "string"
		            }, {
		                token : "constant.numeric", // hex
		                regex : "0[xX][0-9a-fA-F]+\\b"
		            }, {
		                token : "constant.numeric", // float
		                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
		            }, {
		                token : "constant.language.boolean",
		                regex : "(?:true|false)\\b"
		            }, {
		                token : "text", // single quoted strings are not allowed
		                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
		            }, {
		                token : "comment", // comments are not allowed, but who cares?
		                regex : "\\/\\/.*$"
		            }, {
		                token : "comment.start", // comments are not allowed, but who cares?
		                regex : "\\/\\*",
		                next  : "comment"
		            }, {
		                token : "paren.lparen",
		                regex : "[[({]"
		            }, {
		                token : "paren.rparen",
		                regex : "[\\])}]"
		            }, {
		                token : "text",
		                regex : "\\s+"
		            }
		        ],
		        "string" : [
		            {
		                token : "constant.language.escape",
		                regex : /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/
		            }, {
		                token : "string",
		                regex : '"|$',
		                next  : "start"
		            }, {
		                defaultToken : "string"
		            }
		        ],
		        "comment" : [
		            {
		                token : "comment.end", // comments are not allowed, but who cares?
		                regex : "\\*\\/",
		                next  : "start"
		            }, {
		                defaultToken: "comment"
		            }
		        ]
		    };
		    
		};
		
		oop.inherits(JsonHighlightRules, TextHighlightRules);
		
		exports.JsonHighlightRules = JsonHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/lade/fold.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var Range = require("../../range").Range;
		var BaseFoldMode = require("../folding/fold_mode").FoldMode;
		
		var FoldMode = exports.FoldMode = function() {
		};
		oop.inherits(FoldMode, BaseFoldMode);
		
		(function() {
		    var getColumn = function(line) {
		        var column = 0;
		        for(var i = 0, len = line.length; i < len; i++) {
		            if(line[i] == " ") {
		                column++;
		            }else if(line[i] == '\t') {
		                column +=4;
		            }else{
		                break;
		            }
		        }
		        return column;
		    }
		    /**
		        暂时没实现动态添加折叠  只能每次刷新之后才能显示
		    */
		    this.getFoldWidget = function(session, foldStyle, row) {
		        var line = session.getLine(row);
		        var nextLine = session.getLine(row + 1);
		        if(nextLine == "") {
		            return "";
		        }
		        if(getColumn(line) < getColumn(nextLine)) {
		            return "start";
		        }
		        return "";
		    }
		    this.getFoldWidgetRange = function(session, foldStyle, row) {
		        var line = session.getLine(row);
		        var c = getColumn(line);
		        var startRow = row;
		        var endRow = row + 1;
		        var nextLine = session.getLine(endRow);
		        console.log(session, nextLine, getColumn(nextLine));
		        while(nextLine != "" && getColumn(nextLine) > c){ 
		            endRow += 1;
		            nextLine = session.getLine(endRow);
		        }
		        return new Range(startRow, line.length, endRow - 1, session.getLine(endRow - 1).length);
		    }
		}).call(FoldMode.prototype);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/lade/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var LadeHighlightRules = require("./lade_highlight_rules").LadeHighlightRules;
		// TODO: pick appropriate fold mode
		var FoldMode = require("./fold").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = LadeHighlightRules;
		    this.foldingRules = new FoldMode();
		    this.$behaviour = this.$defaultBehaviour;
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		    this.type = 'text';
		    this.blockComment = {start: "/*", end: "*/"};
		
		    this.getNextLineIndent = function(state, line, tab) {
		        if (state == "listblock") {
		            var match = /^(\s*)(?:([-+*])|(\d+)\.)(\s+)/.exec(line);
		            if (!match)
		                return "";
		            var marker = match[2];
		            if (!marker)
		                marker = parseInt(match[3], 10) + 1 + ".";
		            return match[1] + marker + match[4];
		        } else {
		            return this.$getIndent(line);
		        }
		    };
		}).call(Mode.prototype);
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/lade/lade_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		var escapeRe = "\\\\(?:[\\\\0abtrn;#=:]|x[a-fA-F\\d]{4})";
		var styleType = "color";
		var latteType = "click|attrs|class|css|duplex|keys|list|right|route|src|selectList|show|text|view";
		var IniHighlightRules = function() {
		    var styleMapper = this.createKeywordMapper({
		        "support.styleType": styleType,
		    }, "text", true);
		    var latteMapper = this.createKeywordMapper({
		        "support.latteType": latteType,
		    }, "text", false);
		    this.$rules = {
		        start: [{
		            include : ["strings", "url", "comments"]
		        }, {
		            token: "constant",
		            regex: "[a-z0-9-_]+"
		        },{
		            token: "keyword",
		            regex: "#[a-zA-Z0-9-_]+"
		        },{
		            token: "variable",
		            regex: "\\.[a-zA-Z0-9_]+"
		        },{
		            token: "paren.lparen",
		            regex: "\\{",
		            next:  "attribute"
		        }, {
		            token: "paren.rparen",
		            regex: "\\}"
		        },{
		            token: "paren.lparen",
		            regex: "\\<",
		            next:  "style"
		        }, {
		            token: "paren.rparen",
		            regex: "\\>"
		        },{
		            token: "paren.lparen",
		            regex: "\\(",
		            next:  "latte"
		        }, {
		            token: "paren.rparen",
		            regex: "\\)"
		        }],
		        attribute: [{
		            include : ["strings", "url", "comments"]
		        },{
		            token : "paren.rparen",
		            regex : "\\}",
		            next : "start"
		        }],
		        style:[{
		            include : ["strings", "url", "comments"]
		        },{
		            token : "paren.rparen",
		            regex : "\\>",
		            next : "start"
		        },{
		            token : styleMapper,
		            regex : "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*"
		        }],
		        latte: [{
		            include : ["strings", "url", "comments"]
		        },{
		            token : "paren.rparen",
		            regex : "\\)",
		            next : "start"
		        },{
		            token : latteMapper,
		            regex : "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*"
		        }],
		        url: [{
		            token : "support.function",
		            regex : "(?:url(:?-prefix)?|domain|regexp)\\(",
		            push: [{
		                token : "support.function",
		                regex : "\\)",
		                next : "pop"
		            }, {
		                defaultToken: "string"
		            }]
		        }],
		        strings: [{
		            token : "string.start",
		            regex : "'",
		            push : [{
		                token : "string.end",
		                regex : "'|$",
		                next: "pop"
		            }, {
		                include : "escapes"
		            }, {
		                token : "constant.language.escape",
		                regex : /\\$/,
		                consumeLineEnd: true
		            }, {
		                defaultToken: "string"
		            }]
		        }, {
		            token : "string.start",
		            regex : '"',
		            push : [{
		                token : "string.end",
		                regex : '"|$',
		                next: "pop"
		            }, {
		                include : "escapes"
		            }, {
		                token : "constant.language.escape",
		                regex : /\\$/,
		                consumeLineEnd: true
		            }, {
		                defaultToken: "string"
		            }]
		        }],
		        "comments" : [{
		            token: "comment", // multi line comment
		            regex: "\\/\\*",
		            push: [{
		                token : "comment",
		                regex : "\\*\\/",
		                next : "pop"
		            }, {
		                defaultToken : "comment"
		            }]
		        }]
		    };
		    //this.normalizeRules();
		};
		
		IniHighlightRules.metaData = {
		    fileTypes: ['lade'],
		    keyEquivalent: '^~I',
		    name: 'Lade',
		    scopeName: 'source.lade'
		};
		
		
		oop.inherits(IniHighlightRules, TextHighlightRules);
		
		exports.LadeHighlightRules = IniHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/less/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var LessHighlightRules = require("./less_highlight_rules").LessHighlightRules;
		var MatchingBraceOutdent = require("../matching_brace_outdent").MatchingBraceOutdent;
		var CssBehaviour = require("../behaviour/css").CssBehaviour;
		var CssCompletions = require("../css/css_completions").CssCompletions;
		
		var CStyleFoldMode = require("../folding/cstyle").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = LessHighlightRules;
		    this.$outdent = new MatchingBraceOutdent();
		    this.$behaviour = new CssBehaviour();
		    this.$completer = new CssCompletions();
		    this.foldingRules = new CStyleFoldMode();
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.lineCommentStart = "//";
		    this.blockComment = {start: "/*", end: "*/"};
		    
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		
		        // ignore braces in comments
		        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
		        if (tokens.length && tokens[tokens.length-1].type == "comment") {
		            return indent;
		        }
		
		        var match = line.match(/^.*\{\s*$/);
		        if (match) {
		            indent += tab;
		        }
		
		        return indent;
		    };
		
		    this.checkOutdent = function(state, line, input) {
		        return this.$outdent.checkOutdent(line, input);
		    };
		
		    this.autoOutdent = function(state, doc, row) {
		        this.$outdent.autoOutdent(doc, row);
		    };
		
		    this.getCompletions = function(state, session, pos, prefix) {
		        // CSS completions only work with single (not nested) rulesets
		        return this.$completer.getCompletions("ruleset", session, pos, prefix);
		    };
		
		    this.$id = "ace/mode/less";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/less/less_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		var CssHighlightRules = require('../css/css_highlight_rules');
		
		var LessHighlightRules = function() {
		
		
		    var keywordList = "@import|@media|@font-face|@keyframes|@-webkit-keyframes|@supports|" + 
		        "@charset|@plugin|@namespace|@document|@page|@viewport|@-ms-viewport|" +
		        "or|and|when|not";
		
		    var keywords = keywordList.split('|');
		
		    var properties = CssHighlightRules.supportType.split('|');
		
		    var keywordMapper = this.createKeywordMapper({
		        "support.constant": CssHighlightRules.supportConstant,
		        "keyword": keywordList,
		        "support.constant.color": CssHighlightRules.supportConstantColor,
		        "support.constant.fonts": CssHighlightRules.supportConstantFonts
		    }, "identifier", true);   
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    var numRe = "\\-?(?:(?:[0-9]+)|(?:[0-9]*\\.[0-9]+))";
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    this.$rules = {
		        "start" : [
		            {
		                token : "comment",
		                regex : "\\/\\/.*$"
		            },
		            {
		                token : "comment", // multi line comment
		                regex : "\\/\\*",
		                next : "comment"
		            }, {
		                token : "string", // single line
		                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
		            }, {
		                token : "string", // single line
		                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
		            }, {
		                token : ["constant.numeric", "keyword"],
		                regex : "(" + numRe + ")(ch|cm|deg|em|ex|fr|gd|grad|Hz|in|kHz|mm|ms|pc|pt|px|rad|rem|s|turn|vh|vm|vw|%)"
		            }, {
		                token : "constant.numeric", // hex6 color
		                regex : "#[a-f0-9]{6}"
		            }, {
		                token : "constant.numeric", // hex3 color
		                regex : "#[a-f0-9]{3}"
		            }, {
		                token : "constant.numeric",
		                regex : numRe
		            }, {
		                token : ["support.function", "paren.lparen", "string", "paren.rparen"],
		                regex : "(url)(\\()(.*)(\\))"
		            }, {
		                token : ["support.function", "paren.lparen"],
		                regex : "(:extend|[a-z0-9_\\-]+)(\\()"
		            }, {
		                token : function(value) {
		                    if (keywords.indexOf(value.toLowerCase()) > -1)
		                        return "keyword";
		                    else
		                        return "variable";
		                },
		                regex : "[@\\$][a-z0-9_\\-@\\$]*\\b"
		            }, {
		                token : "variable",
		                regex : "[@\\$]\\{[a-z0-9_\\-@\\$]*\\}"
		            }, {
		                token : function(first, second) {
		                    if(properties.indexOf(first.toLowerCase()) > -1) {
		                        return ["support.type.property", "text"];
		                    }
		                    else {
		                        return ["support.type.unknownProperty", "text"];
		                    }
		                },
		                regex : "([a-z0-9-_]+)(\\s*:)"
		            }, {
		                token : "keyword",
		                regex : "&"   // special case - always treat as keyword
		            }, {
		                token : keywordMapper,
		                regex : "\\-?[@a-z_][@a-z0-9_\\-]*"
		            }, {
		                token: "variable.language",
		                regex: "#[a-z0-9-_]+"
		            }, {
		                token: "variable.language",
		                regex: "\\.[a-z0-9-_]+"
		            }, {
		                token: "variable.language",
		                regex: ":[a-z_][a-z0-9-_]*"
		            }, {
		                token: "constant",
		                regex: "[a-z0-9-_]+"
		            }, {
		                token : "keyword.operator",
		                regex : "<|>|<=|>=|=|!=|-|%|\\+|\\*"
		            }, {
		                token : "paren.lparen",
		                regex : "[[({]"
		            }, {
		                token : "paren.rparen",
		                regex : "[\\])}]"
		            }, {
		                token : "text",
		                regex : "\\s+"
		            }, {
		                caseInsensitive: true
		            }
		        ],
		        "comment" : [
		            {
		                token : "comment", // closing comment
		                regex : "\\*\\/",
		                next : "start"
		            }, {
		                defaultToken : "comment"
		            }
		        ]
		    };
		    this.normalizeRules();
		};
		
		oop.inherits(LessHighlightRules, TextHighlightRules);
		
		exports.LessHighlightRules = LessHighlightRules;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/markdown/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var JavaScriptMode = require("../javascript").Mode;
		var XmlMode = require("../xml").Mode;
		var HtmlMode = require("../html").Mode;
		var MarkdownHighlightRules = require("./markdown_highlight_rules").MarkdownHighlightRules;
		var MarkdownFoldMode = require("../folding/markdown").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = MarkdownHighlightRules;
		
		    this.createModeDelegates({
		        "js-": JavaScriptMode,
		        "xml-": XmlMode,
		        "html-": HtmlMode
		    });
		
		    this.foldingRules = new MarkdownFoldMode();
		    this.$behaviour = this.$defaultBehaviour;
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		    this.type = "text";
		    this.blockComment = {start: "<!--", end: "-->"};
		
		    this.getNextLineIndent = function(state, line, tab) {
		        if (state == "listblock") {
		            var match = /^(\s*)(?:([-+*])|(\d+)\.)(\s+)/.exec(line);
		            if (!match)
		                return "";
		            var marker = match[2];
		            if (!marker)
		                marker = parseInt(match[3], 10) + 1 + ".";
		            return match[1] + marker + match[4];
		        } else {
		            return this.$getIndent(line);
		        }
		    };
		    this.$id = "ace/mode/markdown";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/markdown/markdown_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var lang = require("../../lib/lang");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		var JavaScriptHighlightRules = require("../javascript/javascript_highlight_rules").JavaScriptHighlightRules;
		var XmlHighlightRules = require("../xml/xml_highlight_rules").XmlHighlightRules;
		var HtmlHighlightRules = require("../html/html_highlight_rules").HtmlHighlightRules;
		var CssHighlightRules = require("../css/css_highlight_rules").CssHighlightRules;
		
		var escaped = function(ch) {
		    return "(?:[^" + lang.escapeRegExp(ch) + "\\\\]|\\\\.)*";
		};
		
		function github_embed(tag, prefix) {
		    return { // Github style block
		        token : "support.function",
		        regex : "^\\s*```" + tag + "\\s*$",
		        push  : prefix + "start"
		    };
		}
		
		var MarkdownHighlightRules = function() {
		    HtmlHighlightRules.call(this);
		    // regexp must not have capturing parentheses
		    // regexps are ordered -> the first match is used
		
		    this.$rules["start"].unshift({
		        token : "empty_line",
		        regex : '^$',
		        next: "allowBlock"
		    }, { // h1
		        token: "markup.heading.1",
		        regex: "^=+(?=\\s*$)"
		    }, { // h2
		        token: "markup.heading.2",
		        regex: "^\\-+(?=\\s*$)"
		    }, {
		        token : function(value) {
		            return "markup.heading." + value.length;
		        },
		        regex : /^#{1,6}(?=\s*[^ #]|\s+#.)/,
		        next : "header"
		    },
		       github_embed("(?:javascript|js)", "jscode-"),
		       github_embed("xml", "xmlcode-"),
		       github_embed("html", "htmlcode-"),
		       github_embed("css", "csscode-"),
		    { // Github style block
		        token : "support.function",
		        regex : "^\\s*```\\s*\\S*(?:{.*?\\})?\\s*$",
		        next  : "githubblock"
		    }, { // block quote
		        token : "string.blockquote",
		        regex : "^\\s*>\\s*(?:[*+-]|\\d+\\.)?\\s+",
		        next  : "blockquote"
		    }, { // HR * - _
		        token : "constant",
		        regex : "^ {0,2}(?:(?: ?\\* ?){3,}|(?: ?\\- ?){3,}|(?: ?\\_ ?){3,})\\s*$",
		        next: "allowBlock"
		    }, { // list
		        token : "markup.list",
		        regex : "^\\s{0,3}(?:[*+-]|\\d+\\.)\\s+",
		        next  : "listblock-start"
		    }, {
		        include : "basic"
		    });
		
		    this.addRules({
		        "basic" : [{
		            token : "constant.language.escape",
		            regex : /\\[\\`*_{}\[\]()#+\-.!]/
		        }, { // code span `
		            token : "support.function",
		            regex : "(`+)(.*?[^`])(\\1)"
		        }, { // reference
		            token : ["text", "constant", "text", "url", "string", "text"],
		            regex : "^([ ]{0,3}\\[)([^\\]]+)(\\]:\\s*)([^ ]+)(\\s*(?:[\"][^\"]+[\"])?(\\s*))$"
		        }, { // link by reference
		            token : ["text", "string", "text", "constant", "text"],
		            regex : "(\\[)(" + escaped("]") + ")(\\]\\s*\\[)("+ escaped("]") + ")(\\])"
		        }, { // link by url
		            token : ["text", "string", "text", "markup.underline", "string", "text"],
		            regex : "(\\[)(" +                                        // [
		                    escaped("]") +                                    // link text
		                    ")(\\]\\()"+                                      // ](
		                    '((?:[^\\)\\s\\\\]|\\\\.|\\s(?=[^"]))*)' +        // href
		                    '(\\s*"' +  escaped('"') + '"\\s*)?' +            // "title"
		                    "(\\))"                                           // )
		        }, { // strong ** __
		            token : "string.strong",
		            regex : "([*]{2}|[_]{2}(?=\\S))(.*?\\S[*_]*)(\\1)"
		        }, { // emphasis * _
		            token : "string.emphasis",
		            regex : "([*]|[_](?=\\S))(.*?\\S[*_]*)(\\1)"
		        }, { //
		            token : ["text", "url", "text"],
		            regex : "(<)("+
		                      "(?:https?|ftp|dict):[^'\">\\s]+"+
		                      "|"+
		                      "(?:mailto:)?[-.\\w]+\\@[-a-z0-9]+(?:\\.[-a-z0-9]+)*\\.[a-z]+"+
		                    ")(>)"
		        }],
		
		        // code block
		        "allowBlock": [
		            {token : "support.function", regex : "^ {4}.+", next : "allowBlock"},
		            {token : "empty_line", regex : '^$', next: "allowBlock"},
		            {token : "empty", regex : "", next : "start"}
		        ],
		
		        "header" : [{
		            regex: "$",
		            next : "start"
		        }, {
		            include: "basic"
		        }, {
		            defaultToken : "heading"
		        } ],
		
		        "listblock-start" : [{
		            token : "support.variable",
		            regex : /(?:\[[ x]\])?/,
		            next  : "listblock"
		        }],
		
		        "listblock" : [ { // Lists only escape on completely blank lines.
		            token : "empty_line",
		            regex : "^$",
		            next  : "start"
		        }, { // list
		            token : "markup.list",
		            regex : "^\\s{0,3}(?:[*+-]|\\d+\\.)\\s+",
		            next  : "listblock-start"
		        }, {
		            include : "basic", noEscape: true
		        }, { // Github style block
		            token : "support.function",
		            regex : "^\\s*```\\s*[a-zA-Z]*(?:{.*?\\})?\\s*$",
		            next  : "githubblock"
		        }, {
		            defaultToken : "list" //do not use markup.list to allow stling leading `*` differntly
		        } ],
		
		        "blockquote" : [ { // Blockquotes only escape on blank lines.
		            token : "empty_line",
		            regex : "^\\s*$",
		            next  : "start"
		        }, { // block quote
		            token : "string.blockquote",
		            regex : "^\\s*>\\s*(?:[*+-]|\\d+\\.)?\\s+",
		            next  : "blockquote"
		        }, {
		            include : "basic", noEscape: true
		        }, {
		            defaultToken : "string.blockquote"
		        } ],
		
		        "githubblock" : [ {
		            token : "support.function",
		            regex : "^\\s*```",
		            next  : "start"
		        }, {
		            defaultToken : "support.function"
		        } ]
		    });
		
		    this.embedRules(JavaScriptHighlightRules, "jscode-", [{
		       token : "support.function",
		       regex : "^\\s*```",
		       next  : "pop"
		    }]);
		
		    this.embedRules(HtmlHighlightRules, "htmlcode-", [{
		       token : "support.function",
		       regex : "^\\s*```",
		       next  : "pop"
		    }]);
		
		    this.embedRules(CssHighlightRules, "csscode-", [{
		       token : "support.function",
		       regex : "^\\s*```",
		       next  : "pop"
		    }]);
		
		    this.embedRules(XmlHighlightRules, "xmlcode-", [{
		       token : "support.function",
		       regex : "^\\s*```",
		       next  : "pop"
		    }]);
		
		    this.normalizeRules();
		};
		oop.inherits(MarkdownHighlightRules, TextHighlightRules);
		
		exports.MarkdownHighlightRules = MarkdownHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/python/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		"use strict";
		
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var PythonHighlightRules = require("./python_highlight_rules").PythonHighlightRules;
		var PythonFoldMode = require("../folding/pythonic").FoldMode;
		var Range = require("../../range").Range;
		
		var Mode = function() {
		    this.HighlightRules = PythonHighlightRules;
		    this.foldingRules = new PythonFoldMode("\\:");
		    this.$behaviour = this.$defaultBehaviour;
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.lineCommentStart = "#";
		
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		
		        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
		        var tokens = tokenizedLine.tokens;
		
		        if (tokens.length && tokens[tokens.length-1].type == "comment") {
		            return indent;
		        }
		
		        if (state == "start") {
		            var match = line.match(/^.*[\{\(\[:]\s*$/);
		            if (match) {
		                indent += tab;
		            }
		        }
		
		        return indent;
		    };
		
		    var outdents = {
		        "pass": 1,
		        "return": 1,
		        "raise": 1,
		        "break": 1,
		        "continue": 1
		    };
		    
		    this.checkOutdent = function(state, line, input) {
		        if (input !== "\r\n" && input !== "\r" && input !== "\n")
		            return false;
		
		        var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens;
		        
		        if (!tokens)
		            return false;
		        
		        // ignore trailing comments
		        do {
		            var last = tokens.pop();
		        } while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
		        
		        if (!last)
		            return false;
		        
		        return (last.type == "keyword" && outdents[last.value]);
		    };
		
		    this.autoOutdent = function(state, doc, row) {
		        // outdenting in python is slightly different because it always applies
		        // to the next line and only of a new line is inserted
		        
		        row += 1;
		        var indent = this.$getIndent(doc.getLine(row));
		        var tab = doc.getTabString();
		        if (indent.slice(-tab.length) == tab)
		            doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
		    };
		
		    this.$id = "ace/mode/python";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/python/python_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		"use strict";
		
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		var PythonHighlightRules = function() {
		
		    var keywords = (
		        "and|as|assert|break|class|continue|def|del|elif|else|except|exec|" +
		        "finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|" +
		        "raise|return|try|while|with|yield"
		    );
		
		    var builtinConstants = (
		        "True|False|None|NotImplemented|Ellipsis|__debug__"
		    );
		
		    var builtinFunctions = (
		        "abs|divmod|input|open|staticmethod|all|enumerate|int|ord|str|any|" +
		        "eval|isinstance|pow|sum|basestring|execfile|issubclass|print|super|" +
		        "binfile|iter|property|tuple|bool|filter|len|range|type|bytearray|" +
		        "float|list|raw_input|unichr|callable|format|locals|reduce|unicode|" +
		        "chr|frozenset|long|reload|vars|classmethod|getattr|map|repr|xrange|" +
		        "cmp|globals|max|reversed|zip|compile|hasattr|memoryview|round|" +
		        "__import__|complex|hash|min|set|apply|delattr|help|next|setattr|" +
		        "buffer|dict|hex|object|slice|coerce|dir|id|oct|sorted|intern"
		    );
		
		    //var futureReserved = "";
		    var keywordMapper = this.createKeywordMapper({
		        "invalid.deprecated": "debugger",
		        "support.function": builtinFunctions,
		        //"invalid.illegal": futureReserved,
		        "constant.language": builtinConstants,
		        "keyword": keywords
		    }, "identifier");
		
		    var strPre = "(?:r|u|ur|R|U|UR|Ur|uR)?";
		
		    var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
		    var octInteger = "(?:0[oO]?[0-7]+)";
		    var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
		    var binInteger = "(?:0[bB][01]+)";
		    var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";
		
		    var exponent = "(?:[eE][+-]?\\d+)";
		    var fraction = "(?:\\.\\d+)";
		    var intPart = "(?:\\d+)";
		    var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
		    var exponentFloat = "(?:(?:" + pointFloat + "|" +  intPart + ")" + exponent + ")";
		    var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";
		
		    var stringEscape =  "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";
		
		    this.$rules = {
		        "start" : [ {
		            token : "comment",
		            regex : "#.*$"
		        }, {
		            token : "string",           // multi line """ string start
		            regex : strPre + '"{3}',
		            next : "qqstring3"
		        }, {
		            token : "string",           // " string
		            regex : strPre + '"(?=.)',
		            next : "qqstring"
		        }, {
		            token : "string",           // multi line ''' string start
		            regex : strPre + "'{3}",
		            next : "qstring3"
		        }, {
		            token : "string",           // ' string
		            regex : strPre + "'(?=.)",
		            next : "qstring"
		        }, {
		            token : "constant.numeric", // imaginary
		            regex : "(?:" + floatNumber + "|\\d+)[jJ]\\b"
		        }, {
		            token : "constant.numeric", // float
		            regex : floatNumber
		        }, {
		            token : "constant.numeric", // long integer
		            regex : integer + "[lL]\\b"
		        }, {
		            token : "constant.numeric", // integer
		            regex : integer + "\\b"
		        }, {
		            token : keywordMapper,
		            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
		        }, {
		            token : "keyword.operator",
		            regex : "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="
		        }, {
		            token : "paren.lparen",
		            regex : "[\\[\\(\\{]"
		        }, {
		            token : "paren.rparen",
		            regex : "[\\]\\)\\}]"
		        }, {
		            token : "text",
		            regex : "\\s+"
		        } ],
		        "qqstring3" : [ {
		            token : "constant.language.escape",
		            regex : stringEscape
		        }, {
		            token : "string", // multi line """ string end
		            regex : '"{3}',
		            next : "start"
		        }, {
		            defaultToken : "string"
		        } ],
		        "qstring3" : [ {
		            token : "constant.language.escape",
		            regex : stringEscape
		        }, {
		            token : "string",  // multi line ''' string end
		            regex : "'{3}",
		            next : "start"
		        }, {
		            defaultToken : "string"
		        } ],
		        "qqstring" : [{
		            token : "constant.language.escape",
		            regex : stringEscape
		        }, {
		            token : "string",
		            regex : "\\\\$",
		            next  : "qqstring"
		        }, {
		            token : "string",
		            regex : '"|$',
		            next  : "start"
		        }, {
		            defaultToken: "string"
		        }],
		        "qstring" : [{
		            token : "constant.language.escape",
		            regex : stringEscape
		        }, {
		            token : "string",
		            regex : "\\\\$",
		            next  : "qstring"
		        }, {
		            token : "string",
		            regex : "'|$",
		            next  : "start"
		        }, {
		            defaultToken: "string"
		        }]
		    };
		};
		
		oop.inherits(PythonHighlightRules, TextHighlightRules);
		
		exports.PythonHighlightRules = PythonHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/scss/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextMode = require("../text").Mode;
		var ScssHighlightRules = require("./scss_highlight_rules").ScssHighlightRules;
		var MatchingBraceOutdent = require("../matching_brace_outdent").MatchingBraceOutdent;
		var CssBehaviour = require("../behaviour/css").CssBehaviour;
		var CStyleFoldMode = require("../folding/cstyle").FoldMode;
		
		var Mode = function() {
		    this.HighlightRules = ScssHighlightRules;
		    this.$outdent = new MatchingBraceOutdent();
		    this.$behaviour = new CssBehaviour();
		    this.foldingRules = new CStyleFoldMode();
		};
		oop.inherits(Mode, TextMode);
		
		(function() {
		   
		    this.lineCommentStart = "//";
		    this.blockComment = {start: "/*", end: "*/"};
		
		    this.getNextLineIndent = function(state, line, tab) {
		        var indent = this.$getIndent(line);
		
		        // ignore braces in comments
		        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
		        if (tokens.length && tokens[tokens.length-1].type == "comment") {
		            return indent;
		        }
		
		        var match = line.match(/^.*\{\s*$/);
		        if (match) {
		            indent += tab;
		        }
		
		        return indent;
		    };
		
		    this.checkOutdent = function(state, line, input) {
		        return this.$outdent.checkOutdent(line, input);
		    };
		
		    this.autoOutdent = function(state, doc, row) {
		        this.$outdent.autoOutdent(doc, row);
		    };
		
		    this.$id = "ace/mode/scss";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/scss/scss_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var lang = require("../../lib/lang");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		var ScssHighlightRules = function() {
		    
		    var properties = lang.arrayToMap( (function () {
		
		        var browserPrefix = ("-webkit-|-moz-|-o-|-ms-|-svg-|-pie-|-khtml-").split("|");
		        
		        var prefixProperties = ("appearance|background-clip|background-inline-policy|background-origin|" + 
		             "background-size|binding|border-bottom-colors|border-left-colors|" + 
		             "border-right-colors|border-top-colors|border-end|border-end-color|" + 
		             "border-end-style|border-end-width|border-image|border-start|" + 
		             "border-start-color|border-start-style|border-start-width|box-align|" + 
		             "box-direction|box-flex|box-flexgroup|box-ordinal-group|box-orient|" + 
		             "box-pack|box-sizing|column-count|column-gap|column-width|column-rule|" + 
		             "column-rule-width|column-rule-style|column-rule-color|float-edge|" + 
		             "font-feature-settings|font-language-override|force-broken-image-icon|" + 
		             "image-region|margin-end|margin-start|opacity|outline|outline-color|" + 
		             "outline-offset|outline-radius|outline-radius-bottomleft|" + 
		             "outline-radius-bottomright|outline-radius-topleft|outline-radius-topright|" + 
		             "outline-style|outline-width|padding-end|padding-start|stack-sizing|" + 
		             "tab-size|text-blink|text-decoration-color|text-decoration-line|" + 
		             "text-decoration-style|transform|transform-origin|transition|" + 
		             "transition-delay|transition-duration|transition-property|" + 
		             "transition-timing-function|user-focus|user-input|user-modify|user-select|" +
		             "window-shadow|border-radius").split("|");
		        
		        var properties = ("azimuth|background-attachment|background-color|background-image|" +
		            "background-position|background-repeat|background|border-bottom-color|" +
		            "border-bottom-style|border-bottom-width|border-bottom|border-collapse|" +
		            "border-color|border-left-color|border-left-style|border-left-width|" +
		            "border-left|border-right-color|border-right-style|border-right-width|" +
		            "border-right|border-spacing|border-style|border-top-color|" +
		            "border-top-style|border-top-width|border-top|border-width|border|bottom|" +
		            "box-shadow|box-sizing|caption-side|clear|clip|color|content|counter-increment|" +
		            "counter-reset|cue-after|cue-before|cue|cursor|direction|display|" +
		            "elevation|empty-cells|float|font-family|font-size-adjust|font-size|" +
		            "font-stretch|font-style|font-variant|font-weight|font|height|left|" +
		            "letter-spacing|line-height|list-style-image|list-style-position|" +
		            "list-style-type|list-style|margin-bottom|margin-left|margin-right|" +
		            "margin-top|marker-offset|margin|marks|max-height|max-width|min-height|" +
		            "min-width|opacity|orphans|outline-color|" +
		            "outline-style|outline-width|outline|overflow|overflow-x|overflow-y|padding-bottom|" +
		            "padding-left|padding-right|padding-top|padding|page-break-after|" +
		            "page-break-before|page-break-inside|page|pause-after|pause-before|" +
		            "pause|pitch-range|pitch|play-during|position|quotes|richness|right|" +
		            "size|speak-header|speak-numeral|speak-punctuation|speech-rate|speak|" +
		            "stress|table-layout|text-align|text-decoration|text-indent|" +
		            "text-shadow|text-transform|top|unicode-bidi|vertical-align|" +
		            "visibility|voice-family|volume|white-space|widows|width|word-spacing|" +
		            "z-index").split("|");
		          
		        //The return array     
		        var ret = [];
		        
		        //All prefixProperties will get the browserPrefix in
		        //the begning by join the prefixProperties array with the value of browserPrefix
		        for (var i=0, ln=browserPrefix.length; i<ln; i++) {
		            Array.prototype.push.apply(
		                ret,
		                (( browserPrefix[i] + prefixProperties.join("|" + browserPrefix[i]) ).split("|"))
		            );
		        }
		        
		        //Add also prefixProperties and properties without any browser prefix
		        Array.prototype.push.apply(ret, prefixProperties);
		        Array.prototype.push.apply(ret, properties);
		        
		        return ret;
		        
		    })() );
		    
		
		
		    var functions = lang.arrayToMap(
		        ("hsl|hsla|rgb|rgba|url|attr|counter|counters|abs|adjust_color|adjust_hue|" +
		         "alpha|join|blue|ceil|change_color|comparable|complement|darken|desaturate|" + 
		         "floor|grayscale|green|hue|if|invert|join|length|lighten|lightness|mix|" + 
		         "nth|opacify|opacity|percentage|quote|red|round|saturate|saturation|" +
		         "scale_color|transparentize|type_of|unit|unitless|unquote").split("|")
		    );
		
		    var constants = lang.arrayToMap(
		        ("absolute|all-scroll|always|armenian|auto|baseline|below|bidi-override|" +
		        "block|bold|bolder|border-box|both|bottom|break-all|break-word|capitalize|center|" +
		        "char|circle|cjk-ideographic|col-resize|collapse|content-box|crosshair|dashed|" +
		        "decimal-leading-zero|decimal|default|disabled|disc|" +
		        "distribute-all-lines|distribute-letter|distribute-space|" +
		        "distribute|dotted|double|e-resize|ellipsis|fixed|georgian|groove|" +
		        "hand|hebrew|help|hidden|hiragana-iroha|hiragana|horizontal|" +
		        "ideograph-alpha|ideograph-numeric|ideograph-parenthesis|" +
		        "ideograph-space|inactive|inherit|inline-block|inline|inset|inside|" +
		        "inter-ideograph|inter-word|italic|justify|katakana-iroha|katakana|" +
		        "keep-all|left|lighter|line-edge|line-through|line|list-item|loose|" +
		        "lower-alpha|lower-greek|lower-latin|lower-roman|lowercase|lr-tb|ltr|" +
		        "medium|middle|move|n-resize|ne-resize|newspaper|no-drop|no-repeat|" +
		        "nw-resize|none|normal|not-allowed|nowrap|oblique|outset|outside|" +
		        "overline|pointer|progress|relative|repeat-x|repeat-y|repeat|right|" +
		        "ridge|row-resize|rtl|s-resize|scroll|se-resize|separate|small-caps|" +
		        "solid|square|static|strict|super|sw-resize|table-footer-group|" +
		        "table-header-group|tb-rl|text-bottom|text-top|text|thick|thin|top|" +
		        "transparent|underline|upper-alpha|upper-latin|upper-roman|uppercase|" +
		        "vertical-ideographic|vertical-text|visible|w-resize|wait|whitespace|" +
		        "zero").split("|")
		    );
		
		    var colors = lang.arrayToMap(
		        ("aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|" +
		        "blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|" +
		        "chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|" +
		        "darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|" +
		        "darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|" +
		        "darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|" +
		        "darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|" +
		        "dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|" +
		        "ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|" +
		        "hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|" +
		        "lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|" +
		        "lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|" +
		        "lightsalmon|lightseagreen|lightskyblue|lightslategray|" +
		        "lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|" +
		        "magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|" +
		        "mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|" +
		        "mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|" +
		        "moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|" +
		        "orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|" +
		        "papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|" +
		        "red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|" +
		        "seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|" +
		        "springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|" +
		        "wheat|white|whitesmoke|yellow|yellowgreen").split("|")
		    );
		    
		    var keywords = lang.arrayToMap(
		        ("@mixin|@extend|@include|@import|@media|@debug|@warn|@if|@for|@each|@while|@else|@font-face|@-webkit-keyframes|if|and|!default|module|def|end|declare").split("|")
		    );
		    
		    var tags = lang.arrayToMap(
		        ("a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|" + 
		         "big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|" + 
		         "command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|" + 
		         "figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|" + 
		         "header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|" + 
		         "link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|" + 
		         "option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|" + 
		         "small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|" + 
		         "textarea|tfoot|th|thead|time|title|tr|tt|u|ul|var|video|wbr|xmp").split("|")
		    );
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    var numRe = "\\-?(?:(?:[0-9]+)|(?:[0-9]*\\.[0-9]+))";
		
		    // regexp must not have capturing parentheses. Use (?:) instead.
		    // regexps are ordered -> the first match is used
		
		    this.$rules = {
		        "start" : [
		            {
		                token : "comment",
		                regex : "\\/\\/.*$"
		            },
		            {
		                token : "comment", // multi line comment
		                regex : "\\/\\*",
		                next : "comment"
		            }, {
		                token : "string", // single line
		                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
		            }, {
		                token : "string", // multi line string start
		                regex : '["].*\\\\$',
		                next : "qqstring"
		            }, {
		                token : "string", // single line
		                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
		            }, {
		                token : "string", // multi line string start
		                regex : "['].*\\\\$",
		                next : "qstring"
		            }, {
		                token : "constant.numeric",
		                regex : numRe + "(?:em|ex|px|cm|mm|in|pt|pc|deg|rad|grad|ms|s|hz|khz|%)"
		            }, {
		                token : "constant.numeric", // hex6 color
		                regex : "#[a-f0-9]{6}"
		            }, {
		                token : "constant.numeric", // hex3 color
		                regex : "#[a-f0-9]{3}"
		            }, {
		                token : "constant.numeric",
		                regex : numRe
		            }, {
		                token : ["support.function", "string", "support.function"],
		                regex : "(url\\()(.*)(\\))"
		            }, {
		                token : function(value) {
		                    if (properties.hasOwnProperty(value.toLowerCase()))
		                        return "support.type";
		                    if (keywords.hasOwnProperty(value))
		                        return "keyword";
		                    else if (constants.hasOwnProperty(value))
		                        return "constant.language";
		                    else if (functions.hasOwnProperty(value))
		                        return "support.function";
		                    else if (colors.hasOwnProperty(value.toLowerCase()))
		                        return "support.constant.color";
		                    else if (tags.hasOwnProperty(value.toLowerCase()))
		                        return "variable.language";
		                    else
		                        return "text";
		                },
		                regex : "\\-?[@a-z_][@a-z0-9_\\-]*"
		            }, {
		                token : "variable",
		                regex : "[a-z_\\-$][a-z0-9_\\-$]*\\b"
		            }, {
		                token: "variable.language",
		                regex: "#[a-z0-9-_]+"
		            }, {
		                token: "variable.language",
		                regex: "\\.[a-z0-9-_]+"
		            }, {
		                token: "variable.language",
		                regex: ":[a-z0-9-_]+"
		            }, {
		                token: "constant",
		                regex: "[a-z0-9-_]+"
		            }, {
		                token : "keyword.operator",
		                regex : "<|>|<=|>=|==|!=|-|%|#|\\+|\\$|\\+|\\*"
		            }, {
		                token : "paren.lparen",
		                regex : "[[({]"
		            }, {
		                token : "paren.rparen",
		                regex : "[\\])}]"
		            }, {
		                token : "text",
		                regex : "\\s+"
		            }, {
		                caseInsensitive: true
		            }
		        ],
		        "comment" : [
		            {
		                token : "comment", // closing comment
		                regex : "\\*\\/",
		                next : "start"
		            }, {
		                defaultToken : "comment"
		            }
		        ],
		        "qqstring" : [
		            {
		                token : "string",
		                regex : '(?:(?:\\\\.)|(?:[^"\\\\]))*?"',
		                next : "start"
		            }, {
		                token : "string",
		                regex : '.+'
		            }
		        ],
		        "qstring" : [
		            {
		                token : "string",
		                regex : "(?:(?:\\\\.)|(?:[^'\\\\]))*?'",
		                next : "start"
		            }, {
		                token : "string",
		                regex : '.+'
		            }
		        ]
		    };
		};
		
		oop.inherits(ScssHighlightRules, TextHighlightRules);
		
		exports.ScssHighlightRules = ScssHighlightRules;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/xml/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var lang = require("../../lib/lang");
		var TextMode = require("../text").Mode;
		var XmlHighlightRules = require("./xml_highlight_rules").XmlHighlightRules;
		var XmlBehaviour = require("../behaviour/xml").XmlBehaviour;
		var XmlFoldMode = require("../folding/xml").FoldMode;
		var WorkerClient = require("../../worker/worker_client").WorkerClient;
		
		var Mode = function() {
		   this.HighlightRules = XmlHighlightRules;
		   this.$behaviour = new XmlBehaviour();
		   this.foldingRules = new XmlFoldMode();
		};
		
		oop.inherits(Mode, TextMode);
		
		(function() {
		
		    this.voidElements = lang.arrayToMap([]);
		
		    this.blockComment = {start: "<!--", end: "-->"};
		
		    this.createWorker = function(session) {
		        var worker = new WorkerClient(["ace"], "ace/mode/xml_worker", "Worker");
		        worker.attachToDocument(session.getDocument());
		
		        worker.on("error", function(e) {
		            session.setAnnotations(e.data);
		        });
		
		        worker.on("terminate", function() {
		            session.clearAnnotations();
		        });
		
		        return worker;
		    };
		    
		    this.$id = "ace/mode/xml";
		}).call(Mode.prototype);
		
		exports.Mode = Mode;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/mode/xml/xml_highlight_rules.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		var oop = require("../../lib/oop");
		var TextHighlightRules = require("../text/text_highlight_rules").TextHighlightRules;
		
		var XmlHighlightRules = function(normalize) {
		    // http://www.w3.org/TR/REC-xml/#NT-NameChar
		    // NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
		    // NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
		    var tagRegex = "[_:a-zA-Z\xc0-\uffff][-_:.a-zA-Z0-9\xc0-\uffff]*";
		
		    this.$rules = {
		        start : [
		            {token : "string.cdata.xml", regex : "<\\!\\[CDATA\\[", next : "cdata"},
		            {
		                token : ["punctuation.instruction.xml", "keyword.instruction.xml"],
		                regex : "(<\\?)(" + tagRegex + ")", next : "processing_instruction"
		            },
		            {token : "comment.start.xml", regex : "<\\!--", next : "comment"},
		            {
		                token : ["xml-pe.doctype.xml", "xml-pe.doctype.xml"],
		                regex : "(<\\!)(DOCTYPE)(?=[\\s])", next : "doctype", caseInsensitive: true
		            },
		            {include : "tag"},
		            {token : "text.end-tag-open.xml", regex: "</"},
		            {token : "text.tag-open.xml", regex: "<"},
		            {include : "reference"},
		            {defaultToken : "text.xml"}
		        ],
		
		        processing_instruction : [{
		            token : "entity.other.attribute-name.decl-attribute-name.xml",
		            regex : tagRegex
		        }, {
		            token : "keyword.operator.decl-attribute-equals.xml",
		            regex : "="
		        }, {
		            include: "whitespace"
		        }, {
		            include: "string"
		        }, {
		            token : "punctuation.xml-decl.xml",
		            regex : "\\?>",
		            next : "start"
		        }],
		
		        doctype : [
		            {include : "whitespace"},
		            {include : "string"},
		            {token : "xml-pe.doctype.xml", regex : ">", next : "start"},
		            {token : "xml-pe.xml", regex : "[-_a-zA-Z0-9:]+"},
		            {token : "punctuation.int-subset", regex : "\\[", push : "int_subset"}
		        ],
		
		        int_subset : [{
		            token : "text.xml",
		            regex : "\\s+"
		        }, {
		            token: "punctuation.int-subset.xml",
		            regex: "]",
		            next: "pop"
		        }, {
		            token : ["punctuation.markup-decl.xml", "keyword.markup-decl.xml"],
		            regex : "(<\\!)(" + tagRegex + ")",
		            push : [{
		                token : "text",
		                regex : "\\s+"
		            },
		            {
		                token : "punctuation.markup-decl.xml",
		                regex : ">",
		                next : "pop"
		            },
		            {include : "string"}]
		        }],
		
		        cdata : [
		            {token : "string.cdata.xml", regex : "\\]\\]>", next : "start"},
		            {token : "text.xml", regex : "\\s+"},
		            {token : "text.xml", regex : "(?:[^\\]]|\\](?!\\]>))+"}
		        ],
		
		        comment : [
		            {token : "comment.end.xml", regex : "-->", next : "start"},
		            {defaultToken : "comment.xml"}
		        ],
		
		        reference : [{
		            token : "constant.language.escape.reference.xml",
		            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
		        }],
		
		        attr_reference : [{
		            token : "constant.language.escape.reference.attribute-value.xml",
		            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
		        }],
		
		        tag : [{
		            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag.punctuation.end-tag-open.xml", "meta.tag.tag-name.xml"],
		            regex : "(?:(<)|(</))((?:" + tagRegex + ":)?" + tagRegex + ")",
		            next: [
		                {include : "attributes"},
		                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : "start"}
		            ]
		        }],
		
		        tag_whitespace : [
		            {token : "text.tag-whitespace.xml", regex : "\\s+"}
		        ],
		        // for doctype and processing instructions
		        whitespace : [
		            {token : "text.whitespace.xml", regex : "\\s+"}
		        ],
		
		        // for doctype and processing instructions
		        string: [{
		            token : "string.xml",
		            regex : "'",
		            push : [
		                {token : "string.xml", regex: "'", next: "pop"},
		                {defaultToken : "string.xml"}
		            ]
		        }, {
		            token : "string.xml",
		            regex : '"',
		            push : [
		                {token : "string.xml", regex: '"', next: "pop"},
		                {defaultToken : "string.xml"}
		            ]
		        }],
		
		        attributes: [{
		            token : "entity.other.attribute-name.xml",
		            regex : tagRegex
		        }, {
		            token : "keyword.operator.attribute-equals.xml",
		            regex : "="
		        }, {
		            include: "tag_whitespace"
		        }, {
		            include: "attribute_value"
		        }],
		
		        attribute_value: [{
		            token : "string.attribute-value.xml",
		            regex : "'",
		            push : [
		                {token : "string.attribute-value.xml", regex: "'", next: "pop"},
		                {include : "attr_reference"},
		                {defaultToken : "string.attribute-value.xml"}
		            ]
		        }, {
		            token : "string.attribute-value.xml",
		            regex : '"',
		            push : [
		                {token : "string.attribute-value.xml", regex: '"', next: "pop"},
		                {include : "attr_reference"},
		                {defaultToken : "string.attribute-value.xml"}
		            ]
		        }]
		    };
		
		    if (this.constructor === XmlHighlightRules)
		        this.normalizeRules();
		};
		
		
		(function() {
		
		    this.embedTagRules = function(HighlightRules, prefix, tag){
		        this.$rules.tag.unshift({
		            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
		            regex : "(<)(" + tag + "(?=\\s|>|$))",
		            next: [
		                {include : "attributes"},
		                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : prefix + "start"}
		            ]
		        });
		
		        this.$rules[tag + "-end"] = [
		            {include : "attributes"},
		            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>",  next: "start",
		                onMatch : function(value, currentState, stack) {
		                    stack.splice(0);
		                    return this.token;
		            }}
		        ]
		
		        this.embedRules(HighlightRules, prefix, [{
		            token: ["meta.tag.punctuation.end-tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
		            regex : "(</)(" + tag + "(?=\\s|>|$))",
		            next: tag + "-end"
		        }, {
		            token: "string.cdata.xml",
		            regex : "<\\!\\[CDATA\\["
		        }, {
		            token: "string.cdata.xml",
		            regex : "\\]\\]>"
		        }]);
		    };
		
		}).call(TextHighlightRules.prototype);
		
		oop.inherits(XmlHighlightRules, TextHighlightRules);
		
		exports.XmlHighlightRules = XmlHighlightRules;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/theme/tomorrow/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		exports.isDark = false;
		exports.cssClass = "ace-tomorrow";
		exports.cssText = require("./tomorrow.css");
		
		var dom = require("../../lib/dom");
		dom.importCssString(exports.cssText, exports.cssClass);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/theme/tomorrow/tomorrow.css", ["require", "exports", "module", "window","__filename", "__dirname"],
 	function(require, exports, module, window, __filename, __dirname) {
 		module.exports = '.ace-tomorrow .ace_gutter {  background: #f6f6f6;  color: #4D4D4C}.ace-tomorrow .ace_print-margin {  width: 1px;  background: #f6f6f6}.ace-tomorrow {  background-color: #FFFFFF;  color: #4D4D4C}.ace-tomorrow .ace_cursor {  color: #AEAFAD}.ace-tomorrow .ace_marker-layer .ace_selection {  background: #D6D6D6}.ace-tomorrow.ace_multiselect .ace_selection.ace_start {  box-shadow: 0 0 3px 0px #FFFFFF;}.ace-tomorrow .ace_marker-layer .ace_step {  background: rgb(255, 255, 0)}.ace-tomorrow .ace_marker-layer .ace_bracket {  margin: -1px 0 0 -1px;  border: 1px solid #D1D1D1}.ace-tomorrow .ace_marker-layer .ace_active-line {  background: #EFEFEF}.ace-tomorrow .ace_gutter-active-line {  background-color : #dcdcdc}.ace-tomorrow .ace_marker-layer .ace_selected-word {  border: 1px solid #D6D6D6}.ace-tomorrow .ace_invisible {  color: #D1D1D1}.ace-tomorrow .ace_keyword,.ace-tomorrow .ace_meta,.ace-tomorrow .ace_storage,.ace-tomorrow .ace_storage.ace_type,.ace-tomorrow .ace_support.ace_type {  color: #8959A8}.ace-tomorrow .ace_keyword.ace_operator {  color: #3E999F}.ace-tomorrow .ace_constant.ace_character,.ace-tomorrow .ace_constant.ace_language,.ace-tomorrow .ace_constant.ace_numeric,.ace-tomorrow .ace_keyword.ace_other.ace_unit,.ace-tomorrow .ace_support.ace_constant,.ace-tomorrow .ace_variable.ace_parameter {  color: #F5871F}.ace-tomorrow .ace_constant.ace_other {  color: #666969}.ace-tomorrow .ace_invalid {  color: #FFFFFF;  background-color: #C82829}.ace-tomorrow .ace_invalid.ace_deprecated {  color: #FFFFFF;  background-color: #8959A8}.ace-tomorrow .ace_fold {  background-color: #4271AE;  border-color: #4D4D4C}.ace-tomorrow .ace_entity.ace_name.ace_function,.ace-tomorrow .ace_support.ace_function,.ace-tomorrow .ace_variable {  color: #4271AE}.ace-tomorrow .ace_support.ace_class,.ace-tomorrow .ace_support.ace_type {  color: #C99E00}.ace-tomorrow .ace_heading,.ace-tomorrow .ace_markup.ace_heading,.ace-tomorrow .ace_string {  color: #718C00}.ace-tomorrow .ace_entity.ace_name.ace_tag,.ace-tomorrow .ace_entity.ace_other.ace_attribute-name,.ace-tomorrow .ace_meta.ace_tag,.ace-tomorrow .ace_string.ace_regexp,.ace-tomorrow .ace_variable {  color: #C82829}.ace-tomorrow .ace_comment {  color: #8E908C}.ace-tomorrow .ace_indent-guide {  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bdu3f/BwAlfgctduB85QAAAABJRU5ErkJggg==) right repeat-y}';
 	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/theme/twilight/index.js", ["require", "exports", "module", "window","__filename", "__dirname"], function(require, exports, module, window, __filename, __dirname) {
		exports.isDark = true;
		exports.cssClass = "ace-twilight";
		exports.cssText = require("./twilight.css");
		
		var dom = require("../../lib/dom");
		dom.importCssString(exports.cssText, exports.cssClass);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_view/controller/commands/editor/ace/editor/theme/twilight/twilight.css", ["require", "exports", "module", "window","__filename", "__dirname"],
 	function(require, exports, module, window, __filename, __dirname) {
 		module.exports = '.ace-twilight .ace_gutter {  background: #232323;  color: #E2E2E2}.ace-twilight .ace_print-margin {  width: 1px;  background: #232323}.ace-twilight {  background-color: #141414;  color: #F8F8F8}.ace-twilight .ace_cursor {  color: #A7A7A7}.ace-twilight .ace_marker-layer .ace_selection {  background: rgba(221, 240, 255, 0.20)}.ace-twilight.ace_multiselect .ace_selection.ace_start {  box-shadow: 0 0 3px 0px #141414;}.ace-twilight .ace_marker-layer .ace_step {  background: rgb(102, 82, 0)}.ace-twilight .ace_marker-layer .ace_bracket {  margin: -1px 0 0 -1px;  border: 1px solid rgba(255, 255, 255, 0.25)}.ace-twilight .ace_marker-layer .ace_active-line {  background: rgba(255, 255, 255, 0.031)}.ace-twilight .ace_gutter-active-line {  background-color: rgba(255, 255, 255, 0.031)}.ace-twilight .ace_marker-layer .ace_selected-word {  border: 1px solid rgba(221, 240, 255, 0.20)}.ace-twilight .ace_invisible {  color: rgba(255, 255, 255, 0.25)}.ace-twilight .ace_keyword,.ace-twilight .ace_meta {  color: #CDA869}.ace-twilight .ace_constant,.ace-twilight .ace_constant.ace_character,.ace-twilight .ace_constant.ace_character.ace_escape,.ace-twilight .ace_constant.ace_other,.ace-twilight .ace_heading,.ace-twilight .ace_markup.ace_heading,.ace-twilight .ace_support.ace_constant {  color: #CF6A4C}.ace-twilight .ace_invalid.ace_illegal {  color: #F8F8F8;  background-color: rgba(86, 45, 86, 0.75)}.ace-twilight .ace_invalid.ace_deprecated {  text-decoration: underline;  font-style: italic;  color: #D2A8A1}.ace-twilight .ace_support {  color: #9B859D}.ace-twilight .ace_fold {  background-color: #AC885B;  border-color: #F8F8F8}.ace-twilight .ace_support.ace_function {  color: #DAD085}.ace-twilight .ace_list,.ace-twilight .ace_markup.ace_list,.ace-twilight .ace_storage {  color: #F9EE98}.ace-twilight .ace_entity.ace_name.ace_function,.ace-twilight .ace_meta.ace_tag,.ace-twilight .ace_variable {  color: #AC885B}.ace-twilight .ace_string {  color: #8F9D6A}.ace-twilight .ace_string.ace_regexp {  color: #E9C062}.ace-twilight .ace_comment {  font-style: italic;  color: #5F5A60}.ace-twilight .ace_variable {  color: #7587A6}.ace-twilight .ace_xml-pe {  color: #494949}.ace-twilight .ace_indent-guide {  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMQERFpYLC1tf0PAAgOAnPnhxyiAAAAAElFTkSuQmCC) right repeat-y}';
 	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
