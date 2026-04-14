export interface Quantity {
  value: number;
  unit: string;
  category: string;
}

export interface ConvertRequest {
  input: Quantity;
  targetUnit: string;
}

export interface OperationRequest {
  first: Quantity;
  second: Quantity;
  targetUnit?: string;
}

export interface ConvertResponse {
  value: number;
  unit: string;
}

export interface OperationResponse {
  value?: number;
  unit?: string;
  message?: string;
  resultValue?: number;
  baseValue?: number;
  BaseValue?: number;
}

export interface HistoryOperation {
  id: string;
  operationType: string;
  firstQuantityId: string;
  secondQuantityId: string;
  resultValue: number;
  resultUnit: string;
}

export interface HistoryQuantity {
  id: string;
  value: number;
  unit: string;
  category: string;
}

export interface HistoryResponse {
  operations: HistoryOperation[];
  quantities: HistoryQuantity[];
}

export interface AuthResponse {
  token: string;
  Token?: string;
  accessToken?: string;
}

export interface UserResponse {
  username: string;
}