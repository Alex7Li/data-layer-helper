(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';/*
 jQuery v1.9.1 (c) 2005, 2012
 jQuery Foundation, Inc. jquery.org/license.
*/
var f=/\[object (Boolean|Number|String|Function|Array|Date|RegExp|Arguments)\]/;function g(a){return null==a?String(a):(a=f.exec(Object.prototype.toString.call(Object(a))))?a[1].toLowerCase():"object"}function k(a,b){return Object.prototype.hasOwnProperty.call(Object(a),b)}function m(a){if(!a||"object"!=g(a)||a.nodeType||a==a.window)return!1;try{if(a.constructor&&!k(a,"constructor")&&!k(a.constructor.prototype,"isPrototypeOf"))return!1}catch(d){return!1}for(var b in a);return void 0===b||k(a,b)};function n(a,b){var d={},c=d;a=a.split(".");for(var e=0;e<a.length-1;e++)c=c[a[e]]={};c[a[a.length-1]]=b;return d}function q(a,b){var d=!a._clear,c;for(c in a)if(k(a,c)){var e=a[c];"array"===g(e)&&d?("array"===g(b[c])||(b[c]=[]),q(e,b[c])):m(e)&&d?(m(b[c])||(b[c]={}),q(e,b[c])):b[c]=e}delete b._clear};/*
 Copyright 2012 Google Inc. All rights reserved. */
function r(a,b,d){b=void 0===b?{}:b;"function"===typeof b?b={listener:b,listenToPast:void 0===d?!1:d,processNow:!0,commandProcessors:{}}:b={listener:b.listener||function(){},listenToPast:b.listenToPast||!1,processNow:void 0===b.processNow?!0:b.processNow,commandProcessors:b.commandProcessors||{}};this.a=a;this.j=b.listener;this.i=b.listenToPast;this.g=!1;this.b={};this.f=[];this.c=b.commandProcessors;this.h=u(this);b.processNow&&this.process()}
r.prototype.process=function(){var a=this.b;this.registerProcessor("set",function(){if(1===arguments.length&&"object"===g(arguments[0])){var c=arguments[0];for(var e in c)q(n(e,c[e]),a)}else 2===arguments.length&&"string"===g(arguments[0])&&(c=n(arguments[0],arguments[1]),q(c,a))});v(this,this.a,!this.i);var b=this.a.push,d=this;this.a.push=function(){var c=[].slice.call(arguments,0),e=b.apply(d.a,c);v(d,c);return e}};
r.prototype.get=function(a){var b=this.b;a=a.split(".");for(var d=0;d<a.length;d++){if(void 0===b[a[d]])return;b=b[a[d]]}return b};r.prototype.flatten=function(){this.a.splice(0,this.a.length);this.a[0]={};q(this.b,this.a[0])};r.prototype.registerProcessor=function(a,b){a in this.c||(this.c[a]=[]);this.c[a].push(b)};
function v(a,b,d){d=void 0===d?!1:d;for(a.f.push.apply(a.f,b);!1===a.g&&0<a.f.length;){b=a.f.shift();if("array"===g(b))a:{var c=a.b;g(b[0]);for(var e=b[0].split("."),p=e.pop(),l=b.slice(1),h=0;h<e.length;h++){if(void 0===c[e[h]])break a;c=c[e[h]]}try{c[p].apply(c,l)}catch(w){}}else if("arguments"===g(b)){e=a;p=[];l=b[0];if(e.c[l])for(c=e.c[l].length,h=0;h<c;h++)p.push(e.c[l][h].apply(e.h,[].slice.call(b,1)));a.f.push.apply(a.f,p)}else if("function"==typeof b)try{b.call(a.h)}catch(w){}else if(m(b))for(var t in b)q(n(t,
b[t]),a.b);else continue;d||(a.g=!0,a.j(a.b,b),a.g=!1)}}r.prototype.registerProcessor=r.prototype.registerProcessor;r.prototype.flatten=r.prototype.flatten;r.prototype.get=r.prototype.get;r.prototype.process=r.prototype.process;window.DataLayerHelper=r;function u(a){return{set:function(b,d){q(n(b,d),a.b)},get:function(b){return a.get(b)}}};})();
