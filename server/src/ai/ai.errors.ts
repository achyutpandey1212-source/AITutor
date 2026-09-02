export type AIErrorCode =
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'MODEL_NOT_FOUND'
  | 'PROVIDER_UNAVAILABLE'
  | 'NETWORK_TIMEOUT'
  | 'INVALID_REQUEST'
  | 'MALFORMED_MODEL_OUTPUT'
  | 'UNKNOWN_PROVIDER_ERROR';

export interface ClassifiedAIError {
  code: AIErrorCode;
  isKeyRecoverable: boolean;
  isModelError: boolean;
  isProviderRecoverable: boolean;
  message: string;
  originalError: any;
}

/**
 * Classifies an error from Gemini, Groq, or network calls into deterministic action categories.
 */
export function classifyAIError(error: any): ClassifiedAIError {
  if (!error) {
    return {
      code: 'UNKNOWN_PROVIDER_ERROR',
      isKeyRecoverable: false,
      isModelError: false,
      isProviderRecoverable: false,
      message: 'Unknown error',
      originalError: error,
    };
  }

  const rawMsg = (error.message || String(error)).toLowerCase();
  const status = error.status || error.statusCode || error.response?.status;

  // 1. Model Not Found / Unsupported Model (Critical distinction: DO NOT retry keys for model errors!)
  if (
    status === 404 ||
    rawMsg.includes('model') && (
      rawMsg.includes('not found') ||
      rawMsg.includes('does not exist') ||
      rawMsg.includes('not supported') ||
      rawMsg.includes('is no longer available') ||
      rawMsg.includes('invalid model') ||
      rawMsg.includes('unrecognized model')
    )
  ) {
    return {
      code: 'MODEL_NOT_FOUND',
      isKeyRecoverable: false,
      isModelError: true,
      isProviderRecoverable: true,
      message: `Model configuration error or model not found: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  // 2. Invalid Request / Bad Parameter (Fail fast: do not blindly retry keys)
  if (
    status === 400 &&
    !rawMsg.includes('api_key') &&
    !rawMsg.includes('key')
  ) {
    return {
      code: 'INVALID_REQUEST',
      isKeyRecoverable: false,
      isModelError: false,
      isProviderRecoverable: false,
      message: `Invalid request parameters: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  // 3. Invalid API Key / Unauthorized
  if (
    status === 401 ||
    status === 403 ||
    rawMsg.includes('api_key') ||
    rawMsg.includes('invalid api key') ||
    rawMsg.includes('unauthorized') ||
    rawMsg.includes('permission_denied')
  ) {
    return {
      code: 'INVALID_API_KEY',
      isKeyRecoverable: true,
      isModelError: false,
      isProviderRecoverable: true,
      message: `API key unauthorized or invalid: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  // 4. Rate Limited / Quota Exceeded
  if (
    status === 429 ||
    rawMsg.includes('rate limit') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('resource exhausted') ||
    rawMsg.includes('rate_limit_exceeded') ||
    rawMsg.includes('too many requests')
  ) {
    return {
      code: 'RATE_LIMITED',
      isKeyRecoverable: true,
      isModelError: false,
      isProviderRecoverable: true,
      message: `Rate limit or quota reached on current key: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  // 5. Network Timeout / Abort
  if (
    rawMsg.includes('timeout') ||
    rawMsg.includes('timed out') ||
    rawMsg.includes('aborted') ||
    rawMsg.includes('etimedout') ||
    error.name === 'AbortError'
  ) {
    return {
      code: 'NETWORK_TIMEOUT',
      isKeyRecoverable: true,
      isModelError: false,
      isProviderRecoverable: true,
      message: `Request timed out: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  // 6. Provider Unavailable / Transient 5xx
  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    rawMsg.includes('service unavailable') ||
    rawMsg.includes('high demand') ||
    rawMsg.includes('overloaded') ||
    rawMsg.includes('econnrefused') ||
    rawMsg.includes('fetch failed')
  ) {
    return {
      code: 'PROVIDER_UNAVAILABLE',
      isKeyRecoverable: true,
      isModelError: false,
      isProviderRecoverable: true,
      message: `AI provider temporarily unavailable: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  // 7. Malformed Output
  if (rawMsg.includes('json') || rawMsg.includes('parse') || rawMsg.includes('schema')) {
    return {
      code: 'MALFORMED_MODEL_OUTPUT',
      isKeyRecoverable: false,
      isModelError: false,
      isProviderRecoverable: true,
      message: `Malformed model output: ${error.message || rawMsg}`,
      originalError: error,
    };
  }

  return {
    code: 'UNKNOWN_PROVIDER_ERROR',
    isKeyRecoverable: true,
    isModelError: false,
    isProviderRecoverable: true,
    message: error.message || rawMsg,
    originalError: error,
  };
}
