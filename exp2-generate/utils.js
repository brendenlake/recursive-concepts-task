function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
	return 'AssertException: ' + this.message;
};

function assert(exp, message) {
	if (!exp) {
		throw new AssertException(message);
	}
}

// Mean of booleans (true==1; false==0)
function boolpercent(arr) {
	var count = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i]) { count++; } 
	}
	return 100* count / arr.length;
}

// Custom utilities
var tu = {};

tu.protectImages = function (list_img_DOM) {
	$(list_img_DOM).attr('ondrag',"return false")
				   .attr('ondragstart',"return false")
				   .attr('oncontextmenu',"return false")
				   .attr('galleryimg',"no")
				   .attr('onmousedown',"return false");
	return list_img_DOM;			   
};

// size_img can be a 2 element array
tu.resizeImage  = function (img_DOM,size_img) {
	if (size_img instanceof Array) {
		$(img_DOM).attr('width',size_img[0]).attr('height',size_img[1]);
	}
	else {
		if (!(img_DOM instanceof Array)) { // if we don't have an array
			img_DOM = [img_DOM];
		}
		for (var i=0; i<img_DOM.length; i++) {
			item_img_DOM = img_DOM[i];
			curr_height = item_img_DOM.height;
			curr_width = item_img_DOM.width;
			curr_large = Math.max(curr_height,curr_width);
			ratio = size_img / curr_large;
			$(item_img_DOM).attr('width',Math.round(ratio*curr_width)).attr('height',Math.round(ratio*curr_height));	
		}		
	}
	return img_DOM;
};

// see if all of the quiz answers are correct.
// Quiz must be all radio buttons, with a value="1"
// for correct answers
//
// Input: list_qs is an array of question names
// Output: number of missed questions
tu.checkQuiz = function (list_qs) {
	var n = list_qs.length;
	var list_ans = [];
	for (var i=0; i<n; i++) { // get all answers
		list_ans[i] = tu.getRadioCheckedValue(list_qs[i]);
		tu.clearRadio(list_qs[i]);
	}
	    	
    var corr = 0;
    for (var i=0; i<n; i++) { // record if they are correct
    	if (list_ans[i] !== '' && parseInt(list_ans[i]) === 1) {
    		corr += 1;
    	}
    }
	
	// return number of misses
	var nmiss = n - corr;
	return nmiss;
};

// get value of checked radio button
tu.getRadioCheckedValue = function (radio_name) {
    var oRadio = document.getElementsByName(radio_name);
    for (var i = 0; i < oRadio.length; i++) {
          if (oRadio[i].checked) {
             return oRadio[i].value;
          }
     }
     return '';
};

// clear the "checked" feature on all radio buttons
tu.clearRadio = function (radio_name) {
    var oRadio = document.getElementsByName(radio_name);
    for (var i = 0; i < oRadio.length; i++) {
          oRadio[i].checked = false;
    }
};

// randomize the order of elements in an array
tu.shuffle = function ( myArray ) {
    var i = myArray.length;
    if ( i == 0 ) return false;
    while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = myArray[i];
     var tempj = myArray[j];
     myArray[i] = tempj;
     myArray[j] = tempi;
    }
    return myArray;
};