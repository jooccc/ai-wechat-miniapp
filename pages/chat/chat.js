const storage = require('../../utils/storage');
const ai = require('../../services/ai');

function makeId() { return 'c' + Date.now() + Math.random().toString(36).slice(2, 8); }

Page({
  data: { id: '', messages: [], inputValue: '', sending: false, error: '' },
  onLoad: function (options) {
    const conversation = options.id ? storage.getConversation(options.id) : null;
    this.setData({
      id: conversation ? conversation.id : makeId(),
      messages: conversation ? conversation.messages : []
    });
  },
  onInput: function (event) { this.setData({ inputValue: event.detail.value }); },
  sendMessage: function () {
    const content = (this.data.inputValue || '').trim();
    if (!content || this.data.sending) return;
    const now = Date.now();
    const messages = this.data.messages.concat([{ role: 'user', content: content, createdAt: now }]);
    const conversation = {
      id: this.data.id,
      title: messages.length === 1 ? content.slice(0, 30) : this.getCurrentTitle(),
      messages: messages,
      createdAt: this.data.createdAt || now,
      updatedAt: now
    };
    this.setData({ messages: messages, inputValue: '', sending: true, error: '' });
    this.persist(conversation);
    const requestMessages = messages.map(function (message) { return { role: message.role, content: message.content }; });
    ai.sendMessage(requestMessages).then((reply) => {
      const answer = typeof reply === 'string' ? reply : (reply && reply.content) || '';
      if (!answer) throw new Error('AI 服务返回了空内容');
      const updated = this.data.messages.concat([{ role: 'assistant', content: answer, createdAt: Date.now() }]);
      this.setData({ messages: updated });
      this.persist(Object.assign({}, conversation, { messages: updated, updatedAt: Date.now() }));
    }).catch((error) => {
      this.setData({ error: error.message || '发送失败，请稍后重试。' });
    }).then(() => { this.setData({ sending: false }); });
  },
  getCurrentTitle: function () {
    const conversation = storage.getConversation(this.data.id);
    return conversation ? conversation.title : (this.data.messages[0] ? this.data.messages[0].content.slice(0, 30) : '新对话');
  },
  persist: function (conversation) {
    try { storage.saveConversation(conversation); }
    catch (error) { this.setData({ error: '本地保存失败，请检查设备存储空间。' }); }
  },
  onShareAppMessage: function () { return { title: 'AI 对话' }; }
});
