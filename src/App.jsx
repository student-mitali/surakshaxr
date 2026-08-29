import { useState } from "react";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  function startTraining() {
    setScreen("scenario");
    setScore(0);
    setAnswered(false);
  }

  function chooseAnswer(isCorrect) {
    if (answered) return;

    setAnswered(true);

    if (isCorrect) {
      setScore(100);
    } else {
      setScore(0);
    }
  }

  if (screen === "home") {
    return (
      <main className="app">
        <section className="card">
          <p className="tag">SURAKSHAXR MVP</p>

          <h1>Industrial Safety Training</h1>

          <p>
            Practise emergency safety actions safely before facing a real
            emergency.
          </p>

          <label>Select language</label>

          <select>
            <option>English</option>
            <option>Hindi</option>
            <option>Santali</option>
          </select>

          <button className="module-button">
            🔥 Fire and Evacuation
          </button>

          <button className="primary-button" onClick={startTraining}>
            Start Training
          </button>
        </section>
      </main>
    );
  }

  if (screen === "scenario") {
    return (
      <main className="app">
        <section className="card">
          <p className="tag">FIRE AND EVACUATION</p>

          <div className="fire">🔥</div>

          <h2>What should you do first when you see a fire?</h2>

          <button
            className="option-button"
            onClick={() => chooseAnswer(true)}
          >
            Raise the alarm
          </button>

          <button
            className="option-button"
            onClick={() => chooseAnswer(false)}
          >
            Enter the fire area
          </button>

          <button
            className="option-button"
            onClick={() => chooseAnswer(false)}
          >
            Ignore it
          </button>

          {answered && (
            <>
              <p className="feedback">
                {score === 100
                  ? "✅ Correct! Raise the alarm first."
                  : "❌ Wrong action. Never enter the fire area."}
              </p>

              <button
                className="primary-button"
                onClick={() => setScreen("result")}
              >
                View Result
              </button>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="card result-card">
        <p className="tag">TRAINING COMPLETE</p>

        <h1>Your Score</h1>

        <div className="score">{score}%</div>

        <p>
          {score === 100
            ? "Good work. You selected the safe action."
            : "Please repeat the safety training."}
        </p>

        <button className="primary-button" onClick={startTraining}>
          Try Again
        </button>
      </section>
    </main>
  );
}

export default App;