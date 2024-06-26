import { fetchWithTimeout } from "./fetch-with-timeout.js";

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

export class StreamObserver extends EventTarget {
  retryCount = 0;
  streams = [];

  constructor(url, timeout = 1000, interval = 10000) {
    super();

    this.url = url;
    this.timeout = timeout;
    this.interval = setInterval(this.updateStreams, interval);
    this.updateStreams();
  }

  updateStreams = () => {
    console.log("checking streams API");
    fetchWithTimeout(this.url, { timeout: this.timeout })
      .then((res) => res.json())
      .then((out) => {
        this.updateStreamList(out.streams);
      })
      .catch((err) => {
        console.error(err);
        this.updateStreamList([]);
      })
      .finally(() => {
        if (this.timeout < 60000 && this.retryCount > 100) {
          this.setUpdateInterval(60000);
        }
      });
  };

  updateStreamList = (newStreams = []) => {
    if (!areStreamListsEquivalent(this.streams, newStreams)) {
      console.log("stream list changed", newStreams);
      this.streams = newStreams;
      this.dispatchStreamUpdate();
    }
  };

  setUpdateInterval = (newInterval) => {
    this.retryCount = 0;
    clearInterval(this.interval);
    this.interval = setInterval(this.updateStreams, newInterval);
    this.updateStreams();
    console.log("new update interval", newInterval);
  };

  isActive = (streamName) => {
    for (let stream of this.streams) {
      if (stream.name === streamName && stream.app === "live") {
        return true;
      }
    }
    return false;
  };

  dispatchStreamUpdate = () => {
    console.log("dispatchStreamUpdate()");
    this.dispatchEvent(new Event("update"));
  };
}
