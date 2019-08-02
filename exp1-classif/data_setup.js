/*
 * Requires:
 *     utils.js
 */

				// format: name, folder, number of items

noptions = 6;
// var data_setup = [["koch_snowflake",2],
// 				  ["triangles",2],
// 				  ["stacked_triangles",2],
// 				  ["stacked_squares",3],
// 				  ["stacked_diamond_trapz",3],
// 				  ["diamond_tree",3]];
my_niter = 2;
var data_setup = [["fractal0",my_niter],
				  ["fractal1",my_niter],
				  ["fractal2",my_niter],
				  ["fractal3",my_niter],
				  ["fractal4",my_niter],
				  ["fractal5",my_niter],
				  ["fractal6",my_niter],
				  ["fractal7",my_niter],
				  ["fractal8",my_niter],
				  ["fractal9",my_niter],
				  ["fractal10",my_niter],
				  ["fractal11",my_niter],
				  ["fractal12",my_niter],
				  ["fractal13",my_niter],
				  ["fractal14",my_niter],
				  ["fractal15",my_niter],
				  ["fractal16",my_niter],
				  ["fractal17",my_niter],
				  ["fractal18",my_niter],
				  ["fractal19",my_niter],
				  ["fractal20",my_niter],
				  ["fractal21",my_niter],
				  ["fractal22",my_niter],
				  ["fractal23",my_niter]];

var imageExists = function(image_url) {
	$.get(image_url)
	    .done(function() {
	    }).fail(function() { 
	       // throw new Error("Image " + image_url + " does not exist.");
		})
};

data_setup = tu.shuffle(data_setup);

var data = {};
data.categories = [];
data.stims_by_category_small = {};
data.stims_by_category_large = {};
data.bases_by_category_small = {};
data.bases_by_category_large = {};

//  for each fractal
for (var i=0; i<data_setup.length; i++) {
	
	var mycategory = data_setup[i][0];
	var niter = data_setup[i][1];	
	
	data.stims_by_category_small[mycategory] = [];
	data.stims_by_category_large[mycategory] = [];
	
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

	// process all of the stimuli
	var mystimuli_small = [];
	var mystimuli_large = [];
	var perm = [];
	for (var j=0; j<noptions; j++) {
		perm.push(j);
	}
	perm = tu.shuffle(perm);
	for (var k=0; k<noptions; k++) {
		j = perm[k];
		filename_small = dir + "stimulus" + j + "_niter" + (niter+1) + "_small.png";
		filename_large = dir + "stimulus" + j + "_niter" + (niter+1) + "_large.png";
		imageExists(filename_small);
		imageExists(filename_large);
		mystimuli_small.push(filename_small);
		mystimuli_large.push(filename_large);
	}

	// storage
	data.categories.push(mycategory);
	data.stims_by_category_small[mycategory] = mystimuli_small.slice(0);
	data.stims_by_category_large[mycategory] = mystimuli_large.slice(0);
	data.bases_by_category_small[mycategory] = bases_small.slice(0);
	data.bases_by_category_large[mycategory] = bases_large.slice(0);
}