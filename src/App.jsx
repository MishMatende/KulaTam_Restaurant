import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import FindUs from "./pages/FindUs";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="find-us" element={<FindUs />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
