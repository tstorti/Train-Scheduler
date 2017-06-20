//lookup dot.env to hide firebase configuration before posting to github pages

$(document).ready(function() {
	
	var app = {
		
			// Initialize Firebase
		config: {
			apiKey: "AIzaSyBIjzdGUmVMtoVbBOraBS9tmvCV2SIa9sM",
			authDomain: "train-scheduler-6a0f6.firebaseapp.com",
			databaseURL: "https://train-scheduler-6a0f6.firebaseio.com",
			projectId: "train-scheduler-6a0f6",
			storageBucket: "train-scheduler-6a0f6.appspot.com",
			messagingSenderId: "856767255874"
		},
		
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
			firebase.initializeApp(app.config);
			var trainsDB = firebase.database();
			
			this.showTime();

			trainsDB.ref("trains").on("child_added",function(snapshot){
		
				//create new row in trains table with tag for each piece of data
				var newRow=$("<tr>");
			 	var name=$("<td>");
			 	var destination=$("<td>");
			 	var frequency=$("<td>");
			 	var nextArrival=$("<td>");
			 	var minutesAway=$("<td>");
			 	var deleteButton=$("<button>");

			 	deleteButton.addClass("js-delete btn btn-sm btn-danger");
			 	//set key as data attribute and id so that rows can be referenced with button click and firebase DB will update
			 	newRow.attr("id",snapshot.getKey());
			 	deleteButton.attr("data-key",snapshot.getKey());


			 	//calculate the initial minutes to wait and next train times 
		 		var minutesToWait = app.calcMinutesAway(snapshot.val().frequency,snapshot.val().firstArrival);
			 	var nextTrainTime = app.calcNextTrain(minutesToWait,snapshot.val().firstArrival);

			 	//set values in html tags
			 	name.text(snapshot.val().name);
			 	destination.text(snapshot.val().destination);
			 	frequency.text(snapshot.val().frequency+" minutes");
			 	nextArrival.text(nextTrainTime);
			 	minutesAway.text(minutesToWait);
			 	deleteButton.text("Remove Train");

			 	//append each tag to the row for the "trains" child
			 	newRow.append(name);
			 	newRow.append(destination);
			 	newRow.append(frequency);
			 	newRow.append(nextArrival);
			 	newRow.append(minutesAway);
			 	newRow.append(deleteButton);

			 	//output the row to be displayed in the table 
			 	$("#trains").append(newRow);

				//set timer to update arrival times every minute and display result
				var timeInterval=window.setInterval(function(){
					minutesToWait = app.calcMinutesAway(snapshot.val().frequency,snapshot.val().firstArrival);
			 		nextTrainTime = app.calcNextTrain(minutesToWait,snapshot.val().firstArrival);
					nextArrival.text(nextTrainTime);
					minutesAway.text(minutesToWait);
				},60000);

				//delete listener for each child
				$(".js-delete").on("click", function(){
					app.deleteTrain(this);
				});

			});
			
			//add event listener for new train to firebaseDB 
			$("#addTrain").on("click", function(){
				app.addTrain();
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
	};
	
 	//log all of the trains currently in firebaseDB
	app.initialize();
 
});