import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'];
  if (requiredRole) {
    if (requiredRole === 'BUYER' && !auth.isBuyer) {
      router.navigate(['/seller/dashboard']);
      return false;
    }
    if (requiredRole === 'SELLER' && !auth.isSeller) {
      router.navigate(['/']);
      return false;
    }
  }
  return true;
};
