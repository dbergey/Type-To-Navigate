var TTNGlobal = (function() {
	return {
		init: function() {
			// bind message listener
			safari.application.addEventListener('message', function(msg) {
				TTNGlobal[msg.name](msg.message, msg.target);
			}, false);
		},
		handleAlphaKeys: function(data, target) {
			target.page.dispatchMessage('handleAlphaKeys', data);
		},
		handleNonAlphaKeys: function(data, target) {
			target.page.dispatchMessage('handleNonAlphaKeys', data);
		},
		getBlacklist: function(data, target) {
			var blacklist = safari.extension.settings.getItem('blacklist');
			target.page.dispatchMessage('getBlacklistCallback', blacklist);
		}
	};
})();
TTNGlobal.init();
