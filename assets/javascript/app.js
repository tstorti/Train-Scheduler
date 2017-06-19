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
			event.preventDefault();

			var newTrain = firebase.database().ref().child("trains").push();
			var newName=$("#name-input").val();
			var newDestination=$("#destination-input").val();
			var newFrequency=$("#frequency-input").val();
			var newFirst=$("#first-input").val();

			newTrain.set({
				"name": newName,
				"destination": newDestination,
				"frequency": newFrequency,
				"firstArrival":newFirst
  			});

		},

		calcMinutesAway: function(frequency, firstTime){
			var currentDate=moment().format("MM-DD-YYYY");
			var convertedDate = moment(new Date(currentDate+" "+firstTime));
 			var minutesDiff= moment().diff(convertedDate,"minutes");

 			//if first train has not yet arrived
 			if (minutesDiff<0){
 				//return difference between first train time and current time
 				return(minutesDiff*-1);
 			}
 			//if 1st train has already arrived
 			else{
	 			if ((minutesDiff % frequency)===0){
					return("Arriving Now");
					}
				else{
					return(minutesDiff % frequency);
				}
 			}
		},

		//recalculate next arrival time
		calcNextTrain: function(minutes,firstTime){
			var currentDate=moment().format("MM-DD-YYYY");
			var convertedDate = moment(new Date(currentDate+" "+firstTime));

			if(convertedDate>moment()){
				return(convertedDate.format("hh:mm A"));
			}
			else{
				return(moment().add(minutes,"minutes").format("hh:mm A"));
			}
		},

		//this function iterates through all trains currently present in the firebase DB and outputs train information
		initialize: function(){
			firebase.initializeApp(app.config);
			var trainsDB = firebase.database();
			
			this.showTime();

			trainsDB.ref("trains").on("child_added",function(snapshot){
		
				var newRow=$("<tr>");
			 	var name=$("<td>");
			 	var destination=$("<td>");
			 	var frequency=$("<td>");
			 	var nextArrival=$("<td>");
			 	var minutesAway=$("<td>");

		 		var minutesToWait = app.calcMinutesAway(snapshot.val().frequency,snapshot.val().firstArrival);
			 	var nextTrainTime = app.calcNextTrain(minutesToWait,snapshot.val().firstArrival);

			 	name.text(snapshot.val().name);
			 	destination.text(snapshot.val().destination);
			 	frequency.text(snapshot.val().frequency+" minutes");
			 	nextArrival.text(nextTrainTime);
			 	minutesAway.text(minutesToWait);

			 	newRow.append(name);
			 	newRow.append(destination);
			 	newRow.append(frequency);
			 	newRow.append(nextArrival);
			 	newRow.append(minutesAway);

		 		$("#trains").append(newRow);
	
			});
			
			//add new train to firebaseDB 
			$("#addTrain").on("click", function(){
				app.addTrain();
			});
		},

		//show current local time and update the displayed clock every minute
		showTime: function(){
			var time = moment().format("dddd, MMMM Do YYYY, h:mm a");
			$("#current-time").text(time);

			//update the clock every minute
			var timeInterval=window.setInterval(function(){
				time = moment().format("dddd, MMMM Do YYYY, h:mm a");
				$("#current-time").text(time);
			},60000);
		},	
	};
	
 	//log all of the trains currently in firebaseDB
	app.initialize();
	
	
	
	

 
});