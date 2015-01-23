"use strict";

const timeLine = document.querySelector('.timeLine');
var totalTweets = [];

/**
* showStats
*
* Populate some stats
*/

function showStats(){
  let totalTweets = document.querySelector('.totalTweets');
  totalTweets.textContent = countProperties('user') || 0;

  let totalPhotos  = document.querySelector('.totalPhotos');
  totalPhotos.textContent = countProperties('photo') || 0;

  let totalFavourites  = document.querySelector('.totalFavourites');
  totalFavourites.textContent = countProperties('favourited') || 0;
}


/**
* showTimeline
*
* Flesh out some sweet sweet tweet data
* then append to the .timeLine
*/

function showTimeline(){
  let el = document.createElement('div');

  totalTweets.forEach(function(tweet){

    let tweetElement = el.cloneNode(true);
    tweetElement.classList.add('tweet');

    let name = el.cloneNode(true);
    name.classList.add('tweet__name');
    name.textContent = tweet.user.name;

    let handle = el.cloneNode(true);
    handle.classList.add('tweet__handle');
    handle.textContent = '@' + tweet.user.handle;

    let message = el.cloneNode(true);
    message.classList.add('tweet__message');
    message.textContent = tweet.message;

    tweetElement.appendChild(name);
    tweetElement.appendChild(handle);
    tweetElement.appendChild(message);
    timeLine.appendChild(tweetElement);
  });
}

/**
* countProperties
*
* Utility function to help us count certain props
*
* @param  {String} a specific prop
* @return {Number} count
*/

function countProperties(prop) {
  let count = 0;

  totalTweets.forEach(function(tweet){
    if (prop in tweet) count++;
  });

  return count;
}


/**
 * get - XHR Request
 */

let get = function (url) {
  return function (callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      let response = JSON.parse(xhr.responseText);
      if(xhr.readyState != 4) return;
      if (xhr.status === 200) {
        callback(null, response);
      }
      else {
        callback(response, null);
      }
    };
    xhr.send();
  };
};


/**
 * getTweets (Generator)
 */

let getTweets = function* () {
  let data;

  try {
    // get the 1st tweet
    data = yield get('https://api.myjson.com/bins/2qjdn');
    totalTweets.push(data);

    // now get the 2nd tweet
    data = yield get('https://api.myjson.com/bins/3zjqz');
    totalTweets.push(data);

    // then get the 3rd tweet
    data = yield get('https://api.myjson.com/bins/29e3f');
    totalTweets.push(data);

    // then do the other stuff
    showStats();
    showTimeline();

    console.log('All done');
  }
  catch (err) {
    console.log( "Do something with this: ", err);
  }
};


/**
 * runGenerator
 * A function that takes a generator function and
 * recusively calls next() until `done: true
 */

let runGenerator = function (fn) {

  let next = function (err, arg) {
    if (err) return it.throw(err);

    var result = it.next(arg);
    if (result.done) return;

    if (typeof result.value == 'function') {
      result.value(next);
    }
    else {
      next(null, result.value);
    }
  }

  let it = fn();
  return next();
}

// kick it off
runGenerator(getTweets);
