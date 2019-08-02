// Machinery for manipulating L-systems
var LSystem = function (axiom,angle,niter,LHS,RHS) {
	// axiom : starting symbols
	// angle : turn angle (degrees)
	// niter : number of iterations
	// LHS : left-hand-sides of re-write rules (list of size k)
	// RHS : right-hand-sides of re-write rules (list of size k)

	var my = {};
	my.niter = 0;
	my.axiom = '';
	my.angle = 0;
	my.LHS = [];
	my.RHS = [];

	// constructor -- which automatically create a 'G' rule
	(function () {
		my.axiom = axiom;
		my.angle = angle;
		my.niter = niter;
		my.LHS = LHS.slice();
		my.RHS = RHS.slice();

		// add a G rule sized to grow with the size of F
		if ( (my.LHS.length == 1) && (my.LHS[0] == 'F') ) {
			rate = expansion_rate(my.LHS[0],my.RHS[0],angle);
			my.LHS.push('G');
			new_RHS = '';
			for (var i=0; i<rate; i++) {
				new_RHS += 'G';
			}
			my.RHS.push(new_RHS);
		};
			
	})();

	//
	var that = {

		LHS : my.LHS,
		RHS : my.RHS,
		ange : my.ange,

		// unroll the L-system -- producing a string which is it's output
		produce : function () {
			var s = my.axiom;
			var next = '';

			// for each level of recursion
			for (var i=0; i < my.niter; i++) {
				next = '';

				// for each character in the current string
				for (var ci=0; ci < s.length; ci++) {
					var c = s[ci]; // get character
					var idx_in = my.LHS.indexOf(c); // which rule? 				
					if (idx_in >= 0) { // if this is a non-terminal
						next += my.RHS[idx_in];  
					}
					else { // if there is no re-write rule
						next += c;
					}
				}
				s = next;
			}

			return s;
		},

	};

	return that;
};

// computes the rate at which straight line segments are expanding in a recursive process
var expansion_rate = function (LHS,RHS,angle) {
	// LHS : usually just 'F'
    // RHS : re-write rule for 'F'
    T1 = simple_render(LHS,angle);
    bb = boundingbox(T1);
    width1 = bb[2]-bb[0];
    T2 = simple_render(RHS,angle);
    bb = boundingbox(T2);
    width2 = bb[2]-bb[0];
    ratio = width2/width1;
    return Math.round(ratio);
};

// simple render through the L-system
var simple_render = function(action_list,angle) {

	var T = [[0,0]]; // doesn't matter, arbitrary start position
	var pos = T[0];
	var theta = 0;

	var n = action_list.length;
	for (var idx=0; idx<n; idx++) {
		
		var atype = action_list[idx];

		if (is_forward(atype)) {
			var new_pos = [0,0];
			new_pos[0] = pos[0] + stepsize * Math.cos(theta * Math.PI / 180);
			new_pos[1] = pos[1] + stepsize * Math.sin(theta * Math.PI / 180);
		
			// always add the segment			
			T.push(new_pos);
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
};