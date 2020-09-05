---
layout: note
title: "CSRF"
category: Web security
tag: [Web security, Note]
---

# Cross site request forgery

## Main idea

Sensitive request should have some degree of unpredictability in order to prevent an attacker tricking a victim to issue or reissue such a request. The attacker has only to direct victims to his site where they will issue a request to the targeted website.

## Typical situations

1. Validation of CSRF token depends on request method
2. Validation of CSRF token depends on token being present
3. CSRF token is not tied to the user session
4. CSRF token is tied to a non-session cookie
5. CSRF token is simply duplicated in a cookie
6. Validation of Referer depends on header being present
7. Validation of Referer can be circumvented

## Resources
[Portswigger](https://portswigger.net/web-security/csrf)
