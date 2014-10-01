angular.module("taffer.controllers")
.controller("EventsAddCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "$timeout",
  "DataService",
  "$q",
  "$ocModal",
  "AuthService",
  "KeenIO",
  function(scope, state, stateParams, api, timeout, DataService, $q, modal, auth, keenIO) {
    scope.header.subTitle = null;
    scope.header.mainTitle = 'NEW EVENT';
    scope.header.homeBtn = false;
    scope.header.addBtn = false;
    scope.header.cancelBtn = false;
    scope.header.saveBtn = true;
    scope.header.backBtn = true;
    scope.header.footerNav = false;
    scope.event = {};
    scope.event.days = [];

    //value was coming in as true/false string
    //converting to boolean
    scope.editingSeries = (stateParams.editSeries === 'true') ? true : false;
    scope.addingNewEvent = true;

    if(stateParams.eventId) {
      scope.header.mainTitle = scope.editingSeries ? 'EDIT SERIES' : 'EDIT EVENT';
      scope.addingNewEvent = false;
      api.get("events/" + stateParams.eventId).then(function(result) {
          var event = result.data;

          scope.event.title = event.title;
          scope.event.description = event.description;
          scope.event.isAllDay = event.isAllDay;
          scope.selectedDate = event.date;

          if(!event.isAllDay) {
              scope.event.startTime = moment.utc(event.startTimeUTC).format("HH:mm");
              scope.event.endTime = moment.utc(event.endTimeUTC).format("HH:mm");

              scope.event.originalStartTime = moment.utc(event.startTimeUTC).format("HH:mm");
              scope.event.originalEndTime = moment.utc(event.endTimeUTC).format("HH:mm");
          }

          if(event.extendsSeries) {
              scope.event.extendsSeries = event.extendsSeries;
          }
      }).catch(function(err) {console.log(err);});
    } else {
      scope.addingNewEvent = true;
    }

    scope.$on("parent-back", function(event) {
      state.go("Main.Schedule.Events");
    });

    scope.$on("parent-save", function(event) {
      if(scope.eventForm.$valid && scope.selectedDate) {
          if(!scope.addingNewEvent && !scope.editingSeries) {
            // Edit and Not Recurring
            editSingleEvent();
            return;
          }

          if(!scope.addingNewEvent && scope.editingSeries) {
            // Edit and Recurring
            editRecurringEvent();
            return;
          }

          if(scope.addingNewEvent && scope.event.isRecurring) {
            // New and Recurring
            createRecurringEvent();
            return;
          }

          if(scope.addingNewEvent && !scope.event.isRecurring) {
            // New
            createNewEvent();
            return;
          }
        } else {
          if(!scope.selectedDate) {
            showModal("You must select an event date.");
          } else if(scope.eventForm.title.$invalid) {
            showModal("You must enter a title.");
          } else if(scope.eventForm.description.$invalid) {
            showModal("You must enter a description.");
          } else if(scope.eventForm.endDate.$invalid) {
            showModal("You must select an end date.");
          } else {
            showModal("Something went wrong...");
          }
        }
    });

    function createNewEvent() {
        // NEW EVENT - title, desc, date, start time, end time, is all day
        var data = {
            title: scope.event.title,
            description: scope.event.description,
            date: moment.utc(scope.selectedDate).format("YYYY-MM-DD")
        };

        if(scope.event.isAllDay) {
            data.isAllDay = true;
            data.startTimeUTC = moment.utc(scope.selectedDate).startOf('day').valueOf();
            data.endTimeUTC = moment.utc(scope.selectedDate).endOf('day').valueOf();
        } else {
            data.isAllDay = false;
            data.startTimeUTC = moment.utc(scope.selectedDate).add('hours', scope.event.startTime.substr(0,2)).add('minutes', scope.event.startTime.substr(3,2)).valueOf();
            data.endTimeUTC = moment.utc(scope.selectedDate).add('hours', scope.event.endTime.substr(0,2)).add('minutes', scope.event.endTime.substr(3,2)).valueOf();
        }

        api.post("events", data).then(function(result) {
            keenIO.addEvent('eventsNew', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              type: 'single'
            })

            state.go("Main.Schedule.Events");
        }).catch(function(err) {
            console.log(err);
        });
    }

    function editSingleEvent() {
        // EDIT EVENT - title, desc, date, start time, end time, is all day
        var data = {
            title: scope.event.title,
            description: scope.event.description,
            date: moment.utc(scope.selectedDate).format("YYYY-MM-DD")
        };

        if(scope.event.isAllDay) {
            data.isAllDay = true;
            data.startTimeUTC = moment.utc(scope.selectedDate).startOf('day').valueOf();
            data.endTimeUTC = moment.utc(scope.selectedDate).endOf('day').valueOf();
        } else {
            data.isAllDay = false;
            data.startTimeUTC = moment.utc(scope.selectedDate).add('hours', scope.event.startTime.substr(0,2)).add('minutes', scope.event.startTime.substr(3,2)).valueOf();
            data.endTimeUTC = moment.utc(scope.selectedDate).add('hours', scope.event.endTime.substr(0,2)).add('minutes', scope.event.endTime.substr(3,2)).valueOf();
        }

        api.put("events/" + stateParams.eventId, data).then(function(result) {
            keenIO.addEvent('eventsEdit', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              type: 'single'
            })

            state.go("Main.Schedule.Events");
        }).catch(function(err) {
            console.log(err);
        });
    }

    function editRecurringEvent() {
        // EDIT RECURRING EVENT - title, descr
        var data = {
            title: scope.event.title,
            description: scope.event.description
        }

        console.log(scope.event);

        api.put("events/series/" + scope.event.extendsSeries, data).then(function(result) {
            keenIO.addEvent('eventsEdit', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              type: 'recurring'
            })

            state.go("Main.Schedule.Events");
        }).catch(function(err) {
            console.log(err);
        });
    };

    function createRecurringEvent() {
        // CREATE RECURRING EVENT - title, desc, date, start time, end time, is all day
        var seriesStartDate = moment.utc(scope.selectedDate);
        var seriesEndDate = moment.utc(scope.event.endDate);

        var recurDays = [];
        var i = 0;
        while(i <= 6) {
            console.log(i);
            if(scope.event.days[i]) {
                recurDays.push(translateToDay(i));
            }
            i++;
        }

        var recurrence = moment.recur(seriesStartDate.format("YYYY-MM-DD"), seriesEndDate.format("YYYY-MM-DD"))
            .every(recurDays).daysOfWeek();

        var allDays = recurrence.all("YYYY-MM-DD");

        var recurEvents = [];
        allDays.map(function(x) {
            var data = {
                title: scope.event.title,
                description: scope.event.description,
                date: x
            };

            if(scope.event.isAllDay) {
                data.isAllDay = true;
                data.startTimeUTC = moment.utc(x).startOf('day').valueOf();
                data.endTimeUTC = moment.utc(x).endOf('day').valueOf();
            } else {
                data.isAllDay = false;
                data.startTimeUTC = moment.utc(x).add('hours', scope.event.startTime.substr(0,2)).add('minutes', scope.event.startTime.substr(3,2)).valueOf();
                data.endTimeUTC = moment.utc(x).add('hours', scope.event.endTime.substr(0,2)).add('minutes', scope.event.endTime.substr(3,2)).valueOf();
            }

            recurEvents.push(data);
        });

        api.post("events/series", recurEvents).then(function(result) {
            keenIO.addEvent('eventsNew', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              type: 'recurring'
            })

            state.go("Main.Schedule.Events");
        }).catch(function(err) {
            console.log(err);
        });
    };

    function translateToDay(index) {
        var result = "";
        switch(index) {
            case 0:
                result = "monday";
                break;
            case 1:
                result = "tuesday";
                break;
            case 2:
                result = "wednesday";
                break;
            case 3:
                result = "thursday";
                break;
            case 4:
                result = "friday";
                break;
            case 5:
                result = "saturday";
                break;
            case 6:
                result = "sunday";
                break;
        };

        return result;
    }

    function showModal(errorMessage) {
      modal.open({
        url: "views/modals/error_message.html",
        cls: "fade-in",
        init: {
          errorMessage: errorMessage
        }
      });
    };

  }
]);
