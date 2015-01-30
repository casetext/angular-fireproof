
angular.module('flashpoint')
.directive('fpOnDisconnect', function($q, $log, validatePath) {

  return {
    require: '^firebase',
    link: function(scope, el, attrs, fp) {

      var disconnects = {};

      var onDisconnectError = function(err) {

        $log.debug('fpOnDisconnect: error evaluating "' + attrs.fpOnDisconnect +
          '": ' + err.code);

        if (attrs.fpOnDisconnectError) {
          scope.$eval(attrs.fpOnDisconnectError, { $error: err });
        }

      };

      var getDisconnectContext = function(root) {

        return {

          $set: function() {

            var args = Array.prototype.slice.call(arguments, 0),
              data = args.pop(),
              path = validatePath(args);

            if (path) {

              disconnects[path] = true;
              return root.child(path).onDisconnect().set(data)
              .catch(onDisconnectError);

            } else {
              return $q.reject(new Error('Invalid path'));
            }

          },

          $update: function() {

            var args = Array.prototype.slice.call(arguments, 0),
              data = args.pop(),
              path = validatePath(args);

            if (path) {

              disconnects[path] = true;
              return root.child(path).onDisconnect().update(data)
              .catch(onDisconnectError);

            } else {
              return $q.reject(new Error('Invalid path'));
            }

          },

          $setWithPriority: function() {

            var args = Array.prototype.slice.call(arguments, 0),
              priority = args.pop(),
              data = args.pop(),
              path = validatePath(args);

            if (path) {

              disconnects[path] = true;
              return root.child(path).onDisconnect().setWithPriority(data, priority)
              .catch(onDisconnectError);

            } else {
              return $q.reject(new Error('Invalid path'));
            }

          },

          $remove: function() {

            var args = Array.prototype.slice.call(arguments, 0),
              path = validatePath(args);

            if (path) {

              disconnects[path] = true;
              return root.child(path).onDisconnect().remove()
              .catch(onDisconnectError);

            } else {
              return $q.reject(new Error('Invalid path'));
            }

          }

        };

      };

      if (fp.root) {

        // fp.root already exists, better evaluate disconnect immediately
        scope.$eval(attrs.fpOnDisconnect, getDisconnectContext(fp.root));

      }

      scope.$on('fpAttach', function(event, root) {

        // attach disconnect to this Firebase
        scope.$eval(attrs.fpOnDisconnect, getDisconnectContext(root));

      });


      scope.$on('fpDetach', function(event, root) {

        // shut down my disconnects
        for (var disconnectPath in disconnects) {
          root.child(disconnectPath).onDisconnect().cancel();
        }

        disconnects = {};

      });

    }

  };

});
