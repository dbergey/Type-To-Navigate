Type-to-Navigate
================

Overview
--------

Type-to-Navigate is an extension for Google Chrome / Chromium, and a userscript for Safari (with GreaseKit). It enables a type-to-select feature much like Firefox's **accessibility.typeaheadfind** option (in about:config), whereupon you can select links (or any word, really) just by typing.

Usage
-----
Type characters on the keyboard while there are no input fields focused. The first text match will be highlighted as you type. If the selection happens to be within a link, hitting the return key will follow it. Hitting &#8984;G will go to the next result. &#8679;&#8984;G will go to the previous result. Esc will cancel an in-progress search (in case you are in a hurry), and will also de-focus fields and links.

Installation (Chrome / Chromium)
--------------------------------
1. Click to install the extension:  [type_to_navigate.crx](http://github.com/dbergey/type_to_navigate_chrome/raw/master/type_to_navigate.crx), or download it and drag it into a Chrome / Chromium window.
2. Click all ensuing confirmation buttons.

Installation (Safari)
---------------------
1. Install [SIMBL](http://www.culater.net/software/SIMBL/SIMBL.php) and [GreaseKit](http://8-p.info/greasekit/)
2. Click to install the userscript: [type_to_navigate.user.js](http://github.com/dbergey/type_to_navigate_chrome/raw/master/type_to_navigate/type_to_navigate.user.js)
3. Confirm installation.

Chrome / Chromium will automatically update Type-to-Navigate when there is a new version, so there should be continual improvements where needed. Safari will notify you when there is an update; just click the notification to upgrade.

Sites With Remaining Quirks
---------------------------

- GitHub -- some letters don't register, like 's', which triggers focus on the search field, and 't', which does something unspecified.
- Google search results -- When typing the same string as that for which was searched, it seems like some hidden text is selected. Typing something different is a workaround.

Future Plans
------------

- Add user-configurable website blacklist. Might be good to upload this data somewhere transparently, so as to gather data on what sites don't work and which most annoy so.

Author
------
Daniel Bergey  
[http://twitter.com/dbergey](http://twitter.com/dbergey)