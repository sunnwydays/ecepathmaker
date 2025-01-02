import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import Maker from './pages/Maker';
import Courses from './pages/Courses';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='*' element={<NotFound />} />
          <Route path='/' element={<Maker />} />
          <Route path='/courses' element={<Courses />} />
        </Routes>
      </Layout>
    </Router>
  )
}