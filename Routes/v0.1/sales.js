var express = require('express')
var async = require('async')

module.exports = function(app, models){

    var sales = express.Router()

    sales.route("/all")
        .get(app.auth, function(req, res) {
            if(!req.user.hasPermission("sales.read")) {
                res.send("This user does not have access to sales reporting", 403);
                return;
            }
            models.SalesData.find({
                barId: req.user.barId
            }, function(err, sales) {
                if(err) {
                    res.send(err, 500);
                    return;
                } else {
                    var results = [];

                    sales.forEach(function(sale){
                        var formattedDate = sale.day.getFullYear() + "-" +
                            ('0' + (sale.day.getMonth() + 1)).slice(-2) + '-' +
                            ('0' + sale.day.getDate()).slice(-2);

                        var result = [
                            formattedDate,
                            sale.salesAmount,
                            sale.guestCount,
                            sale.staffScheduled,
                            sale.barOpenTime,
                            sale.barCloseTime
                        ]

                        results.push(result);
                    })

                    res.send(results)
                    return;
                }
            });
        });

    sales.route('/')
        //Get all sales data from the request range
        //If no range is specified, use the past week
        .get(app.auth, function(req, res){
            if(!req.user.hasPermission("sales.read")){
                res.send('This user does not have access to sales reporting', 403)
                return;
            }

            if(!req.query.startDate){
                req.query.startDate = new Date()
            } else {
                var startSplit = req.query.startDate.split("-");
                startSplit = startSplit.map(function(x){ return parseInt(x); });
                req.query.startDate = new Date(startSplit[0], startSplit[1] - 1, startSplit[2]);
            }

            if(!req.query.endDate){
                req.query.endDate = new Date(req.query.startDate.getFullYear(), req.query.startDate.getMonth(), req.query.startDate.getDate() - 7)
            } else {
                var endSplit = req.query.endDate.split("-");
                endSplit = endSplit.map(function(x){ return parseInt(x); });
                req.query.endDate = new Date(endSplit[0], endSplit[1] - 1, endSplit[2] + 1);
            }

            models.SalesData.find({
                barId: req.user.barId,
                day: {
                    $gte: new Date(req.query.startDate.getFullYear(), req.query.startDate.getMonth(), req.query.startDate.getDate()),
                    $lte: new Date(req.query.endDate.getFullYear(), req.query.endDate.getMonth(), req.query.endDate.getDate() + 1)
                }
            }, function(err, sales){
                if(err){
                    res.send(err, 500)
                    return;
                } else {
                    //Put the sales into the suggested format
                    //year,month,day,$,guestCount
                    var results = [];

                    sales.forEach(function(sale){
                        var formattedDate = sale.day.getFullYear() + "-" +
                            ('0' + (sale.day.getMonth() + 1)).slice(-2) + '-' +
                            ('0' + sale.day.getDate()).slice(-2);

                        var result = [
                            formattedDate,
                            sale.salesAmount,
                            sale.guestCount,
                            sale.staffScheduled,
                            sale.barOpenTime,
                            sale.barCloseTime
                        ]

                        results.push(result);
                    })

                    res.send(results)
                    return;
                }
            })

        })

        //Create or edit a sales data entry
        /*
            Example body:
            {
                day: Date,
                salesAmount: Number,
                guestCount: Number,
                staffScheduled: Number,
                barOpenTime: String,
                barCloseTime: String
            }
        */
        .post(app.auth, function(req, res){
            if(!req.user.hasPermission('sales.create')){
                res.send('This user does not have access to do sales reporting', 403);
                return;
            }

            if(!req.body.day){
                req.body.day = new Date()
            } else {
                req.body.day = new Date(req.body.day); // No object serialization format for JSON, needed to turn into object
            }

            models.SalesData.findOne({
                barId: req.user.barId,

                day: {
                    $gte: new Date(req.body.day.getFullYear(), req.body.day.getMonth(), req.body.day.getDate()),
                    $lt: new Date(req.body.day.getFullYear(), req.body.day.getMonth(), req.body.day.getDate() + 1)
                }

            }, function(err, sales){
                if(err){
                    res.send(err, 500)
                } else if(!sales){
                    models.SalesData.create({
                        barId: req.user.barId,
                        day: new Date(req.body.day.getFullYear(), req.body.day.getMonth(), req.body.day.getDate()),
                        salesAmount: req.body.salesAmount,
                        guestCount: req.body.guestCount,
                        staffScheduled: req.body.staffScheduled,
                        barOpenTime: req.body.barOpenTime,
                        barCloseTime: req.body.barCloseTime
                    }, function(err, sales){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(sales)
                        }
                    })
                } else {
                    sales.salesAmount = req.body.salesAmount
                    sales.guestCount = req.body.guestCount
                    sales.staffScheduled = req.body.staffScheduled
                    sales.barOpenTime = req.body.barOpenTime
                    sales.barCloseTime = req.body.barCloseTime
                    sales.save(function(err){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(sales)
                        }
                    })
                }
            })
        })

    sales.route("/dashboard")
        .get(app.auth, function(req, res) {
            if(!req.user.hasPermission('sales.read')) {
                res.send([]);
                return;
            }

            models.SalesData.find({
                barId: req.user.barId
            }, function(err, all) {
                if(err) {
                    res.send(err, 500);
                    return;
                } else {
                    var response = {
                        totalSalesChange: {
                            value: "0%",
                            type: "pos"
                        },
                        guestCountChange: {
                            value: "0%",
                            type: "pos"
                        },
                        perHourChange: {
                            value: "0%",
                            type: "pos"
                        }
                    };

                    var todayDate = new Date();
                    var yesterdayDate = new Date(
                        todayDate.getTime() - 86400000
                    );

                    var todayDateFormat = todayDate.getFullYear() + "-" +
                        ('0' + (todayDate.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + todayDate.getDate()).slice(-2);

                    var yesterdayDateFormat = yesterdayDate.getFullYear() + "-" +
                        ('0' + (yesterdayDate.getMonth() + 1)).slice(-2) + '-' +
                        ('0' + yesterdayDate.getDate()).slice(-2);

                    var today = {},
                        yesterday = {};

                    var results = [];

                    all.forEach(function(sale){
                        var formattedDate = sale.day.getFullYear() + "-" +
                            ('0' + (sale.day.getMonth() + 1)).slice(-2) + '-' +
                            ('0' + sale.day.getDate()).slice(-2);

                        if(formattedDate == todayDateFormat) {
                            today = sale;
                        }

                        if(formattedDate == yesterdayDateFormat) {
                            yesterday = sale;
                        }

                        var result = [
                            formattedDate,
                            sale.salesAmount,
                            sale.guestCount
                        ]

                        results.push(result);
                    });

                    // Calculate
                    var yesSales = yesterday.salesAmount ? yesterday.salesAmount : 0,
                        yesGuest = yesterday.guestCount ? yesterday.guestCount : 0,
                        todSales = today.salesAmount ? today.salesAmount : 0,
                        todGuest = today.guestCount ? today.guestCount : 0,
                        yesOpen = yesterday.barOpenTime ? yesterday.barOpenTime : null,
                        yesClose = yesterday.barCloseTime ? yesterday.barCloseTime : null,
                        todOpen = today.barOpenTime ? today.barOpenTime : null,
                        todClose = today.barCloseTime ? today.barCloseTime : null;

                    if(yesSales == 0) {
                        response.totalSalesChange.value = "0%";
                    } else {
                        response.totalSalesChange.value = Math.round((todSales - yesSales) / yesSales * 100) + "%";
                    }

                    if(yesGuest == 0) {
                        response.guestCountChange.value = "0%";
                    } else {
                        response.guestCountChange.value = Math.round((todGuest - yesGuest) / yesGuest * 100) + "%";
                    }

                    if(yesOpen == null || yesClose == null || todOpen == null || todClose == null || yesSales == 0) {
                        response.perHourChange.value = "0%";
                    } else {
                        var tempYesStart = parseInt(yesOpen.split(":")[0], 10);
                        var tempYesClose = parseInt(yesClose.split(":")[0], 10);
                        var tempTodStart = parseInt(todOpen.split(":")[0], 10);
                        var tempTodClose = parseInt(todClose.split(":")[0], 10);


                        var yesDiff = 0;
                        if(tempYesClose < tempYesStart) {
                            yesDiff = tempYesClose + 24 - tempYesStart;
                        } else if (tempYesStart < tempYesClose) {
                            yesDiff = tempYesClose - tempYesStart;
                        } else {
                            yesDiff = 24;
                        }

                        var todDiff = 0;
                        if(tempTodClose < tempTodStart) {
                            todDiff = tempTodClose + 24 - tempTodStart;
                        } else if (tempTodStart < tempTodClose) {
                            todDiff = tempTodClose - tempTodStart;
                        } else {
                            todDiff = 24;
                        }

                        var yesSPH = 0;
                        if(yesDiff != 0) {
                            yesSPH = (yesSales / yesDiff);
                        }

                        var todSPH = 0;
                        if(todDiff != 0) {
                            todSPH = (todSales / todDiff);
                        }

                        if(yesSPH == 0) {
                            response.perHourChange.value = "0%";
                        } else {
                            response.perHourChange.value = Math.round((todSPH - yesSPH) / yesSPH * 100) + "%";
                        }
                    }

                    if(response.totalSalesChange.value.indexOf("-") !== -1) {
                        response.totalSalesChange.type = "neg";
                    }

                    if(response.guestCountChange.value.indexOf("-") !== -1) {
                        response.guestCountChange.type = "neg";
                    }

                    if(response.perHourChange.value.indexOf("-") !== -1) {
                        response.perHourChange.type = "neg";
                    }

                    response.allSales = results;

                    res.send(response);
                    return;
                }
            });
        })

    return sales;
}
