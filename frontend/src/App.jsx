import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import PlayerDetail from './components/PlayerDetail';
import AuctionView from './components/AuctionView';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/players" replace />} />
          <Route path="/players" element={<PlayerList />} />
          <Route path="/player/:id" element={<PlayerDetail />} />
          <Route path="/add" element={<PlayerForm />} />
          <Route path="/auction" element={<AuctionView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
