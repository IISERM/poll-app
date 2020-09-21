/*
	An important note-
	All the strings that are stored in objects of Poll and Question class are to be encoded. At the level of the data,
	encoded string are to be used all the time, i.e., while creating a new object or changing the value of one of its 
	string data members, the encoded form of the string must be passed.
	While displaying a string, decode it.
	This will ensure uniformity and prevent errors.
*/
class Poll {
	constructor(topic, createdBy, description, type, isAnonymous, active, questions) {
		this.topic = topic;
		this.createdBy = createdBy;
		this.description = description;
		this.type = type;
		this.isAnonymous = isAnonymous;
		this.questions = questions;
		this.active = active;
	}
	getAsHTML() {
		var qs = ""
		var arrayLength = this.questions.length;
		for (var i = 0; i < arrayLength; i++) {
			qs = qs + this.questions[i].getAsHTML(i);
		}
		var html =
			`
			<div class="flex flex-column w-90 w-80-ns">
				<header class="tc w-100 bb mb2 pa2">
					<h1 class="f3 f2-ns lh-title mv1">
						${decodeFromFirebaseKey(this.topic)}
					</h1>
					<h1 class="f5 f4-ns lh-title fw1 mv1">
						${decodeFromFirebaseKey(this.description)}
					</h1>
					${this.isAnonymous ? '<h1 class="f6 f5-ns lh-title fw1 mv1 green">This poll is anonymous</h1>' : '<h1 class="f5 lh-title fw1 mv1 red">This poll is not anonymous</h1>'}
				</header>
				${qs}
			</div>`
		return html
	}
}

pollConverter = {
	toFirestore: function (poll) {
		return {
			topic: poll.topic,
			createdBy: poll.createdBy,
			description: poll.description,
			type: poll.type,
			isAnonymous: poll.isAnonymous,
			active: poll.active,
			questions: poll.questions.map(q => questionConverter.toFirestore(q))
		}
	},
	fromFirestore: function (snapshot, options) {
		const data = snapshot.data(options);
		return new Poll(data.topic, data.createdBy, data.description, data.type, data.isAnonymous,data.active, data.questions.map(q => questionConverter.toObject(q)))
	}
}

class Question {
	constructor(questionStr, type, options) {
		this.questionStr = questionStr;
		this.type = type;
		this.options = options;
	}
	getOptionsAsHTML(question_id) {
		var html = ""
		var arrayLength = this.options.length;
		var inp_type = "radio"
		var radioGroup = question_id+"radioGroup";
		if (this.type == 1) {
			inp_type = "checkbox"
			radioGroup = "type"
		}
		for (var i = 0; i < arrayLength; i++) {
			html = html + ` <tr class="stripe-dark">
								<td class="pa3 w-10 tc v-mid">
									<input type="${inp_type}" id="${question_id + "_" + i}" name="${radioGroup}" value="${i}">
								</td>
								<td class="pa3 w-90 tc v-mid"><label class="f5" for="${question_id + "_" + i}">${decodeFromFirebaseKey(this.options[i])}</label></td>
							</tr>`
		}
		return html
	}
	getAsHTML(qid) {
		var questionid = "question_" + qid

		var input_html = this.type == 0 || this.type == 1 ? '<tbody class="lh-copy"\n>' + this.getOptionsAsHTML(questionid) + '</tbody >' : `<textarea name="ta" id="${questionid}" class="db border-box hover-black w-75 ba b--black-20 pa2 br2 mb2 resize-vertical" rows=4 placeholder="Your response"></textarea>`
		var html = `<div class="flex flex-column w-100 ba b--dark-blue br2 pa1 pv3 pa4-ns mv2 bg-washed-blue items-center justify-center">
					<h1 class="f4 f3-ns fw1 mb2 mb4-ns mt0">
						${decodeFromFirebaseKey(this.questionStr)}
					</h1>
					<table class="f6 w-90 w-75-ns center" cellspacing="0">
						${input_html}
					</table >
				</div > `
		return html
	}
}

questionConverter = {
	toFirestore: function (question) {
		return {
			questionStr: question.questionStr,
			type: question.type,
			options: question.options
		}
	},
	fromFirestore: function (snapshot, options) {
		const data = snapshot.data(options);
		return new Question(data.questionStr, data.type, data.options)
	},
	toObject: function (question) {
		return new Question(question.questionStr, question.type, question.options)
	}
}

function encodeToFirebaseKey(s) {
	s = encodeURIComponent(s);
	return s.replace(/\*/g, "%2A").replace(/\./g, "%2E").replace(/\~/g, "%7E").replace(/\_/g, "%5F").replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\-/g, "%2D");
}

function decodeFromFirebaseKey(s) {
	s = s.replace(/%2A/g, "*").replace(/%2E/g, ".").replace(/%7E/g, "~").replace(/%5F/g, "_").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%2D/g, "-");
	return s = decodeURIComponent(s);
}
