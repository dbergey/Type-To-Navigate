// ==UserScript==
// @name          Type-To-Navigate Live
// @description   Enables type-to-navigate, where you can select links/anything just by typing, then hit return to follow a link. Updates automatically.
// @namespace     http://www.danielbergey.com/
// @include       *

// by Daniel Bergey (http://www.danielbergey.com/)
// ==/UserScript==

(function() {
	var loader = {
		
		url: 'http://github.com/dbergey/type_to_navigate_chrome/raw/master/type_to_navigate/type_to_navigate.user.js',
		
		loadJS: function() {
			var s = document.createElement('script');
			s.setAttribute('src', loader.url); 
			document.body.appendChild(s);
		},
		
		init: function() {
			// add indicator div to page
			if ( document.readyState == 'complete' )
				loader.loadJS();
			else
				window.addEventListener('load', function() {
					loader.loadJS();
				});
		}
	};
	loader.init();
})();