import callCallback from "./callcallback";

describe("callCallback", () => {
  describe("if no arguments are passed", () => {
    it("returns undefined", () => {
      const result = callCallback();
      expect(result).toBe(undefined);
    });
  });
  describe("if nothing is passed to the second argument", () => {
    it("returns whatever is in the first argument if one exists", () => {
      const mockArg = "yo";
      const result = callCallback(mockArg);
      expect(result).toBe(mockArg);
    });
    it("returns a promise if it passed as the first argument", async () => {
      const mockFunction = greeting =>
        new Promise(resolve => {
          resolve(greeting);
        });
      const result = callCallback(mockFunction("yo"));
      expect(result instanceof Promise).toBe(true);
      expect(await callCallback(mockFunction("yo"))).toBe("yo");
    });
  });
  describe("if a promise object is passed as the first argument and a callback is passed as a second argument", () => {
    describe("when the promise is successful", () => {
      it("it calls the callback function with the result of the promise", async () => {
        const mockFunction = greeting =>
          new Promise(resolve => {
            resolve(greeting);
          });

        const mockCallback = (err, result) => {
          return `hello ${result}`;
        };

        const mockUtils = { mockCallback };
        spyOn(mockUtils, "mockCallback").and.callThrough();

        const result = callCallback(mockFunction("world"), mockUtils.mockCallback);
        expect(result instanceof Promise).toBe(true);

        result.then(innerPromise => {
          innerPromise.then(callbackResults => {
            expect(mockUtils.mockCallback).toHaveBeenCalledTimes(1);
            expect(callbackResults).toBe("hello world");
          });
        });
      });
    });
    describe("when the promise fails", () => {
      it("it calls the callback function with the error", async () => {
        const mockFunction = greeting =>
          new Promise(resolve => {
            resolve(greeting);
          });

        const mockCallback = (err, result) => {
          if (err) throw err;
          return `hello ${result}`;
        };

        const mockUtils = { mockCallback, mockFunction };
        spyOn(mockUtils, "mockCallback").and.callThrough();
        spyOn(mockUtils, "mockFunction").and.returnValue(Promise.reject(new Error("error")));

        const result = callCallback(mockFunction("world"), mockUtils.mockCallback);
        expect(result instanceof Promise).toBe(true);

        result.then(innerPromise => {
          innerPromise.catch(err => {
            expect(mockUtils.mockCallback).toHaveBeenCalledTimes(1);
            expect(mockUtils.mockCallback).toHaveBeenCalledOnceWith(err);
          });
        });
      });
    });
  });
});
