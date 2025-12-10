import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { GiftIdeas } from "./pages/GiftIdeas";
import { RecoverRequest } from "./pages/RecoverRequest";
import { ResetPassword } from "./pages/ResetPassword";
import { Private } from "./pages/Private";
import { ProfileEdit } from "./pages/ProfileEdit";

export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route element={<Layout />} errorElement={<h1>Not found!</h1>}>

       {/* Public routes */}
       <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
       <Route path="/signup" element={<Signup />} />
       
      <Route path="/recover/request" element={<RecoverRequest />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile/edit" element={<ProfileEdit />} />

      {/* Private routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/private" element={<Private />} />
      <Route path="/generar-ideas/:contactId" element={<GiftIdeas />} />

    </Route>
  )
);
