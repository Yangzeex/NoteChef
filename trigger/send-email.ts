import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import CommentNotification from "@/emails/CommentNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendCommentEmailTask = task({
  id: "send-comment-email",
  run: async (payload: {
    to: string;
    recipientName: string;
    commenterName: string;
    recipeTitle: string;
    recipeId: string;
    commentBody: string;
  }) => {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: payload.to,
      subject: `${payload.commenterName} commented on your recipe`,
      react: CommentNotification(payload),
    });
  },
});
