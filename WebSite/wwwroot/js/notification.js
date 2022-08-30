var Notification = (function ($) {
    /*jshint strict:false */

    return {
        notificationWrap: null,
        unreadNotification: null,
        interval: null,
        timeout: 40000, // 40s
        fiveMinutesTimeout: 300000, //5m
        numberOfItems: 10,
        initialize: function () {
            $("#notification-container").show();
            this.unreadNotification = $("#unreadNotification");
            this.notificationWrap = $("#notificationWrap");

            this.initEvent();
            this.interval = setTimeout(this.getNumberOfNotifications);
            setTimeout(this.get3rdProductsNotification);
        },
        initEvent: function () {
            $("#notification-toggle").click(function (event) {
                event.stopPropagation(); // prevent any parent handlers from being notified of the event
                Notification.toggleNotificationPanel();
            });
            $("#notificationWrap").click(function (event) {
                event.stopPropagation();
            });
            $("#notificationWrap").delegate("#see-all", "click", function (event) {
                event.stopPropagation();
                Notification.getTopMessages(0);
            });
        },

        get3rdProductsNotification: function () {
            $.ajax({
                type: "GET",
                url: "/api/notifications/get-notification-bet-builder",
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (result) {
                    if (result) {
                        var icon = "<span class='products-notification'> </span>";
                        if ($("#3rdProducts-menu > span.products-notification").length === 0) {
                            $("#3rdProducts-menu").append(icon);
                        }
                       
                        if ($(".bet-builder-sub > span.products-notification").length === 0) {
                            $(".bet-builder-sub").append(icon);
                        }
                    } else {
                        $(".products-notification").remove();
                    }
                    // recall
                    setTimeout(Notification.get3rdProductsNotification, Notification.fiveMinutesTimeout);
                }
            });
        },

        getNumberOfNotifications: function () {
            $.ajax({
                type: "GET",
                url: "/api/notifications/get-notification",
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                dataType: "json",
                success: function (data) {
                    if (data > 0) {
                        Notification.unreadNotification.html(data);
                        Notification.unreadNotification.show();
                    }
                    else {
                        Notification.unreadNotification.html('');
                        Notification.unreadNotification.hide();
                    }
                },
                complete: function () {
                    // recall
                    Notification.interval = setTimeout(Notification.getNumberOfNotifications, Notification.timeout);
                }
            });
        },
        getTopMessages: function (top) {
            Notification.notificationWrap.html('');
            $.ajax({
                type: "GET",
                xhrFields: {
                    withCredentials: true
                },
                url: "/apps/notification?top=" + top,
                dataType: "html",
                success: function (data) {
                    if (data && data.length > 0) {
                        Notification.notificationWrap.append(data);
                    }
                },
                error: function () {
                    alert(Languages.SystemError);
                }
            });
        },

        stopInterval: function () {
            clearInterval(Notification.interval);
        },

        toggleNotificationPanel: function () {
            var visible = Notification.notificationWrap.is(":visible");
            if (visible) {
                $(document).unbind("click");
                Notification.getNumberOfNotifications(); // start Interval
                Notification.notificationWrap.toggle();
            }
            else {
                Notification.notificationWrap.toggle();

                Notification.stopInterval(); // stop Interval when user open notification panel
                Notification.getTopMessages(Notification.numberOfItems);

                $(document).one("click", function () {
                    Notification.notificationWrap.toggle();
                    Notification.getNumberOfNotifications(); // start Interval
                });
            }
        }
    };
}(jQuery));

Notification.initialize();