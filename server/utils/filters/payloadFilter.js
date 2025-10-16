import { HttpException } from "../../exceptions/index.js";

export const sanitizePayload = (payload, itemsToDelete) => {
  if (!payload || !itemsToDelete) return payload;

  const filteredPayload = {};

  Object.keys(payload).forEach((key) => {
    if (!itemsToDelete.includes(key)) {
      filteredPayload[key] = payload[key];
    }
  });

  // verify if filteredPayload does not contain any of the itemsToDelete
  const isSanitized = itemsToDelete.every((item) => !filteredPayload[item]);

  if (!isSanitized) {
    throw new HttpException(400, "Payload is not sanitized!", "auth");
  }

  return filteredPayload;
};
