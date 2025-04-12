class Mutex {
  constructor() {
    this._locked = false;
    this._waiting = [];
  }

  lock() {
    const unlock = () => {
      if (this._waiting.length > 0) {
        const nextResolve = this._waiting.shift();
        nextResolve(unlock);
      } else {
        this._locked = false;
      }
    };

    if (this._locked) {
      return new Promise((resolve) => {
        this._waiting.push(resolve);
      });
    } else {
      this._locked = true;
      return Promise.resolve(unlock);
    }
  }
}

module.exports = Mutex;
