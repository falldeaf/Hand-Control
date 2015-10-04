/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//required apps:
// Tasker URL Launcher
// market://https://play.google.com/store/apps/details?id=com.aledthomas.taskerurllauncher&hl=en
// Tasker
// market://https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm&hl=en

var timer_handle = 0;

var connected_base = "#8aed8d";
var connected_highlight = "#06be1b";
var disconnected_base = "#e85a6a";
var disconnected_highlight = "#e31a1a";

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        deviceList.addEventListener('touchstart', this.connect, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
		
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
    
    displayConnected: function() {
        $('#connect_action').animate({"background-color": connected_base}, 1000);
        $('#MAC').animate({"background-color": connected_highlight}, 1000);
    },

    displayDisconnected: function() {
        $('#connect_action').animate({"background-color": disconnected_base}, 1000);
        $('#MAC').animate({"background-color": diconnected_highlight}, 1000);
    },

	CallWebIntent: function(url_str) {
		window.plugins.webintent.startActivity({
			action: window.plugins.webintent.ACTION_VIEW,
			url: url_str}, 
			function() {alert('success')}, 
			function() {alert('Failed to open URL via Android Intent')}
		);
	},
	
	onData: function(data) {
		console.log(data);
		var button_value = arrayBufferToInt(data);
		var div = document.getElementById('logdiv');
		div.innerHTML = div.innerHTML + button_value;
	},
	
	Discover: function() {
        console.log("looking for apps");
		rfduino.discover(3, app.onDiscoverDevice, function(){ alert("failed :("); });
	},
	
	onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                'Advertising: ' + device.advertising + '<br/>' +
                device.uuid;

        listItem.setAttribute('uuid', device.uuid);
        listItem.innerHTML = html;
		var devices = document.getElementById('deviceList');
        devices.appendChild(listItem);
        $('#devicesDisplay').slideDown("fast", "swing");
    },
    
    connect: function(e) {
        var uuid = e.target.getAttribute('uuid'),
            onConnect = function() {
                rfduino.onData(app.onData, app.onError);
                //app.showDetailPage();
                $('#devicesDisplay').slideUp("fast", "swing");
                app.displayDisconnected();
                alert("connected!");
                connected = true;
                $('#connect_action').text('disconnect');
                timer_handle = window.setInterval(app.onConnectionTest, 1000);
            };

        rfduino.connect(uuid, onConnect, app.onError);
    },
    
    disconnect: function() {
        rfduino.disconnect(function() {
            app.displayDisconnected();
        }, app.onError);
    },
    
    onError: function(reason) {
        alert(reason); // real apps should use notification.alert
        app.disconnect();
    },
    
    onConnectionTest: function() {
        rfduino.isConnected(function() {
            //connected
        }, function(){
            //not connected
            $('#connect_action').text('disconnect');
            deviceList.addEventListener('touchstart', this.connect, false);
            window.clearInterval(timer_handle);
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