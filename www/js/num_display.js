var defaultBackgroundColor = "#000";

function attach_action_branch (node) {
    console.log(node);

    node.animate({
        opacity:1
    }, 600, function() {
        $(this).find(">:first-child").animate({
            width:46
        }, 3400, function(){
            $(this).css('height',0);
            //$(this).parent().remove();
        });
    });
}

function attach_action_lock (node) {
    console.log(node);

    bg_flash("red");
    node.animate({
        opacity:1
    }, 600, function() {
        $(this).find(">:first-child").animate({
            width:46
        }, 2400, function(){
            $(this).css('height',0);
            $(this).parent().remove();
        });
    });
}

function attach_action_unlock (node) {
    console.log(node);

    bg_flash("green");

    node.animate({
        opacity:1
    }, 600, function() {
        $(this).find(">:first-child").animate({
            width:46
        }, 900, function(){
            $(this).css('height',0);
            $('#head > div').remove();
            bg_flash("red");
        });
    });
}

function bg_flash(color) {
    
        $('#head').stop().css("background-color", color).animate({backgroundColor: defaultBackgroundColor},300);

}

function empty_head() {
    $('#head div').remove();
}

function unlocked() {
    $('#head div').stop().remove();    
    $('#head').addClass('bganim');
}

function locked() {
    $('#head div').finish();  
    $('#head').removeClass('bganim');
}

function add_nnode(num, type, color) {

    switch(type) {
        case "lock":
            icon_string = '<i class="fa fa-lock"></i>';
            $('#head > div').remove();
            node_string_concat(num, icon_string, color);
            attach_action_lock( $('#head > div').last(), type );
            break;
        case "unlock":
            $('#head div').stop();
            
            icon_string = '<i class="fa fa-unlock"></i>';
            node_string_concat(num, icon_string, color);
            attach_action_unlock( $('#head > div').last(), type );
            break;
        case "branch":
            $('#head div').finish();
            icon_string = '<i class="fa fa-code-fork"></i>';
            node_string_concat(num, icon_string, color);
            attach_action_branch($('#head > div').last(), type );
            break;
        case "action":
            icon_string = '<i class="fa fa-flash"></i>';
            node_string_concat(num, icon_string, color);
            break;
    }
}

function node_string_concat(num, icon_string, color) {
    $('#head').append('<div style="background-color:' + color + ';" class="digit"><div class="digibar"></div>' + num + '<div class="digicon unlock">' + icon_string + '</div></div>');
}


function delete_first_node() {
    $('#head > div').first().stop().animate({
        opacity: 0,
        borderradius: 100,
        width: 0
    }, 600, function() {
        $(this).remove();
    })
}

function prev_nnode_stop() {
    //stop all anim on prev node
    //selector for 2nd to last.anim(stop);

    
}

