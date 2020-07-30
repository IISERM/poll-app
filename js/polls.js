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
var db=firebase.firestore();
var userGlobal;
firebase.auth().onAuthStateChanged(function(user){
    userGLobal = user;
    if(user){
        if(!user.emailVerified){
            displayMessage("You need to veirfy your email before you can cast your votes.");
		}
        loadActivePolls();
	}
});

function loadActivePolls(){
    //The function logic would be different once the lists are there. There will be one document storing the names of active polls for each list. This function will query that document.
    //Write now, there is just one db having the name of all polls.
    var activePolls;
    var select = document.getElementById("pollselect");
    db.collection("VoterLists").doc("All")
        .get()
        .then(function(doc) {
            if (doc.exists){
                activePolls = doc.get("Active Polls");
                for(var i=0;i<activePolls.length;i++){
                    select.options[select.options.length] = new Option(activePolls[i], activePolls[i]);
	            }
			} else{
                displayMessage("An unexpected error has occured. Report to developers");
                console.log("The document doesn't exist");
			}
		})
        .catch(function(error) {
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in fetching the polls. Please try again later.");
		});
}

function loadPollQuestions(){
    var collectionName = document.getElementById("pollselect").value;
    var alreadyVoted = db.collection("Polls").doc("redundant").collection(collectionName).doc("AlreadyVoted").get("alreadyVoted");
    if(alreadyVoted.indexOf(user.uid) != -1){
        db.collection("Polls").doc("redundant").collection(collectionName).doc("PollContent")
            .withConverter(pollConverter)
            .get()
            .then(function(doc){
                if(!doc.exists){
                    displayMessage("An unexpected error has occurred. Report to the developers.")
                    console.log("The document was not found.");
				}else{
                    poll = doc.data();
                    //Do whatever you want with the object.
				}
			})
            .catch(function(error){
                console.log(error.code);
                console.log(error.message);
                displayMessage("There was an error in fetching the contents. Please try againg later.");
            });
	} else{
        //Just say that you have already voted. Preferably in the poll area.
	}
}

function displayMessage(msg){
    //For displaying a message above the poll select dropdown.
}
