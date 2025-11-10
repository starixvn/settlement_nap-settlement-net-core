
var notification = {
    timeout: 40000, // 40s
    fiveMinutesTimeout: 300000, //5m
    numberOfItems: 10,
    oneSecondInterval: 1000, // 1s

}

window.onload = initializeNotification;

function initializeNotification() {
    setTimeout(showIconNumberOfNotifications);
    setInterval(showIconBetBuilder, notification.oneSecondInterval);
    setInterval(showIconOutright, notification.oneSecondInterval);

    var notificationToggle = document.getElementById('notification-toggle');
    notificationToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleNotificationPanel();
    });

    var notificationWrap = document.getElementById('notificationWrap');
    document.addEventListener('click', function handleClickOutsideBox(event) {
        if (!notificationWrap.contains(event.target)) {
            notificationWrap.style.display = 'none';
        }
    });

    var toggleIcon = document.getElementById('toggle-img');
    toggleIcon.addEventListener('click', function () {
        var filterBar = document.getElementsByClassName("filter-bar");
        var toggleUp = document.getElementsByClassName("toggle-up");
        if (toggleUp.length > 0) {
            if (filterBar.length > 0) {
                filterBar[0].style.display = "none";
            }

            toggleUp[0].classList.add("toggle-down");
            toggleUp[0].classList.remove("toggle-up");
        } else {
            var toggleDown = document.getElementsByClassName("toggle-down");
            if (filterBar.length > 0) {
                filterBar[0].style.display = "block";
            }
            
            toggleDown[0].classList.add("toggle-up");
            toggleDown[0].classList.remove("toggle-down");
        }
    });
}

function toggleNotificationPanel() {
    var notificationWrap = document.getElementById('notificationWrap');
    var visible = notificationWrap.style.display;
    if (visible === "none") {
        notificationWrap.style.display = "block";
        getTopMessages(notification.numberOfItems);
    } else {
        notificationWrap.style.display = "none";
    }
}

function getTopMessages(top) {
var urlNotification = "/api/notifications/top-notification?top=" + top;
    fetch(urlNotification)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            var notifications = data.notifications;
            var temp = "<ul class='error-notify'>";

            if (notifications.length > 0) {
                var i = 0;
                notifications.forEach((item) => {
                    var oddEven = i % 2 ? "" : "even" ;
                    i++;
                    temp += "<li class= '" + oddEven +"'>";
                    temp += "    <span class='bold'>" + item.matchCode + "</span>";
                    temp += "(<b>"+item.homeName+"</b> - "+ item.awayName +") - "+ item.message;
                    temp += "<div class='datetime'><span class='icon'></span>" + item.startDate + "</div>";
                    temp += "</li>";

                });

                if (data.numberError > notifications.length) {
                    temp += "<li class='see-all'><a href='javascript:;' id='see-all'>See All</a></li>";
                }

            } else {
                temp += "<li>There is no information available</li>";
            }

            temp += "</ul>";

            var notificationWrap = document.getElementById('notificationWrap');
            notificationWrap.innerHTML = temp;

            if (data.numberError > notifications.length) {
                var seeAll = document.getElementById('see-all');
                seeAll.addEventListener('click', function (event) {
                    event.stopPropagation();
                    getTopMessages(0);
                });
            }
    });
}

function showIconNumberOfNotifications() {
    var unreadNotification = document.getElementById('unreadNotification');
    var urlNotification = '/api/notifications/get-notification';
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === XMLHttpRequest.DONE) {  
            var result = JSON.parse(xmlHttp.responseText);
            if (result > 0) {
                unreadNotification.innerHTML = result;
                unreadNotification.style.display = "block";
            }
            else {
                unreadNotification.innerHTML = "";
                unreadNotification.style.display = "none";
            }
            setTimeout(showIconNumberOfNotifications, notification.timeout);
        }
    };

    xmlHttp.open('GET', urlNotification, true);
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
                var productsNotificationElements = document.getElementsByClassName("products-notification");
                for (var i = productsNotificationElements.length - 1; i >= 0; i--) {
                    productsNotificationElements[i].remove();
                }
            }

        }
    };

    xmlHttp.open('GET', urlNotificationBetBuilder, true);
    xmlHttp.send();
}

function showIconOutright() {
    var parentMenu = document.getElementById('Outright-menu');
    var urlNotificationOutright = '/api/notifications/get-notification-outright';
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === XMLHttpRequest.DONE) {
            var result = JSON.parse(xmlHttp.responseText);
            if (result) {
                var icon = "<span class='flag-notification'> </span>";

                if (parentMenu.getElementsByClassName("flag-notification").length === 0) {
                    parentMenu.innerHTML += icon;
                }
            }
            else {
                var flagNotificationElements = document.getElementsByClassName("flag-notification");
                for (var i = flagNotificationElements.length - 1; i >= 0; i--) {
                    flagNotificationElements[i].remove();
                }
            }
        }
    };

    xmlHttp.open('GET', urlNotificationOutright, true);
    xmlHttp.send();
}