import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { User, Feedback } from '@app/_models';
import { AlertService, UserService, AuthenticationService } from '@app/_services';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  currentUser: User;
  currentUserSubscription: Subscription;
  feedbacks: Feedback[] = [];

  feedbackForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private alertService: AlertService,
      private authenticationService: AuthenticationService,
      private userService: UserService
  ) {
      this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
          this.currentUser = user;
      });
  }

  ngOnInit() {
    this.feedbackForm = this.formBuilder.group({
      feedback: ['', Validators.required],
      username: ['', Validators.required]
    });
    this.loadAllFeedbacks();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  // convenience getter for easy access to form fields
  get f() { return this.feedbackForm.controls; }

  private loadAllFeedbacks() {
    this.userService.getAllFeedback().pipe(first()).subscribe(feedbacks => {
        this.feedbacks = feedbacks;
    });
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.feedbackForm.invalid) {
        return;
    }

    this.loading = true;
    this.userService.giveFeedback(this.feedbackForm.value)
        .pipe(first())
        .subscribe(
            data => {
                this.alertService.success('Submission successful', true);
                this.router.navigate(['/feedback']);
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
  }
}
