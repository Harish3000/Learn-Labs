// app/protected/active-learning/admin/page.tsx
import { restrictServer, getUserFromServer } from "@/utils/restrictServer";

const AdminPage = async () => {
  const user = await restrictServer(["admin"]);
  // Unrestricted user for logging
  const unrestrictedUser = await getUserFromServer();

  // Log the unrestricted user
  console.log("Retrieved user from server (no role check):", unrestrictedUser);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the Admin Panel</p>
      <p>This is a restricted area for administrators only.</p>
    </div>
  );
};

export default AdminPage;
