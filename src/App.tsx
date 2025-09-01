import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Maker, Courses } from "./utils/pageImports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Maker />} />
        <Route path="/courses" element={<Courses />} />
      </Routes>
    </Router>
  );
}
