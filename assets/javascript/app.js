$(document).ready(function() {
	
	var app = {
		
		//this function iterates through all trains currently present in the firebase DB and outputs train information
		initialize: function(){
			this.showTime();
			var query = firebase.database().ref("trains").orderByKey();
			query.once("value")
			.then(function(snapshot) {
				snapshot.forEach(function(childSnapshot) {
		      		var trainDiv = $("<div>");
		      		trainDiv.text("name: " +childSnapshot.val().name +" destination: "+ childSnapshot.val().destination+ " frequency: "+ childSnapshot.val().frequency+ " first arrival " + childSnapshot.val().firstArrival);
		      		$("#content").append(trainDiv);
				});
			})
		},
		
		//check user inputs and add values to new firebase object, also update display
		addTrain: function(){
			
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

  			var trainDiv = $("<div>");
  			trainDiv.text("name: " +newName +" destination: "+ newDestination+ " frequency: "+ newFrequency+ " first arrival " + newFirst);
		    $("#content").append(trainDiv);

		},

		//show current local time and update the displayed clock every minute
		showTime: function(){
			var time = moment().format("dddd, MMMM Do YYYY, h:mm a");
			$("#current-time").text(time);

			//update the clock every minute
			var timeInterval=window.setInterval(function(){
				time = moment().format("dddd, MMMM Do YYYY, h:mm a");
				$("#current-time").text(time);
				updateArrivals();
			},60000);
		},

		//recalculate next arrival
		updateArrivals: function(){

		}
	
	};
	

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyBIjzdGUmVMtoVbBOraBS9tmvCV2SIa9sM",
		authDomain: "train-scheduler-6a0f6.firebaseapp.com",
		databaseURL: "https://train-scheduler-6a0f6.firebaseio.com",
		projectId: "train-scheduler-6a0f6",
		storageBucket: "train-scheduler-6a0f6.appspot.com",
		messagingSenderId: "856767255874"
	};
	firebase.initializeApp(config);
 	var trainsDB = firebase.database();
	

 	//log all of the trains currently in firebaseDB
	app.initialize();
	
	//add new train to firebaseDB based on inputs
	$("#addTrain").on("click", function(){
		app.addTrain();
	});
	
	

 
});