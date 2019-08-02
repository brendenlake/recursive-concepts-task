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

// ARRAY extension

// returns only the unique elements of an array
Array.prototype.unique = function() {
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;  
};