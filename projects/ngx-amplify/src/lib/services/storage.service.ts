import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import {  NgxAmplifyConfig, NGX_AMPLIFY_CONFIG, AccessLevelType } from '../common/interfaces/ngx-amplify.config';
import * as AWS from 'aws-sdk';
import * as S3 from 'aws-sdk/clients/s3';
import moment from 'moment';
import { ICognitoException } from '../common/interfaces/common.interface';
import { CognitoException } from '../common/common.resource';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    @Inject(NGX_AMPLIFY_CONFIG) private config: NgxAmplifyConfig,
    private auth: AuthService) { 
    if (!config.storage) {
      throw new TypeError('NgxAmplify:Storage options are not found. Please refer to the README for usage.');
    }
  }

  private get storage() {
    AWS.config.update({
      region: this.config.storage.bucketRegion
    });

    return new S3({
      params: {
        'Bucket': this.config.storage.bucketName,
      },
      region: this.config.storage.bucketRegion
    });
  }

  private isExpired(url:string) {

    let result:boolean;
    let _url = new URL(url);

    if (_url.search === ''){
        result = true;
    } else {
        let param: string = _url.searchParams.get('Expires');
        if (param) {
            result = moment().isAfter(moment.unix(parseInt(param)));
        } else {
            result = false;
        }
    }

    return result;
}

  getFileByUrl(url: string) {
    let self = this;
    let baseUrl = `https://${self.config.storage.bucketName}.s3.amazonaws.com/`;
    let fileKey = url.replace(baseUrl, '');

    return new Promise((resolve, reject) => {
      try {
        if (fileKey === '') {
          resolve(url);
        }
        else if (self.isExpired(url)) {
          self.storage.getSignedUrl('getObject', { Key: fileKey }, (err, url) => {
            if (err) {
              reject(self.handleError(err, 'getSignedUrl'));
            } else {
              resolve(url);
            }
          });
        } else {
          resolve(url);
        }
      } catch (error) {
        reject(self.handleError(error, 'try/catch getSignedUrl'));
      }
    });
  }

  getFile(filename: string, folder?: string): Promise<string> {
    let self = this;

    // File Access Level = "protected" - this prevents unautheticated access to the file.
    let directory = `${self.config.storage.folderLevel}/`;
    if (folder) {
      directory += `${folder}/`;
    }
    let fileKey = `${directory}${filename}`;

    return new Promise((resolve, reject) => {
      try {
        self.storage.getSignedUrl('getObject', { Key: fileKey }, (err, url) => {
          if (err) {
            reject(self.handleError(err, 'getSignedUrl'));
          } else {
            // self.cognitoService.user.cognitoProfile.picture = url;
            resolve(url);
          }
        });
      } catch (error) {
        reject(self.handleError(error, 'try/catch getSignedUrl'));
      }
    });
  }

  upload(file: Blob, filename: string, folder?: string, accessLevel?:AccessLevelType) {
    let self = this;

    // self.config.folderLevel = "protected" - this prevents unautheticated access to the file.
    let directory = '';
    if (accessLevel) {
      directory = `${accessLevel}/`
    } else {
      directory = `${self.config.storage.defaultLevel}/`;
    }
    if (folder) {
      directory += `${folder}/`;
    }

    filename = filename.toLowerCase().replace(/\s+/g, "-")
    if (file.type === 'image/jpeg') {
      filename += '.jpg';
    }
    if (file.type === 'image/png') {
      filename += '.png';
    }
    if (file.type === 'image/tiff') {
      filename += '.tiff';
    }

    let fileKey = `${directory}${filename}`;

    return new Promise((resolve, reject) => {
      try {
        self.storage.upload({
          Bucket: self.config.storage.bucketName,
          Key: fileKey,
          ContentType: file.type,
          ContentEncoding: 'base64',
          Body: file,
          StorageClass: 'STANDARD',
        }, (err, data) => {
          if (err) {
            self.handleError(err, 'error during upload.');
            reject(err);
          } else {
            console.log('successful upload.');
            resolve(data);
          }
        });
      } catch (error) {
        reject(self.handleError(error, 'try/catch upload'));
      }
    });
  }

  list(directory?: string) {
    let self = this;

    return new Promise((resolve, reject) => {
      if (directory) {
        // let directoryKey = encodeURIComponent(directory);
        let param = { Prefix: directory, Delimiter: '/', Bucket: self.config.storage.bucketName };

        self.storage.listObjectsV2(param, (err, data) => {
          if (err) {
            reject(self.handleError(err, 'list'));
          }
          resolve(data);
        })
      } else {
        self.storage.listObjectsV2((err, data) => {
          if (err) {
            reject(self.handleError(err, 'list'));
          }
          resolve(data);
        })
      }
    })
  }

  public static dataURItoBlob(dataURI, type:string) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    let blob = new Blob([new Uint8Array(array)], { type: type });
    return blob;
}

  private handleError(error: any, caller: string) {
    let exception: ICognitoException = new CognitoException(error);
    console.error(`NgxAmplifyStorageSevice::handleError calledBy::${caller}`, exception);
    return exception;
  }
}
