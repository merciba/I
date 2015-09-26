I.js
====

A streaming UI library.

## Table of Contents

[Getting Started](#getting-started)  
[Binding Streams to the DOM](#binding-streams-to-the-dom)  
[Binding DOM Elements to Each Other](#binding-dom-elements-to-each-other)  
[Using PubNub Streams](#using-pubnub-streams)  
[Using WebSockets](#using-websockets)  
[Wiki](https://github.com/merciba/I/wiki)

### Stream Everything

I.js is not just any old data-binding library. 

I.js aims to blend together event-based paradigms in a tight, orderly way, that makes more sense to human developers. 

You shouldn't need to know how to handle Stream backpressure or have an advanced Master's degree in Functional Programming to leverage their shared potential. 

All you need is a streaming data source that emits events (like a button, for example), and a destination element to render. It's simple addition.  

### I don't care to look at code, I want to see a demo.

Ok, go [here](http://merciba.com/i).

Or, provided you have Node.js installed:

```
git clone git@github.com:merciba/I.git && cd I
npm install && npm test
```

A demo page will open in your browser, containing some real-time examples.

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
		template: "Time: <b>{{time}}</b>",
		source: function(next) {
			setInterval(function() {
				next({ time: new Date() })  	// 'next' is a special function that sends data down the pipe. 
			}, 1000)
		}
	});
```

Et voilà quoi. Your `i-clock` div will refresh every second with the latest time.

### Binding DOM Elements To Each Other

Say you have the following HTML, a naming prompt.

```HTML
	<div>
		 <div>What is your name?</div>
		 <span i-namer ></span>.
		 <input id="name" type="text" placeholder="Slim" />
		 <button id="submit" >Submit</button>
	</div>
```

Let's say we want to make button `#submit`, when clicked, trigger an update of `i-namer`, using whatever's in field `#name`. 

Let's also say, you're a huge Eminem fan, and so you want to append " Shady" to the end of everyone's name.  
Using I.js Hooks, you can do exactly that.

To bind the `#submit` button to the `i-namer` element and auto-refresh it via template:

```JavaScript
	var name = i({
    	id: 'namer',								// id must match the i-* attribute, in this case - i-namer
    	template: 'Hi, my name is {{name}}', 		// you can name any variables in your template with {{variable}}, i.js will automatically save them and use them
		source: 'click #submit', 					// This time, specify 'source' with the method and element id. Similar to Backbone.js views
        capture: {
        	name: '#name'							// Specify the input to be captured with 'JQuery.val()'
        },
        hooks: {
        	name: function(name) { 			
				return name+" Shady"; 				// Append "Shady" to the end of every name passed through
			}			 
        }
	});
```

### Using PubNub Streams

I.js also has built-in support for [PubNub](http://www.pubnub.com/developers/tutorials/publish-subscribe/) streams. 

Here's an example of binding PubNub's [Twitter Firehose](http://www.pubnub.com/developers/data-streams/twitter-stream) to a DOM element.

Let's say you have the following HTML.

```HTML
	<h2>Tweets</h2>
    <div i-tweets></div>
```

```JavaScript
	var tweets = i({
        id: 'tweets',
        template: '<img src="{{user.profile_image_url}}"> <a href="{{user.url}}">{{user.screen_name}}</a><p>{{text}}</p>',
        source: {
			pubnub: {
				channel: 'pubnub-twitter',										// Use any PubNub channel name
				subscribe_key: 'sub-c-78806dd4-42a6-11e4-aed8-02ee2ddab7fe' 	// Use any PubNub subscribe key
			}
		}
    })
```

Tweets will appear and refresh the div as they come in. 

### Using WebSockets

I.js also has built-in support for WebSockets or any other event-emitting object.

Simply pass it in as the `source` option and I.js will listen automatically on a channel corresponding to the `i-<id>` of the I.js instance. For example, using popular WebSockets library [Socket.io](http://socket.io/): 

```JavaScript
// Client-side (Browser)

var socket = io('http://<path-to-socket>');

var element = i({
    id: 'myElement',
    template: 'Hello {{value}}',
    source: socket
})
```

```JavaScript
// Server-side (Node.js)

var handler = function() {
	io.on('connection', function (socket) {
	    socket.emit('i-myElement', { value: 'world' });
	    setTimeout(function() {
	    	socket.emit('i-myElement', { value: 'Merciba' });
	    }, 3000)
	});
}

var app = require('http').createServer(handler)
var io = require('socket.io')(app);

app.listen(80);
```

This example will first print "Hello world", then, after 3 seconds, "Hello Merciba". 

##### TODO

* Better validation with warning and error messages.