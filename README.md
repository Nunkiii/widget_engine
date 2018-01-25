# widget_engine
Lightweight HTML/JavaScript widget engine to create reusable web components.

See the **test** directory to learn how to use this simple library.

##Index.html

```html
<!DOCTYPE html>

<html>
    
    <head>
	
	<meta charset="utf-8">
	<title>Widget Engine Test</title>
	
	<script src="../lib/js/xhr.js"></script>
	<script src="../lib/js/widget_engine.js"></script>

    </head>

    <h1>A simple, lightweight and powerful Widget Engine !</h1>

    <p>
	Learn how to use the widget engine by inspecting the source of this <i>index.html</i> file as well as the test widget's files in the "widgets" subdirectory.
    </p>

    <x-widget  data-class="simple"></x-widget>
    <x-widget  data-class="simple_script"></x-widget>
    <x-widget  data-class="widget_tree"></x-widget>

</html>

```

##Test widgets

###simple.html

```html

<h4>This is a simple widget</h4>

You can write any HTML here...


```

###simple_script.html

```html
<h4>Simple widget with a control script</h4>

<p>You can handle your widget's interactivity using a <i>builder script</i>. The builder script is contained in a script tag with "builder" as class attribute.</p>
<p>Any HTML element in your widget can be identified for easy access using the <i>data-var</i> attribute, for example to handle click on a button :
    <center> <button data-var="b">Click me!</button> </center>
</p>


<script class="builder">

 this.b.addEventListener("click",function(){ alert("You clicked me!");});
 
</script>

```

###widget_tree.html

```html

<h4>Widgets can communicate with each other</h4>

<p>Widgets can be given a "name" attribute and will be accessible in the tree by accessing the <i>childs</i> object. </p>
<p>For example here we create two instances of the same widget and show how we can communicate with these widgets. </p>

<ul>
    <li> <x-widget data-class="test_com_widget" name="A"> </x-widget> </li>
    <li> <x-widget data-class="test_com_widget" name="B"> </x-widget> </li>
</ul>

<p>The following "D" div will be accessed by our childs : 
    <div data-var="D"> </div>
</p>

<script class="builder">
 console.log("Hello");
 
 this.childs.A.set_title("This title was changed by the parent widget!");
 this.childs.B.content.innerHTML="We can also directly access a widget's element identified by a <i>data-var</i> attribute";
 
</script>

```

###test_com_widget.html

```html
<h5 data-var="title">Default title </h5>
<div data-var="content">Default content</div>
<p>Click this button to change our parent's "D" div'c content : <button data-var="b">Click me!</button>

<script class="builder">
 var w=this;


 //We can implement widget's API by attaching functions to our widget : 
 
 this.set_title=function(title){
     w.title.innerHTML=title;
 }

 this.b.addEventListener("click", function(){
     w.parent.D.innerHTML="This was changed by child widget " + w.name + " :) ";
 });
 
</script>

```

