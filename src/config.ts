// Hardcoded token — replace when real auth is added
export const BEARER_TOKEN =
  'eyJhbGciOiJSUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJvcmdhbml6YXRpb24iOiI2OTkyZjllNzdhNzJkNWI3MmNhZjUwZDciLCJuYW1lIjoiTmVlcnUgTmFyYW5nIiwiYWN0aXZlIjp0cnVlLCJ1c2VySWQiOiI2OWE2NmNiZTlkZDZhNzkwNWEwNWE5YjMiLCJlbWFpbCI6Ik5lZXJ1Lm5hcmFuZ0BhaW9ub3MuYWkiLCJzdWIiOiI2OWE2NmNiZTlkZDZhNzkwNWEwNWE5YjMiLCJqdGkiOiJhYTMxZjIxNC1hYmY3LTQ4MjctYTkyOS0zZGE2YjE5NWRlNmUiLCJpYXQiOjE3NzUxMDQ0MDYsImV4cCI6MTc3NTM2MzYwNn0.h7oeznmmjGqJJsXXwHCjca__8m4PHs4r9rRWe88gZx4ODyUh26odD0oOCMkQ8Vq6UE1RYPkf1e82QkfRJPcpa5ZrCjLkSflqt3lPP1m71liWGOKjjeJtXbwU4o6RDL3TkfwMKnHeqYkDrE41uQkc1lRPA5_KsHSNFHM80avbzGwdxhR4VVq33UqTmztDxwmN2_rZYGV03UOFKGxxn2Y59CJ1fL80WUqvxC24aEFfo37W_bDL5QVwlN9-qLhluxXA4exzQP8q5s0SOAfmd1j6uH38T-vxxqWKc9wvfg0NXl3U51oj1ZbRFDF2Nl0RvSOROEuxT9aYmzOuhhGzQuySUw';

export const AUDIT_CATEGORY = 'voicebot_auth_key';

export const INTENT_OPTIONS = [
  { value: 'one_way_booking', label: 'One Way Booking' },
  { value: 'round_trip_booking', label: 'Round Trip Booking' },
  { value: 'multicity_booking', label: 'Multicity Booking' },
  { value: 'manage_booking', label: 'Manage Booking' },
  { value: 'booking_using_miles', label: 'Booking Using Miles' },
  { value: 'government_booking', label: 'Government Booking' },
  { value: 'student_booking', label: 'Student Booking' },
  { value: 'faq', label: 'FAQ' },
  { value: 'status_enquiry', label: 'Status Enquiry' },
  { value: 'cancellation', label: 'Cancellation' },
  { value: 'refund', label: 'Refund' },
  { value: 'multiple_passenger', label: 'Multiple Passenger' },
  { value: 'other', label: 'Other' },
];
