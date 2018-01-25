////////////////////////////////////////////////////////////////////////////
//
// Generic AJAX call  

function xhr_query(query,opts){

    return new Promise(function (ok, fail){

	var xhr = new XMLHttpRequest();    
	var method="GET";
	
	if ("withCredentials" in xhr) {
	    // Check if the XMLHttpRequest object has a "withCredentials" property.
	    // "withCredentials" only exists on XMLHTTPRequest2 objects.
	} else if (typeof XDomainRequest != "undefined") {
	    // Otherwise, check if XDomainRequest.
	    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
	    xhr = new XDomainRequest();
	} else {
	    console.log("CORS not supported by your browser! Request could fail...")
	    //return null;
	}
	
	if(opts!==undefined){
	    
	    if(typeof opts.method!='undefined')
		method = opts.method; 
	    
	    if(typeof opts.type!='undefined')
		xhr.responseType = opts.type; //"arraybuffer"
	    
	    if(typeof opts.progress != 'undefined'){
		xhr.addEventListener("progress", function(e) {
		    opts.progress({m: 'Loading', v : e.loaded, e : e});
		}, false);
	    }
	    
	}
	
	xhr.upload.addEventListener("error", function(ev){
	    fail(new Error("XHTTP Error upload["+query+"]: " + xhr.statusText));
	}, false);
	
	xhr.addEventListener("error", function(ev){
	    fail(new Error("XHTTP Error ["+query+"] : [" + xhr.statusText.toString() + "] ev: " + ev));
	}, false);
	
	xhr.addEventListener("load", function(ev){
	    
	    //console.log("Response Type [" + xhr.responseType + "] status ["+xhr.status+"] : " + xhr.statusText );
	    
	    if(xhr.status==200){
		
		// if(xhr.responseType=='arraybuffer'){
		// 	console.log("Received Binary bytes "+ xhr.response.byteLength);
		// }else
		// 	console.log("Received Text length "+ xhr.responseText.length);
		
		ok((xhr.responseType=='arraybuffer') ?  xhr.response :  (xhr.responseType =='document' ? xhr.responseXML : xhr.responseText));
	    }
	    else
		fail(new Error("XHTTP Bad status " + xhr.status+ " ["+query+"] : " + xhr.statusText,null));
	},false);
	
	//console.log("xhr query ["+query+"]");
	
	
	xhr.open(method, query, true);
	
	if(method=="POST"){
	    var post_data="";
	    if(opts.post_data!==undefined) post_data=opts.post_data;
	    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	    //xhr.setRequestHeader("Content-length", post_data.length);
	    //xhr.setRequestHeader("Connection", "close");
	    xhr.send(post_data);
	}
	else
	    xhr.send();
    });	
}
