import { handleContactPost } from "../_shared/contact-handler.js";

export async function onRequestPost(context) {
  return handleContactPost(context.request, context.env);
}
