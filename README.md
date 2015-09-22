I.js
====

### Stream Everything

I.js is not just any old data-binding library. 

I.js aims to blend together event-based paradigms in a tight, orderly way, that makes more sense to human developers. 

You shouldn't need to know how to handle Stream backpressure or have an advanced Master's degree in Functional Programming to leverage their shared potential. 

All you need is a streaming data source that emits events (like a button, for example), and a destination element to render. It's simple addition.  

### Getting Started

```HTML
	<script type="text/javascript" src="dist/i.min.js"></script>
```

That's it, lol.

### Binding Streams to the DOM

Say you have the following HTML.

```HTML
	<div i-clock ></div>
```

To bind a data stream to this element and refresh it according to a template:

```JavaScript
	var clock = i({
    	id: "clock",
		template: "Time in NY: {{newyork}}"
	});
```

Et voilà quoi. Your `i-clock` div will refresh every second with the latest time.

`clock` is a built-in I.js stream, however, you can also register your own.  

### Binding DOM Elements To Each Other

Say you have the following HTML.

```HTML
	<div>
		 Je m'appelle <span i-name ></span>. Comment vous appelez-vous?
		 <input id="name" type="text" placeholder="Votre nom" />
		 <button id="submit" >Submit</button>
	</div>
```

To bind the `#submit` button to the `i-name` element and refresh it according to a template:

```JavaScript
	var name = i({
    	id: "name",
		fromInput: [{ el: "#testSubmit", method: 'click' }],
        capture: '#name'
	});
```

C'est tout. 

### I don't care to look at code, I want to see a demo.

```
git clone git@github.com:merciba/I.git && cd I
npm install && npm test
```

A demo page will open in oyur browser, containing some real-time examples.

##### TODO

* Tidy up the codebase.
* Simplify the API. 
* Better validation with warning and error messages.