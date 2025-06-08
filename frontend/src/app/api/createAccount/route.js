import fs from "fs";
import path from "path";

export async function POST(req) {
  const body = await req.json();
  const { username } = body;

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), {
      status: 400,
    });
  }

  const usersDir = path.join(process.cwd(), "public/users");
  const userFilePath = path.join(usersDir, `${username}.json`);

  // Check if the user already exists
  if (fs.existsSync(userFilePath)) {
    return new Response(JSON.stringify({ error: "Username is already taken" }), {
      status: 409,
    });
  }

  // Create user data
  const key = Array(32)
    .fill(null)
    .map(() => Math.random().toString(36).charAt(2))
    .join("");
  const userData = {
    username,
    password: key,
    alterationRights: false,
    toWatch: [],
    watched: [],
    collections: [],
  };

  // Save user data as JSON
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir, { recursive: true });
  }
  fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));

  return new Response(JSON.stringify(userData), { status: 201 });
}
