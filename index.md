# Synchronous Asynchronous JavaScript: Part II.

## ES6 iterators and generators

In the [one of my last articles](http://www.chrisbuttery.com/articles/synchronous-asynchronous-javascript/ "Synchronous asynchronous JavaScript") we looked at at few ways we could call aynchronous code in a synchonous flow. We started with the a nested 'callback hell' approach and then progressed through to Promises - with each option arraging the code into a more legible format.

I was pretty much sold on Promises as the answer to everything. That was, until I heard about ES6 generators functions and iterator objects.
Now I'm not going to get into the nitty gritty of ES6 iterators and generators, as [far more intelligent people](http://davidwalsh.name/es6-generators "who doesn't love David Walsh?!") have [already documented them](http://tobyho.com/2013/06/16/what-are-generators/ "Toby Ho rules!") in an [much more elegant way](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function* "MDN: function*") than I _ever_ could.

### Whats the skinny?

* A generator is defined by an * character `function *foo () { ... }`
* A generator function can be paused and resumed at any time in your app.
* A generator function is paused by executing a `yield` keyword in the body of the function
* When a generator function is called, it returns a *Generator Iterator* object
* The *Generator Iterator* includes a  'next' method for stepping through the generator function
* The *Generator Iterator's* next method also returns an object with 'value' and 'done' properties.
* And at the risk of delving too deep - generator functions can yield to other generator functions

####OK, just give me some sort of walk through.

Ok, [browser support for ES6 generator functions](http://kangax.github.io/compat-table/es6/ "kangax ES6 compatibility: see Functions > Generators") are few and far between. Firefox is ahead of the pack when it comes to ES6 implementation - however chrome is adding more and more support with every iteration.

Ok lets get into it.
Open up Firefox and drop this into the console:

```javascript
function *generator () {
  yield 'wow';
  yield 'this';
  yield 'is';
  yield 'sweet';
}

let iterator = generator();
```
Then enter:

```javascript
iterator.next(); // { value: "wow",  done: false }
```

Our _iterator_ object has paused and returned the first value of the generator, along with `done: false`.
So it knows it hasn't run to completion yet.

Now call the `next()` method 3 more times.

```javascript
iterator.next(); // { value: "this",  done: false }
iterator.next(); // { value: "is",  done: false }
iterator.next(); // { value: "sweet",  done: false }
```
We've _yielded_ our 4 `yield` statements - yet out last object is still saying `done: false`. This is because we're still paused at the `yield`.

```javascript
iterator.next(); // { value: undefined,  done: true }
```
ok, `value: undefined`. Well thats not super exciting. But we now know we've run to competion as `done` is now `true`. What we could've done is returned something more meaningful at the end of the function.

```javascript
function *generator () {
  yield 'wow';
  yield 'this';
  yield 'is';
  yield 'sweet';
  return 'dewd!'
}

let iterator = generator();

iterator.next(); // { value: "wow",  done: false }
iterator.next(); // { value: "this",  done: false }
iterator.next(); // { value: "is",  done: false }
iterator.next(); // { value: "sweet",  done: false }
iterator.next(); // { value: "dewd!",  done: true }
```

And that my friends is the most high level look at ES6 generator functions you'll probably ever find.
Please visit some of the links mentioned above for more information, sanity and clarity.

## Get on with it!

<iframe width="100%" height="auto" src="//www.youtube.com/embed/l1YmS_VDvMY" frameborder="0" allowfullscreen></iframe>

By using ES6 generator functions I'm able to take our existing code and call asynchronous methods in a controlled flow.

So we could have a `getTweets` function that _yields_ to our `get(url)` function, which will
make our XHR requests and stuff the response into our array.

```javascript
let getTweets = function* () {
  let totalTweets = [];
  let data;

  // pause and get the 1st tweet. Only continue when next() is called
  data = yield get('https://api.myjson.com/bins/2qjdn');
  totalTweets.push(data);

  // pause and get the 2nd tweet. Only continue when next() is called
  data = yield get('https://api.myjson.com/bins/3zjqz');
  totalTweets.push(data);

  // then get the 3rd tweet. Only continue when next() is called
  data = yield get('https://api.myjson.com/bins/29e3f');
  totalTweets.push(data);

  return totalTweets;
};

let iterator = getTweets();

iterator.next(); // { value: Object,  done: false }
iterator.next(); // { value: Object,  done: false }
iterator.next(); // { value: Object,  done: false }

```

This is so much cleaner that any of [my other approaches](http://www.chrisbuttery.com/articles/synchronous-asynchronous-javascript/ "Synchronous asynchronous JavaScript"). It doesn't even look like aychronous code.

But ... we're going to have to change some of our code. Specifically the `get()` function. We need a way of _returning_ the value of the request back to the _yield_ statement.

What we can do, is turn the `get()` function into a [thunk](http://www.sitepoint.com/javascript-generators-preventing-callback-hell/ " Understanding Thunks").
A thunk, in it's most basic form, is a function that returns a function.
We need `get()` to return a function, so we're then be able to call `next()` on it.

```javascript
let get = function (url) {

  // return a function
  return function (callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
      let response = xhr.responseText;
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
```

## But having to explicitly call iterator.next() a specific amount of times is kind of lame.

Yes, yes it is.

But what if we write a recursive function that will continue to call the iterator until `done` is `true`?

```javascript
let runGenerator = function (generatorFunction) {

  // recursive next()
  let next = function (err, arg) {
    if (err) return it.throw(err);

    var result = it.next(arg);
    if (result.done) return;

    // was a function returned ?
    if (typeof result.value == 'function') {
      result.value(next);
    }
    else {
      next(null, result.value);
    }
  }

  // create the iterator
  let it = generatorFunction();
  return next();
}

runGenerator(someGeneratorFunction);
```

[Drop the code from this gist into the Firefox console to try it out](https://gist.github.com/chrisbuttery/204375cab329d126d521).

## How can I use generators today?

Seeing as generators aren't fully supported yet, you're going to need a tool to convert your script into something most browsers can understand.

### [Regenerator](https://www.npmjs.com/package/regenerator)

[Regenerator](https://www.npmjs.com/package/regenerator) is a simple CLI tool that will convert your ES6 generator functions into usable ES5 goodness.

```bash
$ npm install regenerator
$ regenerator --include-runtime input.js > output.js
```

## Code Source

You can download the full code example (inc regenerator) here.  
To build this example, CD into the project and run:

```bash
npm install
```
