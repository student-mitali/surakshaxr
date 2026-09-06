export default function FireScenario({ cameraActive }) {
  if (!cameraActive) return null;

  return (
    <iframe
      src="/fireline/index.html"
      title="Fire Emergency Drill"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        zIndex: 9999,
      }}
    />
  );
}