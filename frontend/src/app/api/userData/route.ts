import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return new Response(JSON.stringify({ error: "Username is required" }), {
              status: 400,
            });
        }

        // Load the user data from a JSON file (replace with your data source)
        const usersDir = path.join(process.cwd(), "public/users");
        const filePath = path.join(usersDir, `${username}.json`);

        if (!fs.existsSync(filePath)) {
            return new Response(JSON.stringify({ error: "User not found" }), {
              status: 404,
            });
        }

        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Exclude the password from the response
        const { password, ...userDataWithoutPassword } = jsonData;

        return NextResponse.json(userDataWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
}
