/*
var json = {
	"branches": {
		"test": {
			"ntype": "terminal",
			"wintent": "tasker://testask",
			"analogue_intent": "tasker://testask_a",
			"color": "#FFF"
		},
		"house": {
			"ntype": "branch",
			"color": "#0F0",
			"branches": {
				"light1": {
					"ntype": "terminal",
					"wintent": "tasker://light1toggle",
					"analogue_intent": "tasker://light1_a",
					"color": "#F00"
				},
				"light2": {
					"ntype": "terminal",
					"wintent": "tasker://light2toggle",
					"analogue_intent": "tasker://light2_a",
					"color": "#00F"
				},
				"poop": {
					"ntype": "branch",
					"color": "#0F0",
					"branches": {
						"light3": {
							"ntype": "terminal",
							"wintent": "tasker://light3toggle",
							"analogue_intent": "tasker://light3_a",
							"color": "#F00"
						},
						"light4": {
							"ntype": "terminal",
							"wintent": "tasker://light4toggle",
							"analogue_intent": "tasker://light4_a",
							"color": "#00F"
						}
					}
				}
			}
		}
	}
}
*/

var json = {"branches":{}};

if (localStorage.getItem('the_tree') !== null) {
	console.log(json);
	json = JSON.parse(localStorage.getItem('the_tree'));
	console.log(json);
}

modal_options = {
	"overlayClose": true,
	"position": ['0px'],
	"onOpen": openModal,
	"onClose": closeModal,
	"opacity": 90,
	"containerCss": {
		"top": "0px",
		"padding": "20px",
		"background-color": "#FFF"
	},
	"overlayCss": {
		"background-color": "#000"
	}
}

var positions = [];

var receive_state = false;
var current_node = null;
var hold_node = null;
var call_timer_handle = null;
var idle_time = 4000;


var unlock_normal = [1, 2, 3, 4];
var unlock_hold = [4, 3, 2, 1];
var unlock_current_int = 0;
var unlock_timer_handle = 0;
var unlock_idle_time = 1500;

/*
var json = null;
$.getJSON("../tree.json", function(data) {
	//alert(JSON.stringify(data));
	json = data;
});
*/

/*
document.addEventListener('keydown', function(event) {
	//alert(String.fromCharCode(event.keyCode));
	Call(String.fromCharCode(event.keyCode));
});
*/

function Call(num) {
	//console.log("number!");
	//num++;

	if (receive_state) {
		num--;
		$('#state').text(receive_state);
		if (call_timer_handle) window.clearTimeout(call_timer_handle);
		if (unlock_timer_handle) window.clearTimeout(unlock_timer_handle);

		call_timer_handle = window.setTimeout(reset, idle_time);
		//alert(num);
		if (num < 8 && num > -1) {
			//add branches to the root node here!!
			if (current_node == null) current_node = json["branches"];
			temp_node = current_node[Object.keys(current_node)[num]];

			//alert(JSON.stringify(temp_node));
			if (temp_node === undefined) {
				alert("empty node");
				reset();
				return;
			}

			if (temp_node.ntype == "branch") {
				branchNotify(num, temp_node.color);
				current_node = temp_node.branches;

			} else if (temp_node.ntype == "terminal") {
				sendIntent(num, temp_node.wintent, temp_node.color);
				reset();
			}

		} else {
			//alert("Nan between 1-8!");
		}
	} else {
		//looking for unlock pattern 1-2-3-4 with 500ms interval or less
		console.log("unlock #" + num);
		if (num == unlock_normal[unlock_current_int]) {
			//Found a correct match for unllocking!
			console.log("match! " + num + " : " + unlock_current_int);
			if (num == 1) empty_head();
			add_nnode(num, "unlock", "green");

			if (unlock_timer_handle) clearTimeout(unlock_timer_handle);

			//start timer
			unlock_timer_handle = setTimeout(function () {
				//time's up!
				unlock_current_int = 0;
			}, unlock_idle_time);
			//increment unlock int
			unlock_current_int++;

			if (unlock_current_int >= 4) {
				receive_state = true;
				//Combination correct unlocked and ready to recieve!!
				unlocked();
				call_timer_handle = window.setTimeout(reset, idle_time);
				//console.log("ready to receive!");
				//break;
			}
		} else {
			add_nnode(num, "lock", "red");
		}
	}
}

function reset() {
	locked();
	window.clearTimeout(call_timer_handle);
	unlock_current_int = 0;
	current_node = null;
	receive_state = false;
	$('#state').text(receive_state);
}

function openKB() {
	$('#first').focusin();
}

function branchNotify(num, color) {
	console.log("branch!" + color);
	add_nnode(++num, "branch", color);
}

function getTaskerTasks() {
    window.plugins.contentproviderplugin.query({
        contentUri: "content://net.dinglisch.android.tasker/tasks",
        projection: ["name", "project_name"],
        selection: null,
        selectionArgs: null,
        sortOrder: "date DESC"
    }, function (data) {
        console.log(JSON.stringify(data));
    }, function (err) {
        console.log("error query");
    });
}

function runTaskerTask(name) {
    window.plugins.webintent.sendBroadcast({
            action: 'net.dinglisch.android.tasker.ACTION_TASK',
            extras: {
                task_name: name,
            }
        }, function() {
        }, function() {
    });
}

function sendIntent(num, wintent, color) {
	add_nnode(++num, "action", color);
	console.log(wintent + ":" + color);
	app.CallWebIntent(wintent);
}

function openModal(dialog) {
	dialog.overlay.fadeIn('fast');
	dialog.container.slideDown('fast', function () {
		dialog.data.fadeIn('fast');
	});
}

function closeModal(dialog) {
	dialog.data.fadeOut('fast', function () {
		dialog.container.slideUp('fast', function () {
			$.modal.close(); // must call this!
		});
	});
}

function submitBranch(event) {
	event.preventDefault();
	//alert( "Handler for .submit() called." );
	var values = this.elements;
	//console.log(values);
	//console.log("edit value = " + values.edit.value);
	addBranch(values.edit.value, hold_node, values.name.value, values.color.value);
	$.modal.close();
	console.log(json);
	localStorage.setItem('the_tree', JSON.stringify(json));
}

function submitTerminal(event) {
	event.preventDefault();
	//alert( "Handler for .submit() called." );
	var values = this.elements;
	//console.log(values);
	//console.log("edit value = " + values.edit.value);
	addTerminal(values.edit.value, hold_node, values.name.value, values.wintent.value, values.aintent.value, values.color.value);
	$.modal.close();
	localStorage.setItem('the_tree', JSON.stringify(json));
}

function addBranch(edit, node, name, color) {
	var tempn = {
		"ntype": "branch",
		"name": name,
		"color": color,
		"branches": {}
	}
    
    console.log("edit value = " + edit);

	//eval(node + "[\"branches\"][\"" + name + "\"] = tempn;");
    if(edit === "true") {
		console.log("edit=true " + node + " = tempn;");
		eval(node + " = tempn;");
	} else {
		console.log("edit=false " + node + "[\"branches\"][\"" + name + "\"] = tempn;");
		eval(node + "[\"branches\"][\"" + name + "\"] = tempn;");
	}
    
	draw();
}

function addTerminal(edit, node, name, wintent, aintent, color) {

	var tempn = {
		"ntype": "terminal",
		"name": name,
		"wintent": wintent,
		"analogue_intent": aintent,
		"color": color
	}
	
	if(edit === "true") {
		console.log("edit=true " + node + " = tempn;");
		eval(node + " = tempn;");
	} else {
		console.log("edit=false " + node + "[\"branches\"][\"" + name + "\"] = tempn;");
		eval(node + "[\"branches\"][\"" + name + "\"] = tempn;");
	}

	draw();
}

$('#deleteButton').click(function (e) {
	e.preventDefault();
	e.stopPropagation();
	//alert("foo del" + hold_node);
	removeNode(hold_node);
	//draw();
});

function removeNode(node) {
	console.log(node);
	eval("delete " + node);
	localStorage.setItem('the_tree', JSON.stringify(json));
	draw();
}

function renderJSON(obj, objname) {
	'use strict';
	var keys = [],
		retValue = "";
	for (var key in obj) {
		if (typeof obj[key] === 'object') {
			if (obj[key].ntype == "branch") {
				retValue += "<li pos='" + objname + "[\"" + key + "\"]' class='node branch'><ul><i class='fa fa-code-fork'></i> " + key + "<div class='action_button add_branch'><i class='fa fa-code-fork'></i></div><div class='action_button add_terminal'><i class='fa fa-flash'></i></div><div class='action_button edit_branch'><i class='fa fa-edit'></i></div><div class='action_button remove_node'><i class='fa fa-remove'></i></div>";
				retValue += renderJSON(obj[key].branches, objname + "[\"" + key + "\"][\"branches\"]");
				retValue += "</ul></li>";
			} else if (obj[key].ntype == "terminal") {
				retValue += "<li pos='" + objname + "[\"" + key + "\"]' class='node terminal'><i class='fa fa-flash'></i> " + key + "<div class='action_button edit_terminal'><i class='fa fa-edit'></i></div><div class='action_button remove_node'><i class='fa fa-remove'></i></div>" + "</li>";
			}
		} else {
			//retValue += "<li class='tree'>" + key + " = " + obj[key] + "</li>";
		}

		keys.push(key);
	}
	return retValue;
}


function nodePosition(node) {
	return positions.push(node);
}

function draw() {
	$('#json_list').addClass("node").attr('pos', 'json');

	$('#json_list').html("<div class='action_button add_branch'><i class='fa fa-code-fork'></i></div><div class='action_button add_terminal'><i class='fa fa-flash'></i></div><ul>" + renderJSON(json["branches"], 'json["branches"]') + "</ul>");

	$('.remove_node').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		hold_node = $(this).closest('.node').attr('pos');
		//alert("TEST:" + hold_node);
		$('#delete').modal({
			"overlayClose": true,
			"opacity": 80,
			"overlayCss": {
				"background-color": "#fff"
			}
		});
	});
	
	$('.edit_branch').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		hold_node = $(this).closest('.node').attr('pos');
		console.log(hold_node);

		eval("var nname = " + hold_node + "['name']");
		eval("var ncolor = " + hold_node + "['color']");
		$("input[name='edit']").val("true");
		$("input[name='name']").val(nname);
		$("input[name='color']").val(ncolor);

		$('#addBranch').modal(modal_options);
		$(".close").unbind().click(function () {
			$.modal.close();
		});
		$("#branch_form").submit(submitBranch);
		openKB();
	});

	$('.edit_terminal').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		hold_node = $(this).closest('.node').attr('pos');
		console.log(eval(hold_node));

		eval("var nname = " + hold_node + "['name']");
		eval("var nwintent = " + hold_node + "['wintent']");
		eval("var naintent = " + hold_node + "['analogue_intent']");
		eval("var ncolor = " + hold_node + "['color']");
		$("input[name='edit']").val("true");
		$("input[name='name']").val(nname);
		$("input[name='color']").val(ncolor);
		$("input[name='wintent']").val(nwintent);
		$("input[name='aintent']").val(naintent);
		
		$('#addTerminal').modal(modal_options);
		$(".close").unbind().click(function () {
			$.modal.close();
		});
		$("#terminal_form").submit(submitTerminal);
		openKB();
	});

	$('.add_branch').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		
		//clear forms in case editing filled them in
		$("input[type='text']").val("");
		$("#editbranch").val("false");

		hold_node = $(this).closest('.node').attr('pos');

		$('#addBranch').modal(modal_options);
		
		$(".close").unbind().click(function () {
			$.modal.close();
		});
	
		$("#branch_form").submit(submitBranch);
		openKB();
	});

	$('.add_terminal').click(function (e) {
		e.preventDefault();
		e.stopPropagation();
		
		//clear the forms in case editing filled them in
		$("input[type='text']").val("");
		$("#editaction").val("false");
		
		hold_node = $(this).closest('.node').attr('pos');
		$('#addTerminal').modal(modal_options);
		$(".close").unbind().click(function () {
			$.modal.close();
		});
		$("#terminal_form").submit(submitTerminal);
		openKB();
		//alert("TEST:" + node);
		//if( $(this).closest('.node').hasClass('branch') ) {
		//addTerminal( node, "toop", "wintenthere", "aintenthere", "brown" );
		//}
	});
}

$(function () {
	draw();
});

function modal() {

}