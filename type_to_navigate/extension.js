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
	
	$.smartSearch = function() {
		
		// mark fields when they get focus so we can check when not to search
		$(':text, :password, textarea').focus(function() { $(this).attr('smartSearch_hasFocus', true); }).blur(function() { $(this).removeAttr('smartSearch_hasFocus'); });
		
		// escape key: blur any focused input
		$(':text, :password, textarea').bind('keydown', function(e) {
			if (e.keyCode == 27) $(':text, :password, textarea').filter('[smartSearch_hasFocus]').trigger('blur');
		});
		
		$(window).bind('keypress', function(e) {
			e.cmdKey = e.metaKey && !e.ctrlKey;
			e.character = String.fromCharCode(e.charCode);
			
			// if it was a typeable character, Cmd key wasn't down, and a field doesn't have focus
			if (e.charCode&& !$(':text, :password, textarea').filter('[smartSearch_hasFocus]').size()) {
				
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
						
						// if it's there, we'll show in here too
						$('#chromeStatusBar').show().text(window.status); 
							
						// postpone clearing
						clearTimeout(keyupTimeout);

						keyupTimeout = setTimeout(function() {
							window.status = searchString = '';
							currentResult = 0;
							
							// if it's there, we'll assume we showed in there too, and hide it now
							$('#chromeStatusBar').hide();
						}, 1000);
				
						// window.find(searchString, false, false, true, false, true, true);
					
						// get all text nodes and search for searchString
						results = $('body').find('*').andSelf().contents().filter(function() {
							return (this.nodeType == Node.TEXT_NODE);
						}).map(function() {
							var regex = new RegExp(searchString, 'gi');
							var matches = [];
							while (regex.exec(this.data)) {
								matches.push({
									'startOffset': regex.lastIndex - searchString.length,
									'endOffset': regex.lastIndex,
									'node': this
								});
							}
							return matches;
						});
						resultsCount = results.length;
					}
				
				} else {
					
					// if cmd-g go to next
					if ($.inArray(e.character, ['g','G']) >= 0) {
						currentResult = ((currentResult + resultsCount + (event.shiftKey ? -1 : 1)) % resultsCount);
						event.preventDefault();
					}
				}
			
				if (results.length && results[currentResult]) {
				
					// is there something selected?
					var s = window.getSelection();
					if (s.rangeCount > 0) {
				
						// is the selection the same as the searchString?
						if (String(s) == searchString) {
							if (true) return;
						} else {
							s.removeAllRanges();
						}
					}
			
					// select the current result
					var range = document.createRange();
					range.setStart(results[currentResult].node, results[currentResult].startOffset);
					range.setEnd(results[currentResult].node, results[currentResult].endOffset);
					s.addRange(range);
				
					// scroll if needed
					results[currentResult].node.parentNode.scrollIntoViewIfNeeded();
				}
			
			}
		});
	};
});

jQuery(function($) {
	$.smartSearch();
});