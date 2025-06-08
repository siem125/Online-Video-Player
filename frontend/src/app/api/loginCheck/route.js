import fs from "fs";
import path from "path";

export async function POST(req) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return new Response(
      JSON.stringify({ error: "Username and password are required" }),
      { status: 400 }
    );
  }

  const userFilePath = path.join(process.cwd(), "public/users", `${username}.json`);

  // Check if the user exists
  if (!fs.existsSync(userFilePath)) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  const userData = JSON.parse(fs.readFileSync(userFilePath, "utf-8"));

  // Validate password
  if (userData.password !== password) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
    });
  }

  return new Response(
    JSON.stringify({ message: "Login successful", alterationRights: userData.alterationRights }),
    { status: 200 }
  );
}
