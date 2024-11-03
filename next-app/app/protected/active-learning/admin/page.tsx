// app/protected/page.tsx
import { checkRole } from "@/utils/checkRoles";

const Admin = async () => {
  const user = await checkRole(["admin"]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        Only admin can view this page 😎
      </h1>
      <p>Welcome, {user.email}</p>
      <br />
      <br />
      {/* Conditional rendering based on role */}
      {user.user_metadata.role === "admin" && (
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Admin Button sample
        </button>
      )}
      {user.user_metadata.role === "user" && (
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          User Button sample
        </button>
      )}
    </div>
  );
};

export default Admin;
