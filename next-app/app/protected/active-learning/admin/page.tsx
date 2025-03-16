// app/protected/page.tsx
import { checkRole } from "@/utils/checkRoles";
import { restrictServer, getUserFromServer } from "@/utils/restrictServer";

const Admin = async () => {
  // Role-restricted user with redirection
  const user = await restrictServer(["admin"]);
  // Unrestricted user for logging
  const unrestrictedUser = await getUserFromServer();

  // Log the unrestricted user
  console.log("Retrieved user from server (no role check):", unrestrictedUser);

  return (
    <div>
      <h1 className="text-3xl font-bold">Only admin can view this page 😎</h1>
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
