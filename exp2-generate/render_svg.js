// Parameters for visualization
var stroke_width = 2.5; // stroke width

// Parameters
var stepsize = 1.0; // shouldn't matter what we choose here since we rescale
var gwidth = 700; //400; // global width of the window
var bwidth = gwidth*0.083; // width of the border
var cwidth = gwidth-2*bwidth; // width of the canvas
var newscale = 1.0; // width of the visualization (not necessarily the longest dimension)
var hitboxbonus = 10; // hit boxes should have a line width of this (over the normal stroke width)

var isParentSegment = function (c) { 
	// check class membership
	return (typeof c.draw == 'function');
};

var isBasicSegment = function (c) { 
	// check class membership
	return (typeof c.get_line == 'function');
};

// Display a dynamic fractal for which you can control the expansion of the parts
var DynamicDisplay = function (canvas_id,angle,niter,LHS,RHS) {
	//
	// canvas_id : id of svg canvas which contains dynamic L-system
	// angle : angle of a turn
	// niter : number of iterations to expand
	// LHS : [list] -- left hand side of expansion rules
	// RHS : [list] -- right hand side of expansion rules
 
	var my = {}; // private variables
	my.children = []; // sequence of symbols in the base L-system (unrolled)

	// for L-system
	my.angle;
	my.LHS = [];
	my.RHS = [];
	my.axiom = 'F';
	my.f_callback = function () {}; // (optional) -- run this function every time the state updates (due to user actions)

	my.container; // svg container in the html page
	my.bb_scale; // bounding box used for scaling (first)
	my.bb_center; // bounding box used for centering (second, after scaling)

	// constructor
	(function () {
		
		// define the fractal
		my.angle = angle;
		my.niter = niter;
		my.LHS = LHS;
		my.RHS = RHS;
		
		// use this for SVG display
		my.container = document.getElementById(canvas_id);
		my.container.setAttribute('width',gwidth);
		my.container.setAttribute('height',gwidth);

	})();

	// create list that contains all of the structural elements in the display
	var get_tree = function() {
		var flat = [];
		for (let c1 of my.children ) { // iterate over all parent segments
			
			if ( is_forward( c1.toString() ) ) { // if we have a straight segment

				for (let c2 of c1.get_children() ) { // iterate over all child segments				
					flat.push(c2); // push either string OR a BasicSegment object
				}
			}
			else { // if we have a string, either '+' or '-'
				flat.push(c1);
			}
		}
		return flat;
	};

	// draw an interactive figure based on the sequence of symbols
	// 
	// input
	//   simple : (true/false) if true, compute trajectory T in arbitrary coordinate space, and don't update visual elements with positions
	// 			if false, normalize according to private bounding box information, and assign positions to line segments
	//
	// output
	//	 T : trajectory, although only meaningful if simple=true
	var trace_interactive = function(simple) {

		var pos = [0,0]; // doesn't matter, arbitrary start position
		var T = []
		if (simple) {
			T.push(pos);
		}
		else {
			T.push( normalize(pos) );
		}
		
		var theta = 0;
		var action_list = get_tree();
		var n = action_list.length;
		for (var idx=0; idx<n; idx++) {

			// get the segment type			
			var atype = action_list[idx].toString();

			if (is_forward(atype)) {
				var new_pos = [0,0];
				new_pos[0] = pos[0] + stepsize * Math.cos(theta * Math.PI / 180);
				new_pos[1] = pos[1] + stepsize * Math.sin(theta * Math.PI / 180);
		
				if (simple) {
					T.push(new_pos);
				}
				else {
					action_list[idx].set_position( normalize(pos), normalize(new_pos) );
					T.push( normalize(new_pos) );
				}

				pos = new_pos;
			}
			else if (atype == '+') {
				theta -= angle;
			}
			else if (atype == '-') {
				theta += angle;
			}
			else {
				throw new Error('invalid type');
			}		
		}

		return T;
		// if (simple) {
		// 	return T;
		// }
	};

	// normalize a point [length 2 vector] based on global scale, and place in to canvas coordinates
	var normalize = function(pt) {
		// pt : [2 x 1] coordinate
		pt = pt.slice();
		var T = rescale([pt],my.bb_scale);	
		T = center(T,my.bb_center);
		T = canvascoord(T);
		return T[0];
	};

	// public functions
	var that = {

		// L-system properties
		LHS : my.LHS,
		RHS : my.RHS,
		angle : my.angle,

		// other public properties
		container : my.container,

		activate_all : function () {
		// turn ON all of the edges
			for (let c of my.children ) { 
				if (isParentSegment(c)) {
					c.activate();
				}
			}
			that.draw();
		},

		deactivate_all : function () {
		// turn OFF all of the edges
			for (let c of my.children ) { 
				if (isParentSegment(c)) {
					c.deactivate();
				}
			}
			that.draw();
		},

		make_children : function() {
		// expand the fractal to create list of parent symbols, which can possibly be expanded
		// this should be run first, essentially as a constructor.
			var L = LSystem(my.axiom,my.angle,my.niter,my.LHS,my.RHS);
			var action_list = L.produce();
			for (let a of action_list ) {
				if (is_forward(a)) {
					my.children.push(ParentSegment(that));
				}
				else {
					my.children.push(a);
				}
			}
		},


		tight_window : function () {
		// resize the window so that it tightly fits around the maximum size of the figure
		// careful: it clears all data associated with the current state
			that.activate_all();
			var T = trace_interactive(simple=true);
			my.bb_scale = boundingbox(T);
			T = rescale(T);
			my.bb_center = boundingbox(T);
			T = trace_interactive(simple=false);
			bb = boundingbox(T);
			that.deactivate_all();
			var fractal_height = bb[3]-bb[1];
			var cheight = Math.round(fractal_height + (2*bwidth)); // height of the canvas
			// make the tight window
			my.container.setAttribute('height', cheight);
			my.container.setAttribute('viewBox', "0 " + Math.round(gwidth-cheight) + " " + gwidth + " " + cheight); // [min-x min-y width height]
		},
		
		draw : function() {
		// render the display to the screen 
		// (required for all state changes -- anything but line color)

			// compute path to get global geometry
			T = trace_interactive(simple=true);
			my.bb_scale = boundingbox(T);
			T = rescale(T);
			my.bb_center = boundingbox(T);

			// compute path again using proper scale,
			// assign positions to the line segments,
			// and create interactive elements
			trace_interactive(simple=false);

			// update the display
			$(my.container).html(''); // clear current display
			for (let c of my.children ) {
				if (isParentSegment(c)) {
					c.draw();
				}
			}

			// use callback function
			my.f_callback();
		},

		// get the string representation of the user-created contour 
		// (this is what gets recorded as data)
		get_symbols : function () {
			var out = '';
			for (let c of my.children ) { 
				out += c + '';
			}
			return out;
		},

		// this function gets called every time 'draw' is executed
		set_callback : function (f_callback) {			
			my.f_callback = f_callback;
		},
 
	};
		
	return that;

};

// class that controls a parent-level line segment (that can be expanded or not)
var ParentSegment = function (display) {

	var my = {};
	my.active = false;
	my.rgb = 'black'; // color of segment
	my.children_on = []; // SVG objects
	my.children_off = []; // SVG objects
	my.D; // the larger display of elements

	// public functions
	var that = {

		activate : function() {
			my.active = true;
		},

		deactivate : function() {
			my.active = false;
		},

		switch_state : function () {
		// switch the activation state (if on, turn it off)
		// update the display
			if (my.active) {
				my.active = false;
			}
			else {
				my.active = true;
			}
			my.D.draw();
		},

		get_children : function () {
		// return set of children (which depends on activity)
			if (my.active) {
				return my.children_on;
			}
			else {
				return my.children_off;	
			}		
		},

		on_enter : function () {
		// change color to red when the mouse enters this segment
			for (let c of that.get_children()) {
				if (isBasicSegment(c)) {
					if (my.active) {
						c.change_color(red);	
					}
					else {
						c.change_color(green);	
					}		        	
		        }
			}
		},

		on_leave : function () {
		// change color to default when the mouse enters this segment
			for (let c of that.get_children()) {
				if (isBasicSegment(c)) {
		        	c.change_color('default');
		        }
			}
		},

		draw : function () {
		// change color to default when the mouse enters this segment
			for (let c of that.get_children()) {
				if (isBasicSegment(c)) {
		        	var lines = c.get_line();		        	
		        	my.D.container.appendChild( lines[0] );		        	
		        	my.D.container.appendChild( lines[1] );
		        }
			}
		},
		
		toString : function () {
		// string representation of this segment, depending on activation state	
			if (my.active) {
				return 'F';
			}
			else {
				return 'G';
			}
		},
	
	};

	// constructor (needs to go at end, given dependency on that)
	(function () {
		my.D = display;	
		var niter = 1;

		// populate with potential children (for active state -- F expansion)
		var L = LSystem('F',my.D.angle,niter,my.D.LHS,my.D.RHS);
		var action_list = L.produce();		
		for (let a of action_list) {
			if (is_forward(a)) {
				my.children_on.push(BasicSegment(that));
			}
			else {
				my.children_on.push(a);
			}
		}

		// populate with potential children (for inactive state -- G expansion)
		var L = LSystem('G',my.D.angle,niter,my.D.LHS,my.D.RHS);
		var action_list = L.produce();
	
		for (let a of action_list) {
			if (is_forward(a)) {
				my.children_off.push(BasicSegment(that));
			}
			else {
				my.children_off.push(a);
			}
		}


	})();

	return that;

};

// class that controls a basic-level line segment (the lowest level of line segment, within an expanded or unexpanded piece)
var BasicSegment = function (parent) {

	var my = {};
	my.t1 = []; // beginning of line segment [length 2 vector]
	my.t2 = []; // end of line segment [length 2 vector]
	my.rgb = 'black'; // color of segment
	my.stroke_width = stroke_width; 
	my.line_el; // main SVG object
	my.outline_el; // clear covering SVG object that defines the hit box

	// constructor
	(function () {
		my.parent = parent; // ParentSegment
		// my.rgb = 'black';		
	})();

	// public functions
	var that = {

		// position the segment within the image canvas
		set_position : function (t1,t2) {
			my.t1 = t1;
			my.t2 = t2;
		},

		// change the color of the line segment to input 'rgb'
		change_color : function(rgb) {
			if (rgb == 'default') {
				my.line_el.setAttribute('stroke', my.rgb);
			}
			else {
				my.line_el.setAttribute('stroke', rgb);	
			}
		},

		// create SVG element and attach it to the screen
		get_line : function () {

			// get the line element
			my.line_el = makeSVG('line', {x1: my.t1[0], y1: my.t1[1], x2: my.t2[0], y2: my.t2[1], stroke: my.rgb, 'stroke-width': my.stroke_width} );
			my.outline_el = makeSVG('line', {x1: my.t1[0], y1: my.t1[1], x2: my.t2[0], y2: my.t2[1], stroke: 'white', 'stroke-width': my.stroke_width+hitboxbonus, 'opacity':0.0} );

			// for mouse down events, switch the parent state
			my.outline_el.onmousedown = function() {
	        	my.parent.switch_state();
	        };

	        // for mouse enter events, just call the parent
	        my.outline_el.onmouseenter = function() {
	        	my.parent.on_enter();
	        };
	        my.outline_el.onmouseleave = function() {
	        	my.parent.on_leave();
	        };

	        return [my.line_el, my.outline_el];
		},

		// represent as a generic line segment
		toString : function () {
			return 'G';
		},
	
	};

	return that;

};

var red = 'rgb(200,0,0)';
var green = 'rgb(0,180,0)';
var yellow = 'rgb(189,183,107)';

// // get a random color
// var rand_dark_rgd = function() {
// 	base = 225; // 255 for full color
//     var r = base*Math.random()|0,
//         g = base*Math.random()|0,
//         b = base*Math.random()|0;
//     return 'rgb(' + r + ',' + g + ',' + b + ')';
// };

var center = function(T,bb) {
	// Set the bottom-center of trajectory T (list of points) to be at [0,0]
	if (bb == null) {
		bb = boundingbox(T);	
	}	
	width = bb[2]-bb[0];
	bottom = bb[1];
	bb_center = [(bb[2]+bb[0])/2.0, bottom];
	n = T.length;
	for (var i=0; i<n; i++) {
		T[i][0] -= bb_center[0];
		T[i][1] -= bb_center[1];
	}
	return T;
};

var rescale = function(T,bb) {
	// Set the width of the visualization to be 1 (not necessarily the longest dimension)
	if (bb == null) {
		bb = boundingbox(T);	
	}	
	width = bb[2]-bb[0];
	sz = Math.max(width,1);
	scale = newscale/sz;
	n = T.length;	
	for (var i=0; i<n; i++) {
		T[i][0] *= scale;
		T[i][1] *= scale;
	}
	return T;
};

// Old coordinate space
// 
//  [-0.5,1]   [.5,1]
//
//  [-0.5,0]   [.5,0]

// New canvas coordinate space:
//  [0,0]  [X,0]
//  ...
//  [0,X]  [X,X]
var canvascoord = function(T) {
	var dx = newscale/2.0;
	var sx = cwidth/newscale;
	var dy = -newscale;
	var sy = -cwidth/newscale;
	var n = T.length;
	for (var i=0; i<n; i++) {
		T[i][0] = (T[i][0]+dx)*sx + bwidth;
		T[i][1] = (T[i][1]+dy)*sy + bwidth;
	}
	return T;
};

var boundingbox = function(T) {
	// compute bounding box (4 element vector)
	var n = T.length;
	var tx = [];
	var ty = [];
	for (var i=0; i<n; i++) {
		tx.push(T[i][0]);
		ty.push(T[i][1]);
	}
	return [Math.min.apply(Math, tx), Math.min.apply(Math, ty), Math.max.apply(Math, tx), Math.max.apply(Math, ty)];
};

var is_forward = function(atype) {
	// does symbol indicate a forward step
	return (atype == 'F') || (atype == 'G');
};

// make an SVG element
var makeSVG = function(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
};

// print statement
var debug = function(s) {
	$('#pre').append(s);
	$('#pre').append("<br>");
};

// $(document).ready(function() {

// 	// define the L-system
// 	input_niter = 2;
//     input_angle = 120;
//     input_axiom = 'F';
// 	input_LHS = ['F'];
//     // input_RHS = ['G-G+F+G-G'];
//     input_RHS = ['F-F+F+F-F'];

//     //
// 	D = DynamicDisplay('c1',input_angle,input_niter,input_LHS,input_RHS);
// 	D.make_children();
// 	D.draw();
// });