// Generic AJAX call  

function xhr_query(query, opts) {

    return new Promise(function (ok, fail) {

	var xhr = new XMLHttpRequest();    
	var method = "GET";
	
	if ("withCredentials" in xhr) {
	    // Check if the XMLHttpRequest object has a
	    // "withCredentials" property.  "withCredentials" only
	    // exists on XMLHTTPRequest2 objects.
	} else if (typeof XDomainRequest != "undefined") {
	    // Otherwise, check if XDomainRequest.  XDomainRequest
	    // only exists in IE, and is IE's way of making CORS
	    // requests.
	    xhr = new XDomainRequest();
	} else {
	    console.log("CORS not supported by your browser! Request could fail...")
	}
	
	if(opts !== undefined) {
	    
	    if(typeof opts.method != 'undefined')
		method = opts.method; 
	    
	    if(typeof opts.type != 'undefined')
		xhr.responseType = opts.type; //"arraybuffer"
	    
	    if(typeof opts.progress != 'undefined') {
		xhr.addEventListener("progress", function(e) {
		    opts.progress({m : 'Loading', v : e.loaded, e : e});
		}, false);
	    }
	    
	}
	
	xhr.upload.addEventListener("error", function(ev) {
	    fail(new Error("XHTTP Error upload[" + query + "]: " + xhr.statusText));
	}, false);
	
	xhr.addEventListener("error", function(ev) {
	    fail(new Error("XHTTP Error [" + query + "] : [" + xhr.statusText.toString() + "] ev: " + ev));
	}, false);
	
	xhr.addEventListener("load", function(ev) {
	    
	    if(xhr.status==200){
		try{
		    var answer=(xhr.responseType=='arraybuffer' || xhr.responseType=='blob' ) ?  xhr.response :  (xhr.responseType =='document' ? xhr.responseXML : xhr.responseText);
		    ok(answer);
		}
		catch(e){ fail(e); }
	    }
	    else
		fail(new Error("XHTTP Bad status " + xhr.status + " [" + query + "] : " + xhr.statusText,null));
	},false);
	
	xhr.open(method, query, true);
	
	if(method == "POST") {
	    var post_data = "";
	    if(opts.post_data !== undefined) post_data = opts.post_data;
	    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    xhr.send(post_data);
	}
	else
	    xhr.send();
    });	
}
