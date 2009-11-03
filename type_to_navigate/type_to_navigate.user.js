// ==UserScript==
// @name          Type-To-Navigate
// @description   Enables type-to-navigate, where you can select links/anything just by typing, then hit return to follow a link.
// @namespace     http://www.danielbergey.com/
// @include       *

// by Daniel Bergey (http://www.danielbergey.com/)
// ==/UserScript==

(function() {
	
	var ext = {
		
		searchString: '',
		nextSearchString: '',
		keyupTimeout: null,
		
		indicator: null,
		indicatorInner: null,
		indicatorTimeout: null,
		indicatorFadeTimeout: null,
		indicatorFlashTimeout: null,
		
		trim: function(str) { return str.match(/^\s*(.*?)\s*$/)[1]; },
		
		focusedElement: function() {
			var el = document.activeElement;
			var computedStyle = window.getComputedStyle(el);
			return (( el.tagName.match(/INPUT|TEXTAREA/) && (el.getAttribute('type') || '').match(/^|text|search|password$/) ) || el.getAttribute('contenteditable') == 'true' || computedStyle['-webkit-user-modify'] != 'read-only') ? el : false;
		},
		focusSelectedLink: function(str) {
			var s = window.getSelection();
			// get element
			var el = s.anchorNode || false;
			while ( el && el.tagName != 'A' ) el = el.parentNode;
			if ( el && el.tagName == 'A' ) {
				ext.indicatorInner.className = 'green';
				el.focus();
			} else if ( s.rangeCount ) {
				ext.indicatorInner.className = '';
				// get selection
				var range = document.createRange();
				range.setStart(s.anchorNode, s.anchorOffset);
				range.setEnd(s.extentNode, s.extentOffset);
				// defocus (side-effect: deselects)
				document.activeElement.blur();
				// reselect selection
				s.addRange(range);
			} else {
				ext.indicatorInner.className = '';
				document.activeElement.blur();
			}
		},
		createIndicator: function() {
			// create indicator
			var container = document.createElement('div');
			container.innerHTML = '<div id="type_to_select_keys">\
				<style>\
				#type_to_select_keys {\
					position: fixed;\
					left: 0;\
					right: 0;\
					bottom: 10%;\
					text-align: center;\
					opacity: 0;\
					font: 18px helvetica;\
					-webkit-transition: opacity .25s linear;\
					z-index: 9999999;\
					display: none;\
				}\
				#type_to_select_keys_inner {\
					background: rgba(0, 0, 0, 0.75);\
					-webkit-border-radius: 8px;\
					border: 2px solid rgba(255, 255, 255, 0.75);\
					-webkit-box-shadow: 0 3px 25px rgba(0, 0, 0, 0.75);\
					margin: 0 auto;\
					display: inline-block;\
					padding: 8px;\
					color: white;\
				}\
				#type_to_select_keys_inner.red {\
					background: rgba(255, 0, 0, 0.75);\
				}\
				#type_to_select_keys_inner.green {\
					background: rgba(0, 191, 0, 0.75);\
				}\
				</style>\
				<div id="type_to_select_keys_inner"></div>\
			</div>';
			document.body.appendChild(ext.indicator = container.childNodes[0]);
			ext.indicatorInner = document.getElementById('type_to_select_keys_inner');
		},
		displayInIndicator: function(str, append) {
			clearTimeout(ext.indicatorTimeout);
			clearTimeout(ext.indicatorFadeTimeout);
			if ( ext.indicator ) {
				ext.indicatorInner.innerHTML = str.replace(/ /g, '␣') + (append || '');
				ext.indicator.style['-webkit-transition'] = 'none';
				ext.indicator.style.opacity = 1.0;
				ext.indicator.style.display = 'block';
				ext.indicatorTimeout = setTimeout(function() {
					ext.indicator.style['-webkit-transition'] = null;
					ext.indicator.style.opacity = 0.0;
					ext.indicatorFadeTimeout = setTimeout(function() {
						ext.indicator.style.display = null;
					}, 500);
				}, 1000);
			}
		},
		flashIndicator: function() {
			clearTimeout(ext.indicatorFlashTimeout);
			if ( ext.indicator ) {
				ext.indicatorInner.className = 'red';
				ext.indicatorFlashTimeout = setTimeout(function() {
					ext.indicatorInner.className = '';
				}, 200);
			}
		},
		selectedTextEqualsNextSearchString: function() {
			var s = window.getSelection();
			return s.rangeCount && ext.trim(String(s).toLowerCase()) == ext.trim(ext.nextSearchString.toLowerCase());
		},
		handleNonAlphaKeys: function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);
	
			// handle esc in fields (blur)
			if ( e.keyCode == 27 ) {
				ext.displayInIndicator('␛');
				if ( ext.focusedElement() || ext.selectedTextEqualsNextSearchString() ) {
					document.activeElement.blur();
				} else {
					ext.flashIndicator();
				}
				return;
			}
			
			// if cmd-g and we have go to next
			var s = window.getSelection();
			if ( e.character == 'G' && e.cmdKey && ext.selectedTextEqualsNextSearchString() ) {
				window.find(ext.nextSearchString, false, e.shiftKey, true, false, true, false);
				
				// make sure we're not now IN indicator div, if so find again
				if ( ext.trim(s.anchorNode.parentNode.id) == ext.trim(ext.indicatorInner.id) ) {
					window.find(ext.nextSearchString, false, e.shiftKey, true, false, true, false);
				}
				
				ext.focusSelectedLink(ext.nextSearchString);
				ext.displayInIndicator(ext.nextSearchString, ' (⌘G)');
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
		},
		handleAlphaKeys: function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);
			
			// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus
			if ( e.keyCode && !ext.focusedElement() && !e.cmdKey ) {
				
				if ( e.keyCode == 13 && ext.nextSearchString ) { // return key but no link; flash
					ext.displayInIndicator(ext.nextSearchString, ' ⏎');
					ext.flashIndicator();
				} else {
					if ( ext.searchString == '' && e.keyCode == 32 ) {
						// do nothing, we allow the space bar to fall through to scroll the page if we have no searchstring
					} else {
						// append char
						ext.searchString += e.character;
						ext.nextSearchString = ext.searchString;
					
						// clear selection and find again
						window.getSelection().removeAllRanges();
						window.find(ext.searchString, false, false, true, false, true, true);
					
						// focus the link so return key follows
						ext.focusSelectedLink(ext.nextSearchString);
					
						ext.displayInIndicator(ext.nextSearchString);
						e.preventDefault();
						e.stopPropagation();
					}
				}
				
				// postpone clearing
				clearTimeout(ext.keyupTimeout);
				ext.keyupTimeout = setTimeout(function() {
					ext.searchString = '';
				}, 1000);
				
				return false;
			}
		},
		init: function() {
		
			// add indicator div to page
			if ( document.readyState == 'complete' )
				ext.createIndicator();
			else
				window.addEventListener('load', function() {
					ext.createIndicator();
				});
		
			// handle command-g & esc
			window.addEventListener('keydown', function(e) {
				ext.handleNonAlphaKeys(e);
			});
	
			// handle typeable keypresses
			window.addEventListener('keypress', function(e) {
				ext.handleAlphaKeys(e);
			});
		}
	};
	ext.init();
})();