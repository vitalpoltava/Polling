/**
 * @fileOverview A module to extend regular ajax call with POLLING.
 * You can use it with jQuery $.ajax or add your own transport. While
 * applying jQuery.poll you can use standard $.ajax options, or/and jQuery.poll specific ones:
 * - 'pollLoops': haw many loops you want (not defining or -1 will initiate infinite polling),
 * - 'pollDelay': delay between requests (in milliseconds),
 * - 'pollDone': callback for all 'done' promises,
 * - 'pollFail': callback for all 'fail' promises,
 * - 'pollMaxFailedAttempts': limits of sequent fails (default: 10 times)
 *
 * @author Vitalii Omelkin
 *
 * Polling usage:
 * --------------
 *
 * (1) Simple: will initiate infinite looping with default options
 *
 *      $.poll({
 *          url: "https://www.example.com/api/request.json"
 *      });
 *
 * (2) Advanced: init polling options:
 *
 *      $.poll({
 *          url: "https://www.example.com/api/request.json",
 *          pollDelay: 5000,
 *          pollLoops: 15
 *      });
 *
 * The above example will invoke polling ajax request with polling period of 5 sec.
 * with 15 polls.
 *
 *
 */
(function($) {

'use strict';
var jqXHR, _pollTimer, _currentPollLoop, _fails;

/**
 *  @param {Object} o Standard jQuery.ajax settings
 */
var poll = function(o) {

    // we can use here 'classical' $.ajax or or any other transport you want
    var invoker = $.ajax;

    // @private
    function isPageHidden(){
        return document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || false;
    }

    // @private
    function emptyRequest(o) {
        // polling stops while browser tab is hidden (saves resources)
        var invokeFunc = isPageHidden() ? emptyRequest : poll;
        if (_pollTimer) clearTimeout(_pollTimer);
        _pollTimer = setTimeout(function() {
            invokeFunc(o);
        }, 1000);
    }

    // @private
    function expBackoffDelay(currTry) {
        return Math.round(Math.random() * (500 * Math.pow(2, currTry)));
    }

    // @private
    function pollAjax(o, delay) {
        // polling stops while browser tab is hidden (saves resources)
        var invokeFunc = isPageHidden() ? emptyRequest : poll;
        if (_pollTimer) clearTimeout(_pollTimer);

        // stop if 'fails' count is more then max value
        if (_fails > o.pollMaxFailedAttempts) {
            console.error('Polling terminated due to exceeding max failed attempts...');
            return;
        }

        // check loops limit
        if (o.pollLoops !== -1) {
            _currentPollLoop += 1;
            if (_currentPollLoop >= o.pollLoops) return;
        }

        if (delay) {
            _pollTimer = setTimeout(function() {
                invokeFunc(o);
            }, delay);
        }
    }

    // Add/update polling options
    o.pollDelay = o.pollDelay || 60000; // Polling period: 60 sec
    o.pollLoops = o.pollLoops || -1; // max poll loops (-1: infinite loop)
    o.pollMaxFailedAttempts = o.pollMaxFailedAttempts || 10; // max fails (default: 10 times)

    // Internal params
    _currentPollLoop = _currentPollLoop || 0;
    _fails = _fails || 0;

    jqXHR = invoker(o); // Invoke AJAX request

    // add callback for 'done' (success) promise
    if (typeof o.pollDone === 'function') {
        jqXHR.done(o.pollDone);
    }

    // add callback for 'fail' (error) promise
    if (typeof o.pollFail === 'function') {
        jqXHR.fail(o.pollFail);
    }

    jqXHR.done(function() {
        _fails = 0; // init 'fails' sequence on success
        pollAjax(o, o.pollDelay); // re-launch ajax call
    });

    jqXHR.fail(function() {
        _fails++;
        pollAjax(o, expBackoffDelay(_fails)); // re-launch ajax call
    });

};

$.extend({ poll: poll });

}(jQuery));
