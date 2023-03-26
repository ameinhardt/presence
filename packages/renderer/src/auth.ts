/* eslint-disable camelcase */
interface OpenIdConfig {
  authorization_endpoint: string
  token_endpoint: string
}

export interface Verifier {
  code: string
  nonce: string
  state: string
}

export interface OAuthParameters {
  code?: string
  state: string
  session_state?: string
  error?: string
  error_description?: string
  error_uri?: string
}

interface IdToken {
  'exp': number
  'iat': number
  'auth_time': number
  'jti': string
  'iss': string
  'aud': string
  'sub': string
  'nonce'?: string
  'session_state'?: string
  'sid': string
  'email_verified': boolean
  'email': string

  // keycloak
  'preferred_username'?: string
  'roles'?: Array<string>

  // microsoft
  'given_name'?: string
  'name'?: string
  'oid'?: string
}

export interface AuthInfo {
  id: IdToken
  accessToken: string
  idToken: string
  refreshToken: string
  expiresOn: number
}

type RefreshAuthInfo = Omit<AuthInfo, 'id' | 'idToken'>

interface TokenResponse {
  token_type?: 'Bearer'
  scope?: string
  expires_in?: number | string
  ext_expires_in?: number | string
  access_token: string
  refresh_token: string
  id_token?: string
  client_info?: string
  session_state?: string
  expires_on: string
}

if (typeof import.meta.env.VITE_AUTH_CLIENT_ID !== 'string' ||
typeof import.meta.env.VITE_AUTH_CONFIG !== 'string') { throw new TypeError('not enough auth information'); }

const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID as string,
  AUTH_REDIRECT = import.meta.env.VITE_AUTH_REDIRECT as string || `${location.origin}${location.pathname}`,
  AUTH_CONFIG = import.meta.env.VITE_AUTH_CONFIG as string,
  charBase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  SCOPE = 'offline_access openid email profile',

  openIdConfig: () => Promise<OpenIdConfig> = () => fetch(AUTH_CONFIG).then(response => response.json());

function uuid() {
  const uidBuffer = [...crypto
    .getRandomValues(new Uint8Array(16))];
  uidBuffer[6] = (uidBuffer[6] & 0x0F) | 0x40;
  uidBuffer[8] = (uidBuffer[8] & 0xBF) | 0x80;
  return '4-2-2-2-6'.replace(/\d/g, x => uidBuffer
    .splice(0, +x)
    .map(c => c.toString(16)).join('')
  );
}

function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer),
    byteLength = bytes.byteLength,
    byteRemainder = byteLength % 3,
    mainLength = byteLength - byteRemainder;
  let base64 = '',
    index = 0;

  while (index < mainLength) {
    const chunk = (bytes[index++] << 16) | (bytes[index++] << 8) | bytes[index++]; // 3 bytes
    base64 += // to 4 characters
      charBase[chunk >> 18 & 0x3F] +
      charBase[chunk >> 12 & 0x3F] +
      charBase[chunk >> 6 & 0x3F] +
      charBase[chunk & 0x3F];
  }
  if (byteRemainder === 1) {
    const chunk = bytes[mainLength];
    base64 += charBase[chunk >> 2] + charBase[(chunk << 4) & 0x3F]; // + '==';
  } else if (byteRemainder === 2) {
    const chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    base64 += charBase[chunk >> 10] + charBase[(chunk >> 4) & 0x3F] + charBase[(chunk << 2) & 0x3F]; // + '=';
  }
  return base64;
}

function parseToken(tokenString: string): IdToken {
  let bodyString = tokenString.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  while (bodyString.length % 4) { bodyString += '='; }

  return JSON.parse(decodeURIComponent(atob(bodyString)));
}

export function generateVerifier(): Verifier {
  const verifierBase = charBase.slice(0, -2),
    codeVerifierBuilder = [],
    randoms = crypto.getRandomValues(new Uint8Array(96));
  for (const random of randoms) { codeVerifierBuilder.push(verifierBase[random % verifierBase.length]); }

  return {
    code: codeVerifierBuilder.join(''), // to avoid downgrading and sidestepping
    nonce: uuid(), // for the token
    state: uuid() // for the code callback
  };
}

export async function getAuthUrl({ code: codeVerifier, nonce, state }: Verifier, scope = SCOPE) {
  // see https://github.com/keycloak/keycloak/blob/cf386efa40034ad788c265520316a1c30dfe30da/adapters/oidc/js/src/keycloak.js#L422
  const parameters = new URLSearchParams(),
    codeChallenge = base64ArrayBuffer(await crypto.subtle.digest('SHA-256', (new TextEncoder()).encode(codeVerifier)));
  parameters.append('client_id', AUTH_CLIENT_ID);
  parameters.append('scope', scope);
  parameters.append('redirect_uri', AUTH_REDIRECT);
  // "client-request-id": "c3e42670-d1ed-47e4-8194-10f17037c1b3",
  parameters.append('response_mode', 'query'); // fragment
  parameters.append('response_type', 'code'); // authorization code flow
  parameters.append('nonce', nonce); // optional for standard authorization code flow, required for implicit/hybrid
  parameters.append('state', state);

  /* pkce */
  parameters.append('code_challenge', codeChallenge);
  parameters.append('code_challenge_method', 'S256');

  const config = await openIdConfig();
  return `${config.authorization_endpoint}?${parameters.toString()}`;
}

async function postTokenEndpoint(parameters: URLSearchParams): Promise<TokenResponse> {
  const config = await openIdConfig(),
    response = await fetch(`${config.token_endpoint}`, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site'
      },
      // referrer: 'https://developer.microsoft.com/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: parameters.toString(),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit'
    }),
    data: TokenResponse = await response.json();
  if (response.status !== 200) {
    const error = new Error(response.status.toString());
    error.cause = data;
    throw error;
  }
  // console.debug('auth response body', data);
  // return data as TokenTripple
  return data;
}

export async function getToken(routeParameters: OAuthParameters, { code: codeVerifier, state, nonce }: Verifier): Promise<AuthInfo> {
  // console.debug('getting token');
  /*
  const parameterNames = ['code', 'state', 'session_state', 'error', 'error_description', 'error_uri'] as Array<keyof OAuthParameters>, ;
  */
  if (routeParameters.error) {
    console.error(`Auth error: ${routeParameters.error}, ${routeParameters.error_description}`);
    throw new Error(routeParameters.error);
  }
  if (!routeParameters.code || !routeParameters.state) {
    throw new Error('missing code or state');
  }

  if (routeParameters.state !== state) {
    throw new Error('state does\'t match');
  } else {
    // console.debug('state matches');
  }

  const parameters = new URLSearchParams();
  parameters.append('client_id', AUTH_CLIENT_ID);
  parameters.append('redirect_uri', AUTH_REDIRECT);
  parameters.append('scope', SCOPE);
  parameters.append('code', routeParameters.code);
  parameters.append('code_verifier', codeVerifier);
  parameters.append('grant_type', 'authorization_code');
  parameters.append('resource', 'https://graph.microsoft.com/');
  // console.debug('sending token request');

  const { access_token, refresh_token, id_token, expires_on } = await postTokenEndpoint(parameters);
  let id: IdToken | undefined;
  try {
    if (!id_token) { throw Error; }

    id = parseToken(id_token);
  } catch {
    throw new Error('can\'t decode id tokens');
  }
  if (id?.nonce !== nonce) {
    throw new Error('nonce don\'t match!');
  } else {
    // console.debug('nonce matches');
  }

  return {
    id,
    accessToken: access_token,
    refreshToken: refresh_token,
    idToken: id_token,
    expiresOn: Number.parseInt(expires_on, 10)
  };
}

export async function refresh(refreshToken: string, scope = SCOPE): Promise<RefreshAuthInfo> {
  // console.debug('refreshing token');
  const parameters = new URLSearchParams();
  parameters.append('grant_type', 'refresh_token');
  parameters.append('refresh_token', refreshToken);
  parameters.append('client_id', AUTH_CLIENT_ID);
  parameters.append('scope', scope);

  // console.debug('sending token refresh request');
  const { access_token, refresh_token, expires_on } = await postTokenEndpoint(parameters);

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresOn: Number.parseInt(expires_on, 10)
  };
}
/* eslint-enable camelcase */
