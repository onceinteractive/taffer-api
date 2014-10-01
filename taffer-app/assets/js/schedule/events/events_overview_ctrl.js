angular.module("taffer.controllers")
    .controller("EventsOverviewCtrl", [
        "$scope",
        "$state",
        "$stateParams",
        "api",
        "$timeout",
        "DataService",
        "$ocModal",
        "$q",
        "AuthService",
        function(scope, state, stateParams, api, timeout, DataService, modal, $q, auth) {
            scope.auth = auth;

            scope.header.subTitle = 'Events Overview';
            scope.header.mainTitle = scope.bar.name;
            scope.header.homeBtn = true;
            scope.header.cancelBtn = false;
            scope.header.saveBtn = false;
            scope.header.backBtn = false;
            scope.header.footerNav = true;
            scope.dateRange = {};
            scope.todaysDate = moment().format('YYYY-MM-DD');

            scope.edit = function(event) {
                if(event.extendsSeries) {
                    modal.open({
                        url: "views/modals/edit_event_modal.html",
                        cls: "fade-in",
                        onClose: function(editSeries) {
                            console.log(editSeries);
                            if(!modal.waitingForOpen) {
                                state.go("Main.Schedule.EventsAdd", {eventId: event._id, editSeries: editSeries});
                            }
                        }
                    });
                }else {
                    state.go("Main.Schedule.EventsAdd", {eventId: event._id, editSeries: false});
                }
                console.log('edit button clicked');
            }

            scope.delete = function(event) {
                console.log('delete button clicked');
                if(event.extendsSeries) {
                    modal.open({
                        url: "views/modals/delete_event_modal.html",
                        cls: "fade-in",
                        onClose: function(deletingSeries) {
                            console.log(deletingSeries);
                            if(!modal.waitingForOpen) {
                                if(deletingSeries) {
                                    api.delete("events/series/" + event.extendsSeries).then(function(result) {
                                        getMonthsEvents(scope.dateRange);
                                    }).catch(function(err) {
                                        console.log(err);
                                    });
                                }else {
                                    api.delete("events/" + event._id).then(function(result) {
                                        getMonthsEvents(scope.dateRange);
                                    }).catch(function(err) {
                                        console.log(err);
                                    });
                                }
                            }
                        }
                    });
                } else {
                    console.log(event);
                    api.delete("events/" + event._id).then(function(result) {
                        getMonthsEvents(scope.dateRange);
                    }).catch(function(err) {
                        console.log(err);
                    });
                }
            }

            scope.$on("create-cal", function(event, dateRange) {
                console.log(dateRange);
                scope.dateRange = dateRange;
                getMonthsEvents(scope.dateRange);
            });

            scope.$on("parent-create", function(event) {
                console.log('new event');
                state.go("Main.Schedule.EventsAdd");
            });
            function showModal(confirmDeleteMessage,e) {
                modal.open({
                        url: "views/modals/delete_confirmation.html",
                        cls: "fade-in",
                        init: {
                        confirmDeleteMessage: confirmDeleteMessage,
                        event2del: e,
                        tmpFN: function(event2del){
                            console.log('Deleting event....',event2del);
                            scope.delete(e);
                            modal.close();
                        }
                    }
                });
            };
            scope.showModal = showModal;
            function getMonthsEvents(dateRange) {
                scope.eventDays = [];
                var queryParams = "?start=" + dateRange.startOfMonthUTC + "&end=" + dateRange.endOfMonthUTC;
                api.get("events" + queryParams).then(function(result) {
                    scope.events = result.data;

                    scope.events.map(function(x) {
                        x.start = moment.utc(x.startTimeUTC).format("h:mma");
                        x.end = moment.utc(x.endTimeUTC).format("h:mma");
                        scope.eventDays[moment.utc(x.date).format("D")] = true;
                    });

                    console.log(scope.events);
                }).catch(function(err) {
                    console.log(err);
                });
            };

            function deleteSeries(seriesId) {
                var deferred = $q.defer();
                console.log('deleting series');
                Event.all().prefetch("series").filter("series",'=', seriesId)
                    .list(function(events) {
                        angular.forEach(events, function(event) {
                            console.log(event);
                            event.isDeleted = true;
                            event.series.isDeleted = true;
                        });
                        console.log(events);
                        deferred.resolve();
                    });
                return deferred.promise;
            };

        }
    ]);
