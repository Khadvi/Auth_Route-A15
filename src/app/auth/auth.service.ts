import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Subject, tap, throwError } from "rxjs";
import { User } from "./user.model";

export interface AuthResponseData {
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    register?: boolean
}

@Injectable({ providedIn: 'root' })

export class AuthService {

    user = new BehaviorSubject<User | null>(null);

    constructor(private http: HttpClient) { }

    signup(email: string, pass: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDKwFLAg85zsYJLe3BTvf5L_hqiDcGsy9w',
            {
                email: email,
                password: pass,
                retuenSecureToken: true
            }).pipe(catchError(this.errorHandler), tap(respData => {
                return this.handleAuthentication(respData.email, respData.localId, respData.idToken, +respData.expiresIn);
            }))
    }

    login(email: string, pass: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDKwFLAg85zsYJLe3BTvf5L_hqiDcGsy9w',
            {
                email: email,
                password: pass,
                returnSecureToken: true
            }).pipe(catchError(this.errorHandler), tap(respData => {
                return this.handleAuthentication(respData.email, respData.idToken, respData.localId, +respData.expiresIn);
            }))
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user)
    }

    private errorHandler(errorRes: HttpErrorResponse) {
        console.log(errorRes);
        let errorMes = 'An Unknow error Occurred'
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMes);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMes = 'User already Exists'
                break;
            case 'EMAIL_NOT_FOUND':
                errorMes = 'This Email does not Exists'
                break;
            case 'INVALID_PASSWORD':
                errorMes = 'Password is Incorrect'
                break;
            case 'INVALID_LOGIN_CREDENTIALS':
                errorMes = 'Incorrect Email or Password'
        }
        return throwError(errorMes);
    }

}