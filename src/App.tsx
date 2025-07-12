import { BrowserRouter, Route, Routes } from "react-router-dom";
import DrawingApp from "./pages/DrawingApp";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./pages/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext/AuthProvider";
import Error from "./pages/Error";
import AuthCallback from "./pages/AuthCallback";
import { DiagramProvider } from "./contexts/DiagramContext/DiagramProvider";
import { Toaster } from "sonner";
import Invitations from "./pages/Invitations";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <DiagramProvider>
          <Routes>
            <Route path="/auth" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={
              <PrivateRoute>
                <AuthCallback />
              </PrivateRoute>
            } />
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
            <Route path="/invitations" element={
              <PrivateRoute>
                <Invitations />
              </PrivateRoute>
            } />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Error errorCode={404} errorMessage="Page not found" />} />
          </Routes>
        </DiagramProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;