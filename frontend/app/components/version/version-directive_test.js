'use strict';

describe('myApp.version module', function() {
  beforeEach(module('myApp.version'));

  describe('ptm-angular-version directive', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span ptm-angular-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });
});
