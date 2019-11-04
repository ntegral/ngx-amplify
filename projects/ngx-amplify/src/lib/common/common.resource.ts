import { IAuthUser, IAuthCredentials, ICognitoProfile, ICognitoException, ICognitoAddress } from './interfaces';
import { CognitoUser } from 'amazon-cognito-identity-js';

export class AuthUser implements IAuthUser {
    identityId: string;
    authenticated: boolean;
    authCredentials?: IAuthCredentials;
    cognitoProfile?: ICognitoProfile;
    cognitoUser?: CognitoUser;

    constructor(values?: {}) {
        if (values) {
            this.set(values);
        } else {
            this.init();
        }
    }

    static Factory() {
        return new AuthUser();
    }

    init() {
        this.identityId = '';
        this.authenticated = false;
    }

    set(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class CognitoException implements ICognitoException {
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

    constructor(values:Object = {}){
        Object.assign(this, values);
    }
}

export class CognitoProfile implements ICognitoProfile {
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
    address?: string | ICognitoAddress;
    updated_at?: number;
    member_since__c?: string | number;
    country_code__c?: string | number;
    lead_id__c?: string;
    contact_id__c?: string;

    constructor(values:Object = {}){
        Object.assign(this, values);
    }

    static Factory() {
        let init:ICognitoProfile = {sub:''};
        return new CognitoProfile(init);
    }
}