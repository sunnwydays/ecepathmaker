import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./utils/componentImports";
import { NotFound, Maker, Courses, FAQ } from "./utils/pageImports";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Maker />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </Layout>
    </Router>
  );
}
