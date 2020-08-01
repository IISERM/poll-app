class Poll {
	constructor(topic, meantFor, type, isAnonymous, questions) {
		this.topic = topic;
		this.meantFor = meantFor;
		this.type = type;
		this.isAnonymous = isAnonymous;
		this.questions = questions;
	}
	getQuestions() {
		var list = []
		var x;
		for (x of this.questions) {
			list[list.length] = x.getData();
		}
		return list;
	}
	getAsHTML() {
		var qs = ""
		var arrayLength = this.questions.length;
		for (var i = 0; i < arrayLength; i++) {
			qs = qs + this.questions[i].getAsHTML(i)
		}
		var html =
			`
			<div class="flex flex-column w-80">
				<header class="tc w-100 bb mb2 pa2">
					<h1 class="f2 lh-title mv1">
						${this.topic}
					</h1>
					<h1 class="f4 lh-title fw1 mv1">
						${this.meantFor}
					</h1>
					${this.isAnonymous ? '<h1 class="f5 lh-title fw1 mv1 green">This poll is anonymous</h1>' : '<h1 class="f5 lh-title fw1 mv1 red">This poll is not anonymous</h1>'}
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
			meantFor: poll.meantFor,
			type: poll.type,
			isAnonymous: poll.isAnonymous,
			questions: poll.getQuestions()
		}
	},
	fromFirestore: function (snapshot, options) {
		const data = snapshot.data(options);
		return new Poll(data.topic, data.meantFor, data.type, data.isAnonymous, data.questions)
	}
}

class Question {
	constructor(questionStr, type, options) {
		this.questionStr = questionStr;
		this.type = type;
		this.options = options;
	}
	getData() {
		return {
			questionStr: this.questionStr,
			type: this.type,
			options: this.options
		};
	}
	getOptionsAsHTML(question_id) {
		var html = ""
		var arrayLength = this.options.length;
		var inp_type = "radio"
		if (this.type == 1) {
			inp_type = "checkbox"
		}
		for (var i = 0; i < arrayLength; i++) {
			html = html + ` <tr class="stripe-dark">
								<td class="pa3 w-10">
									<input type="${inp_type}" id="${question_id + "_" + i}" name="type" value="${i}">
								</td>
								<td class="pa3 w-90"><label for="${question_id + "_" + i}">${this.options[i]}</label></td>
							</tr>`
		}
		return html
	}
	getAsHTML(qid) {
		var questionid = "question_" + qid
		var input_html = this.type == 0 || this.type == 1 ? '<tbody class="lh-copy"\n>' + this.getOptionsAsHTML(questionid) + '</tbody >' : `<textarea name="${questionid}" id="ta" class="db border-box hover-black w-75 ba b--black-20 pa2 br2 mb2 resize-vertical" rows=4 placeholder="Your response"></textarea>`
		var html = `<div class="flex flex-column w-100 ba b--dark-blue br2 pa4 mv2 bg-washed-blue items-center justify-center">
					<h1 class="f3 fw1 mb4 mt0">
						${this.questionStr}
					</h1>
					<table class="f6 w-75 center" cellspacing="0">
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
	}
}
