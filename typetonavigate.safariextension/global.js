var TTNGlobal = (function() {
	return {
		instapaperReq: new XMLHttpRequest(),
		
		persistentSettingsKeys: {
			secure: ['instapaperUsername', 'instapaperPassword'],
			unsecure: []
		},
		
		init: function() {
			// bind message listener
			safari.application.addEventListener('message', function(msg) {
				TTNGlobal[msg.name](msg.message, msg.target);
			}, false);
			
			// bind settings change listeners
			safari.extension.settings.addEventListener("change", this.getSettings, false);
			safari.extension.settings.addEventListener("change", this.saveSettingsToLocalStorage, false);
			safari.extension.secureSettings.addEventListener("change", this.saveSettingsToLocalStorage, false);
			
			// make sure we have settings
			this.retrieveSettingsFromLocalStorage();
		},
		retrieveSettingsFromLocalStorage: function() {
			var keys = TTNGlobal.persistentSettingsKeys;
			for (x in keys.secure)
				if (!safari.extension.secureSettings[keys.secure[x]])
					safari.extension.secureSettings.setItem(keys.secure[x], localStorage.getItem(keys.secure[x]));
			for (x in keys.unsecure)
				if (!safari.extension.settings.getItem(keys.unsecure[x]))
					safari.extension.settings.setItem(keys.unsecure[x], localStorage.getItem(keys.unsecure[x]));
		},
		saveSettingsToLocalStorage: function(e) {
			var keys = TTNGlobal.persistentSettingsKeys;
			for (x in keys.secure)
				localStorage.setItem(keys.secure[x], safari.extension.secureSettings.getItem(keys.secure[x]));
			for (x in keys.unsecure)
				localStorage.setItem(keys.unsecure[x], safari.extension.settings.getItem(keys.unsecure[x]));
		},
		// handleAlphaKeys: function(data, target) {
		// 	target.page.dispatchMessage('handleAlphaKeys', data);
		// },
		// handleNonAlphaKeys: function(data, target) {
		// 	target.page.dispatchMessage('handleNonAlphaKeys', data);
		// },
		getSettings: function(data, target) {
			var settings = {
				blacklist: safari.extension.settings.getItem('blacklist'),
				linksOnly: safari.extension.settings.getItem('linksOnly')
			};
			if (target && target.page) {
				// if the page asked, it's easy (because each page asks on load)
				target.page.dispatchMessage('getSettingsCallback', settings);
			} else {
				// if a setting changed, we have to push it to all open tabs
				var windows = safari.application.browserWindows;
				for (var w in windows) {
					for (var t in windows[w].tabs) {
						windows[w].tabs[t].page.dispatchMessage('getSettingsCallback', settings);
					}
				}
			}
		},
		sendToInstapaper: function(data, target) {
			data = {
				href: data.href,
				username: safari.extension.secureSettings.getItem('instapaperUsername'),
				password: safari.extension.secureSettings.getItem('instapaperPassword')
			};
			
			var status = 500;
			if ( !data.username || !data.password ) {
				var status = 403;
			} else {
				var url = 'https://www.instapaper.com/api/add?url='+ encodeURIComponent(data.href) +'&username='+ encodeURIComponent(data.username) +'&password='+ encodeURIComponent(data.password);
				try {
					this.instapaperReq.open("GET", url, false); //, encodeURIComponent(data.username), encodeURIComponent(data.password));
					this.instapaperReq.send(null);
					var status = this.instapaperReq.responseText;
				} catch(err) {
					console.log(err);
				}
			}
			target.page.dispatchMessage('sendToInstapaperCallback', { status: status });
		}
	};
})();
TTNGlobal.init();
