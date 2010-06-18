Type-To-Navigate
================

Overview
--------

Type-To-Navigate is an extension for Apple Safari and Google Chrome. It enables a type-to-select feature much like Firefox's **accessibility.typeaheadfind** option (in about:config), whereupon you can select links (or any word, really) just by typing.

Usage
-----
Type characters on the keyboard while there are no input fields focused. The first text match will be highlighted as you type. If the selection happens to be within a link, hitting the return key will follow it. Hitting &#8984;G will go to the next result. &#8679;&#8984;G will go to the previous result. Esc will cancel an in-progress search (in case you are in a hurry), and will also de-focus fields and links.

Installation
------------
1. Click to install the extension, or download it and drag into a Safari window:
	
	- [Type-To-Navigate for Safari](http://dbergey.github.com/Type-To-Navigate/typetonavigate.safariextz)
	- [Type-To-Navigate for Chrome](http://dbergey.github.com/Type-To-Navigate/typetonavigate.crx)
	
2. Click all ensuing confirmation buttons.

Both browsers provide an automatic extension update service, so there should be continual improvements where needed. Safari will not install updates without permission unless you check "Install Updates Automatically" in Extensions preferences; Chrome updates them automatically.

Sites With Remaining Quirks
---------------------------

- GitHub -- some letters don't register, like 's', which triggers focus on the search field, and 't', which does something unspecified.
- Google search results -- When typing the same string as that for which was searched, it seems like some hidden text is selected. Typing something different is a workaround.
- Google Reader, Gmail? - sometimes interferes with j/k-style navigation

Future Plans
------------

- j/k-style navigation support, for websites that use it like Google Reader and Gmail.
- Configurable website blacklist.
- Trigger key: / or ⌘⇧F
- useful hotkeys like  ⌘C to copy the selected link, and ⌘I to send the link to instapaper
- IFRAME support .. right now you can't type to select inside them.

License
-------

Type-To-Navigate is licensed under [the MIT license](http://creativecommons.org/licenses/MIT/). Also, I remain the official publisher, including in Apple's Safari Extensions Gallery and automatic update feed. Feel free to fork, but push changes back to me and I'll incorporate them in the official version as I see fit.

Author
------
Daniel K. Bergey  
[http://twitter.com/dbergey](http://twitter.com/dbergey)