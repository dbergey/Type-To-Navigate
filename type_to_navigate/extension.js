jQuery(function($) {
	var searchString = '';
	var nextSearchString = '';
	var keyupTimeout;
	
	$.smartSearch = function(o) {
		
		o = $.extend({
			excludeIfFocused: 'input:not([type]), input[type="text"], input[type="search"], input[type="password"], textarea',
			excludeHosts: /^$/,
			excludeChars: ' '
		}, o);
		
		var focusedElements = function() {
			// conventional fields
			var els = $(o.excludeIfFocused).filter(function() {
				return $(this).css('cursor') == 'text';
			});
			// facebook-style contenteditable="true" fields
			if (!els.length) {
				var s = window.getSelection();
				els = $( (s.focusNode && s.focusNode.nodeType == 3 ? s.focusNode.parentNode : s.focusNode) || [] ).closest('[contenteditable=true]');
			}
			return els;
		};
		
		var focusSelectedLink = function(str) {
			var s = window.getSelection();
			var el = $(s.anchorNode.parentElement).closest('a');
			if ( el.is('a') && s.rangeCount && String(s).toLowerCase() == str.toLowerCase() ) {
				el[0].focus();
			} else {
				$('#type_to_navigate_non_focus_link')[0].focus();
			}
		};
		
		$('body').append('<a href="javascript:void(0);" id="type_to_navigate_non_focus_link" style="position: fixed; top: -10px; left: -10px;"></a>');
				
		if (location.host.match(o.excludeHosts)) return this;
		
		// escape key: blur any focused input
		$(o.excludeIfFocused).add('[contenteditable=true]').bind('keydown', function(e) {
			if (e.keyCode == 27) focusedElements().trigger('blur');
		});
		
		// handle command-g
		$(window).bind('keydown', function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);

			// if cmd-g and we have go to next
			var s = window.getSelection();
			if ( e.character == 'G' && e.cmdKey && s.rangeCount && $.trim(String(s).toLowerCase()) == $.trim(nextSearchString.toLowerCase()) ) {
				window.find(nextSearchString, false, e.shiftKey, true, false, true, false);
				focusSelectedLink(nextSearchString);
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
		});
		
		// handle typeable keypresses
		$(window).bind('keypress', function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);
		
			// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus, and char isn't return
			if ( e.keyCode && !focusedElements().size() && !e.cmdKey && e.keyCode != 13 && !o.excludeChars.match(e.character)) {
				
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
	};
});

jQuery(function($) {
	$.smartSearch();
});