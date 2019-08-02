/*
 * Requires:
 %     data_setup.js
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
if (mycondition == 0) {
	var stepwise = false;
}
else if (mycondition == 1) {
	var stepwise = true;
}
else {
	throw new Erorr("invalid condition nubmer");
}

/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

/******************
* MAIN EXPERIMENT *
********************/
var FractalExperiment = function() {	

	// task parameters
	// var stepwise ; // show each step of generative process?

	// main variables
	var stimon, // time the image is presented
		stim, // file name of stimulus
		D, // object holding the dynamic display
		rt, // reaction time
		response, // chosen image		
	    stimulus_imsize = 150, // image size	    
	    zoom_size = 250; //-1; // amount larger than image size (-1 to turn off zooming)
	    // zoom_size = 250;

	// css classes
	var css_cell_type = 'bordered_cell';
	var css_normal_border = ''; // normal image option
	var css_heavy_border = 'image_thick_border'; // normal image option

	// Stimuli
	var categories = data.categories;
	var num_trials = categories.length;
	var curr_trial_num = 0;

	// next trial
	var next = function() {
		if (categories.length===0) {
			finish();
		}
		else {
			category = categories.shift();
			trial(category);
		}
	};
	
	//
	var finish = function() {	    
	    // currentview = new Questionnaire();
	    alert('Experiment finished!')
	};

	//
	var add_large_version = function(images) {
		var n = images.length;
		var s;
		for (var i=0; i<n; i++) {
			s = $(images[i]).attr('src') + '';			
			s = s.replace('_small','_large');
			$(images[i]).attr('data-zoom-image',s);
		}
		return images;
	};
	
	// Show all of the images in a category to get a sense
	// of the range of typicality
	var trial = function(category_name) {

		curr_trial_num += 1;
		
		// response variables
		stim = category_name;
		response = '';
		rt = -1;
		
		// display trial information
		$('#curr_trial').text(curr_trial_num);
		$('#tot_trial').text(num_trials);
		$('#selection-confirm').attr('style',"display:none;"); // turn off continue button		
		
		// get the L-system stimulus
		var basefiles = data.bases_by_category_small[category_name];
		var LHS = ['F'];
		var RHS = [ data.RHS_by_category[category_name] ];
		var angle = data.angle_by_category[category_name];
		var niter = data.niter_by_category[category_name];
		
		nbases = basefiles.length;

		var f_done = function () { // when preloading is done
			preloaded_images = preloader.get_images();
			
			// display axiom and base
			// baseimages = preloaded_images[0];
			baseimages = preloaded_images;
			baseimages = tu.protectImages(baseimages);
			baseimages = tu.resizeImage(baseimages,stimulus_imsize);			
			$(baseimages).attr('class',css_heavy_border);
			if (zoom_size > 0) {
				baseimages = add_large_version(baseimages);			
				$(baseimages).elevateZoom({zoomWindowWidth:zoom_size, zoomWindowHeight:zoom_size, zoomWindowPosition:6});				
			}
			if (!stepwise) {
				$("#axiom").html(baseimages[0]);
				$("#base").html(baseimages[baseimages.length-1]);
			}
			else {
				var mybases = $('<table/>').attr('align','center');
				var tRow = $('<tr/>');
				$.each(baseimages, function(i) {					
					$(baseimages[i]).attr('class',css_heavy_border);					
					tCell = $('<td/>');
					if (i == 0) {
						$(tCell).append("<b>Before infection</b><br>");
					}
					else {
						$(tCell).append("<b>Step " + i + "</b><br>");
					}
					tRow.append($(tCell).append(baseimages[i]));
					if (i != nbases-1) {
						tRow.append($('<td/>').attr('style',"font-size:30px;").html("&nbsp;&#8594;&nbsp;"));					
					}					
				});
				$("#bases").html(mybases.append(tRow));
			}

			// make function to record intermediate steps


			// make the dynamic
			D = DynamicDisplay('dynamic_display',angle,niter,LHS,RHS);
			D.make_children();			
			D.tight_window();
			stimon = new Date().getTime();

			// set the callback function
			var f_record = function () {
				// psiTurk.recordTrialData({'phase':"TEST", 'image':stim, 'state':D.get_symbols(), 'rt':new Date().getTime() - stimon})
			};
			D.set_callback(f_record);
			
			// render and then open up the button			
			D.draw();			
			$('#selection-confirm').attr('style',"");
		};

		var f_counter = function (perc) {
			$("#dynamic_display").text("Images loading.... " + perc + " percent complete");	
		};
		var f_error = function () {
			$("#dynamic_display").text("ERROR: loading images");
			throw new Error("ERROR: loading images");	
		};

		// load all of the images		
	 	var preloader = image_preloader(basefiles,f_done,f_error,f_counter);

	};

	// Define actions for continue button during a trial
	var make_continue_button = function() {		
		$("#confirm_button").click(function () {
		    listening = false;
		    response = D.get_symbols();
		    rt = new Date().getTime() - stimon;
			// psiTurk.recordTrialData({'phase':"TEST",'image':stim,'response':response,'rt':rt});
			next();
		});
	};

	// make button to review instructions
	var make_review_button = function() {
		$("#review_button").click(function () {

			// mark that we reviewed the data
			rt = new Date().getTime() - stimon;
			// psiTurk.recordTrialData({'phase':"TEST",'image':stim,'state':'REVIEW','rt':rt});

			// // go to instructions page
			// if (!stepwise) {
			// 	psiTurk.showPage('instructions/instruct.html');	
			// }
			// else {
			// 	psiTurk.showPage('instructions/instruct-stepwise.html');
			// }

			// re-define what the next button does
			$("#next").text('Return');
			$("#next").click(function () {				
				
				// if (!stepwise) {
				// 	psiTurk.showPage('trial.html');	
				// }
				// else {
				// 	psiTurk.showPage('trial_stepwise.html');		
				// }

				// make all of the buttons
				make_continue_button();
				make_review_button();
				make_activate_all_button();
				make_deactivate_all_button();

				// stay on the same trial
				curr_trial_num -= 1;
				trial(stim);
			});

		});
	};

	var make_activate_all_button = function() {
		$("#active_all").click(function () {
		    D.activate_all();
		});
	};

	var make_deactivate_all_button = function() {
		$("#deactive_all").click(function () {
		    D.deactivate_all();
		});
	};

	// // Start the test
	// if (!stepwise) {
	// 	psiTurk.showPage('trial.html');	
	// }
	// else {
	// 	psiTurk.showPage('trial_stepwise.html');		
	// }

	// make all of the buttons
	make_continue_button();
	make_review_button();
	make_activate_all_button();
	make_deactivate_all_button();

	next();
};

// make sure that we have a unique Turker
var error_msg = "<p>Sorry, our records indicate that you have already completed (or attempted to complete) this HIT.</p><p>Because this is a Psychology experiment, you can only complete this HIT once.</p><p>Please release the HIT so someone else can perform the experiment.</p>"
error_msg = error_msg + "<p>If you would like to receive partial compensation or feel you have reached this page in error, please email <a href='mailto:brenden@nyu.edu'>brenden@nyu.edu</a>.</p>"
var check_unique = function() {	
	var workerId = psiTurk.taskdata.get('workerId');
	if (previousWorkers.indexOf(workerId) >= 0) {
		psiTurk.showPage("error.html");		
		$(".alert").html(error_msg);
		throw new Error('Hit already completed');
	}
};

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
   FractalExperiment(); 
   $("#next").click(function () {
	 	$('#container-instructions').attr('style',"display:none;");
	 	$('#container-exp').attr('style',""); 
	});
});