const LEGACY_AI_CONVERSATION_KEY = "ai_conversation_id";
const LEGACY_AI_MESSAGES_KEY = "ai_chat_messages";
const AI_CONVERSATION_PREFIX = "ai_conversation_id_";
const AI_MESSAGES_PREFIX = "ai_chat_messages_";

export function getAiConversationKey(userId?: string | null) {
  return userId ? `${AI_CONVERSATION_PREFIX}${userId}` : null;
}

export function getAiMessagesKey(userId?: string | null) {
  return userId ? `${AI_MESSAGES_PREFIX}${userId}` : null;
}

export function clearAllAiChatStorage() {
  Object.keys(localStorage)
    .filter((key) =>
      key === LEGACY_AI_CONVERSATION_KEY ||
      key === LEGACY_AI_MESSAGES_KEY ||
      key.startsWith(AI_CONVERSATION_PREFIX) ||
      key.startsWith(AI_MESSAGES_PREFIX)
    )
    .forEach((key) => localStorage.removeItem(key));
}
