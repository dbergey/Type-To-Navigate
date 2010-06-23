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
		
		blacklist: [],
		
		trim: function(str) { return str.match(/^\s*(.*?)\s*$/)[1]; },
		
		focusedElement: function() {
			var el = document.activeElement;
			var computedStyle = window.getComputedStyle(el);
			return (( el.tagName.match(/input|textarea|select|button/i) && (el.getAttribute('type') || '').match(/^|text|search|password$/) ) || el.getAttribute('contenteditable') == 'true' || computedStyle['-webkit-user-modify'] != 'read-only') ? el : false;
		},
		focusSelectedLink: function(str) {
			var s = window.getSelection();
			// get element
			var el = s.anchorNode || false;
			while ( el && el.tagName != 'A' ) el = el.parentNode;
			if ( el && el.tagName == 'A' ) {
				if ( this.indicator ) this.indicatorInner.setAttribute('color', 'green');
				el.focus();
			} else if ( s.rangeCount ) {
				if ( this.indicator ) this.indicatorInner.removeAttribute('color');
				// get selection
				var range = document.createRange();
				range.setStart(s.anchorNode, s.anchorOffset);
				range.setEnd(s.extentNode, s.extentOffset);
				// defocus (side-effect: deselects)
				document.activeElement.blur();
				// reselect selection
				s.addRange(range);
			} else {
				if ( this.indicator ) this.indicatorInner.removeAttribute('color');
				document.activeElement.blur();
			}
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
		displayInIndicator: function(str, append) {
			clearTimeout(this.indicatorTimeout);
			clearTimeout(this.indicatorFadeTimeout);
			if ( this.indicator ) {
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
		handleNonAlphaKeys: function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
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
			if ( e.character == 'G' && e.cmdKey && this.selectedTextEqualsNextSearchString() ) {
				window.find(this.nextSearchString, false, e.shiftKey, true, false, true, false);
				
				// make sure we're not now IN indicator div, if so find again
				if ( this.indicator && this.trim(s.anchorNode.parentNode.tagName) == this.trim(this.indicatorInner.tagName) ) {
					window.find(this.nextSearchString, false, e.shiftKey, true, false, true, false);
				}
				
				this.focusSelectedLink(this.nextSearchString);
				this.displayInIndicator(this.nextSearchString, ' (⌘G)');
				event.preventDefault();
				event.stopPropagation();
				return false;
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
						// also let it fall through if it's only j's and k's (or possibly other known nav keys unlikely to be words)
						// KeyThinkAI™, idea credit @andyfowler
						if ( this.searchString.length > 1 && !this.searchString.match(/^[jk]*$/) ) {
							
							// clear selection and find again
							window.getSelection().removeAllRanges();
							window.find(this.searchString, false, false, true, false, true, false);
							
							// focus the link so return key follows
							this.focusSelectedLink(this.nextSearchString);
							
							this.displayInIndicator(this.nextSearchString);
							
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
		init: function() {
			// only apply to top page
			if ( window !== window.top ) return;
			
			// bind message listener
			safari.self.addEventListener("message", function(msg) {
				TTNInjection[msg.name](msg.message);
			}, false);
			
			// fetch blacklist
			safari.self.tab.dispatchMessage('getBlacklist');
		},
		getBlacklistCallback: function(blacklist) {
			this.blacklist = blacklist.split(',');

			// bail if location.host matches anything in the blacklist
			// for (href in this.blacklist) {
			// 				if ( location.host.match(new RegExp('^'+this.blacklist[href].replace('*', '.*')+'$')) ) {
			// 					console.log('Not engaging Type-To-Navigate due to blacklist.');
			// 					return;
			// 				}
			// 			}
			
			// ok go ahead and do stuff
			this.setUpEventsAndElements.apply(this);
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

