/*
 * Requires:
 %     data_setup.js
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object  // these two variables are passed by the psiturk server process
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
	var feedback = false; // feedback on each trial?
	// var stepwise ; // show each step of generative process?

	// main variables
	var stimon, // time the image is presented
		stim, // file name of stimulus
		rt, // reaction time
		response, // chosen image		
	    stimulus_imsize = 150, // image size	    
	    options_imsize = 200, // image size
	    zoom_size = options_imsize+50, // amount larger than image size
	    selected_id, // current selection by the person
	    noptions = -1, // number of options on the screen
	    correct_option = 'stimulus0_'; // the correct option has this in the file name

	// if (stepwise) {
	// 	stimulus_imsize = 150;
	// }

	// css classes
	var css_cell_type = 'bordered_cell';
	var css_normal_border = ''; // normal image option
	var css_heavy_border = 'image_thick_border'; // normal image option
	var css_select_border = 'image_highlight'; // the selected answer
	var css_correction_border = 'image_correct'; // the right answer

	// messages
	var msg_correct = '<font size="5">Correct!</font>';
	var msg_incorrect = '<font size="5">Incorrect! The right answer is shown in </font><font size="5" color="blue">blue</font>.';

	// Stimuli
	var categories = data.categories;
	var num_trials = categories.length;
	var curr_trial_num = 0;

	// // make sure a string, if defined, is "true" or "false"
 //    check_url_param = function (input_string) {
 // 		if (input_string !== undefined) {
 // 			if (input_string !== "true" && input_string !== "false") {
 // 				throw new Error("a URL parameter has an invalid value (should be 'true' or 'false')");
 // 			} 					
 // 		}
 // 	};


	// next image
	var next = function() {
		$('#message').html('');
		if (categories.length===0) {
			finish();
		}
		else {
			category = categories.shift();			
			trial(category);
		}
	};

	//
    var select_image = function (option_id) {    	 
    	 $('#'+selected_id).attr('class',css_normal_border);
    	 selected_id = option_id;
    	 $('#'+selected_id).attr('class',css_select_border);
    	 response = $('#'+selected_id).attr('src');
		 rt = new Date().getTime() - stimon;
    	 if (feedback) {
    	 	$('#feedback-confirm').attr('style',""); // turn on continue button
    	 }
    	 else {
    	 	$('#selection-confirm').attr('style',""); // turn on continue button
    	 }    	     	 
    };

    // make sure all of the options are no longer clickable
    var clear_onclick = function () {
    	if (noptions < 0) {
    		throw new Error("ERROR: number of options is not defined while clearing click functions");
    	}
    	for (var i=0; i<noptions; i++) {
    		$('#option'+i).off("click");
    	}
    };

    display_feedback = function () {
    	clear_onclick();
    	is_correct = response.indexOf(correct_option) > -1; 	
    	if (is_correct) {
    		$('#message').html(msg_correct);
    	}
    	else {
    		$('#message').html(msg_incorrect);
    		for (var i=0; i<noptions; i++) {
    			src = $('#option'+i).attr('src');
    			best_answer = src.indexOf(correct_option) > -1;
    			if (best_answer) {
    				$('#option'+i).attr('class',css_correction_border);
    			}
    		}    		
		}
    	$('#feedback-confirm').attr('style',"display:none;"); // turn off the feedback button
		$('#selection-confirm').attr('style',""); // turn on continue button
    };
	
	//
	var finish = function() {	    
	    alert('Experiment finished!');
	};

	var add_large_version = function(images) {
		var n = images.length;
		var s;
		for (var i=0; i<noptions; i++) {
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
		selected_id = -1;
		response = -1;
		rt = -1;
		
		// display trial information
		$('#curr_trial').text(curr_trial_num);
		$('#tot_trial').text(num_trials);
		$('#selection-confirm').attr('style',"display:none;"); // turn off continue button		
		
		var basefiles = data.bases_by_category_small[category_name];
		var optionfiles = data.stims_by_category_small[category_name];
		
		noptions = optionfiles.length;
		nbases = basefiles.length;

		var f_done = function () { // when preloading is done
			preloaded_images = preloader.get_images();
			
			// display axiom and base
			baseimages = preloaded_images[0];
			baseimages = tu.protectImages(baseimages);
			baseimages = tu.resizeImage(baseimages,stimulus_imsize);			
			$(baseimages).attr('class',css_heavy_border);			
			baseimages = add_large_version(baseimages);			
			$(baseimages).elevateZoom({zoomWindowWidth:zoom_size, zoomWindowHeight:zoom_size, zoomWindowPosition:6});			

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

			// display possible fractal extensions
			optionimages = preloaded_images[1];
			optionimages = tu.protectImages(optionimages);
			optionimages = tu.resizeImage(optionimages,options_imsize);
			optionimages = add_large_version(optionimages);			

			// set zoom position
			numCols = Math.ceil(Math.sqrt(noptions))
			$.each(optionimages, function(i,item) {
				if (i < noptions-numCols) {
					$(item).elevateZoom({zoomWindowWidth:zoom_size, zoomWindowHeight:zoom_size, zoomWindowPosition:6});					
				}
				else {
					$(item).elevateZoom({zoomWindowWidth:zoom_size, zoomWindowHeight:zoom_size, zoomWindowPosition:14});	
				}
			});

			// generate table using jquery
			var mytable = $('<table/>').attr('align','center');
			var tRow = $('<tr\>');
			$.each(optionimages, function(i,item) {
				$(item).attr('id','option'+i).attr('class',css_normal_border).click(function() { select_image('option'+i); } );
				tCell = $('<td\>').attr('id','cell'+i).attr('class',css_cell_type);
				$(tCell).html(item);
				if((i%numCols)==0 && i > 0) { // make row
					$(mytable).append(tRow);
					tRow = $('<tr\>');
				}
				$(tRow).append(tCell);
			});
			$(mytable).append(tRow);
			
			// $.each(optionimages, function(i) {
			//   if(!(i%numCols)) tRow = $('<tr/>');			 
			//   $(optionimages[i]).attr('id','option'+i).attr('class',css_normal_border).click(function() { select_image('option'+i); } );
			//   tCell = $('<td/>').attr('id','cell'+i).attr('class',css_cell_type);
			//   $(tCell).html(optionimages[i]);
			//   mytable.append(tRow.append(tCell));
			// });

			$("#images").html(mytable);
			stimon = new Date().getTime();
		};
		var f_counter = function (perc) {
			$("#images").text("Images loading.... " + perc + " percent complete");	
		};
		var f_error = function () {
			$("#images").text("ERROR: loading images");
			throw new Error("ERROR: loading images");	
		};

		// load all of the images
	 	var preloader = image_preloader([basefiles,optionfiles],f_done,f_error,f_counter);
	};

	// Define actions for continue button during a trial
	var make_continue_button = function() {
		$("#confirm_button").click(function () {
		    listening = false;
			// psiTurk.recordTrialData({'phase':"TEST",'image':stim,'response':response,'rt':rt});
			next();
		});
		if (feedback) {
			$("#feedback_button").click(function () { display_feedback(); }); 
		}
	};

	// // Start the test
	// if (!stepwise) {
	// 	psiTurk.showPage('trial.html');	
	// }
	// else {
	// 	psiTurk.showPage('trial_stepwise.html');		
	// }	
	make_continue_button();	
	next();
	
};

/*******************
 * Run Task
 ******************/
$(window).load( function(){
	$('#preview0').elevateZoom({zoomWindowWidth:200, zoomWindowHeight:200, zoomWindowPosition:6});
    $('#preview1').elevateZoom({zoomWindowWidth:200, zoomWindowHeight:200, zoomWindowPosition:6});
    $('#preview2').elevateZoom({zoomWindowWidth:200, zoomWindowHeight:200, zoomWindowPosition:6});
	FractalExperiment();	
	$("#next").click(function () {
	 	$('#container-instructions').attr('style',"display:none;");
	 	$('#container-exp').attr('style',""); 
	});
});