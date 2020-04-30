# [3.0.0](https://github.com/qiwi/decorator-utils/compare/v2.3.0...v3.0.0) (2020-04-30)


### Bug Fixes

* correct FIELD decorators handling ([91ff8ee](https://github.com/qiwi/decorator-utils/commit/91ff8ee02dd7875955da61c6e264de62b1596d82))


### BREAKING CHANGES

* field decorator does not affect proto now

# [2.3.0](https://github.com/qiwi/decorator-utils/compare/v2.2.0...v2.3.0) (2020-04-03)


### Features

* add injectMeta helper ([caad7b9](https://github.com/qiwi/decorator-utils/commit/caad7b9357c7f328e7d6c6e740d778bd269e3718))


### Performance Improvements

* **package:** up deps ([e577955](https://github.com/qiwi/decorator-utils/commit/e577955233a769e8770b24ebdb47facbac0b62fd))

# [2.2.0](https://github.com/qiwi/decorator-utils/compare/v2.1.0...v2.2.0) (2020-03-28)


### Features

* add proto and ctor refs to IDecoratorContext ([ec3e937](https://github.com/qiwi/decorator-utils/commit/ec3e937a2fea3b2cb22ab1c315db9c759535a3a9))

# [2.1.0](https://github.com/qiwi/decorator-utils/compare/v2.0.0...v2.1.0) (2020-03-28)


### Features

* handle param decorators ([22956df](https://github.com/qiwi/decorator-utils/commit/22956df1aa5d93befc25cbcf83a0b7f76da591bb))

# [2.0.0](https://github.com/qiwi/decorator-utils/compare/v1.3.1...v2.0.0) (2020-03-27)


### Features

* pass propName to method decorators ([37fd934](https://github.com/qiwi/decorator-utils/commit/37fd93424525bc9652ea89a51e950dde2b9748cd))
* safeHandleFactory asserts the result of method substitution ([e7f1fad](https://github.com/qiwi/decorator-utils/commit/e7f1fad0902e6daa3e44cf39ab7327ed75b40a85))
* use IDecoratorContext as the only argument of IHandler ([7caaafc](https://github.com/qiwi/decorator-utils/commit/7caaafc08483ac11884e9556e2e4898f359e61f5))


### BREAKING CHANGES

* IHandler does not process the prev arg scheme

## [1.3.1](https://github.com/qiwi/decorator-utils/compare/v1.3.0...v1.3.1) (2020-03-25)


### Bug Fixes

* **package:** publish typings dir ([6e69130](https://github.com/qiwi/decorator-utils/commit/6e691308919139336b7979c086c292b784726d4e))

# [1.3.0](https://github.com/qiwi/decorator-utils/compare/v1.2.0...v1.3.0) (2019-09-12)


### Bug Fixes

* **package:** add missed esm dev dep ([f002551](https://github.com/qiwi/decorator-utils/commit/f002551))


### Features

* add FlowType libdefs ([7c5adb7](https://github.com/qiwi/decorator-utils/commit/7c5adb7)), closes [#32](https://github.com/qiwi/decorator-utils/issues/32)

# [1.2.0](https://github.com/qiwi/decorator-utils/compare/v1.1.1...v1.2.0) (2019-08-26)


### Features

* add alias constructDecorator = createDecorator ([e0ec1b7](https://github.com/qiwi/decorator-utils/commit/e0ec1b7))

## [1.1.1](https://github.com/qiwi/decorator-utils/compare/v1.1.0...v1.1.1) (2019-08-26)


### Bug Fixes

* **package:** regenerate yarn.lock ([d22d1cd](https://github.com/qiwi/decorator-utils/commit/d22d1cd))

# [1.1.0](https://github.com/qiwi/decorator-utils/compare/v1.0.0...v1.1.0) (2019-07-19)


### Features

* migrate to typescript and jest ([3765460](https://github.com/qiwi/decorator-utils/commit/3765460)), closes [#10](https://github.com/qiwi/decorator-utils/issues/10) [#11](https://github.com/qiwi/decorator-utils/issues/11)

# 1.0.0 (2019-02-03)


### Bug Fixes

* change entry point & add test for index ([e511947](https://github.com/qiwi/decorator-utils/commit/e511947))


### Features

* add `flow` libdef ([bad99e1](https://github.com/qiwi/decorator-utils/commit/bad99e1))
