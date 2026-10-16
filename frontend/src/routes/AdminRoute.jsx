import {
  Navigate,
} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

export default function AdminRoute({
  user,
  children,
}) {
  const profile =
    user?.perfil ||
    user?.tipo;

  const allowed = [
    "repositor",
    "dev",
  ];

  return (
    <PrivateRoute user={user}>
      {allowed.includes(profile) ? (
        children
      ) : (
        <Navigate
          to="/"
          replace
        />
      )}
    </PrivateRoute>
  );
}
