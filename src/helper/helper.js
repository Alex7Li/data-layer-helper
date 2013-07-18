/**
 * Copyright 2012 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Data layer helper library.
 *
 * The dataLayer is a shared queue of objects holding generic information
 * about the page. It uses a standard set of keys so it can be read by anyone
 * that understands the spec (The spec is still under construction). It uses
 * a queue so that the page can record changes to its state. For example, a
 * page might start with the following dataLayer in its head section:
 *
 *   var dataLayer = [{
 *     title: 'Original page title'
 *   }];
 *
 * But in many situations (like an Ajax app), the state/data of the page can
 * change. Using a queue allows the page to update the data when that happens.
 * For example, if the title should change, the page can do this:
 *
 *   dataLayer.push({title: 'New page title'});
 *
 * Strictly speaking, this could have been done without a queue. But using a
 * queue allows readers of the dataLayer to come along at any time and process
 * the entire history of the page's data. This is especially useful for things
 * that load asynchronously or are deferred until long after the page
 * originally loads. But most importantly, using a queue allows all this
 * functionality without requiring a synchronous bootloader script slowing down
 * the page.
 *
 * @author bkuhn@google.com (Brian Kuhn)
 */


/**
 * Creates a new helper object for the given dataLayer.
 *
 * @constructor
 * @param {!Array.<!Object>} dataLayer The dataLayer to help with.
 * @param {function(!Object, !Object)=} opt_listener The callback function to
 *     execute when a new state gets pushed onto the dataLayer.
 * @param {boolean=} opt_listenToPast If true, the given listener will be
 *     executed for state changes that have already happened.
 */
var DataLayerHelper = function(dataLayer, opt_listener, opt_listenToPast) {

  /**
   * The dataLayer to help with.
   * @type {!Array.<!Object>}
   * @private
   */
  this.dataLayer_ = dataLayer;

  /**
   * The listener to notify of changes to the dataLayer.
   * @type {function(!Object, !Object)}
   * @private
   */
  this.listener_ = opt_listener || function() {};

  /**
   * The internal marker for checking if the listener is currently on the stack.
   * @type {boolean}
   * @private
   */
  this.executingListener_ = false;

  /**
   * The internal representation of the dataLayer's state at the time of the
   * update currently being processed.
   * @type {!Object}
   * @private
   */
  this.model_ = {};

  /**
   * The internal queue of dataLayer updates that have not yet been processed.
   * @type {Array.<Object>}
   * @private
   */
  this.unprocessed_ = [];

  // Process the existing/past states.
  this.processStates_(dataLayer, !opt_listenToPast);

  // Add listener for future state changes.
  var helper = this;
  var oldPush = dataLayer.push;
  dataLayer.push = function() {
    var states = [].slice.call(arguments, 0);
    var result = oldPush.apply(dataLayer, states);
    helper.processStates_(states);
    return result;
  };
};
window['DataLayerHelper'] = DataLayerHelper;

/**
 * Returns the value currently assigned to the given key in the helper's
 * internal model.
 *
 * @param {string} key The path of the key to set on the model, where dot (.)
 *     is the path separator.
 * @return {*} The value found at the given key.
 * @this {DataLayerHelper}
 */
DataLayerHelper.prototype['get'] = function(key) {
  var target = this.model_;
  var split = key.split('.');
  for (var i = 0; i < split.length; i++) {
    if (target[split[i]] === undefined) return undefined;
    target = target[split[i]];
  }
  return target;
};

/**
 * Flattens the dataLayer's history into a single object that represents the
 * current state. This is useful for long running apps, where the dataLayer's
 * history may get very large.
 *
 * @this {DataLayerHelper}
 */
DataLayerHelper.prototype['flatten'] = function() {
  this.dataLayer_.splice(0, this.dataLayer_.length);
  this.dataLayer_[0] = {};
  merge_(this.model_, this.dataLayer_[0]);
};

/**
 * Merges the given update objects (states) onto the helper's model, calling
 * the listener each time the model is updated.
 *
 * @param {Array.<Object>} states The update objects to process, each
 *     representing a change to the state of the page.
 * @param {boolean=} opt_skipListener If true, the listener the given states
 *     will be applied to the internal model, but will not cause the listener
 *     to be executed. This is useful for processing past states that the
 *     listener might not care about.
 * @private
 */
DataLayerHelper.prototype.processStates_ = function(states, opt_skipListener) {
  this.unprocessed_.push.apply(this.unprocessed_, states);
  // Checking executingListener here protects against multiple levels of
  // loops trying to process the same queue. This can happen if the listener
  // itself is causing new states to be pushed onto the dataLayer.
  while (this.executingListener_ == false && this.unprocessed_.length > 0) {
    var update = this.unprocessed_.shift();
    if (!isPlainObject(update)) continue;
    for (var key in update) {
      merge_(expandKeyValue_(key, update[key]), this.model_);
    }
    if (!opt_skipListener) {
      this.executingListener_ = true;
      this.listener_(this.model_, update);
      this.executingListener_ = false;
    }
  }
};

/**
 * Converts the given key value pair into an object that can be merged onto
 * another object. Specifically, this method treats dots in the key as path
 * separators, so the key/value pair:
 *
 *   'a.b.c', 1
 *
 * will become the object:
 *
 *   {a: {b: {c: 1}}}
 *
 * @param {string} key The key's path, where dots are the path separators.
 * @param {*} value The value to set on the given key path.
 * @return {Object} An object representing the given key/value which can be
 *     merged onto the dataLayer's model.
 * @private
 */
function expandKeyValue_(key, value) {
  var result = {};
  var target = result;
  var split = key.split('.');
  for (var i = 0; i < split.length - 1; i++) {
    target = target[split[i]] = {};
  }
  target[split[split.length - 1]] = value;
  return result;
}

/**
 * Determines if the given value is an array.
 *
 * @param {*} value The value to test.
 * @return {boolean} True iff the given value is an array.
 * @private
 */
function isArray_(value) {
  return type(value) == 'array';
}

/**
 * Merges one object into another or one array into another. Scalars and
 * "non-plain" objects are overwritten when there is a merge conflict.
 * Arrays and "plain" objects are merged recursively.
 *
 * TODO(bkuhn): This is just a starting point for how we'll decide which
 * objects get cloned and which get copied. More work is needed to flesh
 * out the details here.
 *
 * @param {Object|Array} from The object or array to merge from.
 * @param {Object|Array} to The object or array to merge into.
 * @private
 */
function merge_(from, to) {
  for (var property in from) {
    if (hasOwn(from, property)) {
      var fromProperty = from[property];
      if (isArray_(fromProperty)) {
        if (!isArray_(to[property])) to[property] = [];
        merge_(fromProperty, to[property]);
      } else if (isPlainObject(fromProperty)) {
        if (!isPlainObject(to[property])) to[property] = {};
        merge_(fromProperty, to[property]);
      } else {
        to[property] = fromProperty;
      }
    }
  }
}
