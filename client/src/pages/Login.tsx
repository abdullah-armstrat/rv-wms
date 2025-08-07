// client/src/pages/Login.tsx

import { useForm } from "react-hook-form";
import { login } from "../api/auth";
import type { LoginData } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const {
    register: hookRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  async function onSubmit(data: LoginData) {
    try {
      const { token, user } = await login(data);
      setAuth(token, user);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        <label className="block mb-2">
          Email
          <input
            {...hookRegister("email", { required: "Email required" })}
            type="email"
            className="mt-1 block w-full px-3 py-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </label>

        <label className="block mb-4">
          Password
          <input
            {...hookRegister("password", { required: "Password required" })}
            type="password"
            className="mt-1 block w-full px-3 py-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </label>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
