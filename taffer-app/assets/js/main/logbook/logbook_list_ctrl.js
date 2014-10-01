angular.module("taffer.controllers")
.controller("LogBookListCtrl", [
  "$scope",
  "$state",
  "api",
  "KeenIO",
  function(scope, state, api, keenIO) {
    scope.searchText = "";

    var searchInput = $("#l-logbook-search-input")[0];
    searchInput.addEventListener("search", function(e) {
      if(searchInput.value && searchInput.value !== "") {
        scope.search();
        scope.$apply();
      } else {
        scope.clearSearch();
        scope.$apply();
      }
    }, false);

    scope.$on("parent-create", function(event) {
      state.go("Main.LogBook.NewLogEntry");
    });

    scope.reply = function(thread) {
      if(!scope.isSearching) {
        state.go("Main.LogBook.Reply", {threadId: thread._id, fromParent: true});
      }
    };

    scope.view = function(thread) {
      scope.updateSelectedLog(thread);
      state.go("Main.LogBook.View");

      keenIO.addEvent('logbookView', {
        user: scope.auth.getUser()._id,
        bar: scope.auth.getUser().barId,
        threadId: thread._id
      })
    };

    scope.search = function() {
      if(scope.searchText && scope.searchText !== "") {
        scope.updateIsSearching(true);
        var promise = api.put("logbook", {text: scope.searchText});
        promise.success(function(data, status, headers, config) {
          scope.addSearchLogs(data);
          console.log(data);
        });

        promise.error(function(data, status, headers, config) {
          console.log(status);
          console.log(data);
        });
      }
    };

    scope.clearSearch = function() {
      scope.updateIsSearching(false);
      scope.resetLogs();
      scope.searchText = "";
    };

    scope.getCreatedDate = function(time) {
      if(time) {
        return moment(time).fromNow();
      } else {
        return moment('2000-01-01').fromNow();
      }
    }

  }
]);
