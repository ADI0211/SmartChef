import { Link } from "react-router-dom";

// Small house icon shown at the top of every non-Home page, since Home
// isn't one of the bottom nav tabs (per the original spec) and otherwise
// there'd be no way back to it.
export default function HomeButton() {
  return (
    <Link to="/" className="home-button" aria-label="Back to home">
      🏠
    </Link>
  );
}
