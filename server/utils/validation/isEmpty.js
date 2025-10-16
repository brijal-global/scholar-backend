const isEmpty = (value) => {
  if (value === null) return true;
  if (typeof value !== "number" && value === "") return true;
  if (value === "undefined" || value === undefined) return true;
  if (value !== null && typeof value === "object" && !Object.keys(value).length)
    return true;

  return false;
};

export default isEmpty;
