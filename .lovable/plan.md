

# University Canvas of Bangladesh — Anonymous Feedback Platform

## Overview
A professional landing page for the "University Canvas of Bangladesh" club featuring an anonymous feedback system with an admin dashboard for managing responses.

## Pages & Features

### 1. Landing Page (`/`)
- **Hero Section**: Organization logo (uploaded image), club name "University Canvas of Bangladesh", tagline, and a brief description encouraging anonymous feedback
- **Feedback Form**: Clean card-based form with a text area for anonymous feedback and a submit button. No personal info collected — fully anonymous
- **Footer**: Organization branding and social links

### 2. Admin Dashboard (`/admin`)
- **Login Gate**: Simple password-protected access page (email + password login via Supabase Auth)
- **Feedback List**: Table view of all submitted feedback with timestamps
- **Export**: Download all feedback as CSV/Excel
- **Email Notifications**: Admin receives email when new feedback is submitted

## Design
- **Color Palette**: Navy blue (`#1B2A4A`) primary color matching the logo, with clean whites and subtle grays
- **Typography**: Professional, clean font hierarchy
- **Logo**: Prominently displayed in the hero section
- **Overall Feel**: Modern, trustworthy, institutional — encourages honest feedback

## Data Storage
- Supabase database to store feedback entries (message + timestamp only — no user identification)
- Supabase Auth for admin login
- Edge function for email notifications on new submissions

## Key UX Details
- Success toast after submitting feedback
- "Your feedback is 100% anonymous" reassurance near the form
- Responsive design for mobile and desktop
- Custom page title and favicon matching the organization

