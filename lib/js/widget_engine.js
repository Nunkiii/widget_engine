"use strict";

(function() {

    var widget_handlers = {};
    var widget_tree = {};

    function load_script(path, callback) {

	var done = false;
	var scr = document.createElement('script');
	
	scr.onload = handleLoad;
	scr.onreadystatechange = handleReadyStateChange;
	scr.onerror = handleError;
	scr.src = path;
	document.body.appendChild(scr);
	
	function handleLoad() {
            if (!done) {
		done = true;
		callback(path, "ok");
            }
	}
	
	function handleReadyStateChange() {
            var state;
	    
            if (!done) {
		state = scr.readyState;
		if (state === "complete") {
                    handleLoad();
		}
            }
	}
	function handleError() {
            if (!done) {
		done = true;
		callback(path, "error");
            }
	}
    }
    
    class widget_factory {
	
	constructor() {
	    this.widgets = {};
	    this.parser = new DOMParser();
	}

	parse(source) {
	    return this.parser.parseFromString(source, "text/html");
	}
	
	get_widget(wname) {
	    var wlib = this;
	    return new Promise(function(ok, fail) {
		if(wlib.widgets[wname] !== undefined)
		    ok(wlib.widgets[wname]);
		else
		    xhr_query("widgets/"+wname+".html").then(function(source) {
			wlib.widgets[wname] = {source : source};
			ok(wlib.widgets[wname]);
		    }).catch(fail);
	    });
	}

	create_random_name(w_class) {
	    return w_class+"-"+Math.random().toString(36).substring(2);
	}
	create_child(tree, name) {
	    if(tree.childs === undefined) tree.childs = {};
	    tree.childs[name] = {builders : [], name : name, parent : tree };
	    return tree.childs[name];
	}
	create_widget(w_class, root_tree, pnode, name) {
	    var wlib = this;
	    return new Promise(function(ok, fail) {
		wlib.get_widget(w_class).then(function(w) {
		    var doc = wlib.parse(w.source);
		    
		    if (name === undefined)
			name = wlib.create_random_name(w_class);

		    var tree = wlib.create_child(root_tree, name);

		    if(tree.builders === undefined) tree.builders = [];
		    
		    wlib.build(doc, tree).then(function() {
			if(pnode !== undefined) {
			    while(doc.body.hasChildNodes()) {
				pnode.appendChild(doc.body.firstChild);
			    }
			    
			}
			ok(tree);
		    }).catch(fail);
		}).catch(fail);    
	    });
	}

	process_content(doc, tree) {

	    var w_vars = doc.querySelectorAll("[data-var]");
	    var w_scripts = doc.getElementsByClassName("builder");
	    var w_styles = doc.getElementsByTagName("style");
		
	    while(w_scripts.length !== 0) {
		s = w_scripts.item(0);
		tree.builders.push(Function(s.innerHTML));
		s.parentNode.removeChild(s);
	    }
	    
	    var w_other_scripts = doc.getElementsByTagName("script");

	    if(tree !== widget_tree) {
		while(w_other_scripts.length !== 0) {
		    s = w_other_scripts.item(0);
		    s.parentNode.removeChild(s);
		    var ssrc = s.getAttribute("src");
		    console.log("script source is [" +ssrc + "]");
		    if( ssrc !== null) {

			console.log("Adding to head !" + ssrc);
			var ss = document.createElement("script"); ss.innerHTML = s.innerHTML; ss.src = s.src;
			document.head.appendChild(ss);
		    }else{
			var sf = Function(s.innerHTML);
			sf();
		    }
		    
		}
	    }
	    
	    while(w_styles.length !== 0) {
		var s = w_styles.item(0);
		document.head.appendChild(s);
	    }
	    
	    for(let e = 0; e < w_vars.length; e++) {
		tree[w_vars[e].dataset.var] = w_vars[e];
	    }
	    
	}
	
	build(doc, tree) {
	    
	    var wlib = this;
	    
	    return new Promise(function(ok, fail) {
		var widgets = doc.body.getElementsByTagName("x-widget");
		
		if(tree.builders === undefined) tree.builders = [];

		wlib.process_content(doc, tree);
		
		function build_child() {

		    if(widgets.length > 0) {
			
			var cw = widgets[0];
			var w_class = cw.dataset.class;
			let name = cw.getAttribute("name");
			if(name === null) name = wlib.create_random_name(w_class);
			
			var child_tree = wlib.create_child(tree, name);

			wlib.get_widget(w_class).then(function(w) {
			    var child_doc = wlib.parse(w.source);
			    
			    wlib.build(child_doc, child_tree).then(function() {
				
				while(child_doc.body.hasChildNodes()) {
				    cw.parentNode.insertBefore(child_doc.body.firstChild, cw);
				}
				cw.parentNode.removeChild(cw);

				build_child();
				
			    }).catch(fail);
			    
			}).catch(fail);
		    }else{
			
			tree.builders.forEach(function(h) {
			    h.call(tree);
			});
			
			if(widget_handlers[tree.name] !== undefined)
			    widget_handlers[tree.name].forEach(function(h) {
				h.call(tree);
			    });
			
			ok();
		    }
		}
		
		build_child();
	    
	    });
	    
	}
    }
    
    window.handle_widget = function(w_name, f) {
	if(widget_handlers[w_name] === undefined) widget_handlers[w_name] = [];
	widget_handlers[w_name].push(f);
    };
    
    window.factory = new widget_factory();
    window.widget_tree = widget_tree;
    window.load_script = load_script;
    
    window.addEventListener("load", function() {
	factory.build(document, widget_tree);
    });
    
})();
