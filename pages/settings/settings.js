const storage = require('../../utils/storage');

Page({
  data: { conversationCount: 0 },
  onShow: function () { this.setData({ conversationCount: storage.getConversations().length }); },
  clearHistory: function () {
    wx.showModal({
      title: '清空历史记录', content: '将删除本机保存的全部对话，且无法恢复。确定继续吗？',
      success: (result) => {
        if (result.confirm) {
          storage.clearConversations();
          this.setData({ conversationCount: 0 });
          wx.showToast({ title: '历史记录已清空', icon: 'success' });
        }
      }
    });
  },
  showAbout: function () {
    wx.showModal({ title: '关于 AI 助手', content: 'AI 微信小程序助手第一版。对话记录保存在当前设备。', showCancel: false });
  }
});
