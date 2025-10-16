import fs from "fs";

export const deleteFile = async (path) => {
  await fs.unlink(path, (err) => {
    if (err) console.error(err);
  });
};
