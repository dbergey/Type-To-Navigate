jQuery(function($) {
	var searchString = '';
	var keyupTimeout;
	
	$.smartSearch = function(o) {
		
		o = $.extend({
			excludeIfFocused: ':text, :password, textarea, [contenteditable=true]',
			excludeHosts: /^.*facebook.com$/
		}, o);
		
		if (location.host.match(o.excludeHosts)) return this;
		
		// escape key: blur any focused input
		$(o.excludeIfFocused).bind('keydown', function(e) {
			if (e.keyCode == 27) $(o.excludeIfFocused).filter(function() {
				return $(this).css('cursor') == 'text';
			}).trigger('blur');
		});
		
		// handle command-g
		$(window).bind('keydown', function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);

			// if cmd-g and we have go to next
			var s = window.getSelection();
			if ( e.character == 'G' && e.cmdKey && s.rangeCount && String(s).toLowerCase() == nextSearchString.toLowerCase() ) {
				window.find(nextSearchString, false, e.shiftKey, true, false, true, false);
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
		});
		
		// handle typeable keypresses
		$(window).bind('keypress', function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.keyCode);
		
			// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus
			if ( e.keyCode && !$(o.excludeIfFocused).filter(function() {
				return $(this).css('cursor') == 'text';
			}).size() ) {
				
				if ( !e.cmdKey ) {
				
					// if return and selection is on a link
					if (e.keyCode == 13) {
					
						var s = window.getSelection();
						var el = $(s.anchorNode.parentElement);
						if (el[0].tagName == 'A' && s.rangeCount && String(s).toLowerCase() == nextSearchString.toLowerCase() && el.trigger('click'))
							location.href = el.attr('href');
						return;
					
					// do normal type-ahead search stuff
					} else {
					
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
					}
				
				}
			}
		});
	};
});

jQuery(function($) {
	$.smartSearch();
});