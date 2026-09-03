import { useState } from "react";

function FireScenario({ cameraActive }) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "RAISE THE ALARM",
      text: "Emergency detected near the conveyor equipment.",
      action: "Raise alarm"
    },
    {
      title: "EVACUATE",
      text: "Use the designated evacuation route.",
      action: "Evacuate"
    },
    {
      title: "FIRE EXTINGUISHER",
      text: "Use only if the fire is small and it is safe to do so.",
      action: "Use extinguisher"
    },
    {
      title: "MUSTER POINT",
      text: "Report to the designated muster point.",
      action: "Report to muster point"
    },
    {
      title: "SUPERVISOR",
      text: "Remain at the muster point and follow instructions.",
      action: "Follow supervisor"
    }
  ];

  const current = steps[step - 1];

  function completeStep() {
    if (step < steps.length) {
      setStep(step + 1);
    }
  }

  return (
    <div className={`ar-scenario ${cameraActive ? "camera-live" : ""}`}>

      <div className="ar-dark"></div>

      <div className="ar-top">

        <div className="ar-alert">
          ⚠ FIRE EMERGENCY
          <span>MINING INDUSTRY — JHARKHAND</span>
        </div>

        <div className="ar-progress">
          <strong>ASSESSMENT MODE</strong>
          <span>Decision {step} of 5</span>

          <div className="ar-progress-track">
            <div
              className="ar-progress-fill"
              style={{ width: `${step * 20}%` }}
            ></div>
          </div>
        </div>

        <div className="no-hints">
          NO HINTS
        </div>

      </div>

      <div className="ar-timer">
        ◷ 00:24
      </div>

      <div className="mine-scene">

        <div className="mine-tunnel"></div>

        <div className="mine-support support-one"></div>
        <div className="mine-support support-two"></div>

        <div className="conveyor">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="fire-effect">
          🔥
        </div>

        <div className="fire-label">
          🔥
          <strong>FIRE DETECTED</strong>
          <span>High temperature near equipment</span>
        </div>

        <div className="exit-label">
          🚶 EXIT →
          <span>Designated evacuation route</span>
        </div>

        <div className="extinguisher-label">
          🧯 FIRE EXTINGUISHER
          <span>Use only if safe</span>
        </div>

        <div className="muster-label">
          👥 MUSTER POINT
          <span>Report to supervisor</span>
        </div>

      </div>

      <div className="task-panel">

        <span>YOUR TASK</span>

        <h2>
          STEP {step} OF 5
        </h2>

        <h1>
          {current.title}
        </h1>

        <p>
          {current.text}
        </p>

        <button
          className="scenario-action"
          onClick={completeStep}
        >
          {current.action}
        </button>

      </div>

      <div className="procedure-bar">

        <div className={step >= 1 ? "done" : ""}>
          <b>1</b>
          Alarm
        </div>

        <div className={step >= 2 ? "done" : ""}>
          <b>2</b>
          Evacuate
        </div>

        <div className={step >= 3 ? "done" : ""}>
          <b>3</b>
          Extinguisher
        </div>

        <div className={step >= 4 ? "done" : ""}>
          <b>4</b>
          Muster
        </div>

        <div className={step >= 5 ? "done" : ""}>
          <b>5</b>
          Supervisor
        </div>

      </div>

      {step === 5 && (
        <div className="scenario-complete">
          ✓ TRAINING SCENARIO COMPLETED
        </div>
      )}

    </div>
  );
}

export default FireScenario;