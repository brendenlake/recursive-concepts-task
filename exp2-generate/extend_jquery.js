//
// My jQuery extensions
//

// Detect if a jQuery select returns empty
// 
// Used like:
// $("#notAnElement").exists();
$.fn.exists = function () {
    return this.length !== 0;
}

// Used like:
// $(".myclass").get_attr('id');
// returns an array of all of the ids
$.fn.get_attr = function (myattr) {
	var out = new Array();
	this.each( function () {
		out.push($(this).attr(myattr));
	});
	return out;	
}