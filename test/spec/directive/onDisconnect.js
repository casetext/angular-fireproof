
describe('onDisconnect', function() {

  var root = new Firebase(window.__env__.FIREBASE_TEST_URL),
    $scope;

  beforeEach(function(done) {

    module('flashpoint');
    module('flashpoint.mocks.pump');

    root.unauth();
    root.child('test/disconnect').remove(done);

  });

  afterEach(function() {
    $scope.$destroy();
  });

  it('evaluates its argument to create an onDisconnect on the associated firebase', function() {

    inject(function($rootScope, $compile) {

      var el = angular.element('<div firebase="' + window.__env__.FIREBASE_TEST_URL +
        '" on-disconnect="promise = $set(\'test\', \'disconnect\', true)"></div>');

      $compile(el)($rootScope);
      $scope = el.scope();
      $rootScope.$digest();

    });

    return $scope.promise.then(function() {

      Firebase.goOffline();
      Firebase.goOnline();

      return expect($scope.fp.root.child('test/disconnect')).to.equal(true);

    });

  });

  it('evaluates onDisconnectError in case of error', function(done) {

    this.timeout(5000);
    inject(function($rootScope, $compile) {

      var el = angular.element('<div firebase="' + window.__env__.FIREBASE_TEST_URL +
        '" on-disconnect-error="done($error)" on-disconnect="promise = $set(\'error\', \'disconnect\', true)"></div>');

      $compile(el)($rootScope);
      $scope = el.scope();
      $scope.done = function(err) {
        expect(err.code).to.be.defined;
        done();
      };

      $rootScope.$digest();

    });

    return $scope.promise.then(function() {

      Firebase.goOffline();
      Firebase.goOnline();
    });

  });


/* TODO(goldibex): test onDisconnect's behavior on detachment */
});
