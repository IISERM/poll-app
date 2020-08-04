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
var pollGlobal;
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (!user.emailVerified) {
            displayMessage("You need to verify your email before you can cast your votes.");
        }
        loadActivePolls();
    } else {
        window.location = "index.html";
    }
});
function loadActivePolls() {
    //The function logic would be different once the lists are there.
    //Write now, there is just one db having the name of all polls.
    var activePolls;
    var select = document.getElementById("pollselect");
    db.collection("ListWiseActivePolls").doc("All")
        .get()
        .then(function (doc) {
            if (doc.exists) {
                activePolls = doc.get("Active Polls");
                for (var i = 0; i < activePolls.length; i++) {
                    select.options[select.options.length] = new Option(activePolls[i], activePolls[i]);
                }
            } else {
                displayMessage("An unexpected error has occured. Report to developers");
                console.log("The document doesn't exist");
            }
        })
        .catch(function (error) {
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in fetching the polls. Please try again later.");
        });
}

function loadPollQuestions() {
    var collectionName = document.getElementById("pollselect").value;
    if (collectionName != "---Select a Poll---") {
        var alreadyVoted = hasAlreadyVoted();
        if (!alreadyVoted) {
            db.collection("Polls").doc("Redundant").collection(collectionName).doc("PollContent")
                .withConverter(pollConverter)
                .get()
                .then(function (doc) {
                    if (!doc.exists) {
                        displayMessage("An unexpected error has occurred. Report to the developers.");
                        console.log("The document was not found.");
                    } else {
                        pollGlobal = doc.data();
                        document.getElementById('current_poll').innerHTML = pollGlobal.getAsHTML();
                    }
                })
                .catch(function (error) {
                    console.log(error.code);
                    console.log(error.message);
                    displayMessage("There was an error in fetching the contents. Please try againg later.");
                });
        } else {
            document.getElementById('current_poll').innerHTML = "Yay! You've already voted!"
        }
    } else {
	pollGlobal = null;
    }
}

function displayMessage(msg) {
    var div = document.getElementById("errorDiv")
    var span = document.getElementById("errorMsg")
    span.innerHTML = msg
    div.classList.remove("hidden")
    setTimeout(() => {
        div.classList.add("hidden")
    }, 2000);
}

function hasAlreadyVoted() {
    var alreadyVotedList = null;
    db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PeopleWhoHaveAlreadyVoted")
        .get()
        .then(function(doc){
            alreadyVotedList = doc.AlreadyVoted;
            if(alreadyVotedList.indexOf(firebase.auth().currentUser.uid)!=-1) {
                return false;
	        } else {
                return true;
	        }
		})
        .catch(function(error) {
            displayMessage("There was an error. Please retry.");
            console.log(error.code, error.message);
		});
}

function submitPollResponse() {
    var numOfQuestions = pollGlobal.questions.length;
    var i;
    var dbRef = db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PollResults");
    if(pollGlobal.isAnonymous){
        var batch = db.batch();
        var responseMap = {};
        for(i=0; i<numOfQuestions; i++) {
            var qType = pollGlobal.questions[i].type;
            if (qType == 0) {
                var j;
                for(j=0; j<pollGlobal.questions[i].options.length; j++) {
                    if(document.getElementById("question_"+i+"_"+j).checked) {
                        responseMap[pollGlobal.questions[i].questionStr+"."+pollGlobal.questions[i].options[j]] = firebase.firestore.FieldValue.increment(1);
                        break;
				    }
			    }
		    } else if (qType == 1) {
                var j;
                for(j=0; j<pollGlobal.questions[i].options.length; j++) {
                    if(document.getElementById("question_"+i+"_"+j).checked) {
                        responseMap[pollGlobal.questions[i].questionStr+"."+pollGlobal.questions[i].options[j]] = firebase.firestore.FieldValue.increment(1);
				    }
			    }
		    } else if (qType == 2) {
                var resp = document.getElementById("question_"+i).value;
                responseMap[pollGlobal.questions[i].questionStr+".Responses"] = firebase.firestore.FieldValue.arrayUnion(resp);
		    } else {
                console.log("Something is seriously wrong.");
		    }
	    }
        batch.update(dbRef, responseMap);
        batch.update(db.collection("Polls").doc("Redundant").collection(pollGlobal.topic).doc("PeopleWhoHaveAlreadyVoted"), {"AlreadyVoted": firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)});
        batch.commit()
            .then(function() {
                displayMessage("Your response has been recorded.");
                window.location.reload();
		    })
            .catch(function(error) {
                displayMessage("Your response couldn't be recorded");
                console.log(error.code, error.message);
		    });
    }
}

function signOut() {
    firebase.auth().signOut()
        .catch(function(error) {
            displayMessage("Couldn't sign you out.");
            console.log(error.code);
            console.log(error.message);
		});
}

/*
poll = new Poll(
    "Title", "Description", 0, false,
    [new Question(
        "This is a question with mcq.",
        0,
        ["Option1", "Option2", "Option3"]
    ),
    new Question(
        "This is a question with scq.",
        1,
        ["Option1", "Option2", "Option3"]
    ),
    new Question(
        "This is a question with lat.",
        2,
        []
    ),
    ])
document.getElementById('current_poll').innerHTML = poll.getAsHTML()
*/
