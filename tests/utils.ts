import { delay, http, HttpResponse } from "msw";
import { server } from "./mocks/server";

export const simulateDelay = async (endpoint: string) => {
  server.use(
    http.get(endpoint, async () => {
      await delay();
      return HttpResponse.json([]);
    })
  );
};

export const simulateError = async (endpoint: string) => {
  server.use(http.get(endpoint, () => HttpResponse.error()));
};
