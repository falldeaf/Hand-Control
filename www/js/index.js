//required apps:
// Tasker URL Launcher
// market://https://play.google.com/store/apps/details?id=com.aledthomas.taskerurllauncher&hl=en
// Tasker
// market://https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm&hl=en

var timer_handle = 0;

var current_MAC = "";
var blank_MAC = "--:--:--:--:--:--";

var connected_base = "#8aed8d";
var connected_highlight = "#06be1b";
var disconnected_base = "#e85a6a";
var disconnected_highlight = "#e31a1a";

//ping pong checker handle
var pingpong = null;

var disconnected_buttons = "<button id='connect_action'onclick='app.Discover();'>Discover</button><button id='connect_action' onclick='app.reconnect();'>reconnect</button>";
var connected_buttons = "<button id='connect_action' onclick='app.disconnect();'>disconnect</button>";

var app = {
	// Application Constructor
	initialize: function () {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function () {
		document.addEventListener('deviceready', this.onDeviceReady, false);
		deviceList.addEventListener('touchstart', this.connect, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function () {

        window.plugin.backgroundMode.setDefaults({
            title:  "Hand Thingy",
            ticker: "tick",
            text:   "connected"
        });

				window.plugin.backgroundMode.enable();

		//app.receivedEvent('deviceready');
        if(localStorage.getItem('MAC')) {
            current_MAC = localStorage.getItem('MAC');
            //$('#MAC').html(current_MAC);
            app.lockConnect();
        }

	},
	// Update DOM on a Received Event
	/*
	receivedEvent: function(id) {
	    var parentElement = document.getElementById(id);
	    var listeningElement = parentElement.querySelector('.listening');
	    var receivedElement = parentElement.querySelector('.received');

	    listeningElement.setAttribute('style', 'display:none;');
	    receivedElement.setAttribute('style', 'display:block;');

	    console.log('Received Event: ' + id);
	},*/

	displayConnected: function () {
		$('#connection_status').animate({
			"background-color": connected_base
		}, 1000);
		$('#MAC').html(current_MAC);
		$('#MAC').animate({
			"background-color": connected_highlight
		}, 1000);

		//add disconnect button, remove discover and connect
        $('#connection_status button').remove();
        $('#connection_status').prepend(connected_buttons);
	},

	displayDisconnected: function () {
		$('#connection_status').animate({
			"background-color": disconnected_base
		}, 1000);
		$('#MAC').animate({
			"background-color": disconnected_highlight
		}, 1000);

		//add discover and connect button, remove disconnect
        $('#connection_status button').remove();
        $('#connection_status').prepend(disconnected_buttons);
	},

	CallWebIntent: function (url_str) {
		window.plugins.webintent.startActivity({
				action: window.plugins.webintent.ACTION_VIEW,
				url: url_str
			},
			function () {
				//alert('success')
			},
			function () {
				alert('Failed to open URL via Android Intent')
			}
		);
	},

	onData: function (data) {
		console.log(data);
		var button_value = arrayBufferToInt(data);
		//var div = document.getElementById('logdiv');
		//div.innerHTML = div.innerHTML + button_value;
		if(button_value == 112) {
            console.log("I see a pong!");
						clearInterval(pingpong);
    } else {
            Call(button_value);
    }
	},

	Discover: function () {
		console.log("looking for apps");
		rfduino.discover(3, app.onDiscoverDevice, function () {
			alert("failed :(");
		});
	},

	onDiscoverDevice: function (device) {
		$('#devicelist').html('');
		var listItem = document.createElement('li'),
			html = '<b>' + device.name + '</b><br/>' +
			'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
			'Advertising: ' + device.advertising + '<br/>' +
			device.uuid;

		//current_MAC = device.uuid;

		listItem.setAttribute('uuid', device.uuid);
		listItem.innerHTML = html;
		var devices = document.getElementById('deviceList');
		devices.appendChild(listItem);
		$('#devicesDisplay').slideDown("fast", "swing");
	},

	connect: function (e) {
		var uuid = e.target.getAttribute('uuid'),
			onConnect = function () {
				rfduino.onData(app.onData, app.onError);
				//app.showDetailPage();
				$('#devicesDisplay').slideUp("fast", "swing");

                current_MAC = uuid;
                localStorage.setItem('mac', uuid);
								app.displayConnected();
                app.lockConnect();

                //timer_handle = window.setInterval(app.onConnectionTest, 1000);
			};

		rfduino.connect(uuid, onConnect, app.onError);
	},

	reconnect: function () {
		rfduino.connect(current_MAC, function() {
            rfduino.onData(app.onData, app.onError);
            //app.showDetailPage();
            app.lockConnect();
						app.displayConnected();
        }, app.onError);
	},

	disconnect: function () {
		rfduino.disconnect(function () {
            app.unlockConnect();
			app.displayDisconnected();
		}, app.onError);
	},

	onError: function (reason) {
		console.log(reason); // real apps should use notification.alert
		bg_flash("red");
        app.disconnect();
	},

    lockConnect: function() {

        timer_handle = window.setInterval(app.onConnectionTest, 60000);
        $('#lockconn').html('<i class="fa fa-lock"></i>');
    },

    unlockConnect: function() {
        window.clearInterval(timer_handle);
        $('#lockconn').html('<i class="fa fa-unlock"></i>');
    },

	onConnectionTest: function () {
		console.log("connection test time.\n")
		rfduino.isConnected(function () {
			//connected
			rfduino.write('p', function(){}, function(){});
			pingpong = setInterval(function() {
				app.disconnect();
			});
    }, function () {
			//not connected
			app.reconnect();

		});
	}

};

var arrayBufferToInt = function (ab) {
	var a = new Uint8Array(ab);
	return a[0];
};

function testSlide() {
	$('#devicesDisplay').slideDown("fast", "swing");
}
