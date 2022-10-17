export type Success<T> = {value: T; error: undefined};
export type Failure = {value: undefined; error: Error};
type Map<T> = {map<U>(_: (t: T) => U): Result<U>};

export type Result<T> = (Success<T> | Failure) & Map<T>;

export const success: <T>(value: T) => Result<T> = <T>(value: T) => ({
  value,
  error: undefined,
  map<U>(mapper: (t: T) => U): Result<U> {
    return success(mapper(value));
  },
});

export const failure: <T>(error: Error) => Result<T> = (error: Error) => ({
  value: undefined,
  error,
  map() {
    return failure(error);
  },
});
