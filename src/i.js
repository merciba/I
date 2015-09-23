/********************************************************************************************

██╗
██║
██║
██║
██║
╚═╝.js   
                                                                        
Stream Everything! 

********************************************************************************************/

(function(window) {
	var I = function(options) {
		if ((typeof options !== 'undefined') && options.hasOwnProperty('id')) {
			this.options = options
		}
		return this;
	};

	window.I = new I()
	window.i = function(options) {
		var instance = new I(options)
		window.I.instances.push(instance)
		return instance;
	}

	I.prototype.init = function(options) {
		var el = $('[i-'+options.id+']')
		var data = { val: "" }

		if (options.hasOwnProperty('template')) this.saveTemplate(options.id, options.template)
		if (options.hasOwnProperty('stream')) this.saveStream(options.id, options.stream)
		if (options.hasOwnProperty('fromInput')) this.fromInput = options.fromInput
		if (options.hasOwnProperty('capture')) this.capture = options.capture
		if (options.hasOwnProperty('hooks')) this.hooks = options.hooks

		this.getStream(options.id)
		this.getTemplate(options.id)
		
		if (options.hasOwnProperty('startWith')) {
			data = options.startWith
		}
		else {
			data = {}
			this.getTokens(this.template).map(function(key) {
				data[key] = ""
			})
		}

		this.id = options.id;
		this.pipes = data;

		this.setRactive({
			el: el,
			template: this.template,
			data: data
		});

		this.getTokens(this.template).map(this.start.bind(this))

	}

	/********************************************************************************************

	I.js Templates

	********************************************************************************************/

	I.prototype.templates = {};

	/********************************************************************************************

	I.js Streams

	These are handy, common streams of data baked into the I library. 

	********************************************************************************************/

	I.prototype.streams = {
		
		clock: function() {
			this.observer.onNext(moment().format('h:mm:ss a'));
	        setInterval(function() {
	          this.observer.onNext(moment().format('h:mm:ss a'));
	        }.bind(this), 1000);
	    }

	}; 

	/********************************************************************************************

	I.js Constants

	********************************************************************************************/

	I.prototype.id = null

	I.prototype.type = "default"

	I.prototype.pipes = null

	I.prototype.ractive = null

	I.prototype.instances = []

	/********************************************************************************************

	I.js Methods

	********************************************************************************************/

	I.prototype.start = function(key) {
			
		var update = function(data) {
			var result = {}
			
			this.getTokens(this.template).map(function(k) {
				if (this.hasOwnProperty('capture')) {
					data = $(this.capture).val();
				}
				if (this.hasOwnProperty('hooks') && this.hooks.hasOwnProperty(k)) {
					data = this.hooks[k](data);
				}
				if (typeof data === 'string') result[k] = data
				else if (k.indexOf('.') > 0) {
					var tmp = data
					k.split('.').map(function(i) {
						tmp = tmp[i]
					})
					result[k] = tmp
				}
				else {
					result[k] = data[k]
				}
			}.bind(this))

			this.set.call(this, result);
		}

		if (this.hasOwnProperty('fromInput')) {
			this.fromInput.map(function(input) {
				if (!input.hasOwnProperty('key')) input.key = "val"
				if (input.key === key) {
					var observable = Rx.Observable.fromEvent($(input.el), input.method)
					this.pipes[input.key] = observable.subscribe(update.bind(this));
				}
			}.bind(this));
		}
		else {
			var observable = this.createObservable(this.stream);
			this.pipes[key] = observable.subscribe(update.bind(this));
		}

	}

	I.prototype.set = function(data) {
		this.getTokens(this.template).map(function(key) {
			setTimeout(function() {
				this.ractive.set(key, data[key])
			}.bind(this), 0)
		}.bind(this));
	}

	I.prototype.asCallback = function(instance) {
		return function(data) {
			this.observer.onNext(data)
		}.bind(instance)
	}

	I.prototype.setRactive = function(options) {
		this.ractive = new Ractive(options)
	}

	I.prototype.getTemplate = function(name) {
		if (typeof this.template === 'undefined') {
			if (window.I.templates.hasOwnProperty(name)) this.template = window.I.templates[name]
			else this.template = "{{val}}"
		}
	}

	I.prototype.saveTemplate = function(name, template) {
		window.I.templates[name] = template
	}

	I.prototype.getStream = function(name) {
		if (typeof this.stream === 'undefined') {
			if (window.I.streams.hasOwnProperty(name)) this.stream = window.I.streams[name]
			else this.stream = function() {
				
			}
		}
	}

	I.prototype.saveStream = function(name, stream) {
		window.I.streams[name] = stream
	}

	I.prototype.createObservable = function(handler) {
		return Rx.Observable.create(function(observer) {
			this.observer = observer;
			handler.call(this)
		}.bind(this));
	}

	I.prototype.getTokens = function(str) {
	  var results = [], re = /{{([^}]+)}}/g, text;

	  while(text = re.exec(str)) {
	    results.push(text[1]);
	  }
	  return results;
	}
})(window)

/********************************************************************************************

I.js Dependency Manegement

********************************************************************************************/

I.loadScript = function(url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function () {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

I.withRx = function () {
	I.instances.map(function(instance) {
		instance.init(instance.options)
	})
}

I.withRactive = function () {
	if (typeof Rx === 'undefined') I.loadScript("https://cdnjs.cloudflare.com/ajax/libs/rxjs/3.1.2/rx.all.min.js", I.withRx)
	else I.withRx()
}

I.withMoment = function () {
	if (typeof Ractive === 'undefined') I.loadScript("http://cdn.ractivejs.org/latest/ractive.js", I.withRactive)
	else I.withRactive()
}

I.withJQuery = function () {
	if (typeof moment === 'undefined') {
		I.loadScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js", function() {
			I.loadScript("https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.4.0/moment-timezone.min.js", I.withMoment)
		}
	}
	else I.withMoment()
} 

if (typeof $ === 'undefined') I.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js", I.withJQuery)
else I.withJQuery()
