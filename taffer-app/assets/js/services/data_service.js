angular.module('taffer.services')
    .service('DataService', ['$q', "APIConfig", function($q, CONFIG) {
        var API_BASE =
            CONFIG.protocol +
            "://" + CONFIG.host +
            ":" + CONFIG.port +
            "/" + CONFIG.version + "/";

        persistence.debug = false;
        persistence.store.websql.config(persistence, 'fusiondb', 'description', 5*1024*1024);

        var User = persistence.define('User', {
            _id: "TEXT",
            email: "TEXT",
            firstName: "TEXT",
            lastName: "TEXT",
            pictureURI: "TEXT",
            role: "TEXT",
            permissions: "TEXT",
            barId: "TEXT"
        });

        var Schedule = persistence.define('Schedule', {
            startDate: "INT",
            endDate: "INT",
            status: "TEXT",
            laborPer: "INT"
        });

        var Day = persistence.define('Day', {
            day: "TEXT",
            dateString: "TEXT",
            date: "INT"
        });

        var Shift = persistence.define('Shift', {
            day: "INT",
            dateUTC: "INT",
            active: "BOOL",
            start: "TEXT",
            end: "TEXT",
            startTimeUTC: "INT",
            endTimeUTC: "INT",
            isOpening: "BOOL",
            isClosing: "BOOL",
            isSaved: "BOOL"
        });

        var Series = persistence.define('Series', {
            startDate: "INT",
            endDate: "INT",
            isDeleted: "BOOL"
        });

        var Event = persistence.define('Event', {
            title: "TEXT",
            description: "TEXT",
            date: "TEXT",
            startTime: "TEXT",
            endTime: "TEXT",
            startTimeUTC: "INT",
            endTimeUTC: "INT",
            isAllDay: "BOOL",
            isRecurring: "BOOL",
            isDeleted: "BOOL"
        });

        var TimeOff = persistence.define('TimeOff', {
            userId: "TEXT",
            dateUTC: "INT",
            status: "TEXT",
            isAllDay: "BOOL",
            startTimeUTC: "INT",
            endTimeUTC: "INT",
            reason: "TEXT"
        });

        var Swap = persistence.define('Swap', {
            requestingUserId: "TEXT",
            requestingShiftId: "TEXT",
            requestedUserId: "TEXT",
            requestedShiftId: "TEXT",
            userStatus: "TEXT",//pending, approved, declined
            managerStatus: "TEXT", //pending, approved, declined
            requestReason: "TEXT",
            declinedReason: "TEXT",
            updatedOn : "INT" //UTC Time the swap was approved or rejected
        });

        Schedule.hasMany('days', Day, 'schedule');
        Schedule.hasMany('shifts', Shift, 'schedule');
        User.hasMany('shifts', Shift, 'user');
        Series.hasMany('days', Day, 'series');
        Series.hasMany('events', Event, 'series');

        User.enableSync(API_BASE + "users/changes");
        Schedule.enableSync(API_BASE + "schedules/changes");
        Day.enableSync(API_BASE + "days/changes");
        Shift.enableSync(API_BASE + "shifts/changes");
        Event.enableSync(API_BASE + "events/changes");
        Series.enableSync(API_BASE + "series/changes");
        TimeOff.enableSync(API_BASE + "timeoff/changes");
        Swap.enableSync(API_BASE + "swaps/changes");

        persistence.schemaSync(null,function(tx) {
            //alert('wait');
        });

        this.User = function() {
            return User;
        }

        this.Schedule = function() {
            return Schedule;
        }

        this.Day = function() {
            return Day;
        }

        this.Shift = function() {
            return Shift;
        }

        this.Event = function() {
            return Event;
        }

        this.Series = function() {
            return Series;
        }

        this.TimeOff = function() {
            return TimeOff;
        }

        this.Swap = function() {
            return Swap;
        }

        this.SyncAndFlush = function(callback) {
            var deferred = $q.defer();

            persistence.flush(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
                deferred.resolve();
            });

            SyncAll();

            return deferred.promise;
        }

        function SyncAll(cb) {
            var connectionType = "";
            if(navigator.connection) {
                connectionType = navigator.connection.type;
            } else {
                connectionType = "web";
            }

            if(connectionType !== 'none') {
                Schedule.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                    Series.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                        Event.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                            User.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                                Shift.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                                    Day.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                                        TimeOff.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                                            Swap.syncAll(persistence.sync.preferRemoteConflictHandler, function() {
                                                persistence.flush(function() {
                                                    //alert('sync!!');
                                                });
                                            }, function(error) {
                                                console.log(error);
                                            });
                                        }, function(error) {
                                            console.log(error);
                                        });
                                    }, function(error) {
                                        console.log(error);
                                    });
                                }, function(error) {
                                    console.log(error);
                                });
                            }, function(error) {
                                console.log(error);
                            });
                        }, function(error) {
                            console.log(error);
                        });
                    }, function(error) {
                        console.log(error);
                    });
                }, function(error) {
                    console.log(error);
                });
            }
        }

        this.removeAllDataNoSync = function() {
            var deferred = $q.defer();
            persistence.reset(function() {
                deferred.resolve();
            });

            return deferred.promise;
        }

        this.removeAllData = function() {

            var promises = [];
            var deferred = $q.defer();

            promises.push(deferred.promise);
            persistence.reset(function() {
                persistence.schemaSync(null,function(tx) {
                    deferred.resolve();
                });
            });

            return promises;

        }

        function removeAllSchedules(callback) {
            Schedule.all().destroyAll(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
            }, function(error) {
                console.log(error);
            });
        }

        function removeAllSeries(callback) {
            Series.all().destroyAll(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
            }, function(error) {
                console.log(error);
            });
        }

        function removeAllEvents(callback) {
            Event.all().destroyAll(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
            }, function(error) {
                console.log(error);
            });
        }

        function removeAllUsers(callback) {
            User.all().destroyAll(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
            }, function(error) {
                console.log(error);
            });
        }

        function removeAllShifts(callback) {
            Shift.all().destroyAll(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
            }, function(error) {
                console.log(error);
            });
        }

        function removeAllDays(callback) {
            Day.all().destroyAll(function() {
                if(typeof(callback) === 'function' && callback) {
                    callback();
                }
            }, function(error) {
                console.log(error);
            });
        }
    }]);
