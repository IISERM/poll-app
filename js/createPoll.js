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
const title = document.getElementById("title")
const desc = document.getElementById("desc")
const anon = document.getElementById("anon")

firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (!user.emailVerified) {
            window.location = "account-verify.html";
        }
    } else {
        window.location = "index.html";
    }
});
var db = firebase.firestore();

var poll = new Poll("", "", 0, false, [])

function uploadPoll() {
    var pollDb = db.collection("Polls").doc("Redundant").collection(poll.topic).doc("PollContent").withConverter(pollConverter);
    var pollListDb = db.collection("ListWiseActivePolls").doc("All");
    var batch = db.batch();
    batch.set(pollDb, poll);
    batch.update(pollListDb, { "ActivePolls": firebase.firestore.FieldValue.arrayUnion(poll.topic) });
    if (poll.isAnonymous) {
        var pollObj = {};
        var i;
        for (i = 0; i < poll.questions.length; i++) {
            var qtype = poll.questions[i].type;
            var optionsObj = {};
            if (qtype == 0 || qtype == 1) {
                var j;
                for (j = 0; j < poll.questions[i].options.length; j++) {
                    optionsObj[poll.questions[i].options[j]] = 0;
                }
                pollObj[poll.questions[i].questionStr] = optionsObj;
            } else {
                pollObj[poll.questions[i].questionStr] = { "Responses": [] };
            }
        }
        batch.set(db.collection("Polls").doc("Redundant").collection(poll.topic).doc("PollResults"), pollObj)
    }
    batch.set(db.collection("Polls").doc("Redundant").collection(poll.topic).doc("PeopleWhoHaveAlreadyVoted"), { "AlreadyVoted": [] });
    batch.commit()
        .then(function () {
            displayMessageAndLeave("The Poll has been added.");
        })
        .catch(function (error) {
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in adding the poll.");
        });
}

function updatePoll() {
    poll.topic = encodeToFirebaseKey(title.value)
    poll.description = encodeToFirebaseKey(desc.value)
    poll.isAnonymous = encodeToFirebaseKey(anon.checked)
    updateUI()
}

function updateUI() {
    document.getElementById('displayArea').innerHTML = poll.getAsHTML()
}

function resetoptions() {
    const options = document.getElementById("options")
    while (options.firstChild) {
        options.removeChild(options.lastChild);
    }
}
function removeLastQuestion() {
    poll.questions.pop()
    updateUI()
}
function addoption() {
    new_input = document.createElement("input")
    new_input.className = 'mv1 pa2 input-reset ba bg-transparent'
    new_input.type = 'text'
    new_input.name = 'options'
    new_input.placeholder = 'Option'
    new_input.required = true
    document.getElementById("options").appendChild(new_input)
}
function opendialog() {
    dia = document.getElementById('addQDialog')
    dia.classList.remove('dn')
    dia.classList.add('flex')
}
function closedialog() {
    dia = document.getElementById('addQDialog')
    dia.classList.remove('flex')
    dia.classList.add('dn')
}
function addQuestion() {
    var title = encodeToFirebaseKey(document.getElementById('question').value)
    var ele = document.getElementsByName('type');
    var type = 0
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            type = parseInt(ele[i].value)
        }
    }
    var options = []
    ele = document.getElementsByName('options');
    for (var i = 0; i < ele.length; i++) {
        options.push(encodeToFirebaseKey(ele[i].value))
    }
    console.log(options);
    poll.questions.push(new Question(
        title,
        type,
        options
    ))
    document.getElementById("Qform").reset()
    closedialog()
    updateUI()
    return false
}

function displayMessage(str) {
    var div = document.getElementById("errorDiv")
    var span = document.getElementById("errorMsg")
    span.innerHTML = str
    div.classList.remove("hidden")
    setTimeout(() => {
        div.classList.add("hidden")
    }, 5000);
}

function displayMessageAndLeave(str) {
    var div = document.getElementById("errorDiv")
    var span = document.getElementById("errorMsg")
    span.innerHTML = str
    div.classList.remove("hidden")
    setTimeout(() => {
        div.classList.add("hidden");
        window.location = "polls.html";
    }, 1000);
}
