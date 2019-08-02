/*
 * Requires:
 *     utils.js
 */
my_niter = 3; // number of iterations to provide

// name, number of iterations, right-hand-side,  

//// THIS IS HALF THE SET (the simpler ones)
var data_setup = [  ["fractal0",my_niter,"F-F+F+F-F",90],
					["fractal1",my_niter,"F-G+F+G-F",120],
					["fractal3",my_niter,"F-F++F-F",60],
					["fractal4",my_niter,"F-G+G+G-F",90],
					["fractal5",my_niter,"G-F+F+F-G",90],
					["fractal6",my_niter,"F-G+G+G-F",120],
					["fractal7",my_niter,"G-G+F+G-G",90],
					["fractal8",my_niter,"F-G+F+G-F",90],
					["fractal11",my_niter,"F-F+G+F-F",90],
					["fractal16",my_niter,"G-F+G+F-G",90],
					["fractal17",my_niter,"G-F+G+F-G",120],
					["fractal18",my_niter,"G-G+F+G-G",120],
					["fractal20",my_niter,"G-F++F-G",60]];

//// THIS IS THE FULL SET OF FRACTALS
// var data_setup = [  ["fractal0",my_niter,"F-F+F+F-F",90],
// 					["fractal1",my_niter,"F-G+F+G-F",120],
// 					["fractal2",my_niter,"F-G+F+G-F",60],
// 					["fractal3",my_niter,"F-F++F-F",60],
// 					["fractal4",my_niter,"F-G+G+G-F",90],
// 					["fractal5",my_niter,"G-F+F+F-G",90],
// 					["fractal6",my_niter,"F-G+G+G-F",120],
// 					["fractal7",my_niter,"G-G+F+G-G",90],
// 					["fractal8",my_niter,"F-G+F+G-F",90],
// 					["fractal9",my_niter,"G-F+G+F-G",60],
// 					["fractal10",my_niter,"G-F++F-G-F++F-G",60],
// 					["fractal11",my_niter,"F-F+G+F-F",90],
// 					["fractal12",my_niter,"G-G++F-G-F++G-G",60],
// 					["fractal13",my_niter,"G-G+F+G-G",60],
// 					["fractal14",my_niter,"F-F+G+F-F",60],
// 					["fractal15",my_niter,"G-F+F+F-G",60],
// 					["fractal16",my_niter,"G-F+G+F-G",90],
// 					["fractal17",my_niter,"G-F+G+F-G",120],
// 					["fractal18",my_niter,"G-G+F+G-G",120],
// 					["fractal19",my_niter,"F-F+F+F-F",60],
// 					["fractal20",my_niter,"G-F++F-G",60],
// 					["fractal21",my_niter,"F-G+G+G-F",60],
// 					["fractal22",my_niter,"G-F++G-G-G++F-G",60],
// 					["fractal23",my_niter,"F-G++F--F+F+F--F++G-F",60] ];

var imageExists = function(image_url) {
	$.get(image_url)
	    .done(function() {
	    }).fail(function() { 
	       throw new Error("Image " + image_url + " does not exist.");
		})
};

data_setup = tu.shuffle(data_setup);

var data = {};
data.categories = [];
data.bases_by_category_small = {};
data.bases_by_category_large = {};
data.RHS_by_category = {};
data.angle_by_category = {};
data.niter_by_category = {};

//  for each fractal
for (var i=0; i<data_setup.length; i++) {
	
	var mycategory = data_setup[i][0];
	var niter = data_setup[i][1];
	var RHS = data_setup[i][2];
	var angle = data_setup[i][3];
	
	// get all of the stimuli filenames and check if they exist
	var dir = "static/images/stimuli/" + mycategory + '/';

	// process all of the bases
	var bases_small = [];
	var bases_large = [];
	for (var j=0; j<=niter; j++) {
		filename_small = dir + "iter" + j + "_small.png";
		filename_large = dir + "iter" + j + "_large.png";
		imageExists(filename_small);
		imageExists(filename_large);
		bases_small.push(filename_small);
		bases_large.push(filename_large);
	}

	// storage
	data.categories.push(mycategory);
	data.RHS_by_category[mycategory] = RHS;
	data.angle_by_category[mycategory] = angle;
	data.niter_by_category[mycategory] = niter;
	data.bases_by_category_small[mycategory] = bases_small.slice(0);
	data.bases_by_category_large[mycategory] = bases_large.slice(0);
}