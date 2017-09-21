"use strict";

(function(){

    var widget_handlers={};
    var widget_tree={};

    class widget_factory {
	
	constructor(){
	    this.widgets={};
	    this.parser = new DOMParser();
	}

	parse(source){
	    return this.parser.parseFromString(source, "text/html");
	}
	
	get_widget(wname){
	    var wlib=this;
	    return new Promise(function(ok, fail){
		if(wlib.widgets[wname]!==undefined)
		    ok(wlib.widgets[wname]);
		else
		    xhr_query(wname+".widget.html").then(function(source){
			wlib.widgets[wname]= { source : source};
			ok(wlib.widgets[wname]);
		    }).catch(fail);
	    });
	}

	create_random_name(w_class){
	    return w_class+"-"+Math.random().toString(36).substring(2);
	}
	
	create_widget(w_class, tree, pnode){
	    var wlib=this;
	    return new Promise(function(ok, fail){
		wlib.get_widget(w_class).then(function(w){
		    var doc=wlib.parse(w.source);
		    if (tree.name===undefined)
			name=wlib.create_random_name(w_class);
		    if(tree.builders===undefined) tree.builders=[];
		    
		    wlib.build(doc, tree).then(function(){
			if(pnode!==undefined){
			    while(doc.body.hasChildNodes()){
				pnode.appendChild(doc.body.firstChild);
			    }
			    
			}
			ok(doc.body);
		    }).catch(fail);
		}).catch(fail);    
	    });
	}

	process_content(doc, tree){

	    var w_vars=doc.querySelectorAll("[data-var]");
	    var w_scripts=doc.getElementsByTagName("script");
	    var w_styles=doc.getElementsByTagName("style");
	    
	    if(w_scripts.length!==0) {
		
		var s=w_scripts.item(0);
		console.log(name + " proces" + s.innerHTML);
		tree.builders.push(Function(s.innerHTML));
		
		while(w_scripts.length!==0)
		    w_scripts.item(0).parentNode.removeChild(w_scripts.item(0));
		
	    }
	    
	    if(w_styles.length!==0) {
		var s=w_styles.item(0);
		//console.log(s.innerHTML);
		document.head.appendChild(s);
		
		while(w_scripts.length!==0)
		    w_scripts.item(0).parentNode.removeChild(w_scripts.item(0));
	    }
	    
	    
	    
	    for(let e=0;e< w_vars.length;e++){
		tree[w_vars[e].dataset.var]=w_vars[e];
	    }
	    
	}
	
	build(doc, tree){
	    
	    var wlib=this;
	    
	    return new Promise(function(ok, fail){
		var widgets=doc.body.getElementsByTagName("x-widget");

		if(widgets.length===0) ok(); else {

		    function build_child(){
			
			var cw=widgets[0];
			var w_class=cw.dataset.class;
			let name=cw.getAttribute("name");
			if(name===null) name=wlib.create_random_name(w_class);
			var child_tree=tree[name]={ builders : [] };
			
			wlib.get_widget(w_class).then(function(w){
			    var child_doc=wlib.parse(w.source);

			    wlib.process_content(child_doc, child_tree);
			    
			    wlib.build(child_doc, child_tree).then(function(){
				
				while(child_doc.body.hasChildNodes())
				    //console.log("Cloning node ["+n.tagName+"]["+n.dataset.class+"] parent " + n.parentNode+ " remains " + widgets.length);
				    cw.parentNode.insertBefore(child_doc.body.firstChild, cw);
				
				cw.parentNode.removeChild(cw);
				//console.log("After removing widget ["+n.dataset.class+"] parent " + n.parentNode+ " remains " + widgets.length);

				
				child_tree.builders.forEach(function(h){
				    h.call(child_tree);
				});
				
				if(widget_handlers[name]!==undefined)
				    widget_handlers[name].forEach(function(h){
					h.call(child_tree);
				    });
				
				
				if(widgets.length>0) build_child(); else ok();
				
				
			    }).catch(fail);
			    
			}).catch(fail);
		    }
		    
		    build_child();
		}
	    });
	    
	}
    }
    
    window.handle_widget=function(w_name, f){
	if(widget_handlers[w_name]===undefined) widget_handlers[w_name]=[];
	widget_handlers[w_name].push(f);
    };
    
    window.factory = new widget_factory();
    
    window.addEventListener("load", function(){
	factory.build(document, widget_tree);
    });
    
})();
