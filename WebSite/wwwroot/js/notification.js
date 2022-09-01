//var Notification = (function ($) {
//    /*jshint strict:false */

//    return {
//        notificationWrap: null,
//        unreadNotification: null,
//        interval: null,
//        timeout: 40000, // 40s
//        fiveMinutesTimeout: 300000, //5m
//        numberOfItems: 10,
//        initialize: function () {
//            $("#notification-container").show();
//            this.unreadNotification = $("#unreadNotification");
//            this.notificationWrap = $("#notificationWrap");

//            this.initEvent();
//            this.interval = setTimeout(this.showIconNumberOfNotifications);
//            setTimeout(this.get3rdProductsNotification);
//        },
//        initEvent: function () {
//            $("#notification-toggle").click(function (event) {
//                event.stopPropagation(); // prevent any parent handlers from being notified of the event
//                Notification.toggleNotificationPanel();
//            });
//            $("#notificationWrap").click(function (event) {
//                event.stopPropagation();
//            });
//            $("#notificationWrap").delegate("#see-all", "click", function (event) {
//                event.stopPropagation();
//                Notification.getTopMessages(0);
//            });
//        },

//        get3rdProductsNotification: function () {
//            $.ajax({
//                type: "GET",
//                url: "/api/notifications/get-notification-bet-builder",
//                crossDomain: true,
//                xhrFields: {
//                    withCredentials: true
//                },
//                dataType: "json",
//                success: function (result) {
//                    if (result) {
//                        var icon = "<span class='products-notification'> </span>";
//                        if ($("#3rdProducts-menu > span.products-notification").length === 0) {
//                            $("#3rdProducts-menu").append(icon);
//                        }
                       
//                        if ($(".bet-builder-sub > span.products-notification").length === 0) {
//                            $(".bet-builder-sub").append(icon);
//                        }
//                    } else {
//                        $(".products-notification").remove();
//                    }
//                    // recall
//                    setTimeout(Notification.get3rdProductsNotification, Notification.fiveMinutesTimeout);
//                }
//            });
//        },

//        showIconNumberOfNotifications: function () {
//            $.ajax({
//                type: "GET",
//                url: "/api/notifications/get-notification",
//                crossDomain: true,
//                xhrFields: {
//                    withCredentials: true
//                },
//                dataType: "json",
//                success: function (data) {
//                    if (data > 0) {
//                        Notification.unreadNotification.html(data);
//                        Notification.unreadNotification.show();
//                    }
//                    else {
//                        Notification.unreadNotification.html('');
//                        Notification.unreadNotification.hide();
//                    }
//                },
//                complete: function () {
//                    // recall
//                    Notification.interval = setTimeout(Notification.showIconNumberOfNotifications, Notification.timeout);
//                }
//            });
//        },
//        getTopMessages: function (top) {
//            Notification.notificationWrap.html('');
//            $.ajax({
//                type: "GET",
//                xhrFields: {
//                    withCredentials: true
//                },
//                url: "/apps/notification?top=" + top,
//                dataType: "html",
//                success: function (data) {
//                    if (data && data.length > 0) {
//                        Notification.notificationWrap.append(data);
//                    }
//                },
//                error: function () {
//                    alert(Languages.SystemError);
//                }
//            });
//        },

//        stopInterval: function () {
//            clearInterval(Notification.interval);
//        },

//        toggleNotificationPanel: function () {
//            var visible = Notification.notificationWrap.is(":visible");
//            if (visible) {
//                $(document).unbind("click");
//                Notification.showIconNumberOfNotifications(); // start Interval
//                Notification.notificationWrap.toggle();
//            }
//            else {
//                Notification.notificationWrap.toggle();

//                Notification.stopInterval(); // stop Interval when user open notification panel
//                Notification.getTopMessages(Notification.numberOfItems);

//                $(document).one("click", function () {
//                    Notification.notificationWrap.toggle();
//                    Notification.showIconNumberOfNotifications(); // start Interval
//                });
//            }
//        }
//    };
//}(jQuery));
var timeout = 10000;
var fiveMinutesTimeout = 10000;

function showIconNumberOfNotifications() {
    var unreadNotification = document.getElementById('unreadNotification');
    var urlNotification = '/api/notifications/get-notification';
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === XMLHttpRequest.DONE) {  
            var result = xmlHttp.responseText;
            if (result !== "") {
                unreadNotification.innerHTML = result;
                unreadNotification.style.display = "block";
            }
            else {
                unreadNotification.innerHTML = "";
                unreadNotification.style.display = "none";
            }
            setTimeout(showIconNumberOfNotifications, timeout);
        }
    };

    xmlHttp.open('GET', urlNotification, true);
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.send();
}

function showIconBetBuilder() {
    var parentMenu = document.getElementById('3rdProducts-menu');
    var urlNotificationBetBuilder = '/api/notifications/get-notification-bet-builder';
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === XMLHttpRequest.DONE) {
            var result = JSON.parse(xmlHttp.responseText);
            if (result) {
                var icon = "<span class='products-notification'> </span>";

                if (parentMenu.getElementsByClassName("products-notification").length === 0) {
                    parentMenu.innerHTML += icon;
                }

                var subMenu = document.getElementsByClassName("bet-builder-sub");

                if (subMenu.length > 0 && subMenu[0].getElementsByClassName("products-notification").length === 0) {
                    subMenu[0].innerHTML += icon;
                }
            }
            else {
                document.classList.remove("products-notification");
            }

            setTimeout(showIconBetBuilder, fiveMinutesTimeout);
        }
    };

    xmlHttp.open('GET', urlNotificationBetBuilder, true);
    xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xmlHttp.send();
}

setTimeout(showIconNumberOfNotifications, timeout);
setTimeout(showIconBetBuilder, fiveMinutesTimeout);
