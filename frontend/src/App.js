import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

// pages & components
import Home from './pages/Home'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
        <div className="pages">
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
          </Routes>
        </div>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
