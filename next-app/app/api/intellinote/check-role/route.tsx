// app/api/intellinote/check-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRole } from "@/utils/checkRoles";

export async function GET(req: NextRequest) {
  try {
    // Get roles from query parameter
    const searchParams = req.nextUrl.searchParams;
    const rolesParam = searchParams.get("roles");

    if (!rolesParam) {
      return NextResponse.json(
        { error: "Roles parameter is required" },
        { status: 400 }
      );
    }

    // Parse the roles array from the query string
    const roles = JSON.parse(rolesParam);

    // Use the existing checkRole function
    const user = await checkRole(roles);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Role check error:", error);
    return NextResponse.json(
      { error: "Failed to check user role" },
      { status: 401 }
    );
  }
}
