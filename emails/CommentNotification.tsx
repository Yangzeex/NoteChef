import * as React from "react";

interface CommentNotificationProps {
  recipientName: string;
  commenterName: string;
  recipeTitle: string;
  recipeId: string;
  commentBody: string;
}

export default function CommentNotification({
  recipientName,
  commenterName,
  recipeTitle,
  recipeId,
  commentBody,
}: CommentNotificationProps) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h2>Hi {recipientName},</h2>
      <p>
        <strong>{commenterName}</strong> commented on your recipe{" "}
        <strong>{recipeTitle}</strong>:
      </p>
      <blockquote
        style={{
          borderLeft: "4px solid #f97316",
          paddingLeft: 16,
          color: "#555",
        }}
      >
        {commentBody}
      </blockquote>
      <a
        href={`https://notechef.app/recipe/${recipeId}`}
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
        Reply to comment
      </a>
    </div>
  );
}
