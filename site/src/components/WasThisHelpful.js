import React, { useState } from 'react';
import Alert from './Alert';
import MultiLineInput from './MultiLineInput';
import SingleLineInput from './SingleLineInput';
import InteractiveButton from './InteractiveButton';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function WasThisHelpful({pageId}) {
    const {siteConfig} = useDocusaurusContext();
    const controller = new AbortController();
    const [isHelpfulSubmitted, setIsHelpfulSubmitted] = useState(false);
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
    const [questionOpacity, setQuestionOpacity] = useState(1);
    const [feedbackOpacity, setFeedbackOpacity] = useState(1);
    const [feedbackQuality, setFeedbackQuality] = useState('');
    const [feedbackPlaceholder, setFeedbackPlaceholder] = useState('');
    const [userFeedback, setUserFeedback] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [emailNote, setEmailNote] = useState('');
    const [awaitingResponse, setAwaitingResponse] = useState(false);
    const [requestError, setRequestError] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState('');
    const transitionTimeMs = 500;
    const pipedreamUrl = siteConfig.customFields.pipedream;
    const errorMessageString = 'There was an error submitting your feedback, please try again.';

    var questionStyle = {
        opacity: `${questionOpacity}`,
        transition: `${transitionTimeMs}ms`
    };

    var feedbackStyle = {
        opacity: `${feedbackOpacity}`,
        transition: `${transitionTimeMs}ms`
    };

    const helpfulQuestion = () => {
        return(
            <div className="question-container" style={questionStyle}>
                <div className="question-text">Was this page helpful?</div>
                <InteractiveButton type={'secondary'} onClick={() => submitHelpful('good')} text={'Yes'}/>
                <InteractiveButton type={'secondary'} onClick={() => submitHelpful('bad')} text={'No'}/>
            </div>
        )
    };
    
    const feedbackInput = () => {
        return(
            <div className="feedback-container" style={feedbackStyle}>
                <MultiLineInput label={'Feedback'} changeFunction={handleFeedback} placeholder={feedbackPlaceholder} value={userFeedback}/>
                <SingleLineInput label={'Email'} changeFunction={handleEmail} placeholder={'Optional'} value={userEmail} note={emailNote} valid={isEmailValid}/>
                <Alert type={'info'} text={'Your email will only be used to contact you regarding this feedback.'}/>
                <div className="feedback-buttons">
                    <InteractiveButton type={'secondary'} onClick={submitFeedback} isDisabled={awaitingResponse} isLoading={awaitingResponse} text={'Submit'}/>
                    <InteractiveButton type={'destructive'} onClick={cancelFeedback} isDisabled={awaitingResponse} text={'Cancel'}/>
                </div>
                {requestError && <Alert type={'error'} text={requestErrorMessage}/>}
            </div>
        )
    };

    const feedbackSubmitted = () => {
        const thanks = 'Thanks! Your feedback has been submitted.';
        return(
            <div className="feedback-submitted">{userEmail ? `${thanks} We will contact you at ${userEmail}` : thanks}</div>
        )
    };

    const handleFeedback = (e) => {
        setUserFeedback(e.target.value);
    };

    const handleEmail = (e) => {
        setUserEmail(e.target.value);
        setIsEmailValid(true);
        setEmailNote('');
    }

    const submitHelpful = (isHelpful) => {
        setFeedbackQuality(isHelpful);
        setQuestionOpacity(0);
        setFeedbackPlaceholder(isHelpful=='good' ? 'How was this page helpful? (Optional)' : 'What can we improve? (Optional)');
        
        setTimeout(() => {
            setIsHelpfulSubmitted(true);
            setFeedbackOpacity(1);
        }, transitionTimeMs)
    };

    const cancelFeedback = () => {
        setFeedbackOpacity(0);

        setTimeout(() => {
            setIsHelpfulSubmitted(false);
            setQuestionOpacity(1);
            setIsEmailValid(true);
            setEmailNote('');
            setUserFeedback('');
            setUserEmail('');
        }, transitionTimeMs)
    };

    const submitFeedback = async () => {
        setRequestError(false);

        const emailRegex = /^\S+@\S+$/;
        if(userEmail && !emailRegex.test(userEmail)) {
            setIsEmailValid(false);
            setEmailNote('Please enter a valid email address.');
            return;
        }

        const feedbackBody = {
            timestamp: new Date(Date.now()),
            pageId: pageId,
            feedbackType: feedbackQuality,
            feedbackString: userFeedback,
            userEmail: userEmail
        };
        setAwaitingResponse(true);

        try {
            setTimeout(() => controller.abort(), 20000);
            const response = await fetch(pipedreamUrl, {method: 'POST', body: JSON.stringify(feedbackBody), signal: controller.signal});
            setAwaitingResponse(false);
            switch(response.status) {
                case 204:
                    setFeedbackOpacity(0);
                    setTimeout(() => {
                        setIsFeedbackSubmitted(true);
                    }, transitionTimeMs)
                    break;
                case 400:
                    setRequestError(true);
                    setRequestErrorMessage(errorMessageString);
                    break;
                default:
                    setRequestError(true);
                    setRequestErrorMessage(errorMessageString);
                    break;
            }
        } catch(error) {
            setAwaitingResponse(false);
            if(error.name == 'AbortError') {
                setRequestError(true);
                setRequestErrorMessage('Your feedback request has timed out, please wait a few seconds and try again.');
            } else {
                setRequestError(true);
                setRequestErrorMessage(errorMessageString);
            }
        }
        
    };

    return (
        <div className="was-this-helpful">
            <hr/>
            {(!isHelpfulSubmitted && !isFeedbackSubmitted) && helpfulQuestion()}
            {(isHelpfulSubmitted && !isFeedbackSubmitted) && feedbackInput()}
            {(isHelpfulSubmitted && isFeedbackSubmitted) && feedbackSubmitted()}
            <hr/>
        </div>
    );
}
