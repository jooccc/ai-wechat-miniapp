const config = require('./config');

function sendMessage(messages) {
  return new Promise(function (resolve, reject) {
    const baseUrl = (config.backendBaseUrl || '').replace(/\/+$/, '');
    if (!baseUrl) {
      reject(new Error('请先在 services/config.js 中配置后端 HTTPS 地址。'));
      return;
    }

    wx.request({
      url: baseUrl + '/api/chat',
      method: 'POST',
      timeout: 60000,
      header: { 'content-type': 'application/json' },
      data: { messages: messages },
      success: function (response) {
        const data = response.data || {};
        if (response.statusCode >= 200 && response.statusCode < 300 && typeof data.reply === 'string') {
          resolve(data.reply);
          return;
        }
        reject(new Error(data.error || '后端请求失败，请稍后重试。'));
      },
      fail: function (error) {
        reject(new Error((error && error.errMsg) || '无法连接 AI 服务，请检查网络和后端地址。'));
      }
    });
  });
}

module.exports = { sendMessage: sendMessage };
