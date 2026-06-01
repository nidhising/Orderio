export default function Loading({ text = 'Loading…' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" aria-label="Loading" />
      <p className="loading-text">{text}</p>
    </div>
  );
}
