//lookup dot.env to hide firebase configuration before posting to github pages

$(document).ready(function() {
	
	var app = {
		
		//check user inputs and add values to new firebase object, also update display
		addTrain: function(){
			//since input is a form, don't refresh page
			event.preventDefault();

			//create a new child in the "trains" tree in firebase
			var newTrain = firebase.database().ref().child("trains").push();
			var newName=$("#name-input").val();
			var newDestination=$("#destination-input").val();
			var newFrequency=$("#frequency-input").val();
			var newFirst=$("#first-input").val();

			//set the input values to firebase
			newTrain.set({
				"name": newName,
				"destination": newDestination,
				"frequency": newFrequency,
				"firstArrival":newFirst
  			});
		},

		//determine minutes until the next train time
		calcMinutesAway: function(frequency, firstTime){
			var currentDate=moment().format("MM-DD-YYYY");
			var convertedDateTime = moment(new Date(currentDate+" "+firstTime));
 			var minutesDiff= moment().diff(convertedDateTime,"minutes");
 			

 			//case 1: first train has not yet arrived
 			if (minutesDiff<0){
 				//return difference between first train time and current time
 				return(minutesDiff*-1);
 			}
 			else{
	 			//case 2: train is arriving now
	 			if ((minutesDiff % frequency)===0){
					return("Arriving Now");
				}
				//case 3: next train will arrive soon
				else{
					//calculate minutes to next train based on frequency and minutes between first train and current time
					return(frequency -(minutesDiff % frequency));
				}
 			}
		},

		//recalculate next arrival time
		calcNextTrain: function(minutes,firstTime){
			var currentDate=moment().format("MM-DD-YYYY");
			var convertedDateTime = moment(new Date(currentDate+" "+firstTime));

			//case 1 - first train has not arrived
			if(convertedDateTime >= moment()){
				//return first train time formatted
				return(convertedDateTime.format("hh:mm A"));
			}
			//case 2 - first train has arrived
			else{
				//return minutes until train added to current time formatted
				return(moment().add(minutes,"minutes").format("hh:mm A"));
			}
		},

		//this function deletes the train from the firebase database and removes the row from the html
		deleteTrain:function(target){
			var rowTarget = "#"+$(target).attr("data-key");
			$(rowTarget).html("");
			firebase.database().ref("trains").child($(target).attr("data-key")).remove();
		},

		//this function iterates through all trains currently present in the firebase DB and outputs train information
		initialize: function(){
			
			//initialize firebase DB based on config information
			firebase.initializeApp(config);
			
			this.showTime();

			firebase.database().ref("trains").on("child_added",function(snapshot){
		
				//create new row in trains table with tag for each piece of data
				var newRow=$("<tr>");
			 	var name=$("<td>");
			 	var destination=$("<td>");
			 	var frequency=$("<td>");
			 	var firstArrival=$("<td>");
			 	var nextArrival=$("<td>");
			 	var minutesAway=$("<td>");
			 	var buttonContainerUpdate=$("<td>");
			 	var buttonContainerDelete=$("<td>");
			 	var updateButton=$("<button>");
			 	var deleteButton=$("<button>");

			 	deleteButton.addClass("js-delete btn btn-sm btn-danger");
			 	updateButton.addClass("js-update btn btn-sm btn-primary");
			 	
			 	//set key as data attribute and id so that rows can be referenced with update button click and firebase DB will update
			 	newRow.attr("id",snapshot.getKey());
			 	name.attr("id","name"+snapshot.getKey());
			 	destination.attr("id","destination"+snapshot.getKey());
			 	frequency.attr("id","frequency"+snapshot.getKey());
			 	firstArrival.attr("id","firstArrival"+snapshot.getKey());
			 	buttonContainerUpdate.attr("id","update"+snapshot.getKey());
			 	nextArrival.attr("id","nextArrival"+snapshot.getKey());
			 	minutesAway.attr("id","minutesAway"+snapshot.getKey());
			 	deleteButton.attr("data-key",snapshot.getKey());
			 	updateButton.attr("data-key",snapshot.getKey());
				
				
			 	
			 	//set values in html tags
			 	name.text(snapshot.val().name);
			 	destination.text(snapshot.val().destination);
			 	frequency.text(snapshot.val().frequency);
			 	firstArrival.text(snapshot.val().firstArrival)
			 	updateButton.text("Update Train");
			 	deleteButton.text("Remove Train");

			 	//put buttons in containers (UI replaces update with save button)
			 	buttonContainerUpdate.append(updateButton);
			 	buttonContainerDelete.append(deleteButton);

			 	//append each tag to the row for the "trains" child
			 	newRow.append(name);
			 	newRow.append(destination);
			 	newRow.append(frequency);
			 	newRow.append(firstArrival);
			 	newRow.append(nextArrival);
			 	newRow.append(minutesAway);
			 	newRow.append(buttonContainerUpdate);
			 	newRow.append(buttonContainerDelete);
			 	
			 	//output the row to be displayed in the table 
			 	$("#trains").append(newRow);
			});
			//set timer to update arrival times every minute and display result
			app.calcTimes();
			app.refreshTimes();
			
		},

		//this function calculates the initial wait time and next arrival, it also is called whenever user updates train data with new information
		calcTimes:function(){
			firebase.database().ref("trains").on("child_added",function(snapshot){
				var minutesTarget = "#minutesAway"+snapshot.getKey();
				var nextTrainTarget = "#nextArrival"+snapshot.getKey();
				//calculate the initial minutes to wait and next train times 
		 		var minutesToWait = app.calcMinutesAway(snapshot.val().frequency,snapshot.val().firstArrival);
			 	var nextTrainTime = app.calcNextTrain(minutesToWait,snapshot.val().firstArrival);
			 	$(nextTrainTarget).text(nextTrainTime);
				$(minutesTarget).text(minutesToWait);
			});
		},

		//this function is sets an interval timer to automatically update the wait times and next arrival time every minute.  it is called once when initializing the app.
		refreshTimes:function(){
			firebase.database().ref("trains").on("child_added",function(snapshot){
				var minutesTarget = "#minutesAway"+snapshot.getKey();
				var nextTrainTarget = "#nextArrival"+snapshot.getKey();

				var timeInterval=window.setInterval(function(){
					minutesToWait = app.calcMinutesAway(snapshot.val().frequency,snapshot.val().firstArrival);
			 		nextTrainTime = app.calcNextTrain(minutesToWait,snapshot.val().firstArrival);
					$(nextTrainTarget).text(nextTrainTime);
					$(minutesTarget).text(minutesToWait);
				},60000);
			});
		},

		//show current local time and update the displayed clock every minute
		showTime: function(){
			var time = moment().format("hh:mm a");
			$("#current-time").text("Current Train Schedule: "+ time);

			//update the clock every minute
			var timeInterval=window.setInterval(function(){
				time = moment().format("hh:mm a");
				$("#current-time").text("Current Train Schedule: "+ time);
			},60000);
		},

		//this function allows users to edit the details for each train manually after saving
		updateTrain:function(button){
			//clear row and replace it with inputs
			var nameTarget = "#name"+$(button).attr("data-key");
			var destinationTarget = "#destination"+$(button).attr("data-key");
			var frequencyTarget = "#frequency"+$(button).attr("data-key");
			var firstArrivalTarget = "#firstArrival"+$(button).attr("data-key");
			var updateButtonTarget = "#update"+$(button).attr("data-key");
			
			//create a save button which will temporarily replace update button, this will be used to complete update function
			var saveButton=$("<button>");
			saveButton.addClass("js-save btn btn-sm btn-success");

			//temporarily save old data so this can be used for placeholder in input fields
			var oldName=$(nameTarget).text();
			var oldDestination=$(destinationTarget).text();
			var oldFrequency=$(frequencyTarget).text();
			var oldFirstArrival=$(firstArrivalTarget).text();
			$(saveButton).text("Save Changes");
			
			//clear current output and replace with inputs that are editable.
			$(nameTarget).html("<input id='newName' value='"+oldName+"'>");
			$(destinationTarget).html("<input id='newDestination' value='"+oldDestination+"'>");
			$(frequencyTarget).html("<input id='newFrequency' value='"+oldFrequency+"'>");
			$(firstArrivalTarget).html("<input id='newFirstArrival' value='"+oldFirstArrival+"'>");
			$(updateButtonTarget).html("");
			$(updateButtonTarget).append(saveButton);

			//once user changes 
			$(".js-save").on("click",function(){
				
				//set new values in firebase based on user inputs
				firebase.database().ref("trains").child($(button).attr("data-key")).set({
					"name": $("#newName").val(),
					"destination": $("#newDestination").val(),
					"frequency": $("#newFrequency").val(),
					"firstArrival":$("#newFirstArrival").val(),
  				});
				//output new input values
				$(nameTarget).html($("#newName").val());
				$(destinationTarget).html($("#newDestination").val());
				$(frequencyTarget).html($("#newFrequency").val());
				$(firstArrivalTarget).html($("#newFirstArrival").val());
  					
  				//replace save button with update button again
  				var updateButton=$("<button>");
				updateButton.addClass("js-update btn btn-sm btn-primary");
				$(updateButton).text("Update Train");
  				updateButton.attr("data-key", $(button).attr("data-key"));	
  				$(updateButtonTarget).html("");
				$(updateButtonTarget).append(updateButton);
				
				//refresh minutes away and next train times immediately
				app.calcTimes();
			});

		},

	};
	
 	//log all of the trains currently in firebaseDB
	app.initialize();

	$('body').on("click", ".js-update", function () {
    	app.updateTrain(this);
	});
	$('body').on("click", ".js-delete", function () {
		app.deleteTrain(this);
	});
	$("#addTrain").on("click", function(){
		app.addTrain();
	});	
 
});