
export type ErrorResponse = { error: true; message: string };
export type SuccessResponse = { error: false; message?: undefined };
export type ServiceError = { error: true; message: string } | { error: false; message?: undefined };