---
layout: note
title: "Server-side template injection"
category: Web
---

# Server-side template injection

## Overview
Template engines are designed to generate web pages by combining fixed templates with volatile data. Server-side template injection attacks can occur when user input is concatenated directly into a template, rather than passed in as data. This allows attackers to inject arbitrary template directives in order to manipulate the template engine, often enabling them to take complete control of the server.  

## Testing guide

### Detect
Fuzz characters such as ${{<%[%'"}}%\. Look for the following contexts in which the bug may appear and apply context specific detection methods.

#### Plaintext context
If user input is rendered directly like this:
```javascript
render('Hello ' + username)
```
You would detect it by checking if an expression is processed server-side:
```http
http://vulnerable-website.com/?username=${7*7}
```

#### Code context
In other cases, the vulnerability is exposed by user input being placed within a template expression.
```javascript
greeting = getQueryParameter('greeting')
engine.render("Hello {{"+greeting+"}}", data)
```
On the website, the resulting URL would be something like:
```http
http://vulnerable-website.com/?greeting=data.username
```
It may be exploited like this:
```http
http://vulnerable-website.com/?greeting=data.username}}<tag>
```

### Identify
Look for **server errors** or try to **guess the engine methodologically** using template expressions.
![Portswigger decision tree for template engine identification](https://portswigger.net/web-security/images/template-decision-tree.png)

## Tools

## Resources
[Portswigger](https://portswigger.net/web-security/server-side-template-injection)
