import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';;

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements CanActivate {
  constructor(private route: Router){

  }
  canActivate() {
    if(document.cookie != ""){
      return true;
    }else{
      this.route.navigate(["/login"]);
      return false;
    }
  }

}
