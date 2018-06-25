# decorator-utils

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![buildStatus](https://img.shields.io/travis/qiwi/decorator-utils.svg?maxAge=3600&branch=master)](https://travis-ci.org/qiwi/decorator-utils)
[![Coveralls](https://img.shields.io/coveralls/qiwi/decorator-utils.svg?maxAge=3600)](https://coveralls.io/github/qiwi/decorator-utils)
[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/qiwi/decorator-utils)
[![dependencyStatus](https://img.shields.io/david/qiwi/decorator-utils.svg?maxAge=3600)](https://david-dm.org/qiwi/decorator-utils)
[![devDependencyStatus](https://img.shields.io/david/dev/qiwi/decorator-utils.svg?maxAge=3600)](https://david-dm.org/qiwi/decorator-utils)
[![Greenkeeper badge](https://badges.greenkeeper.io/qiwi/decorator-utils.svg)](https://greenkeeper.io/)

##### Do I need this?
1. — Decorator, what's that?  
   — It's just a proposal ["aspect" syntax for JS](https://github.com/tc39/proposal-decorators).
2. — How does it work?  
   — [Addy Osmany's answer](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)
3. — Is there any ready solution?  
   — Yes, there're many awesome things around. Look at [core-decorators](https://www.npmjs.com/package/core-decorators) and [lodash-decorators](https://www.npmjs.com/package/lodash-decorators). 
4. — Do I need this lib?  
   — You should try this one before: [decorator-utils](https://www.npmjs.com/package/decorator-utils) by Luke Horvat
5. — ...  
   — [Just give a chance to Google](https://google.com/search?q=js+decorator+utils)
6. — ...   
   — How about writing your own? [Netanel Basal's practical tips](https://netbasal.com/create-and-test-decorators-in-javascript-85e8d5cf879c) may be very helpful.
6. — ...  
   — *Yes*, but it's at your own risk

##### NOTE
There's no right way to support both decorator types: with @parentheses() and @plain.
Holy War thread: [https://github.com/wycats/javascript-decorators/issues/23](https://github.com/wycats/javascript-decorators/issues/23)

##### Usage examples
###### Field
```javascript
    import {createDecorator, FIELD} from 'qiwi-decorator-utils'
    
    const prefix = constructDecorator((targetType, target, param) => {
      if (targetType === FIELD) {
        return () => (param || '') + target()
      }
    })

    class Foo {
      @prefix('_')
      foo = 'bar'
      @prefix('__')
      baz = 'qux'
    }
```

###### Method
```javascript
 const decorator = constructDecorator((targetType, target, param) => {
          if (targetType === METHOD) {
            return value => param || 'qux'
          }
        })

        class Foo {
          @decorator()
          foo () { return 'bar' }
          @decorator('BAZ')
          baz () { return 'baz' }
        }
```

###### Class
```javascript
const decorator = constructDecorator((targetType, target) => {
          if (targetType === CLASS) {
            return class Bar extends target {
              constructor (name, age) {
                super(name)
                this.age = age
              }
            }
          }
        })

        @decorator()
        class Foo {
          constructor (name) {
            this.name = name
          }
          foo () { return 'bar' }
        }
```

Also you may apply decorator to the class, but decorate its methods

```javascript
const decorator = constructDecorator((targetType, target) => {
      if (targetType === METHOD) {
        return () => {
          return target().toUpperCase()
        }
      }
    })

    @decorator()
    class Foo {
      foo () { return 'bar' }
      baz () { return 'baz' }
    }
```
