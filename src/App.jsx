import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import FindUs from "./pages/FindUs";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { ForgotPassword, ResetPassword } from "./pages/PasswordReset";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="find-us" element={<FindUs />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/forgot-password" element={<ForgotPassword />} />
        <Route path="admin/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
