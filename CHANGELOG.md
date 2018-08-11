# Changelog

## 1.2.1 / 2018-08-12

* Fix: forgot to build module before deploy

## 1.2.0 / 2018-08-12

* Revert: debug timebase
* Breaking: Re-write into ES module
* Addition: TVMLKit support
* Addition: Tree-shaking compatibility

## 1.1.0 / 2018-06-20

* Feature: configurable debug instance timebase
* Update: devDependencies
* Fix: new color test condition: unexpected useragent

## 1.0.0 / 2018-05-15

* Breaking: Re-write in ES6
* Breaking: createDebug.humanize move to env.humanize
* Breaking: createDebug.enabled renamed to createDebug.enabler
* Addition: nwjs support
* Addition: `process` package support
* Addition: 99% coverage test
* Fix: JSON.stringify circular issue
* Fix: Edge > 16.16215 support console colors
* Fix: window.webkitURL is existed in Edge issue
