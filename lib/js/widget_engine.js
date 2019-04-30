"use strict";


(function(){

    ///Widget engine implementation
    
    var widget_handlers={};
    
    class widget {
	constructor(name, tree){
	    this.builders = [];
	    this.name=name;
	    this.parent=tree;
	}

	find_widget(name){
	    if(name==this.name) return this;
	    
	    for (var p in this.childs){
		var obj=this.childs[p].find_widget(name);
		if(obj!==undefined) return obj;
	    }
	    return undefined;
	}

	
    };
    
    var widget_tree = new widget("root");
    
    
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
	    this.queue=[];
	    this.lock=false;
	}

	parse(source) {
	    var domtmp=this.parser.parseFromString(source, "text/html");

	    var ids = domtmp.body.getElementsByTagName("x-ids");
	    if(ids.length>0){
		var ids_txt=ids[0].textContent;
		var ids=ids_txt.split(" ");
		var rnd_ids=[];
		for(let k=0;k<ids.length;k++){
		    rnd_ids.push(Math.random().toString(36).substring(2));
		}
		
		var src_split = source.split("\"");
		var src_regen = "";
		for(let s=0;s<src_split.length;s++){
		    let str=src_split[s];

		    if(s%2==0){
			
			src_regen+=str;
		    }else{
			
			let k=0;
			for(;k<ids.length;k++){
			    if(str==ids[k]){
			
				src_regen+='"'+str+rnd_ids[k]+'"';
				break;
			    }
			}
			if(k==ids.length) src_regen+='"'+str+'"';
		    }
		}

		source=src_regen;
	    }

	    console.log( source);

	    return this.parser.parseFromString(source, "text/html");
	}

	enqueue(cb){
	    //console.log("Enqueue request");
	    this.queue.push(cb);
	}

	unlock(){
	    if(this.queue.length>0){
		let cb=this.queue.pop();
		cb();
	    }else this.lock=false;
	}
	

	async download_widget(wname){
	    var source = await xhr_query("widgets/"+wname+".html");
	    //console.log("widget "+wname+" source downloaded !") ;
	    this.widgets[wname]= { source : source};
	    return this.widgets[wname];
	}

	async get_widget(wname){
	    var wlib=this;

	    return new Promise(function(ok, fail){		
		
		if(wlib.lock==true){
	    	    wlib.enqueue(function(){
			wlib.lock=true;
			look_for_widget().then(function(w){
			    wlib.unlock();
			    ok(w);
			}).catch(function(e){
			    wlib.unlock();
			    fail(e);
			});
			
	    	    });
		}else{
	    	    wlib.lock=true;
	    	    look_for_widget().then(function(w){
			//console.log("Widget downloaded, oking... queue="+wlib.queue.length);
			ok(w);
			wlib.unlock();

		    }).catch(function(e){
			wlib.unlock();
			fail(e);
		    });
		}
		
		async function look_for_widget(){
		    var w=null;
		    //console.log("llonking widget ["+wname+"]" + wlib.widgets[wname]);
		    if(wlib.widgets[wname]!==undefined){
			w=wlib.widgets[wname];
		    }
		    else w= await wlib.download_widget(wname);
		    //console.log("await done w="+w);
		    return w;
		}
		
	    });
	}
	
	create_random_name(w_class){
	    return w_class+"-"+Math.random().toString(36).substring(2);
	}
	create_child(tree, name){
	    if(tree.childs===undefined) tree.childs={};
	    tree.childs[name]=new widget(name, tree);
//	    tree.childs[name]={ builders : [], name : name, parent : tree };
	    return tree.childs[name];
	}
	create_widget(w_class, root_tree, pnode, name){
	    var wlib=this;
	    return new Promise(function(ok, fail){
		wlib.get_widget(w_class).then(function(w){
		    var doc=wlib.parse(w.source);
		    if (pnode!==undefined && typeof pnode == "string"){
			name=pnode; pnode=undefined;
		    }
		    if (name===undefined)
			name=wlib.create_random_name(w_class);
		    var tree=wlib.create_child(root_tree, name);
		    //console.log("Create widget " + name);
		    if(tree.builders===undefined) tree.builders=[];
		    
		    wlib.build(doc, tree, w).then(function(){
			if(pnode!==undefined){
			    while(doc.body.hasChildNodes()){
// =======
// 	get_widget(wname) {
// 	    var wlib = this;
// 	    return new Promise(function(ok, fail) {
// 		if(wlib.widgets[wname] !== undefined)
// 		    ok(wlib.widgets[wname]);
// 		else
// 		    xhr_query("widgets/"+wname+".html").then(function(source) {
// 			wlib.widgets[wname] = {source : source};
// 			ok(wlib.widgets[wname]);
// 		    }).catch(fail);
// 	    });
// 	}

// 	create_random_name(w_class) {
// 	    return w_class+"-"+Math.random().toString(36).substring(2);
// 	}
// 	create_child(tree, name) {
// 	    if(tree.childs === undefined) tree.childs = {};
// 	    tree.childs[name] = {builders : [], name : name, parent : tree };
// 	    return tree.childs[name];
// 	}
// 	create_widget(w_class, root_tree, pnode, name) {
// 	    var wlib = this;
// 	    return new Promise(function(ok, fail) {
// 		wlib.get_widget(w_class).then(function(w) {
// 		    var doc = wlib.parse(w.source);
		    
// 		    if (name === undefined)
// 			name = wlib.create_random_name(w_class);

// 		    var tree = wlib.create_child(root_tree, name);

// 		    if(tree.builders === undefined) tree.builders = [];
		    
// 		    wlib.build(doc, tree).then(function() {
// 			if(pnode !== undefined) {
// 			    while(doc.body.hasChildNodes()) {
// >>>>>>> 5a76bf9421e8429cce6c5e8bd2ccd8dcc4257f8c
				pnode.appendChild(doc.body.firstChild);
			    }
			    
			}
			ok(tree);
		    }).catch(fail);
		}).catch(fail);    
	    });
	}


	process_content(doc, tree, widget){

	    var w_vars=doc.querySelectorAll("[data-var]");
	    var w_scripts=doc.getElementsByClassName("builder");
	    var w_styles=doc.getElementsByTagName("style");
	    
	    //if(w_scripts.length!==0) {
		
		//var s=w_scripts.item(0);
		//console.log(tree.name + " adding builder /"+w_scripts.length+" parentnode " + s.parentNode + " content "  + s.innerHTML);
		
		//console.log(" parentnode " + s.parentNode);


	    
	    while(w_scripts.length!==0){
		s=w_scripts.item(0);
		tree.builders.push(Function(s.innerHTML));
		s.parentNode.removeChild(s);
	    }
	    

	    if(true /*widget===undefined || widget.headers_set===undefined*/){
		//if(widget!==undefined) console.log("Initialize ext scripts for " + widget.source);
		var w_other_scripts=doc.getElementsByTagName("script");
		
		if(tree!==widget_tree){
		    while(w_other_scripts.length!==0){
			s=w_other_scripts.item(0);
			s.parentNode.removeChild(s);
			var ssrc= s.getAttribute("src");
			console.log("script source is [" +ssrc + "]");
			if( ssrc!==null){
			    
			    console.log("Adding to head !" + ssrc);
			    var ss=document.createElement("script"); ss.innerHTML=s.innerHTML; ss.src=s.src;
			    document.head.appendChild(ss);
			}else{
			    var sf=Function(s.innerHTML);
			    sf();
			}
			//console.log("Moving scripts n="+w_other_scripts.length + " src is " + s.src + " content " + s.innerHTML);
			
		    }
		}
		
		//console.log("Begin Moving styles : N="+w_styles.length);
		
		
		for(var i=0;i<w_styles.length;i++){
		    var s=w_styles.item(i);
		    document.head.appendChild(s);
		}

		if(widget!==undefined)
		    widget.headers_set=true;
		
		// while(w_styles.length!==0) {
		// 	console.log("Moving styles ... N="+w_styles.length);
		// 	var s=w_styles.item(0);
		// 	//console.log(s.innerHTML);
		// 	s.addEventListener('loaded', function(){
		// 	    console.log("Loaded ! N="+w_styles.length);
		// 	});
		// 	document.head.appendChild(s);
		// }
		
		//while(w_scripts.length!==0)
		//w_scripts.item(0).parentNode.removeChild(w_scripts.item(0));
	    }else{
	
	    }
	    

	    
	    
	    for(let e=0;e< w_vars.length;e++){
		tree[w_vars[e].dataset.var]=w_vars[e];
// =======
// 	    while(w_styles.length !== 0) {
// 		var s = w_styles.item(0);
// 		document.head.appendChild(s);
// 	    }
	    
// 	    for(let e = 0; e < w_vars.length; e++) {
// 		tree[w_vars[e].dataset.var] = w_vars[e];
// >>>>>>> 5a76bf9421e8429cce6c5e8bd2ccd8dcc4257f8c
	    }
	    
	}

	build(doc, tree, widget){
	    
	    var wlib = this;
	    
	    return new Promise(function(ok, fail) {
		var widgets = doc.body.getElementsByTagName("x-widget");
		
		if(tree.builders === undefined) tree.builders = [];

		wlib.process_content(doc, tree, widget);
		
		function build_child() {

		    if(widgets.length > 0) {
			
			var cw = widgets[0];
			var w_class = cw.dataset.class;
			let name = cw.getAttribute("name");

			if(name === null) name = wlib.create_random_name(w_class);
			
			var child_tree = wlib.create_child(tree, name);
			child_tree.arguments={};
			
			//var nodes=[], values=[];
			for (var att, i = 0, atts = cw.attributes, n = atts.length; i < n; i++){
			    att = atts[i];
			    child_tree.arguments[att.nodeName]=att.nodeValue;
			}

			

			wlib.get_widget(w_class).then(function(w) {
			    var child_doc = wlib.parse(w.source);
			    
			    wlib.build(child_doc, child_tree, widget).then(function(){

				//console.log("Copy body " + child_doc.body.innerHTML);
				
				while(child_doc.body.hasChildNodes()) {
				    cw.parentNode.insertBefore(child_doc.body.firstChild, cw);
				}
				cw.parentNode.removeChild(cw);

				build_child();
				
			    }).catch(fail);
			    
			}).catch(fail);
		    }else{
			
			tree.builders.forEach(function(h) {
			    //console.log("BUILDING Child ["+tree.name+"] arguments " + JSON.stringify(tree.arguments));
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

    //window.find_widget=find_widget;
    window.widget_tree=widget_tree;
    window.load_script=load_script;

	    window.addEventListener("load", function() {
	factory.build(document, widget_tree);
    });
    
})();
