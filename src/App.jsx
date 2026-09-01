import { useState } from "react";
import "./App.css";
import HamburgerMenu from "./HamburgerMenu";

const briefingSections = [
  {
    number: "01",
    title: "Recognise the hazard",
    text: "Identify smoke, flames, unusual heat or emergency signals immediately."
  },
  {
    number: "02",
    title: "Follow the approved alarm procedure",
    text: "Raise the emergency alarm according to the authorised workplace procedure."
  },
  {
    number: "03",
    title: "Avoid the danger zone",
    text: "Do not enter the affected area or return to collect personal belongings."
  },
  {
    number: "04",
    title: "Use the designated route",
    text: "Move through the approved evacuation route and avoid blocked or dangerous exits."
  },
  {
    number: "05",
    title: "Report to the muster point",
    text: "Reach the designated muster point and follow supervisor instructions."
  }
];

const scenarioSteps = [
  {
    question:
      "You are working near industrial equipment when you notice smoke and flames. The emergency alarm has not been raised. What should you do first?",
    options: [
      "Follow the approved emergency-alarm procedure",
      "Enter the area to inspect the equipment",
      "Continue working and wait for instructions",
      "Run outside without informing anyone"
    ],
    correct: "Follow the approved emergency-alarm procedure",
    points: 20,
    critical: true,
    explanation:
      "The approved emergency-alarm procedure must be followed before approaching or leaving the hazard area."
  },
  {
    question:
      "The alarm has been raised. You notice that the nearest exit is partially blocked. What should you do?",
    options: [
      "Use the designated safe evacuation route",
      "Force your way through the blocked exit",
      "Move closer to the fire to find another route",
      "Wait inside the affected area"
    ],
    correct: "Use the designated safe evacuation route",
    points: 20,
    critical: true,
    explanation:
      "A blocked exit must be avoided. Follow the designated safe route."
  },
  {
    question:
      "A coworker says they are going back to collect a personal item. What is the safest response?",
    options: [
      "Tell them not to re-enter and report the situation",
      "Go back with them",
      "Ignore the situation",
      "Wait for them near the fire"
    ],
    correct: "Tell them not to re-enter and report the situation",
    points: 20,
    critical: true,
    explanation:
      "Workers should not re-enter an affected area. Escalate the situation through the approved procedure."
  },
  {
    question:
      "You have reached the safe area. What should you do next?",
    options: [
      "Report to the designated muster point",
      "Leave the site without reporting",
      "Return to check the equipment",
      "Hide somewhere away from the team"
    ],
    correct: "Report to the designated muster point",
    points: 20,
    critical: false,
    explanation:
      "Workers should report to the designated muster point and follow supervisor instructions."
  },
  {
    question:
      "At the muster point, the supervisor is checking attendance. What should you do?",
    options: [
      "Remain at the muster point and provide the required information",
      "Leave immediately because you are safe",
      "Return to the work area",
      "Move to another location without informing anyone"
    ],
    correct: "Remain at the muster point and provide the required information",
    points: 20,
    critical: false,
    explanation:
      "Remain at the muster point until the responsible supervisor gives further instructions."
  }
];

function App() {
  const [screen, setScreen] = useState("home");
  const [language, setLanguage] = useState("English");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const currentStep = scenarioSteps[stepIndex];

  function openModule() {
    setScreen("module");
  }

  function startAssessment() {
    setStepIndex(0);
    setAnswers([]);
    setResult(null);
    setScreen("assessment");
  }

  function chooseAnswer(option) {
    const isCorrect = option === currentStep.correct;

    const updatedAnswers = [
      ...answers,
      {
        selected: option,
        correct: isCorrect,
        critical: currentStep.critical,
        explanation: currentStep.explanation
      }
    ];

    setAnswers(updatedAnswers);

    if (stepIndex === scenarioSteps.length - 1) {
      const finalScore = updatedAnswers.reduce((total, answer, index) => {
        return answer.correct
          ? total + scenarioSteps[index].points
          : total;
      }, 0);

      const criticalErrors = updatedAnswers.filter(
        (answer) => !answer.correct && answer.critical
      ).length;

      const finalResult = {
        score: finalScore,
        criticalErrors,
        language,
        completedAt: new Date().toISOString()
      };

      setResult(finalResult);

      localStorage.setItem(
        "surakshaxr_latest_result",
        JSON.stringify(finalResult)
      );

      setScreen("result");
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  function returnHome() {
    setScreen("home");
    setStepIndex(0);
    setAnswers([]);
    setResult(null);
  }

  let content;

  if (screen === "home") {
    content = (
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">SURAKSHAXR TRAINING PLATFORM</p>

          <h1>Industrial safety training for better emergency decisions.</h1>

          <p className="hero-description">
            Learn the essential procedure first. Then complete a realistic
            scenario-based assessment without hints.
          </p>

          <button className="primary-button" onClick={openModule}>
            Open fire evacuation module
          </button>
        </div>

        <div className="module-preview">
          <div className="preview-header">
            <span className="status-dot"></span>
            Training module
          </div>

          <div className="preview-icon">01</div>

          <p className="preview-label">FIRE &amp; EVACUATION</p>

          <h2>Emergency response fundamentals</h2>

          <div className="preview-details">
            <span>5 decisions</span>
            <span>No hints</span>
            <span>Offline ready</span>
          </div>
        </div>
      </section>
    );
  }

  if (screen === "module") {
    content = (
      <section className="content-card">
        <p className="eyebrow">MODULE 01 / LEARNING BRIEF</p>

        <h1>Fire &amp; Evacuation</h1>

        <p className="large-text">
          Review the complete safety brief before starting the assessment.
          There will be no hints during the test.
        </p>

        <div className="language-box">
          <label htmlFor="language">Training language</label>

          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Santali</option>
          </select>
        </div>

        <div className="brief-list">
          {briefingSections.map((section) => (
            <div className="brief-item" key={section.number}>
              <span className="brief-number">{section.number}</span>

              <div>
                <strong>{section.title}</strong>
                <p>{section.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="safety-note">
          <span>ASSESSMENT RULE</span>

          <p>
            You must make five decisions in one emergency scenario. A critical
            unsafe decision may require retraining.
          </p>
        </div>

        <button className="primary-button" onClick={startAssessment}>
          I have reviewed the brief — start assessment
        </button>
      </section>
    );
  }

  if (screen === "assessment") {
    content = (
      <section className="content-card">
        <div className="assessment-header">
          <div>
            <p className="eyebrow">ASSESSMENT MODE</p>

            <span>
              Decision {stepIndex + 1} of {scenarioSteps.length}
            </span>
          </div>

          <span className="no-hints">NO HINTS</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill assessment-fill"
            style={{
              width: `${((stepIndex + 1) / scenarioSteps.length) * 100}%`
            }}
          ></div>
        </div>
        <div className="scenario-visual">
  <div className="visual-header">
    INDUSTRIAL WORK AREA / SIMULATION
  </div>

  <div className="visual-floor">
    <div className="visual-hazard">
      <span>HAZARD</span>
      FIRE ZONE
    </div>

    <div className="visual-exit safe-exit">
      SAFE EXIT A
    </div>

    <div className="visual-exit blocked-exit">
      BLOCKED EXIT
    </div>

    <div className="visual-muster">
      MUSTER POINT
    </div>
  </div>
</div>

        <div className="scenario-context">
          <span>INCIDENT SCENARIO</span>

          <p>
            Smoke and flames have been observed near industrial equipment
            during a work shift. The emergency response is in progress.
          </p>
        </div>

        <h1 className="assessment-question">
  {currentStep.question}
</h1>

        <div className="answer-list">
          {currentStep.options.map((option) => (
            <button
              className="answer-button"
              key={option}
              onClick={() => chooseAnswer(option)}
            >
              <span className="answer-marker"></span>
              {option}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (screen === "result") {
    content = (
      <section className="content-card result-card">
        <p className="eyebrow">ASSESSMENT COMPLETE</p>

        <h1>Your training result</h1>

        <div className="result-score">{result?.score}%</div>

        <div className="result-summary">
          <div>
            <span>Critical errors</span>
            <strong>{result?.criticalErrors}</strong>
          </div>

          <div>
            <span>Language</span>
            <strong>{result?.language}</strong>
          </div>
        </div>

        <p className="large-text">
          {result?.criticalErrors === 0
            ? "You completed the scenario without a critical error."
            : "Review the corrections below before attempting the assessment again."}
        </p>

        <h2 className="review-heading">Decision Review</h2>

        <div className="review-list">
          {answers.map((answer, index) => {
            const question = scenarioSteps[index];

            return (
              <div
                className={`review-item ${
                  answer.correct ? "review-correct" : "review-wrong"
                }`}
                key={index}
              >
                <h3>
                  Decision {index + 1}{" "}
                  {answer.correct ? "✓ Correct" : "✕ Needs correction"}
                </h3>

                <p>
                  <strong>Your choice:</strong> {answer.selected}
                </p>

                {!answer.correct && (
                  <p className="correct-answer">
                    <strong>Correct action:</strong> {question.correct}
                  </p>
                )}

                <p>
                  <strong>Explanation:</strong> {answer.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <button className="primary-button" onClick={returnHome}>
          Return to home
        </button>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={returnHome}>
          <span className="brand-mark">S</span>
          <span>SurakshaXR</span>
        </button>

        <div className="topbar-status">
          <span className="online-dot"></span>
          Prototype mode
        </div>
        <HamburgerMenu setScreen={setScreen} />
      </header>

      <main className="page-content" key={screen}>
  {content}
</main>
</div>
  );
}

export default App;