import { Injectable, Inject } from '@angular/core';
import { NgxAmplifyConfig, NGX_AMPLIFY_CONFIG } from '../common/interfaces/ngx-amplify.config';
import * as AWS from 'aws-sdk';
import { ICognitoUserPoolData, CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession, CognitoUserAttribute, ICognitoUserAttributeData, UserData, ISignUpResult } from 'amazon-cognito-identity-js';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CognitoException, CognitoProfile, AuthUser } from '../common/common.resource';
import { IAuthState, IAuthUser, ICognitoCredentials, ICognitoException, ICognitoSignUpCredentials, ICognitoProfile, IAuthUserState } from '../common/interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private poolData: ICognitoUserPoolData;
  private session: CognitoUserSession;
  private userPool: CognitoUserPool;
  private unauthCreds: any;
  private resetting: boolean = false;

  private authState: BehaviorSubject<IAuthState> = new BehaviorSubject({ state: 'signedOut', user: null });
  authState$: Observable<IAuthState> = this.authState.asObservable();

  private authUserState: BehaviorSubject<IAuthUserState> = new BehaviorSubject({ state: 'signedOut', user: null });
  authUserState$: Observable<IAuthUserState> = this.authUserState.asObservable();

  private cognitoUserSub: BehaviorSubject<CognitoUser> = new BehaviorSubject(null);
  cognitoUser$: Observable<CognitoUser> = this.cognitoUserSub.asObservable();
  cognitoUser: CognitoUser;
  user: IAuthUser;

  constructor(
    @Inject(NGX_AMPLIFY_CONFIG) private config: NgxAmplifyConfig
  ) { 
    AWS.config.region = this.config.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.config.identityPoolId
    });

    this.poolData = { UserPoolId: config.userPoolId, ClientId: this.config.appId };
    this.userPool = new CognitoUserPool(this.poolData);
    this.user = AuthUser.Factory();
    // this.authUserState.next({ state: 'signedOut', user: this.user });
    // this.refreshOrResetCreds();
    this.currentAuthUser();
  }

  private authDetails(creds: ICognitoCredentials): AuthenticationDetails {
    return new AuthenticationDetails({ Username: creds.username, Password: creds.password });
  }

  private buildCreds() {
    let self = this;
    let json = self.buildLogins(self.session.getIdToken().getJwtToken());
    return new AWS.CognitoIdentityCredentials(json);
  }

  private buildLogins(token) {
    let self = this;
    let key = `${self.config.idpUrl}/${self.config.userPoolId}`;
    let json = { IdentityPoolId: self.config.identityPoolId, Logins: {} };
    json.Logins[key] = token;
    return json;
  }

  private handleError(error: any, caller: string) {
    let exception: ICognitoException = new CognitoException(error);
    console.error(`AWS Cognito Service::handleError callerMethod::${caller}`, exception);
    return exception;
  }

  private getCurrentUser(): CognitoUser {
    return this.userPool.getCurrentUser();
  }

  private getCognitoAttributes(
    profile: ICognitoSignUpCredentials | ICognitoProfile
  ) {
    let cognitoAttributes: CognitoUserAttribute[] = [];

    for (let key in profile) {
      if (!key.includes("password") && !key.includes("confirmPassword")) {
        let attribute: CognitoUserAttribute;
        if (key.includes("username")) {
          attribute = new CognitoUserAttribute({
            Name: "preferred_username",
            Value: profile[key]
          });
        } else if (key.endsWith("__c")) {
          let k = key.substring(0, key.length - 3);
          let name = `custom:${k}`;
          attribute = new CognitoUserAttribute({
            Name: name,
            Value: profile[key]
          });
        } else {
          attribute = new CognitoUserAttribute({
            Name: key,
            Value: profile[key]
          });
        }
        cognitoAttributes.push(attribute);
      }
    }
    return cognitoAttributes;
  }

  private getCognitoUser(creds: ICognitoCredentials): CognitoUser {
    let self = this;
    let result: CognitoUser = new CognitoUser({ Username: creds.username, Pool: self.userPool });
    return result;
  }

  getJwtToken(): string {
    let self = this;
    let user = self.getCurrentUser();
    let token: string;
    
    if (user !== null) {
       token = user.getSignInUserSession().getAccessToken().getJwtToken();
    }
    return token;
  }

  getCognitoProfile(
    attributes: CognitoUserAttribute[] | ICognitoUserAttributeData[],
  ): CognitoProfile {
    let dynObj: ICognitoProfile = CognitoProfile.Factory();
    let values: any = attributes;

    (values as ICognitoUserAttributeData[]).forEach(attr => {
      if (attr.Name.startsWith('custom:')) {
        let attributeName = attr.Name.substring(7);
        dynObj[attributeName + '__c'] = attr.Value;
      } else {
        dynObj[attr.Name] = attr.Value;
      }
    });
    let result = new CognitoProfile(dynObj);
    return result;
  }

  private setCognitoProfile(cognitoUser: CognitoUser): Promise<ICognitoProfile> {
    let self = this;
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) {
        reject(null);
      } else {
        cognitoUser.getUserData((err: Error, result: UserData) => {
          if (err) {
            reject(self.handleError(err, 'setCognitoProfile'));
          }
          let dynObj: ICognitoProfile = self.getCognitoProfile(result.UserAttributes);
          if (dynObj.sub){
            self.user.identityId = dynObj.sub;
          }
          self.user.cognitoProfile = dynObj;
          resolve(dynObj);
        });
      }
    });
  }

  updateCognitoProfile(attributes: ICognitoUserAttributeData[]): Promise<ICognitoProfile> {
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {
       self.cognitoUser.updateAttributes(attributes, async (err, result) => {
        if (err) {
          reject(self.handleError(err, 'updateAttributes'));
        }
        self.setCognitoProfile(self.cognitoUser)
          .then((profile) => {
            resolve(profile);
          })
          .catch((error) => {
            reject(self.handleError(error, 'setCognitoProfile'));
          });
      });

      } catch (error) {
        reject(self.handleError(error, 'try/catch updateCognitoProfile'));
      }
    });
  }

  private resetCreds (clearCache:boolean = false) {
    console.log('Resetting credentials for unauth access');
    this.resetting = true;
    AWS.config.region = this.config.region;
    this.cognitoUser = null;
    this.cognitoUserSub.next(null);
    this.unauthCreds = this.unauthCreds || new AWS.CognitoIdentityCredentials({ IdentityPoolId: this.config.identityPoolId });
    if (clearCache){ this.unauthCreds.clearCachedId() }
    this.setCredentials(this.unauthCreds);
    this.resetting = false;
  }

  async currentAuthUser(): Promise<IAuthUser> {
    let self = this;

    let user = this.userPool.getCurrentUser();
    if (user !== null) {
      await this.refreshSession();
    } /* else {
      self.authState.next({state: 'signedOut', user: user });
      self.cognitoUserSub.next(user);
      self.authUserState.next({ state: 'signedOut', user: self.user });
    } */
    return self.user;
  }

  async refreshOrResetCreds() {
    this.cognitoUser = this.userPool.getCurrentUser();

    if (this.cognitoUser !== null) {
      if (this.cognitoUser.getSignInUserSession() === null) {
        let session = await this.refreshSession();
      }
    } else {
      this.resetCreds();
    }
  }

  private refreshSession (user?:CognitoUser): Promise<CognitoUserSession> {
    let self = this;
    if (user === undefined) {
      user = this.userPool.getCurrentUser();
    }
    self.cognitoUser = user; // Object.assign({},user, self.cognitoUser); 
    // console.log('self.user on refresh', self.cognitoUser);
    // self.session = user.;
    if (self.session && self.session.isValid) {
      // console.log('using the current session already refreshed..');
      self.cognitoUser.setSignInUserSession(self.session);
      return new Promise(async(resolve) => {
        await self.saveCreds(self.cognitoUser, self.session);
        resolve(self.session)
      });
    } else {

      return self.cognitoUser.getSession(async (err, session: CognitoUserSession) => {
        if (err) { console.log('Error refreshing user session', err); return err; }
        console.log(`${new Date()} - Refreshed session for ${self.cognitoUser.getUsername()}. Valid?: `, session.isValid());
        self.session = session;
        self.cognitoUser.setSignInUserSession(session);
        await self.saveCreds(self.cognitoUser, session);
        return session;
      })
    }
  }

  async saveCreds(cognitoUser?:CognitoUser, session?: CognitoUserSession) {
    let self = this;

    if (session) {
      self.session = session;
      self.user.authenticated = session.isValid();
      self.authState.next({state: 'signedIn', user: cognitoUser });
    } 
    if (cognitoUser) {
      self.cognitoUser = cognitoUser;
      self.user.cognitoUser = cognitoUser;
      self.authState.next({state: 'signedIn', user: cognitoUser });
      self.cognitoUserSub.next(cognitoUser);
      self.user.cognitoProfile = CognitoProfile.Factory();
      await self.setCognitoProfile(cognitoUser);
      self.authUserState.next({ state: 'signedIn', user: self.user });
    }

    self.setCredentials(self.buildCreds());

    return self.user;
  }

  private setCredentials(creds) {
    AWS.config.credentials = creds;
  }

  signIn(creds: ICognitoCredentials): Promise<IAuthUser> {
    let self = this;

    let cognitoUser = self.getCognitoUser(creds);

    return new Promise((resolve, reject) => {
      try {
        cognitoUser.authenticateUser(self.authDetails(creds), {
          onSuccess: async(session: CognitoUserSession) => {
            // console.log(`Signed in user ${cognitoUser.getUsername()}. Sessiong valid?: `, session.isValid());
            let user = await self.saveCreds(cognitoUser, session);
            resolve(user);
          },
          onFailure: (err: any) => {
            reject(self.handleError(err, 'signIn'))
          },
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            cognitoUser.completeNewPasswordChallenge(creds.password, requiredAttributes, {
              onSuccess: async(session: CognitoUserSession) => {
                let aws_creds: AWS.CognitoIdentityCredentials;
                aws_creds = new AWS.CognitoIdentityCredentials(self.buildLogins(session.getIdToken().getJwtToken()));
                let user = await self.saveCreds(cognitoUser, session);
                resolve(user);
              },
              onFailure: (err: any) => {
                reject(self.handleError(err, 'completeNewPasswordChallenge'));
              }
            })
          },
          mfaRequired: (challengeName, challengeParameters) => {},
          customChallenge: (challengeParameters) => {},
        })
      } catch (error) {
        reject(error);
      }
    });
  }

  signUp(creds: ICognitoSignUpCredentials): Promise<ISignUpResult> {
    let self = this;
    // creds.member_since__c = moment().year().toString();
    return new Promise((resolve, reject) => {
      try {
        let attributes: CognitoUserAttribute[] = [];
        attributes = self.getCognitoAttributes(creds);
        return self.userPool.signUp(creds.username, creds.password, attributes, null, (err: Error, result) => {
          if (err) {
            reject(self.handleError(err, 'signUp'));
          } else {
            // console.log('signUp registration successful', result);
            resolve(result);
          }
        });
      } catch (error) {
        reject(self.handleError(error, 'try/catch signUp'));
      }
    });
  }

  confirmSignUp(username: string, code: string): Promise<any> {
    let self = this;

    let userData = {
      Username: username,
      Pool: self.userPool
    };

    let cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      try {
        cognitoUser.confirmRegistration(code, true, ((err, result) => {
          if (err) {
            reject(self.handleError(err, 'confirmRegistration'));
          } else {
            // console.log('confirm registration successful', result);
            resolve(result);
          }
        }))
      } catch (error) {
        reject(this.handleError(error,'try/catch confirm signUp'));
      }
    });
  }

  confirmPassword(username: string, verificationCode: string, password:string) {
    let self = this;

    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      try {
        cognitoUser.confirmPassword(verificationCode, password, {
          onFailure: (err) => {
            reject(self.handleError(err, 'confirmPassword'));
          },
          onSuccess: () => {
            resolve('Confirm Password SUCCESS');
          }
        })
      } catch (error) {
        reject(self.handleError(error, 'try/catch confirmPassword'));
      }
    });
  }

  forgotPassword(username:string) {
    let self = this;

    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new CognitoUser(userData);

    return new Promise((resolve,reject)=> {
      try {
        cognitoUser.forgotPassword({
          onFailure: (err) => {
            reject(self.handleError(err, 'forgotPassword'));
          },
          onSuccess: () => {
            resolve('Verification Code Sent');
          },
          inputVerificationCode: () => {
            resolve('Verification Code Sent');
          }
        })
      } catch (err) {
         reject(self.handleError(err,'try/catch forgotPassword'));
      }
    });
  }

  resendConfirmationCode(username: string) {
    let self = this;

    let userData = {
      Username: username,
      Pool: this.userPool
    };

    let cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      try {
        cognitoUser.resendConfirmationCode((err, result) => {
          if (err) {
            // let exception: ICognitoException = self.handleError(err,'resendConfirmationCode');
            // console.log('error occurred while confirming registration code', exception);
            reject(self.handleError(err, 'resendConfirmationCode'));
          } else {
            // console.log('confirm registration successful', result);
            resolve(result);
          }
        });
      } catch (error) {
        // let exception: ICognitoException = self.handleError(error,'try/catch resendConfirmationCode');//new CognitoException(error);
        reject(self.handleError(error, 'try/catch resendConfirmationCode'));
      }
    });

  }


  signOut(): Promise<string> {
    let self = this;
    
    if (self.cognitoUser) {
      let username = self.cognitoUser.getUsername();

      return new Promise((resolve, reject) => {
        try {
          self.cognitoUser.signOut();
          self.cognitoUserSub.next(null);
          self.authState.next({state:'signedOut', user: null });
          self.resetCreds(true);
          self.user = AuthUser.Factory();
          self.authUserState.next({state: 'signedOut', user: null });
          resolve('signOut successful');
        } 
        catch (error) {
          reject(self.handleError(error, 'try/catch signOut'));
        }
      })
    }
  }
}
