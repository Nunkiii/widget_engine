# widget_engine
Lightweight HTML/JavaScript widget engine to create reusable web components.

See the **test/** directory to learn how to use this simple library.

## Index.html

```html

    <!DOCTYPE html>
    <meta charset="utf-8">
    <title>Widget Engine test</title>
    	
    <script src="../lib/js/xhr.js"></script>
    <script src="../lib/js/widget_engine.js"></script>
    
    <body>
    
      <h1>A simple, lightweight and powerful Widget Engine !</h1>
    
      <p>Learn how to use the widget engine by inspecting the source of
        this <code>index.html</code> file as well as the test widget's
        files in the "widgets" subdirectory.
    
        <x-widget data-class="simple"></x-widget>
        <x-widget data-class="simple_script"></x-widget>
        <x-widget data-class="widget_tree"></x-widget>
    
```

## Test widgets

### simple.html

```html
    
    <h2>This is a simple widget</h2>
    
    You can write any <code>HTML</code> here...

```

### simple_script.html

```html

    <h2>Simple widget with a control script</h2>
    
    <p>You can handle your widget's interactivity using a <em>builder
    script</em>. The builder script is contained in a script tag with
      "builder" as class attribute.
      
    <p>Any HTML element in your widget can be identified for easy access
      using the <i>data-var</i> attribute, for example to handle click on
      a button:
      <button data-var="b">Click me!</button> </center>
    
    
    <script class="builder">
    
      this.b.addEventListener("click",function(){ alert("You clicked me!");});
     
    </script>

```

### widget_tree.html

```html

    <h2>Widgets can communicate with each other</h2>
    
    <p>Widgets can be given a "name" attribute and will be accessible in
    the tree by accessing the <em>childs</em> object.
    
    <p>For example here we create two instances of the same widget and
    show how we can communicate with these widgets.
    
    <ul data-var="list">
        <li> <x-widget data-class="test_com_widget" name="A"> </x-widget> </li>
        <li> <x-widget data-class="test_com_widget" name="B"> </x-widget> </li>
    </ul>
    
    <p>The following "D" div will be accessed by our childs:
      <div data-var="D"> </div>
    
    <h3>Dynamic creation of widgets</h3>
    
    <p>It is also possible to dynamically create widgets from our
      JavaScript by using
      the <em>factory</em> <strong>create_widget</strong> function. Click
      this button to add more "test_com_widget" widgets to the list above:
      <button data-var="new_widget">Click to create a widget!</button>
    
      
    <script class="builder">
        
        var w=this;
    
        this.childs.A.set_title("This title was changed by the parent widget!");
        this.childs.B.content.innerHTML="We can also directly access a widget's element identified by a <i>data-var</i> attribute";
    
        var idx=0;
    
        this.new_widget.addEventListener("click", function(){
            var wname="W"+(idx++);
            var li=document.createElement("li"); w.list.appendChild(li);
        
            factory.create_widget("test_com_widget", w, li, wname).then(function(child){
    	    child.set_title("This widget (" + child.name + ") has been dynamically created !");
            });
        });
    
    </script>

```

### test_com_widget.html

```html
    
    <h2 data-var="title">Default title </h2>
    
    <div data-var="content">Default content</div>
    
    <p>Click this button to change our parent's "D" div content:
      <button data-var="b">Click me!</button>
    
    <script class="builder">
      var w=this;
    
      // We can implement widget's API by attaching functions to our widget : 
     
      this.set_title=function(title){
          w.title.innerHTML=title;
      }
    
      this.b.addEventListener("click", function(){
          w.parent.D.innerHTML="This was changed by child widget " + w.name + " :) ";
      });
     
    </script>
    
```

