const storage = require('../../utils/storage');
const time = require('../../utils/time');

Page({
  data: { conversations: [] },
  onShow: function () { this.loadConversations(); },
  onPullDownRefresh: function () {
    this.loadConversations();
    wx.stopPullDownRefresh();
  },
  loadConversations: function () {
    const conversations = storage.getConversations().map(function (item) {
      const last = item.messages[item.messages.length - 1];
      return Object.assign({}, item, {
        displayTime: time.formatTime(item.updatedAt),
        preview: last ? last.content : ''
      });
    });
    this.setData({ conversations: conversations });
  },
  openConversation: function (event) {
    wx.navigateTo({ url: '/pages/chat/chat?id=' + event.currentTarget.dataset.id });
  },
  deleteConversation: function (event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '删除对话', content: '删除后无法恢复，确定删除吗？',
      success: (result) => {
        if (result.confirm) {
          storage.deleteConversation(id);
          this.loadConversations();
        }
      }
    });
  }
});
