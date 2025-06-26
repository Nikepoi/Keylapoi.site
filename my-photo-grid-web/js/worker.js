const updateWorker = new Worker('js/worker.js');
updateWorker.postMessage('start');

updateWorker.onmessage = function (e) {
  if (e.data === 'update') {
    checkForUpdates();
  }
};
