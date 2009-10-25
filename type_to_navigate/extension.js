/*
known issues:
- adding a dvd to a netflix queue succeeds, but overlay popup reports an error.
- finding something then hitting ctrl-g starts advancing only on 2nd try.
- breaks on cnn.com, macnn.com, facebook's token field, facebook chat field
*/
jQuery(function($) {
	var searchString = '';
	var currentResult = 0;
	var resultsCount = 0;
	var results = [];
	var keyupTimeout;
	
	$.smartSearch = function(o) {
		
		o = $.extend({
			excludeIfFocused: ':text, :password, textarea, [contenteditable=true]',
			excludeHosts: /^.*facebook.com$/
		}, o);
		
		if (location.host.match(o.excludeHosts)) return this;
		
		// mark fields when they get focus so we can check when not to search
		// escape key: blur any focused input
		$(o.excludeIfFocused).bind('keydown', function(e) {
			if (e.keyCode == 27) $(o.excludeIfFocused).filter(function() {
				return $(this).css('cursor') == 'text';
			}).trigger('blur');
		});
		
		// handle keypresses on page
		$(window).bind('keypress', function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.charCode);
			
			// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus
			if ( e.charCode && !$(o.excludeIfFocused).filter(function() {
				return $(this).css('cursor') == 'text';
			}).size() ) {
				
				if ( !e.cmdKey ) {
				
					// if return and selection is on a link
					if (e.charCode == 13) {
					
						var el = $(window.getSelection().anchorNode.parentElement);
						if (el[0].tagName == 'A' && el.trigger('click'))
							location.href = el.attr('href');
						return;
					
					// do normal type-ahead search stuff
					} else {
					
						// append char
						window.status = searchString += e.character;
						
						// postpone clearing
						clearTimeout(keyupTimeout);
						
						keyupTimeout = setTimeout(function() {
							window.status = searchString = '';
							currentResult = 0;
						}, 1000);
						
						// clear selection and find again
						window.getSelection().removeAllRanges();
						window.find(searchString, false, false, true, false, true, true);
					}
				
				} else {
					
					// if cmd-g go to next
					if ($.inArray(e.character, ['g','G']) >= 0) {
						window.find(searchString, false, false, true, false, true, true);
						event.preventDefault();
					}
				}
			}
		});
	};
});

jQuery(function($) {
	$.smartSearch();
});