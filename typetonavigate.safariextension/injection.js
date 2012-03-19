var TTNInjection = (function() {
	
	return {
		
		searchString: '',
		nextSearchString: '',
		displaySearchString: '',
		keyupTimeout: null,
		
		indicator: null,
		indicatorInner: null,
		indicatorTimeout: null,
		indicatorFadeTimeout: null,
		indicatorFlashTimeout: null,
		
		settings: {
			blacklist: '', // array version will be in this.blacklist
		},
		blacklist: [],

		setupAlready: false,
		
		trim: function(str) { return String(str).match(/^\s*(.*?)\s*$/)[1]; },
		fireEvent: function(el, eventName) {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(eventName, true, true);
			el.dispatchEvent(evt);
		},
		focusedElement: function() {
			var el = document.activeElement;
			var computedStyle = window.getComputedStyle(el);
			return (( el.tagName.match(/input|textarea|select|button/i) && (el.getAttribute('type') || '').match(/^|text|search|password$/) ) || el.getAttribute('contenteditable') == 'true' || computedStyle['-webkit-user-modify'] != 'read-only') ? el : false;
		},
		mouseoutListener: function() {
			TTNInjection.fireEvent(this, 'mouseout');
			// make sure we remove ourselves
			this.removeEventListener('focusout', TTNInjection.mouseoutListener);
		},
		focusSelectedLink: function(str) {
			var s = window.getSelection();
			var color = '';
			
			// get element
			var el = s.anchorNode || false;
			while ( el && el.tagName != 'A' ) el = el.parentNode;
			
			if ( el && el.tagName == 'A' ) {
				color = 'green';
				el.focus();
				// send mouseover event to new element
				TTNInjection.fireEvent(el, 'mouseover');
				// send mouseout event when it loses focus
				el.addEventListener('focusout', TTNInjection.mouseoutListener);
			} else if ( s.rangeCount ) {
				// get selection
				var range = document.createRange();
				range.setStart(s.anchorNode, s.anchorOffset);
				range.setEnd(s.extentNode, s.extentOffset);
				// defocus (side-effect: deselects)
				document.activeElement.blur();
				// reselect selection
				s.addRange(range);
				
				// var el = s.extentNode || false;
				// if (el) {
				// 	while ( el.nodeType == 3 ) el = el.parentNode;
				// 	console.log(el.nodeType);
				// 	// send mouseover event to new element
				// 	TTNInjection.fireEvent(el, 'mouseover');
				// 	var focusFakeEl = this.createHiddenElementWithTagNameAndContents('a');
				// 	focusFakeEl.focus();
				// 	// send mouseout event when it loses focus
				// 	focusFakeEl.addEventListener('focusout', function() { TTNInjection.mouseoutListener.call(el); });
				// }
				
			} else {
				document.activeElement.blur();
			}
			return color;
		},
		createHiddenElementWithTagNameAndContents: function(tagName, contents) {
			var hiddenEl = document.createElement(tagName);
			hiddenEl.style.position = 'absolute';
			hiddenEl.style.top = '-1000px';
			if (contents) hiddenEl.innerHTML = contents;
			document.getElementsByTagName('body')[0].appendChild(hiddenEl);
			return hiddenEl;
		},
		createIndicator: function() {
			// only make one, in the outside
			if (window !== window.top || !document.getElementsByTagName('body').length ) return;
			
			// create indicator
			this.indicator = document.createElement('ttn');
			this.indicator.innerHTML = '<ttn_inner></ttn_inner>';
			document.getElementsByTagName('body')[0].appendChild(this.indicator);
			this.indicatorInner = document.getElementsByTagName('ttn_inner')[0];
		},
		displayInIndicator: function(str, append, color) {
			clearTimeout(this.indicatorTimeout);
			clearTimeout(this.indicatorFadeTimeout);
			if ( this.indicator ) {
				this.indicatorInner.setAttribute('color', color || '');
				this.indicatorInner.innerHTML = str + (append || '');
				this.indicator.style['-webkit-transition'] = 'none';
				this.indicator.style.opacity = 1.0;
				this.indicator.style.display = 'block';
				this.indicatorTimeout = setTimeout(function() {
					TTNInjection.indicator.style['-webkit-transition'] = null;
					TTNInjection.indicator.style.opacity = 0.0;
					TTNInjection.indicatorFadeTimeout = setTimeout(function() {
						TTNInjection.indicator.style.display = null;
					}, 500);
				}, 1000);
			}
		},
		hideIndicator: function() {
			this.searchString = '';
			this.nextSearchString = '';
			this.displaySearchString = '';
			this.indicator.style.display = 'none';
		},
		flashIndicator: function() {
			clearTimeout(this.indicatorFlashTimeout);
			if ( this.indicator ) {
				this.indicatorInner.setAttribute('color', 'red');
				this.indicatorFlashTimeout = setTimeout(function() {
					TTNInjection.indicatorInner.removeAttribute('color');
				}, 400);
			}
		},
		selectedTextEqualsNextSearchString: function() {
			var s = window.getSelection();
			return s.rangeCount && this.trim(String(s).toLowerCase()) == this.trim(this.nextSearchString.toLowerCase());
		},
		hijackCopyWith: function(textToCopy) {
			
			// get current selection
			var s = window.getSelection();
			var currentSelection = s.getRangeAt(0);
			
			// create element
			var ttn_clipboard = this.createHiddenElementWithTagNameAndContents('ttn_clipboard', textToCopy);
			console.log('Copied:', textToCopy);
			
			// select it
			s.removeAllRanges();
			var range = document.createRange();
			range.selectNode(document.querySelectorAll('ttn_clipboard')[0]);
			s.addRange(range);
			
			// do this stuff immediately after copy operation
			setTimeout(function() {
				s.removeAllRanges();
				s.addRange(currentSelection);
				ttn_clipboard.parentNode.removeChild(ttn_clipboard);
			}, 0);
		},
		handleNonAlphaKeys: function(e) {
			e.cmdKey = e.metaKey;
			e.character = String.fromCharCode(e.keyCode);
			
			// handle esc in fields (blur)
			if ( e.keyCode == 27 ) {
				this.displayInIndicator('␛');
				if ( this.focusedElement() || this.selectedTextEqualsNextSearchString() ) {
					document.activeElement.blur();
				} else {
					this.flashIndicator();
				}
				this.hideIndicator();
				return;
			}
			
			// if cmd-g and we have go to next
			var s = window.getSelection();
			if ( this.selectedTextEqualsNextSearchString() ) {
				if ( e.character == 'G' && e.cmdKey ) {
					this.find(this.nextSearchString, e.shiftKey);
				
					// find again if we're now IN indicator div, or selected something invisible
					// or selected something not in viewport (FIXME - NOT YET)
					if ( (this.indicator && this.trim(s.anchorNode.parentNode.tagName) == this.trim(this.indicatorInner.tagName)) || !s.anchorNode.parentNode.offsetHeight)
						this.find(this.nextSearchString, e.shiftKey);
				
					var color = this.focusSelectedLink(this.nextSearchString);
					this.displayInIndicator(this.nextSearchString, ' (⌘G)', color);
					event.preventDefault();
					event.stopPropagation();
				} else if ( e.character == 'I' && e.cmdKey && !e.ctrlKey && !e.shiftKey ) {
					var href = this.mungeHref(document.activeElement.getAttribute('href')).join('');
					if (href) safari.self.tab.dispatchMessage('sendToInstapaper', { href: href });
					event.preventDefault();
					event.stopPropagation();
				}
			}
		},
		sendToInstapaperCallback: function(data) {
			if ( TTNInjection.indicator ) {
				if (data.status == 201) { // success
					TTNInjection.displayInIndicator('URL saved to Instapaper', ' (⌘I)', 'gray');
				} else if (data.status == 403) { // wrong credentials
					TTNInjection.displayInIndicator('Incorrect Instapaper credentials', ' (⌘I)', 'red');
				} else {
					TTNInjection.displayInIndicator('Sorry, Instapaper error', ' (⌘I)', 'red');
				}
			}
		},
		handleCopy: function(e) {
			if ( document.activeElement && document.activeElement.tagName == 'A' && this.selectedTextEqualsNextSearchString() ) {
				this.hijackCopyWith(e.srcElement.href);
				this.displayInIndicator('URL copied', ' (⌘C)', 'blue');
			}
		},
		handleAlphaKeys: function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);
			
			// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus
			if ( e.keyCode && !this.focusedElement() && !e.cmdKey && !e.metaKey && !e.ctrlKey) {
				
				if ( e.keyCode == 13 ) { // return key but no link; flash
					this.displayInIndicator(this.nextSearchString, ' ⏎');
					this.flashIndicator();
				} else {
					if ( this.searchString == '' && (e.keyCode == 32 || e.keyCode == 8) ) {
						// do nothing, we allow the space bar and delete to fall through to scroll the page if we have no searchstring
					} else {
						// append char
						this.searchString += e.character;
						this.nextSearchString = this.searchString;
						this.displaySearchString = this.searchString.replace(/ /g, '␣');
					
						// let the first letter fall through, for j/k-style navigation
						// also let it fall through if it's only j's and k's (or possibly other known nav keys unlikely to be words), or a string of idential chars
						// KeyThinkAI™, idea credit @andyfowler
						if ( this.searchString.length > 1 && !this.searchString.match(/^[jk]*$/) && !this.searchString.match(new RegExp('^['+this.searchString[0]+']+$')) ) {
							
							// clear selection and find again
							window.getSelection().removeAllRanges();
							this.find(this.searchString, false);
							
							// focus the link so return key follows
							var color = this.focusSelectedLink(this.nextSearchString);
							this.displayInIndicator(this.nextSearchString, '', color);
							
							// check for nothing found
							if ( !window.getSelection().rangeCount ) this.flashIndicator();
							
							e.preventDefault();
							e.stopPropagation();
						}
					}
				}
				
				// postpone clearing
				clearTimeout(this.keyupTimeout);
				this.keyupTimeout = setTimeout(function() {
					TTNInjection.searchString = '';
				}, 1000);
				
				// return false;
			}
		},
		find: function(searchString, backwards)
		{
			var scrollPosition = {
				top: document.body.scrollTop,
				left: document.body.scrollPosition
			};

			// skip until we get something in our viewport (and a link if linksOnly == true)
			var validResult = false;
			var failSafe = 0;
			while ( !validResult && failSafe < 500) {
				failSafe++;
				if (failSafe == 500) console.log('bailed');
				window.find(searchString, false, backwards, true, false, true, false);
				var s = window.getSelection();
				var el = s && s.anchorNode && s.anchorNode.parentNode || false;

				// start out assuming it's good
				validResult = true;
			}
		},
		mungeHref: function(href) {
			// figure out what to do 
			if ( href.match(/^([a-zA-Z]+:)/) )
				var prefix = '';
			else if ( href.match(/^\//) )
				var prefix = location.protocol +'//'+ location.host;
			else if ( href.match(/^#/) )
				var prefix = location.href;
			else
				var prefix = location.href.replace(/\/[^\/]*(\?.*)?$/, '/');
				
			// deal with ../ in <a href>
			var this_href = href;
			while ( this_href.match(/\.\.\//) ) {
				this_href = this_href.replace(/\.\.\//, '');
				prefix = prefix.replace(/[^\/]*\/$/, '');
			}
			return [prefix, this_href];
		},
		init: function() {
			// only apply to top page
			if ( window !== window.top ) return;
			
			// bind message listener
			safari.self.addEventListener("message", function(msg) {
				TTNInjection[msg.name](msg.message);
			}, false);
			
			// fetch settings (inc. blacklist)
			safari.self.tab.dispatchMessage('getSettings');
		},
		getSettingsCallback: function(settings) {
			this.settings = settings;
			this.blacklist = settings.blacklist.split(',');

			if (this.setupAlready) return;

			// bail if we match anything in the blacklist
			for (var href in this.blacklist) {
				// trim blacklist entry
				this.blacklist[href] = this.blacklist[href].replace(/^\s|\s$/, '');
				// match either host or host + url
				if ( location.host.match(new RegExp('^'+this.blacklist[href].replace(/\*/g, '.*')+'$')) ||
						(location.host+location.pathname).match(new RegExp('^'+this.blacklist[href].replace(/\*/g, '.*')+'$')) ) {
					console.log('Type-To-Navigate: Not engaging due to blacklist.');
					return;
				}
			}
			
			// ok go ahead and do stuff
			this.setUpEventsAndElements.apply(this);

			this.setupAlready = true;
		},
		setUpEventsAndElements: function() {
			// add indicator div to page
			this.createIndicator();

			// handle command-g & esc
			window.addEventListener('keydown', function(e) {
				TTNInjection.handleNonAlphaKeys(e);
/*				safari.self.tab.dispatchMessage('handleNonAlphaKeys', new SafariEvent(e));*/
			}, true);
			
			// handle typeable keypresses
			window.addEventListener('keypress', function(e) {
				TTNInjection.handleAlphaKeys(e);
/*				safari.self.tab.dispatchMessage('handleAlphaKeys', new SafariEvent(e));*/
			}, true);
			
			window.addEventListener('beforecopy', function(e) {
				TTNInjection.handleCopy(e);
			}, true);
		}
	};
})();

// wait till the opportune time to set up
// var injectionInterval = setInterval(function() {
// 	console.log('document.readyState', document.readyState);
// 	if ( document.readyState != 'complete' ) return;
// 	clearInterval(injectionInterval);
// 	TTNInjection.init();
// }, 100);

if ( document.readyState == 'complete' )
	TTNInjection.init();
else window.addEventListener('load', function() {
	TTNInjection.init();
});

