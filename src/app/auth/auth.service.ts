import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Subject, tap, throwError } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";

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
    private userTimer: any;

    constructor(private http: HttpClient, private route: Router) {}

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
        this.user.next(user);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    autoLogin() {
        const userDataRaw = localStorage.getItem('userData');
        let userData : { email: string, id: string, _token: string, _tokenExpirationDate: string };
        if(!userDataRaw) {
            return;
        }
        userData = JSON.parse(userDataRaw);
        
        const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

        if (loadedUser.token) {
            this.autoLogout()
            this.user.next(loadedUser);
            console.log('Auto Login');
        }
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

    logout() {
        this.user.next(null);
        this.route.navigate(['/auth']);
        localStorage.removeItem('userData');
        if(this.userTimer) {
            clearTimeout(this.userTimer);
        }
        this.userTimer = null;
    }

    autoLogout() {
        this.userTimer = setTimeout(() => {
            this.user.next(null);
            this.route.navigate(['/auth']);
            console.log('Auto Logout');
        }, 9000);
    }

}