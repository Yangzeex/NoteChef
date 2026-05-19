import * as React from "react";

interface WelcomeEmailProps {
  username: string;
}

export default function WelcomeEmail({ username }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h1>Welcome to Notechef, {username}!</h1>
      <p>
        We&apos;re so glad you&apos;re here. Start by creating your first recipe
        or exploring what other cooks are making.
      </p>
      <a
        href="https://notechef.app/explore"
        style={{
          display: "inline-block",
          background: "#f97316",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 6,
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Explore Recipes
      </a>
    </div>
  );
}
