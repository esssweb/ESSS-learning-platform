"use client";

import { ChangeEvent, FormEvent, useState } from "react";

import { questionsType } from "@/types/dynamic-courses/types";

const Quiz = ({
  title,
  questions,
}: {
  title: string;
  questions: questionsType[];
}) => {
  const q = questions.map((question) => {
    if (!!question.choices) {
      return question.choices[0];
    }

    return {};
  });
  const [answers, setAnswers] = useState(q);

  const handleChoiceChange = (answer: string, questionId: number) => {
    answers[questionId] = answer;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(answers);
  };

  return (
    <div className="text-Primary rounded-[10px] border-2 bg-white px-2 sm:px-12 py-7">
      <h3 className="text-xl font-SofiaProRegular mb-10">Challenge: {title}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {questions.map((question, idx) => (
          <fieldset key={question.key} className="mb-3.5">
            <legend className="font-SofiaProLight mb-0.5">
              {idx + 1}. {question.question}
            </legend>

            <ul className="font-SofiaProLight px-3.5">
              {question.choices.map((choice, i) => (
                <li key={choice.key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={question.question}
                    value={choice.choice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChoiceChange(e.target.value, idx)
                    }
                  />
                  <label>
                    {String.fromCharCode(97 + i)}) {choice.choice}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}

        <input
          type="reset"
          value="Clear all answers"
          className="p-2 mt-5 self-end rounded-lg text-Secondary bg-Primary border border-Primary hover:text-Primary cursor-pointer font-SofiaProSemiBold hover:bg-Secondary"
        />
        <button type="submit">Submit answers</button>
      </form>
    </div>
  );
};

export default Quiz;
