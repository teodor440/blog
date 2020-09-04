---
layout: note
title: "XSS"
category: Web
---

# Cross site scripting

## Overview

Cross-site scripting works by manipulating a vulnerable web site so that it returns malicious JavaScript to users. Cross-site scripting vulnerabilities normally allow an attacker to masquerade as a victim user, to carry out any actions that the user is able to perform, and to access any of the user's data

## Testing guide

### Reflected cross-site scripting

### Stored cross-site scripting

### DOM-based cross-site scripting

#### Beware of common sinks

For JavaScript:
>document.write()
document.writeln()
document.domain
someDOMElement.innerHTML
someDOMElement.outerHTML
someDOMElement.insertAdjacentHTML
someDOMElement.onevent

For JQuery:
>add()
after()
append()
animate()
insertAfter()
insertBefore()
before()
html()
prepend()
replaceAll()
replaceWith()
wrap()
wrapInner()
wrapAll()
has()
constructor()
init()
index()
jQuery.parseHTML()
$.parseHTML()

#### For AngularJS
When a site uses the **ng-app attribute on an HTML element**, it will be processed by AngularJS. In this case, AngularJS will **execute JavaScript inside double curly braces** that can occur directly in HTML or inside attributes.

## Pentest

- Changing the email of the account should be enforced by retyping your password, otherwise an XSS vulnerability would lead to account takeover

## Resources
[Portswigger](https://portswigger.net/web-security/cross-site-scripting)  
[XSS cheatsheet portswigger](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
