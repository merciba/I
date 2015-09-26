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
		if (typeof options !== 'undefined') {
			if (options.hasOwnProperty('id')) this.id = options.id
			else throw new Error("i.js instances must have an id")

			if (options.hasOwnProperty('template')) this.template = options.template
			else throw new Error("i.js instances must have a template")

			if (options.hasOwnProperty('source')) this.source = options.source
			else throw new Error("i.js instances must have a source. This can be either a function, CSS selector, or PubNub stream")
			
			if (options.hasOwnProperty('hooks')) this.hooks = options.hooks

			if (options.hasOwnProperty('capture')) {
				if (typeof options.source === 'string') this.capture = options.capture
				else throw new Error("Only specify 'capture' when 'source' is a string containing an element selector and a method, e.g. 'click #<id>'")
			}
			this.options = options
		}
		return this
	};

	window.I = new I()
	window.I.instances = []
	window.i = function(options) {
		var instance = new I(options)
		window.I.instances.push(instance)
		return instance
	}

	I.prototype.init = function(options) {
		var el = $('[i-'+options.id+']')

		this.tokens = this.getTokens(this.template)
		var ractiveOptions = {
			el: el,
			template: this.template,
			data: {}
		}

		if (this.tokens.length > 0) {
			this.tokens.map(function(key) {
				if (options.hasOwnProperty('initWith') && options.initWith.hasOwnProperty(key)) ractiveOptions.data[key] = options.initWith[key]
				else ractiveOptions.data[key] = ""
			})
		}
		else {
			throw new Error("Template must contain at least one variable declaration between double-braces, e.g. {{variable}}")
		}

		this.ractive = new Ractive(ractiveOptions)
		this.start()
	}

	/********************************************************************************************

	I.js Constants

	********************************************************************************************/

	I.prototype.id = null

	I.prototype.pipes = {}

	I.prototype.ractive = null

	/********************************************************************************************

	I.js Methods

	********************************************************************************************/

	I.prototype.start = function() {
			
		var update = function(data) {
			var result = {}

			this.tokens.map(function(k) {
				if (this.hasOwnProperty('capture')) var capture = this.getProperty(k, this.capture)
				if (this.hasOwnProperty('hooks')) var hook = this.getProperty(k, this.hooks)

				if (capture) result[k] = this.getProperty(k, $(capture).val());
				else if (hook) result[k] = hook(this.getProperty(k, data))
				else result[k] = this.getProperty(k, data)
			}.bind(this))

			this.set.call(this, result);
		}

		if (typeof this.source === 'string') {
			if (!this.hasOwnProperty('capture')) throw new Error("i.js instances using a CSS selector as source must also specify an element whose value to capture. They can be the same.")
			this.srcMethod = this.source.split(' ')[0]
			this.srcSelector = this.source.split(' ')[1]
			if (!this.srcSelector.match('#')) throw new Error("Class names are not supported for input sources. Please use an #<id>")
			var observable = Rx.Observable.fromEvent($(this.srcSelector), this.srcMethod)
			this.subscription = observable.subscribe(update.bind(this))
		}
		else {
			var observable = Rx.Observable.create(function(observer) {
				this.observer = observer
				
				if (typeof this.source === 'function') this.source(this.send.bind(this))
				else if (this.source.hasOwnProperty("pubnub")) {
					var init = {}
					var sub = {
						message: this.send.bind(this)
					}
					Object.keys(this.source.pubnub).map(function(key) {
						if (key === 'subscribe_key') {
							init.subscribe_key = this.source.pubnub.subscribe_key
							delete this.source.pubnub.subscribe_key
						}
						if (key === 'channel') sub[key] = this.source.pubnub.channel
					}.bind(this))
					PUBNUB.init(init).subscribe(sub)
				}
				else if (this.source.hasOwnProperty("on")) {
					this.source.on("i-"+this.id, this.send.bind(this))
				}
			}.bind(this))
			this.subscription = observable.subscribe(update.bind(this))
		}
		
		
	}

	I.prototype.send = function(data) {
		if (this.srcSelector && this.srcMethod) $(this.srcSelector)[this.srcMethod](data)
		else this.observer.onNext(data)
	}

	I.prototype.set = function(data) {
		this.tokens.map(function(key) {
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

	I.prototype.getTokens = function(str) {
	  var results = [], re = /{{([^}]+)}}/g, text;

	  while(text = re.exec(str)) {
	    results.push(text[1]);
	  }
	  return results;
	}

	I.prototype.getProperty = function(key, data) {
		if (typeof data === 'string') return data
		else if (data instanceof Date) return data.toString()
		else if (key.indexOf('.') > 0) {
			var tmp = data
			key.split('.').map(function(i) {
				tmp = tmp[i]
			})
			return tmp
		}
		else if (data.hasOwnProperty(key)) return data[key]
		else return null
	}
})(window)

/********************************************************************************************

I.js Dependency Manegement

********************************************************************************************/

I.loadScript = function(url, callback) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = function () {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

I.withPubNub = function () {
	I.instances.map(function(instance) {
		instance.init(instance.options)
		instance.options = null
	})
}

I.withRx = function() {
	if (typeof PUBNUB === 'undefined') I.loadScript("http://cdn.pubnub.com/pubnub.min.js", I.withPubNub)
	else I.withPubNub()
}

I.withRactive = function () {
	if (typeof Rx === 'undefined') I.loadScript("https://cdnjs.cloudflare.com/ajax/libs/rxjs/3.1.2/rx.all.min.js", I.withRx)
	else I.withRx()
}

I.withJQuery = function () {
	if (typeof moment === 'undefined') I.loadScript("http://cdn.ractivejs.org/latest/ractive.js", I.withRactive)
	else I.withRactive()
} 

if (typeof $ === 'undefined') I.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js", I.withJQuery)
else I.withJQuery()
