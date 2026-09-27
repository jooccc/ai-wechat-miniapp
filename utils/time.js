function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const pad = function (value) { return value < 10 ? '0' + value : '' + value; };
  if (date.toDateString() === now.toDateString()) return pad(date.getHours()) + ':' + pad(date.getMinutes());
  return (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

module.exports = { formatTime };
