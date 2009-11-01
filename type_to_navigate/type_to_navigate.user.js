// ==UserScript==
// @name          Type-To-Navigate
// @description   Enables type-to-navigate, where you can select links/anything just by typing, then hit return to follow a link.
// @namespace     http://www.danielbergey.com/
// @include       *

// by Daniel Bergey (http://www.danielbergey.com/)
// ==/UserScript==

(function() {
	var searchString = '';
	var nextSearchString = '';
	var keyupTimeout;
	var indicator;
	var indicatorInner;
	
	function trim(str) { return str.match(/^\s*(.*?)\s*$/)[1]; };
	
	function focusedElement() {
		var el = document.activeElement;
		var computedStyle = window.getComputedStyle(el);
		return (( el.tagName.match(/INPUT|TEXTAREA/) && (el.getAttribute('type') || '').match(/^|text|search|password$/) ) || el.getAttribute('contenteditable') == 'true' || computedStyle['-webkit-user-modify'] != 'read-only') ? el : false;
	};

	function focusSelectedLink(str) {
		var s = window.getSelection();
		// get element
		var el = s.anchorNode || false;
		while ( el && el.tagName != 'A' ) el = el.parentNode;
		if ( el && el.tagName == 'A' ) {
			el.focus();
		} else if ( s.rangeCount ) {
			// get selection
			var range = document.createRange();
			range.setStart(s.anchorNode, s.anchorOffset);
			range.setEnd(s.extentNode, s.extentOffset);
			// defocus (side-effect: deselects)
			document.activeElement.blur();
			// reselect selection
			s.addRange(range);
		} else {
			document.activeElement.blur();
		}
	};
	
	function createIndicator() {
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
				font: 18px arial;\
				-webkit-transition: opacity .25s linear;\
				z-index: 9999999;\
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
			</style>\
			<div id="type_to_select_keys_inner"></div>\
		</div>';
		document.body.appendChild(indicator = container.childNodes[0]);
		indicatorInner = document.getElementById('type_to_select_keys_inner');
	}
	
	if ( document.readyState == 'complete' ) createIndicator();
		else window.addEventListener('load', function() {
			createIndicator();
		});
		
	// handle command-g & esc
	window.addEventListener('keydown', function(e) {
		e.cmdKey = e.metaKey && !e.ctrlKey;
		e.character = String.fromCharCode(e.keyCode);
		
		// handle esc in fields (blur)
		if ( focusedElement() && e.keyCode == 27 ) {
			focusedElement().blur();
			return false;
		}
		
		// if cmd-g and we have go to next
		var s = window.getSelection();
		if ( e.character == 'G' && e.cmdKey && s.rangeCount && trim(String(s).toLowerCase()) == trim(nextSearchString.toLowerCase()) ) {
			window.find(nextSearchString, false, e.shiftKey, true, false, true, false);
			focusSelectedLink(nextSearchString);
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	});
	
	// handle typeable keypresses
	window.addEventListener('keypress', function(e) {
		e.cmdKey = e.metaKey && !e.ctrlKey;
		e.character = String.fromCharCode(e.keyCode);
		// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus, and char isn't return or space
		if ( e.keyCode && !focusedElement() && !e.cmdKey && e.keyCode != 13 && e.character != ' ' ) {
			
			// append char
			searchString += e.character;
			nextSearchString = searchString;
			
			// postpone clearing
			clearTimeout(keyupTimeout);
			if ( indicator ) {
				indicatorInner.innerHTML = searchString;
				indicator.style['-webkit-transition'] = 'none';
				indicator.style.opacity = 1.0;
			}
		
			keyupTimeout = setTimeout(function() {
				searchString = '';
				
				// indicator
				if ( indicator ) {
					indicator.style['-webkit-transition'] = null;
					indicator.style.opacity = 0.0;
				}
			}, 1000);
			
			// clear selection and find again
			window.getSelection().removeAllRanges();
			window.find(searchString, false, false, true, false, true, true);
			
			// focus the link so return key follows
			focusSelectedLink(nextSearchString);
		}
	});
})();