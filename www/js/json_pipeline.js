var json = {
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

if (localStorage.getItem('the_tree') !== null) {
    console.log(json);
    json = JSON.parse(localStorage.getItem('the_tree'));
    console.log(json);
}

modal_options = {
    "overlayClose": true,
    "opacity": 80,
    "overlayCss": {"background-color":"#000"}
}

var positions = [];

var receive_state = false;
var current_node = null;
var hold_node = null;
var call_timer_handle = null;
var idle_time = 4000;


var unlock_normal = [1,2,3,4];
var unlock_hold   = [4,3,2,1];
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
    console.log("number!");
    //num++;
		
	if(receive_state) {
		num--;
        $('#state').text(receive_state);
        if(call_timer_handle) window.clearTimeout(call_timer_handle);
        if(unlock_timer_handle) window.clearTimeout(unlock_timer_handle);

        call_timer_handle = window.setTimeout(reset, idle_time);
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
    } else {
        //looking for unlock pattern 1-2-3-4 with 500ms interval or less
        console.log("unlock #" + num);
        if(num == unlock_normal[unlock_current_int]) {
			console.log("match! " + num + " : " + unlock_current_int);
            if(unlock_timer_handle) clearTimeout(unlock_timer_handle);

			//start timer
			unlock_timer_handle = setTimeout(function() {
				//time's up!
				unlock_current_int = 0;
			}, unlock_idle_time);
			//increment unlock int
			unlock_current_int++;
			
			if(unlock_current_int >= 4) {
                receive_state = true;
                console.log("ready to receive!");
				//break;
			}
        }
    }
}

function reset() {
	window.clearTimeout(call_timer_handle);
	unlock_current_int = 0;
	current_node = null;
	receive_state = false;
	$('#state').text(receive_state);
}

function branchNotify(color) {
	alert("branch!" + color);
}

function sendIntent(wintent, color) {
	alert(wintent + ":" + color);
}

function submitBranch( event ) {
    event.preventDefault();
    //alert( "Handler for .submit() called." );
    var values = this.elements;
    //console.log(values);
    console.log(values.name.value);
    addBranch(hold_node, values.name.value, values.color.value);
    $.modal.close();
    console.log(json);
    localStorage.setItem('the_tree', JSON.stringify(json));
}

function submitTerminal( event ) {
    event.preventDefault();
    //alert( "Handler for .submit() called." );
    var values = this.elements;
    //console.log(values);
    console.log(values.name.value);
    addTerminal(hold_node, values.name.value, values.wintent.value, values.aintent.value, values.color.value);
    $.modal.close();
    localStorage.setItem('the_tree', JSON.stringify(json));
}

function addBranch(node, name, color) {
    var tempn = {
                    "ntype": "branch",
                    "name": name,
                    "color": color,
                    "branches": {}
                 }
	
    eval(node + "[\"branches\"][\"" + name + "\"] = tempn;");
    
	draw();
}

function addTerminal(node, name, wintent, aintent, color) {

    var tempn = {
        "ntype": "terminal",
        "name": name,
        "wintent": wintent,
        "analogue_intent": aintent,
        "color": color
     }
    
    console.log(node + "[\"" + name + "\"] = tempn;");
    eval(node + "[\"branches\"][\"" + name + "\"] = tempn;");
        
    draw();
}

$('#deleteButton').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        //alert("foo del" + hold_node);
        removeNode(hold_node);
        //draw();
});

function removeNode(node) {
    alert(node);
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
            if(obj[key].ntype == "branch") {
                retValue += "<li pos='"+objname+"[\""+key+"\"]' class='node branch'><ul>" + key + "<div class='action_button add_branch'>+B</div><div class='action_button add_terminal'>+A</div><div class='action_button remove_node'>X</div>";
                retValue += renderJSON(obj[key].branches, objname+"[\""+key+"\"][\"branches\"]");
                retValue += "</ul></li>";
            } else if(obj[key].ntype == "terminal") {
                retValue += "<li pos='"+objname+"[\""+key+"\"]' class='node terminal'>"+key + "<div class='action_button remove_node'>X</div>"+"</li>";
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
	
    $('#json_list').html("<div class='action_button add_branch'>+B</div><div class='action_button add_terminal'>+A</div><ul>"+renderJSON(json, "json")+"</ul>");

	$('.remove_node').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        hold_node = $(this).closest('.node').attr('pos');
		//alert("TEST:" + hold_node);
        $('#delete').modal({
            "overlayClose": true,
            "opacity": 80,
            "overlayCss": {"background-color":"#fff"}
        });
	});

    $('.add_branch').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        hold_node = $(this).closest('.node').attr('pos');
        $('#addBranch').modal(modal_options);
        $( "#branch_form" ).submit(submitBranch);
    });

	$('.add_terminal').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        hold_node = $(this).closest('.node').attr('pos');
        $('#addTerminal').modal(modal_options);
        $( "#terminal_form" ).submit(submitTerminal);
        //alert("TEST:" + node);
        //if( $(this).closest('.node').hasClass('branch') ) {
            //addTerminal( node, "toop", "wintenthere", "aintenthere", "brown" );
		//}
    });
}

$(function (){
    draw();
});

function modal() {
    
}