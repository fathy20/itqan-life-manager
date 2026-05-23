# Itqan CRS

CRS here means Creative Reference Sheet: a small reference file for the product direction, UI rules, and external inspiration links we can return to while improving the app.

## Reference Products

- fluffy: Muslim productivity app built around prayers, tasks, habits, and focus. Reference: https://myfluffy.app/
- Tarteeb: Muslim productivity app with prayer tracking, Islamic habits, goals, schedules, tasks, and progress analytics. Reference: https://apps.apple.com/us/app/tarteeb-muslim-productivity/id6744073360
- Tasklyo: glassy productivity dashboard with focus sprints, Islamic hub, cloud sync, and Google login. Reference: https://tasklyo.netlify.app/
- Hadaff: Islamic growth app with Quran, Athkar, habits, AI guidance, dashboards, and progress signals. Reference: https://hadaff.de/
- Nafs: Islamic screen-time app with strong dashboard visuals, ibadah actions, and step-based explanation. Reference: https://www.getnafs.com/
- Solah: faith, productivity, health, sleep, nutrition, Hijri calendar, and Quran tracking in one life system. Reference: https://solah.app/
- Noor UI: Arabic/RTL-first component system with tokens, accessible components, dashboards, tabs, calendars, charts, and bilingual support. Reference: https://noorui.com/
- UI Fuel auth patterns: dark authentication flows, login/signup tabs, password recovery, social sign-in, and onboarding-ready layouts. Reference: https://ui-fuel.com/

## Product Direction

- Itqan should feel like a serious Arabic-first life operating system, not a landing page.
- First screen must be useful: login, account creation, or the user dashboard.
- Auth should support clear login and account creation paths, with a visible way back from signup to login.
- Onboarding should be recoverable: users must always be able to go back to the previous step or return to login.
- Save onboarding only after the full profile state is ready, then mark `profile.onboardingCompleted = true`.

## Visual Rules

- Keep the current dark navy foundation: `#000E30`, `#071A3A`, `#0C2550`.
- Use cyan as the main action color: `#08A7E7`.
- Use restrained cards: max 18px radius for major panels, 8-12px for controls.
- Keep RTL layout explicit on Arabic-first screens.
- Buttons should include icons where the action benefits from recognition: login, signup, back, logout, save.
- Avoid marketing hero layouts inside the app. Prioritize operational screens, focused forms, and dashboard surfaces.

## Auth Flow Rules

- Login: email + password + clear error messages.
- Signup: name + email + password + password confirmation.
- Signup must lead to onboarding, not straight to dashboard.
- Existing users should enter dashboard only when `onboardingCompleted` is true.
- Old users with a saved `profile.name` can be migrated to completed onboarding.

## Next Improvements

- Add password reset.
- Add Google login if Firebase provider is enabled.
- Add form-level disabled states and field validation hints.
- Add a small account recovery/help link.
- Replace remaining mojibake text in older screens with clean Arabic strings.
