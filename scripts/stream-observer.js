"use strict";

async function fetchWithTimeout(url, options = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

function areStreamListsEquivalent(list1, list2) {
  if (list1.length !== list2.length) {
    return false;
  }

  return (
    list1.length === list2.length &&
    list1.every((stream1) =>
      list2.some(
        (stream2) =>
          stream1.name === stream2.name && stream1.app === stream2.app
      )
    )
  );
}

class StreamObserver extends EventTarget {
  streams = [];

  constructor(url, interval = 60000, timeout = 1000) {
    super();

    this.url = url;
    this.timeout = timeout;

    this.updateStreams();
    setInterval(this.updateStreams, interval);
  }

  updateStreams = () => {
    fetchWithTimeout(this.url, { timeout: this.timeout })
      .then((res) => res.json())
      .then((out) => {
        this.updateStreamList(out.streams);
      })
      .catch((err) => {
        console.error(err);
        this.updateStreamList();
      });
  };

  updateStreamList = (newStreams = []) => {
    if (!areStreamListsEquivalent(this.streams, newStreams)) {
      this.streams = newStreams;
      this.dispatchStreamUpdate();
    }
  };

  isActive = (streamName) => {
    for (let stream of out.streams) {
      if (stream.name === streamName && stream.app === "live") {
        return true;
      }
    }
    return false;
  };

  dispatchStreamUpdate = () => {
    this.dispatchEvent(new Event("update"));
  };
}
