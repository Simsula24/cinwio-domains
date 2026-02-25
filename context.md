# Project Context: Domain Management Platform For Cinwio.com (cinwio-domains)

## Overview

This project is a full‑stack web platform that allows clients to:

- Search for domain availability
- Purchase domains via Name.com API
- Register domains to their account
- Transfer domains from other registrars
- Manage DNS via Cloudflare API
- View and manage their owned domains

The platform acts as a reseller interface and domain management dashboard.

---

## Goals

Primary goals:

1. Integrate Name.com API for domain operations
2. Integrate Cloudflare API for DNS and zone management
3. Provide clean client dashboard
4. Provide secure authentication and account isolation
5. Automate provisioning (domain purchase → Cloudflare zone → DNS setup)
6. Make the system scalable and maintainable

Secondary goals:

- Admin panel
- Billing integration (future)
- Audit logs

---

## External APIs

### Name.com API

Used for:

- Domain availability check
- Domain registration
- Domain transfer
- Domain renewal
- Domain listing

Docs:
https://docs.name.com/docs/api-reference

---

### Cloudflare API

Used for:

- Create zones
- Manage DNS records
- Assign domains to Cloudflare

Docs:
https://api.cloudflare.com/

---

## Core Features

### User Features

- Register account
- Login/logout
- View owned domains
- Search domain availability
- Purchase domain
- Transfer domain
- View domain details
- Manage DNS records
- And more

### Admin Features

- View all users
- View all domains
- View logs
- Manage system configuration

---

## UI Pages

Public:

- Landing page
- Login
- Register

Private:

- Dashboard
- Domain list
- Domain details
- DNS editor

Admin:

- Admin dashboard

---

## Important Constraints

- Never expose Name.com or Cloudflare credentials to frontend
- All domain operations must go through backend
- Maintain strict user ownership of domains
- Ensure reliability and error handling

---

## Future Features

- Billing integration (Stripe)
- Automatic renewal
- Email notifications
- Multi‑tenant support

---

## Summary

This system is a domain reseller and management platform built on Name.com and Cloudflare APIs, with secure authentication, scalable backend, and modern frontend dashboard.
