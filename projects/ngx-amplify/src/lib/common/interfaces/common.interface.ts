import { CognitoUser } from 'amazon-cognito-identity-js';

export type IAuthStateOptions = 'signedOut' | 'signedIn';

export interface IAuthCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
}

export interface IAuthUser {
    identityId: string;
    authenticated: boolean;
    authCredentials?: IAuthCredentials,
    cognitoProfile?: ICognitoProfile,
    cognitoUser?: CognitoUser,
}

export interface IAuthState {
    state: IAuthStateOptions,
    user: CognitoUser
}

export interface IAuthUserState {
    state: IAuthStateOptions,
    user: IAuthUser
}

export interface IAuthResponse {
    session_key: boolean;
    accessToken: string;
    expiresIn: number;
    sig: string;
    secret: string;
    userID: string;
}

export interface ICognitoConfigOptions {
    region: string;
    userPoolId: string;
    appId: string;
    idpUrl?: string;
    identityPoolId?: string;
}

export interface ICognitoException {
    code: string;
    columnNumber?: number;
    fileName?: string;
    lineNumber?: number;
    message: string;
    name?: string;
    originalError?: ICognitoException;
    requestId: string;
    retryDelay: number;
    retryable: boolean;
    statusCode: number;
    time: Date;
}

export interface ICognitoCredentials {
    email?: string;
    username: string;
    password: string;
}

export interface ICognitoChangePassword {
    oldPassword: string;
    newPassword: string;
}

export interface ICognitoSignUpCredentials extends ICognitoCredentials, ICognitoProfile { }

export interface ICognitoAddress {
    fomatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
}

export interface ICognitoProfile {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    middle_name?: string;
    nickname?: string;
    preferred_username?: string;
    profile?: string;
    picture?: string;
    website?: string;
    email?: string;
    email_verified?: boolean;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    address?: ICognitoAddress | string;
    updated_at?: number;
    member_since__c?: number | string;
    country_code__c?: number | string;
    lead_id__c?: string;
    contact_id__c?: string;
}