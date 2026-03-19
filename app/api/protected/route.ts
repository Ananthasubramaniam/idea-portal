import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    // 1. Extract token from the Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // 2. Validate token securely using Supabase Admin
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return NextResponse.json({ error: "Invalid user or expired token" }, { status: 401 });
    }

    const email = data.user.email;

    // 3. Enforce university email domain check strictly on the backend
    if (!email || !email.toLowerCase().endsWith("saiuniversity.edu.in")) {
      return NextResponse.json(
        { error: "Access restricted: Only saiuniversity.edu.in accounts permitted." },
        { status: 403 }
      );
    }

    // 4. Continue with actual secure backend logic
    return NextResponse.json(
      { 
        message: "Successfully authorized! Backend logic executed.", 
        user: {
          id: data.user.id,
          email: data.user.email
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
