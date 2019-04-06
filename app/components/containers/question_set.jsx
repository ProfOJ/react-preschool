import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { fetchQuestions } from 'actions/firebase/actions';
import { 
    incrementScore,
    markAsAnswered,
    nextQuestion,
    reduceTries
} from 'actions/creators';
import Feedback from 'presenters/feedback/feedback.jsx';
import Question from 'presenters/questions/question.jsx';
import Options from 'presenters/questions/options.jsx';
import QuestionLoader from 'presenters/loaders/question_loader.jsx';
import OptionsLoader from 'presenters/loaders/options_loader.jsx';


class QuestionSet extends React.Component {

    componentDidMount(){
       if(!!!this.props.questions){
            this.props.fetchQuestions();
        }
    }
       

    checkAnswer(optionId){
        if(this.isCorrectAnswer(optionId)){
           this.props.incrementScore(this.props.activeQuestion.triesLeft);
           this.props.markAsAnswered();
        }
        else{
            this.props.reduceTries(optionId);
        }
    }
    

    nextQuestion(){
        if(this.props.questions.remaining > 0){
            this.props.nextQuestion();
        }
        else{
            this.props.router.push("/score");
        }
    }


    isCorrectAnswer(optionId){
        return (
            this.props.activeQuestion.answer === 
            this.props.options[optionId].value
        );
    }


    transformOptions(options){
        if(!this.props.activeQuestion.answered) return options
        
        let modifiedOptions = {...this.props.options}
        for(let option in modifiedOptions){
            modifiedOptions[option].attempted = true
        }
        return modifiedOptions;
    }
    

    shouldDisplayFeedback(){
        return ( 
            this.props.activeQuestion.triesLeft == 0 || 
            this.props.activeQuestion.answered 
        );
    }

    renderLoader(){
        return (
            <div className = {`question`}>
                <div className="card"> 
                <QuestionLoader />
                </div> 
                <OptionsLoader />
            </div>
        );   
    }
     
    render() {
        if(!this.props.questions){ 
            return this.renderLoader();
        }

        let [showFeedback, feedbackClass] = this.shouldDisplayFeedback() ?
            [true, " answered"] : [false, ""];

        return (
            <div className = {`question${feedbackClass}`}>
                <div className="card card--flippable">
                    <Question question = { this.props.activeQuestion } />
                    <Feedback
                        active = { showFeedback }
                        score = {this.props.activeQuestion.triesLeft}
                        text = { this.props.questions.current.explanation } 
                        action = { this.nextQuestion.bind(this) } />
                </div>
                <Options 
                    options={this.transformOptions(this.props.options)} 
                    clickHandler={this.checkAnswer.bind(this)} />
            </div>
        );
    }
}

let mapStateToProps = state => {
    if(state.questions){
        return { 
            questions : state.questions,
            activeQuestion : state.questions.current,
            options : state.questions.current.options
        };
    }
    
    return {};
}
    
let mapDispatchToProps = 
    dispatch => ({ 
        fetchQuestions : () => { dispatch(fetchQuestions()) } ,
        incrementScore : increment => { dispatch(incrementScore(increment)) },
        markAsAnswered : () => { dispatch(markAsAnswered()) },
        reduceTries : optionId => { dispatch(reduceTries(optionId)) },
        nextQuestion : () => { dispatch(nextQuestion()) }
    });


export default withRouter(
    connect(mapStateToProps,mapDispatchToProps)(QuestionSet)
);