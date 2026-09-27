const STORAGE_KEY = 'ai_assistant_conversations_v1';

function readConversations() {
  try {
    const value = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function writeConversations(conversations) {
  wx.setStorageSync(STORAGE_KEY, conversations);
}

function getConversations() {
  return readConversations().sort(function (a, b) {
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });
}

function getConversation(id) {
  return readConversations().find(function (item) { return item.id === id; }) || null;
}

function saveConversation(conversation) {
  const conversations = readConversations();
  const index = conversations.findIndex(function (item) { return item.id === conversation.id; });
  if (index >= 0) conversations[index] = conversation;
  else conversations.push(conversation);
  writeConversations(conversations);
}

function deleteConversation(id) {
  writeConversations(readConversations().filter(function (item) { return item.id !== id; }));
}

function clearConversations() {
  writeConversations([]);
}

module.exports = { getConversations, getConversation, saveConversation, deleteConversation, clearConversations };
