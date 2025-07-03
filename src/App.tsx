import { BrowserRouter, Route, Routes } from "react-router-dom";
import DrawingApp from "./pages/DrawingApp";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./pages/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext/AuthProvider";
import Error from "./pages/Error";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<SignUp />} />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/draw" element={
            <PrivateRoute>
              <DrawingApp />
            </PrivateRoute>
          } />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<Error errorCode={404} errorMessage="Page not found" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;