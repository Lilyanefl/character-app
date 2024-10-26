import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthsrvService } from '../authsrv.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  formvalid = false;
  errorMessage: string | null = null;

  constructor(
    private authSvc: AuthsrvService,
    private router: Router,
    private formb: FormBuilder
  ) {
    this.form = this.formb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  register() {
    if (this.form.valid) {
      this.authSvc.register(this.form.value).subscribe(
        (res) => {
          console.log('Registrazione andata a buon fine');
          this.router.navigate(['auth/']);
        },
        (error) => {
          console.error('Login failed', error);
          this.errorMessage =
            'Registrazione fallita. probabilmente la tua email è già in uso.';
        }
      );
    } else {
      this.formvalid = true;
      console.log('not valid');
    }
  }
}
