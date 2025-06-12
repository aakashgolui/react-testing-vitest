import { http, HttpResponse } from "msw";
import { products } from "./data";
import { db } from "./db";

export const handlers = [...db.product.toHandlers("rest")];
