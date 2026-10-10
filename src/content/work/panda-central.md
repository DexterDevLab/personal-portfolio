---
title: Panda Central
summary: A web app my designer colleague and I use to manage our client WordPress sites from one dashboard, with updates, monitoring, and client reports.
tagline: Internal app for managing client WordPress sites
role: Planning and development, with substantial AI assistance
stack: [Next.js, TypeScript, BullMQ, Postgres]
screenshot: ../../assets/projects/panda-central.jpg
screenshotAlt: Panda Central dashboard showing the managed-sites overview, queue health, sites requiring updates, and a recent activity log.
liveUrl: https://manager.pandavisuals.cloud/
order: 1
featured: true
caseStudy: true
status: in-progress
statusLabel: In daily use, actively developed
---

## Overview

Panda Central is a self-hosted web application for managing the WordPress sites my designer colleague and I look after for clients. Instead of logging into each site's admin to check for plugin updates, run a backup, or see whether something broke, we open one dashboard that shows the whole fleet.

It is an internal tool, login-gated, and in daily use. It is also still growing: we are currently adding a support system so client requests land in the same place as the sites they belong to.

## The problem

Every WordPress site needs the same recurring care: core, plugin, and theme updates; backups; checking that it is still up; and a periodic summary for the client. Across a growing number of sites, doing that by hand through each site's dashboard means a lot of logins, a lot of tabs, and a real chance of missing one.

We wanted a single place that answers "which sites need attention right now?" and lets us act on it without leaving the page.

## My role and how we worked

The idea came out of our own maintenance routine; my colleague and I shaped it together. I planned the application and did the development: the data model, the job queue, the WordPress connector, and the dashboard itself.

A large part of that development was AI-assisted. I used AI tools heavily for prompting through implementation, exploring approaches, and generating code that I then reviewed, tested, and adjusted. I did not hand-write every line, and I don't claim to have. What I did do was decide what to build, how the pieces fit, what was acceptable to ship, and what to fix when it didn't work.

## What it does

The dashboard above is the overview screen. From the current build and the existing product description, Panda Central covers:

- **Fleet overview.** Every managed site, its connection status, and how many core, plugin, and theme updates are pending.
- **Updates.** Updates run as background jobs through a queue, in batches, with per-site results recorded. The overview shows queue health so a stuck or failing job is visible immediately.
- **History and notifications.** Every action and failure is logged against the site it belongs to, and failures surface as notifications.
- **Clients and reports.** Sites are grouped by client, and the platform generates reports for them.
- **Backups and monitoring.** Backups, uptime checks, and vulnerability monitoring are part of the platform's feature set as previously described on this site; the screenshot above focuses on the update workflow.

## Technical decisions

- **Next.js and TypeScript** for the application, so the dashboard and its API live in one codebase with shared types.
- **Postgres** as the system of record for sites, clients, jobs, and history.
- **BullMQ** for background work. Talking to dozens of WordPress sites is slow and unreliable by nature, so updates and diagnostics run as queued jobs with retries rather than inside a request. The queue-health panel on the overview exists because this was the part most likely to misbehave.
- **A connector on each WordPress site** that the platform talks to, so a site can be managed without sharing its admin login.

## Status and what's next

Panda Central is in daily use for our own client sites. The update, history, notification, and client/report workflows are built and used. The support system is in progress and not yet complete. Because it is an internal tool, there are no public usage numbers to share, and I would rather not invent any.

If you need something similar, an internal tool that replaces a manual routine, that is the kind of project I enjoy most.
