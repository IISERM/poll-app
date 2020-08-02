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
firebase.analytics();
var db = firebase.firestore();

var poll = new Poll("", "", 0, false, [])

function uploadPoll() {
    var pollDb = db.collection("Polls").doc("Redundant").collection(poll.topic).doc("PollContent").withConverter(pollConverter);
    var pollListDb = db.collection("ListWiseActivePolls").doc("All");
    var batch = db.batch();
    batch.set(pollDb, poll);
    batch.update(pollListDb, {"Active Polls": firebase.firestore.FieldValue.arrayUnion(poll.topic)});
    batch.commit()
        .then(function() {
            displayMessage("The Poll has been added.");
		})
        .catch(function(error) {
            console.log(error.code);
            console.log(error.message);
            displayMessage("There was an error in adding the poll.");
        });
}

function updatePoll() {
    poll.topic = title.value
    poll.description = desc.value
    poll.isAnonymous = anon.checked
    updateUI()
}

function updateUI() {
    document.getElementById('displayArea').innerHTML = poll.getAsHTML()
}

function displayMessage(str) {
    var div = document.getElementById("errorDiv")
    var span = document.getElementById("errorMsg")
    span.innerHTML = msg
    div.classList.remove("hidden")
    setTimeout(() => {
        div.classList.add("hidden")
    }, 2000);
}

function resetoptions() {
    const options = document.getElementById("options")
    while (options.firstChild) {
        options.removeChild(options.lastChild);
    }
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
    var title = document.getElementById('question').value
    var ele = document.getElementsByName('type');
    var type = 0
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].checked) {
            type = ele[i].value
        }
    }
    var options = []
    ele = document.getElementsByName('options');
    for (var i = 0; i < ele.length; i++) {
        options.push(ele[i].value)
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
