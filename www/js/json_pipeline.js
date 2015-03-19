var receive_state = false;
var current_node = null;
var json = null;
var timer_handle = null;
var idle_time = 4000;

$.getJSON("tree.json", function(data) {
	//alert(JSON.stringify(data));
	json = data;
});

document.addEventListener('keydown', function(event) {
	//alert(String.fromCharCode(event.keyCode));
	passNumber(String.fromCharCode(event.keyCode));
});

function passNumber(num) {
		
	receive_state = true;
	$('#state').text(receive_state);
	if(timer_handle) window.clearInterval(timer_handle);
	
	timer_handle = window.setInterval(reset, idle_time);
	//alert(num);
	if(num < 8 && num > -1) {
		if(current_node == null) current_node = json;
		temp_node = current_node[Object.keys(current_node)[num]];
		
		//alert(JSON.stringify(temp_node));
		if(temp_node === undefined) {
			alert("empty node");
			reset();
			return;
		}
		
		if(temp_node.ntype == "branch") {
			branchNotify(temp_node.color);
			current_node = temp_node.branches;
			
		} else if(temp_node.ntype == "terminal") {
			sendIntent(temp_node.wintent, temp_node.color);
			reset();
		}
		
	} else {
		//alert("Nan between 1-8!");
	}
	
}

function reset() {
	window.clearInterval(timer_handle);
	current_node = null;
	receive_state = false;
	$('#state').text(receive_state);
}

function branchNotify(color) {
	alert("branch!" + color);
}

function sendIntent(wintent, color) {
	alert(wintent + ":" color);
}