import { Component } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { iUser } from '../../interfaces/i-user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  users:iUser[] = []

  constructor(private userSvc: UsersService){}
  ngOnInit(): void {
    this.userSvc.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

}
