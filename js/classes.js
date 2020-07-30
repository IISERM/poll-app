class Poll{
	constructor(topic, meantFor, type, isAnonymous, questions){
		this.topic = topic;
		this.meantFor = meantFor;
		this.type = type;
		this.isAnonymous = isAnonymous;
		this.questions = questions;
	}
	getQuestions(){
		var list=[]
		var x;
		for(x of this.questions){
			list[list.length] = x.getData();
		}
		return list;
	}
}

pollConverter = {
	toFirestore: function(poll) {
		return {
			topic: poll.topic,
			meantFor: poll.meantFor,
			type: poll.type,
			isAnonymous: poll.isAnonymous,
			questions: poll.getQuestions()
		}
	},
	fromFirestore: function(snapshot, options){
		const data = snapshot.data(options);
		return new Poll(data.topic, data.meantFor, data.type, data.isAnonymous, data.questions)
	}
}

class Question{
	constructor(questionStr, type, options){
		this.questionStr = questionStr;
		this.type = type;
		this.options = options;
	}
	getData(){
		return {
			questionStr: this.questionStr,
			type: this.type,
			options: this.options
		};
	}
}

questionConverter = {
	toFirestore: function(question) {
		return {
			questionStr: question.questionStr,
			type: question.type,
			options: question.options
		}
	},
	fromFirestore: function(snapshot, options) {
		const data = snapshot.data(options);
		return new Question(data.questionStr, data.type, data.options)
	}
}