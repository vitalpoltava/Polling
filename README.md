Polling
=======

jQuery plugin for ajax polling.

You can use this plugin to initiate a sequence of ajax requests with defined delay and several other options.

Polling usage:
--------------

(1) Simple: will initiate infinite looping with default options

      $.poll({
          url: "https://www.example.com/api/request.json"
      });
 
(2) Advanced: init polling options:

      $.poll({
          url: "https://www.example.com/api/request.json",
          pollDelay: 5000,
          pollLoops: 15
      });

The above example will invoke polling ajax request with polling period of 5 sec.
with 15 polls.

Options
-------

##pollLoops
haw many loops you want (not defining or -1 will initiate infinite polling)

##pollDelay
delay between requests (in milliseconds)


##pollDone
callback for all 'done' promises

##pollFail
callback for all 'fail' promises

##pollMaxFailedAttempts
limits of sequent fails (default: 10 times)
