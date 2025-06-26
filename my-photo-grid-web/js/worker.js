// Web Worker - Auto Check Update setiap 20 detik dan juga support refresh
self.onmessage = function (e) {
  if (e.data === 'start') {
    setInterval(() => {
      self.postMessage('update');
    }, 20000); // Cek update setiap 20 detik
  }
};
