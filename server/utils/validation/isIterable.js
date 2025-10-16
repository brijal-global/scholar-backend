const isIterable = (value) => {
  return Symbol.iterator in Object(value);
};

export default isIterable;
