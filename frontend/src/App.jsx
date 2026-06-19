// import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication.jsx';
import HomeComponent from './pages/HomePage.jsx'
import VideoMeet from './pages/VideoMeet.jsx'
import History from './pages/History.jsx'

function App() {
  
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/auth/:state" element={<Authentication />} />
          <Route path="/home" element={<HomeComponent />} />
          <Route path='/:url' element={<VideoMeet />} />
          <Route path='/history' element={<History />} />
          <Route path="*" element={<LandingPage />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
