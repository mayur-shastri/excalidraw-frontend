import { BrowserRouter, Route, Routes } from "react-router-dom";
import DrawingApp from "./pages/DrawingApp";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/auth" element={<SignUp/>} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/draw" element={<DrawingApp/>}/>
      </Routes>
    </BrowserRouter>
 );
}

export default App;