const storage = require('../../utils/storage');
const time = require('../../utils/time');

Page({
  data: { recent: [] },
  onShow: function () {
    const recent = storage.getConversations().slice(0, 3).map(function (item) {
      return Object.assign({}, item, { displayTime: time.formatTime(item.updatedAt) });
    });
    this.setData({ recent: recent });
  },
  startChat: function () { wx.navigateTo({ url: '/pages/chat/chat' }); },
  openConversation: function (event) {
    wx.navigateTo({ url: '/pages/chat/chat?id=' + event.currentTarget.dataset.id });
  },
  openHistory: function () { wx.switchTab({ url: '/pages/history/history' }); }
});
