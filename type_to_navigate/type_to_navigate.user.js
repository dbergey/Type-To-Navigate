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
	
	function trim(str) { return str.match(/^\s*(.*?)\s*$/)[1]; };
	
	function focusedElement() {
		var el = document.activeElement;
		return (( el.tagName.match(/INPUT|TEXTAREA/) && el.getAttribute('type').match(/^|text|search|password$/) ) || el.getAttribute('contenteditable') == 'true') ? el : false;
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
	
	// handle command-g & esc
	window.addEventListener('keydown', function(e) {
		e.cmdKey = e.metaKey && !e.ctrlKey;
		e.character = String.fromCharCode(e.keyCode);
		
		// handle esc in fields (blur)
		if ( focusedElement() && e.keyCode == 27 ) {
			focusedElement().blur();
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
			
			keyupTimeout = setTimeout(function() {
				searchString = '';
			}, 1000);
			
			// clear selection and find again
			window.getSelection().removeAllRanges();
			window.find(searchString, false, false, true, false, true, true);
			
			// focus the link so return key follows
			focusSelectedLink(nextSearchString);
		}
	});
})();