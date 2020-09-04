---
layout: note
title: "Insecure Deserialization"
category: Web
---

# Insecure Deserialization

## Overview

## Testing guide

#### Check for parts of application with serialized data
Look after cookies with exotic encodings (maybe base64).

#### PHAR deserialization
If the server uses PHP try using `phar://` protocol.  
The PHP documentation reveals that PHAR manifest files contain serialized metadata. Crucially, if you perform any filesystem operations on a phar:// stream, this metadata is implicitly deserialized. This means that a phar:// stream can potentially be a vector for exploiting insecure deserialization, provided that you can pass this stream into a filesystem method.

## Exploitation

#### Look for gadget chain exploits for the language of the web app.
They will trigger unintended behavior (RCE) at unserialization time.

#### There might be a need to create your own exploits for custom gadget chains
This has relevance especially when having source code access.

## Attack surface

## Tools

- [Ysoserial - common gadget chain exploiter](https://github.com/frohoff/ysoserial)  
- [Phpgcc](https://github.com/ambionics/phpggc)  
- [Ruby 2.x Universal RCE Gadget Chain](https://www.elttam.com/blog/ruby-deserialization/)  
- [Generic Java program for serializing objects](https://github.com/PortSwigger/serialization-examples/tree/master/java/generic)

## Resources

[Portswigger](https://portswigger.net/web-security/deserialization/exploiting)  
[Phar deserialization mentioned in the top of creative web hacking techniques 2018](https://portswigger.net/research/top-10-web-hacking-techniques-of-2018#6)
