import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>> {
    let token = this.auth.getJwtToken();
    return this.addToken(req,next,token);
  }

  private addToken(req: HttpRequest<any>, next: HttpHandler, token: string) {
    let alteredReq = req;
    // HttpHeader object is immutable
    const header: { [name: string]: string | string[] } = {};

    for (let key of req.headers.keys()) {
      header[key] = req.headers.getAll(key);
    }
    if (token !== '') {
      header["Authorization"] = `Bearer ${token}`;
    }
    header["Content-Type"] = "application/json";

    let alterdHeader = new HttpHeaders(header);
    alteredReq = req.clone({
      headers: alterdHeader
    });

    return next.handle(alteredReq);
  }
}
