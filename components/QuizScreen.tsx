"use client";

import React, { useState } from 'react';
import { QUIZ_DATA } from '../data/quizData';
import ResultsScreen from '../components/ResultsScreen';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { logEvent } from "@/lib/logEvent";

const QuizScreen = () => {
  const [questions, setQuestions] = useState(QUIZ_DATA);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (option: string | boolean) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(option);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === currentQuestion.answer;
      if (isCorrect) {
        setScore(score + 1);
      }
      setIsAnswerSubmitted(true);
      logEvent("quiz_answer", { data: { questionId: currentQuestion.id, selected: selectedAnswer, correct: isCorrect } })
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizComplete(true);
      logEvent("quiz_complete", { data: { total: questions.length, score: score + (isAnswerSubmitted && selectedAnswer === currentQuestion.answer ? 1 : 0) } })
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
  };

  if (quizComplete) {
    return <ResultsScreen score={score} total={questions.length} onRestart={handleRestart} />;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">吴文化知识测验</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <img 
              src={currentQuestion.image} 
              alt="文物图片" 
              className="w-full h-64 object-cover rounded-md mb-4" 
            />
            <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.type === 'choice' 
                ? currentQuestion.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full text-left justify-start ${ 
                        isAnswerSubmitted 
                          ? option === currentQuestion.answer 
                            ? 'bg-green-500 text-white'
                            : option === selectedAnswer 
                              ? 'bg-red-500 text-white'
                              : ''
                          : selectedAnswer === option 
                            ? 'bg-cyan-700 text-white'
                            : ''
                      }`}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswerSubmitted}
                    >
                      {option}
                    </Button>
                  ))
                : [
                    <Button
                      key="true"
                      variant="outline"
                      className={`w-full text-left justify-start ${
                        isAnswerSubmitted
                          ? true === currentQuestion.answer
                            ? 'bg-green-500 text-white'
                            : true === selectedAnswer
                              ? 'bg-red-500 text-white'
                              : ''
                          : selectedAnswer === true
                            ? 'bg-cyan-700 text-white'
                            : ''
                      }`}
                      onClick={() => handleSelectOption(true)}
                      disabled={isAnswerSubmitted}
                    >
                      对
                    </Button>,
                    <Button
                      key="false"
                      variant="outline"
                      className={`w-full text-left justify-start ${
                        isAnswerSubmitted
                          ? false === currentQuestion.answer
                            ? 'bg-green-500 text-white'
                            : false === selectedAnswer
                              ? 'bg-red-500 text-white'
                              : ''
                          : selectedAnswer === false
                            ? 'bg-cyan-700 text-white'
                            : ''
                      }`}
                      onClick={() => handleSelectOption(false)}
                      disabled={isAnswerSubmitted}
                    >
                      错
                    </Button>
                  ]
              }
            </div>
            {isAnswerSubmitted && (
              <p className="mt-4 text-sm text-gray-600">
                {selectedAnswer === currentQuestion.answer 
                  ? currentQuestion.feedback_correct 
                  : currentQuestion.feedback_incorrect}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={isAnswerSubmitted ? handleNextQuestion : handleSubmitAnswer}
            disabled={!isAnswerSubmitted && selectedAnswer === null}
          >
            {isAnswerSubmitted ? '下一题' : '确认'}
          </Button>
        </CardFooter>
      </Card>
      <p className="text-center text-sm text-gray-500 mt-4">
        进度: {currentQuestionIndex + 1} / {questions.length}
      </p>
    </div>
  );
};

export default QuizScreen;
