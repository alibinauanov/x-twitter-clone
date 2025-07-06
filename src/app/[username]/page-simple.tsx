"use client";

import { useParams } from "next/navigation";

export default function UserPage() {
  const params = useParams();
  const username = params?.username as string;

  return (
    <div className="p-4">
      <h1>Profile Page</h1>
      <p>Username: {username}</p>
      <p>This is a simplified profile page to test routing.</p>
    </div>
  );
}
