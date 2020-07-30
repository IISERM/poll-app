const firebaseConfig = {
    apiKey: "AIzaSyDfdUKiKHzPs0MN0WUQ9Mm9tMR4njm6U-s",
    authDomain: "poll-app-8877f.firebaseapp.com",
    databaseURL: "https://poll-app-8877f.firebaseio.com",
    projectId: "poll-app-8877f",
    storageBucket: "poll-app-8877f.appspot.com",
    messagingSenderId: "275134846597",
    appId: "1:275134846597:web:0865c7c0a10dc59a1ffbec",
    measurementId: "G-QMNV123VEJ"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

function writePoll(){
    Poll poll=getPoll();
    db.collection("Polls").doc("Redundant").collection(poll.topic).doc("PollContent")
        .withConverter(pollConverter)
        .set(poll)
        .then(function(doc){
            displayMessage("The Poll has been added.");
		})
        .catch(function(error){
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in adding the poll.");
		});
}

function getPoll(){
    var formElems = document.forms("pollForm").elements;
    for(i=0;i<formElems.length;i++){
        
	}
    //return poll;
}

function displayMessage(str){
    //Display the message at an appropriate place
}