# WAHAP — Flutter Mobile Conversion Guide

> Convert the existing full-stack web app (React 19 + Express + MongoDB) into a cross-platform mobile app using **Flutter (Dart)**. Backend is reused as-is.

## Project Context

| Item | Value |
|---|---|
| **App concept** | WAHAP — Event & venue management: browse events, view interactive venue maps with stall navigation, QR entry, feedback/reviews, plus an admin command center (create/edit events, map editor, banners) |
| **Current stack** | React 19 + react-router-dom 7 + Axios, Node/Express 5 + Mongoose, MongoDB, Leaflet + react-leaflet maps, jsQR + qrcode.react, Google OAuth stub + JWT-ish email login |
| **Core features to migrate** | 1) Email auth + admin guard 2) Event browse/search/filter 3) Interactive venue map + L-route navigation + visit feedback 4) QR scan-to-open-event (+ file-upload fallback) + image uploads (Multer) |
| **Backend reuse** | Yes — mobile app consumes existing REST endpoints. No backend rewrite. |

Existing REST surface (from `server/routes/`):

```
POST /api/auth/signup | POST /api/auth/signin | GET /api/auth/:id
GET  /api/events[?city=&type=&query=] | GET /api/events/:id
POST /api/events/create (multipart: eventImage, bannerImage, layoutImage)
PUT  /api/events/:id | DELETE /api/events/:id
GET  /api/stalls/:eventId | POST /api/stalls/add | DELETE /api/stalls/delete/:stallId
POST /api/visits/record (or /api/visits) | GET /api/visits/feedback/:stallId (confirm exact path in visitRoutes.js)
GET  /api/banners/:eventId | POST /api/banners (multipart)
GET  /uploads/<file>  (static images)
```

Web routes (from `client/src/App.js`) to migrate:

```
 /                    → Home (hero carousel + grouped event rows)
 /events?type=&city=&query= → EventList
 /event/:id           → EventDetails
 /event/:id/map       → EventMap (VenueMap)
 /scan-qr             → QrScanner
 /signin, /signup     → Auth
 /admin               → AdminDashboard (guarded)
 /admin/create        → AdminCreateEvent (guarded)
 /admin/edit/:id      → AdminEditEvent (guarded)
 /admin/map/:eventId  → AdminMapEditor (guarded)
 /admin/banners       → ManagerBanners (guarded)
```

---

## 1. Project Structure (clean architecture)

Create alongside the repo (do NOT mix into `client/`):

```
wahap_mobile/
  lib/
    main.dart                  # entry: DI, theme, router
    core/
      config/app_config.dart   # baseUrl (env-aware)
      network/dio_client.dart  # Dio + auth interceptor + logging
      storage/secure_storage.dart
      storage/prefs_store.dart
      theme/app_theme.dart
      utils/image_url.dart     # mirrors web formatImageUrl()
      utils/date_format.dart   # mirrors formatEventDate()
    data/
      models/event_model.dart | stall_model.dart | banner_model.dart | visit_model.dart | user_model.dart
      repositories/event_repository.dart | stall_repository.dart | visit_repository.dart | auth_repository.dart | banner_repository.dart
    state/
      auth_provider.dart       # ChangeNotifier (or Riverpod equivalent)
      events_provider.dart
      map_provider.dart
    navigation/
      app_router.dart          # go_router table (Stack + Bottom Tabs + admin guard)
      admin_guard.dart
    features/
      home/home_screen.dart + widgets/event_row.dart, hero_carousel.dart
      events/event_list_screen.dart | event_detail_screen.dart
      map/venue_map_screen.dart    # flutter_map replacement for Leaflet
      map/admin_map_editor_screen.dart
      qr/qr_scanner_screen.dart    # mobile_scanner replacement for jsQR/getUserMedia
      auth/signin_screen.dart | signup_screen.dart
      admin/admin_dashboard_screen.dart | admin_create_event_screen.dart | admin_edit_event_screen.dart | banner_manager_screen.dart
      feedback/widgets/rating_sheet.dart
  assets/images/  pubspec.yaml  .env (API_BASE_URL, GOOGLE_CLIENT_ID)
```

Packages (`pubspec.yaml` essentials):

```yaml
dependencies:
  flutter:
  go_router: ^14.0.0
  dio: ^5.4.0
  provider: ^6.1.0          # or flutter_riverpod
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.0
  flutter_map: ^6.0.0       # replaces Leaflet
  latlong2: ^0.9.0
  mobile_scanner: ^5.0.0    # replaces jsQR + BarcodeDetector
  qr_flutter: ^4.1.0        # replaces qrcode.react
  image_picker: ^1.0.0      # replaces <input type=file> (QR-from-image + event image upload)
  cached_network_image: ^3.3.0
  google_sign_in: ^6.2.0
  jwt_decoder: ^2.0.0
```

---

## 2. Navigation Mapping (React Router → go_router)

Pattern: web `BrowserRouter + ProtectedRoute` → mobile `GoRouter` with `StatefulShellRoute` (bottom tabs) + top-level `Stack` pushes + `redirect` guard. The web hides Navbar/Footer on `/map` and `/admin*` — on mobile that becomes: tabs only on attendee screens, fullscreen pushes for map/editor/admin.

| Web route | Mobile destination | Navigation type |
|---|---|---|
| `/` Home | `HomeScreen` | Tab 1 (Explore) |
| `/events?...` | `EventListScreen(type,city,query)` | Tab 1 push / Tab 2 (Events) with filter sheet |
| `/event/:id` | `EventDetailScreen(id)` | Stack push |
| `/event/:id/map` | `VenueMapScreen(eventId)` | Fullscreen stack push (no tab bar) |
| `/scan-qr` | `QrScannerScreen` | Tab 3 (Scan) — camera view |
| `/signin`, `/signup` | `SignIn/SignUpScreen` | Stack modal (redirects back to pending event after login, mirroring `pendingMapRedirect`) |
| `/admin`, `/admin/create`, `/admin/edit/:id`, `/admin/map/:eventId`, `/admin/banners` | Admin screens | Separate admin stack, guarded by `redirect` (mirrors `ProtectedRoute`: email == admin@wahap.com / admin@gmail.com) |

Key behavioral ports:
- `ProtectedRoute` → `admin_guard.dart` + `redirect:` on admin branch.
- `useSearchParams` filters (`?type=&city=&query=`) → `state.uri.queryParameters` passed as screen args; filter UI becomes a bottom sheet, not a URL bar.
- `navigate(-1)`/back-links → `context.pop()`.
- `hideNavbarFooter` on map/admin → `hideBottomNav` per location in the shell.

---

## 3. UI/UX Refactoring Strategy

| Web (React + CSS) | Flutter equivalent | Notes |
|---|---|---|
| `<div>` + flexbox/grid, `.event-row` horizontal scroll + arrow buttons | `Column/Row/Flex`, horizontal `ListView.builder`, `PageView` for hero carousel | Delete web arrow-button logic (`rowRefs`, `scrollRowBy`); touch scroll is native |
| `Home.jsx` grouped rows (10-item preview + "View all" `Link`) | `CustomScrollView` + `SliverToBoxAdapter` per type group + "View all" → `context.push('/events?type=...')` | Keep `EVENT_TYPES` ordering logic — port `constants/eventTypes.js` to Dart |
| `<table>`/admin grids, `.events-grid` CSS grid | `GridView.builder` (`SliverGridDelegateWithFixedCrossAxisCount`) or `ListView` cards | 2-col grid on tablets via `MediaQuery`/`LayoutBuilder` |
| `Leaflet MapContainer + ImageOverlay + Marker + Polyline + Popup` | `flutter_map` with `CRS.simple`-style custom bounds: render the same procedural venue SVG as an `OverlayImage`/asset, stalls as `Marker`s, L-routes as `Polyline`s, popups as `showModalBottomSheet` | See §6 for coordinate mapping (`[100-y, x]` → screen point) |
| `VenueMap.css` isometric 3D markers, `vm-visited-badge ✔`, progress bar | Custom `Marker` widget (emoji + label chip + visited badge), `LinearProgressIndicator` for explored count | Keep `TYPE_CFG` icon/color table — port verbatim to Dart map |
| `window.alert / confirm` (route set, delete event) | `SnackBar` (route set), `showDialog(AlertDialog)` (delete confirm) | Never use blocking web dialogs |
| `localStorage "vm_visited_<eventId>"`, `"wahap_temp_user"`, `"wahap_user_email"` | `SharedPreferences` for visited IDs + non-secret user cache; `FlutterSecureStorage` for password/token | See §4 |
| `getUserMedia + BarcodeDetector/jsQR + FileReader` (QrScanner.jsx) | `mobile_scanner` (live) + `image_picker` + QR decode for upload fallback | Camera permission via `permission_handler`; must add `NSCameraUsageDescription` (iOS) + `CAMERA` (Android) |
| `qrcode.react` (event QR) | `qr_flutter` `QrImageView(data: eventId)` | Same payload: event ID string |
| `Navbar + Footer` | `BottomNavigationBar`/`NavigationBar` (Explore, Events, Scan, Profile) + optional `Drawer` for admin entry | Admin screens live outside tabs |
| `AdminMapEditor` click-to-place + snap-to-corridor | `MapController` tap → `onTap` latlng → convert to 0–100 grid → snap to `[12.5,37.5,62.5,87.5]` → confirm sheet (name + type) → `POST /api/stalls/add` | Same algorithm as `MapClickHandler` — port as-is |
| Image `<img src={API_URL + path}>` + `formatImageUrl()` | `CachedNetworkImage(imageUrl: ImageUrl.resolve(path))` | Same backslash-normalization (`replace(/\\/g,'/')`) |
| `window.dispatchEvent("wahap_data_changed")` refresh hack | Provider/Riverpod `notifyListeners()` + `refreshIndicator` / `ref.invalidate` | Delete the event-bus pattern entirely |

**SafeArea / touch rules:** wrap every screen in `SafeArea` + `Scaffold`; min touch target 48×48; stalls bottom-sheet instead of Leaflet popups (popups are unreadable on small screens); pinch-zoom map via `InteractionOptions` (replaces `scrollWheelZoom={false}` desktop hack — on mobile enable pinch, disable double-tap-drag conflicts in editor).

---

## 4. Data & State Management

### 4.1 Token / session storage (replaces localStorage)

Web today stores `wahap_temp_user` (name), `wahap_user_email`, `wahap_user_picture`, `vm_visited_<eventId>` in `localStorage`, and has no real JWT persistence (Google flow is a mock — `SignIn.jsx` just derives a name locally). For mobile:

- **Secrets** (password never; auth token once backend issues a real JWT): `FlutterSecureStorage` (`auth_token`, `user_email`).
- **Non-secrets** (display name, avatar, visited stall IDs per event): `SharedPreferences` (`user_name`, `visited_<eventId>` as `List<String>`).
- **Admin check stays client-side for now** (mirror web): `email.toLowerCase() in {admin@wahap.com, admin@gmail.com}` → `isAdmin` flag in `AuthProvider`. ⚠️ Backend has no role enforcement — keep this parity but flag it as a hardening task (add real JWT + `isAdmin` claim server-side; passwords are currently plaintext per TECH_STACK docs).

### 4.2 API layer (replaces per-file `axios.get(...)` + `config.js`)

Single `Dio` client: `baseUrl = API_BASE_URL`, `connectTimeout 15s`, interceptors: (a) attach `Authorization: Bearer <token>` if present, (b) normalize image paths centrally, (c) 401 → clear storage + redirect to `/signin` preserving pending event ID (mobile equivalent of `sessionStorage.pendingMapRedirect`).

```dart
// lib/core/config/app_config.dart
class AppConfig {
  static const baseUrl = String.fromEnvironment('API_BASE_URL',
      defaultValue: 'http://10.0.2.2:5000'); // Android emulator → host loopback
}
```

> Emulator networking: Android emulator cannot reach `localhost:5000` — use `http://10.0.2.2:5000`; iOS simulator can use `http://localhost:5000`; physical devices use your machine LAN IP (`http://192.168.x.x:5000`).

### 4.3 State sync (replaces `useState/useEffect` + `wahap_data_changed` events)

- `AuthProvider (ChangeNotifier)`: `user, isAdmin, signIn/signUp/signOut`, persists via storage above, emits `notifyListeners()`; router `refreshListenable` reacts to it.
- `EventsProvider`: `events, filtered(type/city/query), fetchEvents(), deleteEvent()` (with confirm dialog), `refresh()` for pull-to-refresh.
- `MapProvider (per eventId)`: `stalls, routeStart/routeEnd, visitedIds, feedbackList, fetchStalls(), setStart/setEnd(), submitVisit(feedback)` → `POST /api/visits/...` then persist visited ID.
- Offline/cache (new capability, web lacks it): cache last `GET /api/events` + `GET /api/stalls/:eventId` in `SharedPreferences`/sqlite (or `dio_cache_interceptor`) so maps work with spotty venue Wi-Fi; queue `POST /api/visits` when offline and flush on reconnect (`connectivity_plus`).

---

## 5. Boilerplate Code

### 5.1 Entry point — `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'state/auth_provider.dart';
import 'state/events_provider.dart';
import 'state/map_provider.dart';
import 'navigation/app_router.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..load()),
        ChangeNotifierProvider(create: (_) => EventsProvider()),
        ChangeNotifierProvider(create: (_) => MapProvider()),
      ],
      child: const WahapApp(),
    ),
  );
}

class WahapApp extends StatelessWidget {
  const WahapApp({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return MaterialApp.router(
      title: 'WAHAP',
      theme: AppTheme.light(),
      routerConfig: buildRouter(auth),
    );
  }
}
```

### 5.2 Core navigation — `lib/navigation/app_router.dart`

```dart
import 'package:go_router/go_router.dart';
import '../state/auth_provider.dart';
import 'admin_guard.dart';
import '../features/home/home_screen.dart';
import '../features/events/event_list_screen.dart';
import '../features/events/event_detail_screen.dart';
import '../features/map/venue_map_screen.dart';
import '../features/qr/qr_scanner_screen.dart';
import '../features/auth/signin_screen.dart';
import '../features/auth/signup_screen.dart';
import '../features/admin/admin_dashboard_screen.dart';
import '../features/admin/admin_create_event_screen.dart';
import '../features/admin/admin_edit_event_screen.dart';
import '../features/map/admin_map_editor_screen.dart';
import '../features/admin/banner_manager_screen.dart';
import 'package:flutter/material.dart';

GoRouter buildRouter(AuthProvider auth) {
  return GoRouter(
    refreshListenable: auth,
    initialLocation: '/',
    redirect: (ctx, state) {
      final loc = state.matchedLocation;
      final isAdminRoute = loc.startsWith('/admin');
      if (isAdminRoute && !isAdmin(auth.email)) return '/'; // mirrors ProtectedRoute
      return null;
    },
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (ctx, st, shell) => Scaffold(
          body: SafeArea(child: shell),
          bottomNavigationBar: NavigationBar(
            selectedIndex: shell.currentIndex,
            onDestinationSelected: shell.goBranch,
            destinations: const [
              NavigationDestination(icon: Icon(Icons.explore), label: 'Explore'),
              NavigationDestination(icon: Icon(Icons.event), label: 'Events'),
              NavigationDestination(icon: Icon(Icons.qr_code_scanner), label: 'Scan'),
              NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
            ],
          ),
        ),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: '/', builder: (_, __) => const HomeScreen())]),
          StatefulShellBranch(routes: [GoRoute(
            path: '/events',
            builder: (_, s) => EventListScreen(
              type: s.uri.queryParameters['type'],
              city: s.uri.queryParameters['city'],
              query: s.uri.queryParameters['query'],
            ),
          )]),
          StatefulShellBranch(routes: [GoRoute(path: '/scan', builder: (_, __) => const QrScannerScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/profile', builder: (_, __) => const SignInScreen())]),
        ],
      ),
      GoRoute(path: '/event/:id', builder: (_, s) => EventDetailScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/event/:id/map', builder: (_, s) => VenueMapScreen(eventId: s.pathParameters['id']!)),
      GoRoute(path: '/signin', builder: (_, __) => const SignInScreen()),
      GoRoute(path: '/signup', builder: (_, __) => const SignUpScreen()),
      GoRoute(path: '/admin', builder: (_, __) => const AdminDashboardScreen()),
      GoRoute(path: '/admin/create', builder: (_, __) => const AdminCreateEventScreen()),
      GoRoute(path: '/admin/edit/:id', builder: (_, s) => AdminEditEventScreen(id: s.pathParameters['id']!)),
      GoRoute(path: '/admin/map/:eventId', builder: (_, s) => AdminMapEditorScreen(eventId: s.pathParameters['eventId']!)),
      GoRoute(path: '/admin/banners', builder: (_, __) => const BannerManagerScreen()),
    ],
  );
}
```

```dart
// lib/navigation/admin_guard.dart — mirrors App.js ProtectedRoute
bool isAdmin(String? email) {
  final e = (email ?? '').toLowerCase();
  return e == 'admin@wahap.com' || e == 'admin@gmail.com';
}
```

### 5.3 API client + repository sketch

```dart
// lib/core/network/dio_client.dart
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/secure_storage.dart';

Dio buildDio(SecureStore store) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConfig.baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (o, h) async {
      final token = await store.read('auth_token');
      if (token != null) o.headers['Authorization'] = 'Bearer $token';
      return h.next(o);
    },
  ));
  return dio;
}
```

```dart
// lib/data/repositories/event_repository.dart
import 'package:dio/dio.dart';
import '../models/event_model.dart';

class EventRepository {
  final Dio dio;
  EventRepository(this.dio);

  Future<List<EventModel>> list({String? city, String? type, String? query}) async {
    final res = await dio.get('/api/events', queryParameters: {
      if (city != null && city != 'All') 'city': city,
      if (type != null && type.isNotEmpty) 'type': type,
      if (query != null && query.isNotEmpty) 'query': query,
    });
    return (res.data as List).map((e) => EventModel.fromJson(e)).toList();
  }

  Future<EventModel> byId(String id) async =>
      EventModel.fromJson((await dio.get('/api/events/$id')).data);

  Future<void> remove(String id) async => dio.delete('/api/events/$id');

  Future<void> create(Map<String, dynamic> fields, List<String> imagePaths) async {
    final form = FormData.fromMap({
      ...fields,
      if (imagePaths.isNotEmpty)
        'eventImage': await MultipartFile.fromFile(imagePaths.first),
    });
    await dio.post('/api/events/create', data: form);
  }
}
```

### 5.4 Type config + route math (ported from `VenueMap.jsx`)

```dart
// stall type table — mirrors TYPE_CFG
const stallTypes = {
  'stall': ('🛍️', 0xFFFFFFFF, 'Stall'),
  'stage': ('🎤', 0xFFFFEAA7, 'Stage'),
  'restroom': ('🚻', 0xFF55EFC4, 'Restroom'),
  'food': ('🍔', 0xFFFAB1A0, 'Food Court'),
  'entry': ('🚪', 0xFFE056FD, 'Entry Gate'),
  'exit': ('🏁', 0xFFC8D6E5, 'Exit'),
  'help': ('🧭', 0xFFFEEAA7, 'Help Desk'),
};

// L-route builder — mirrors buildRoutes(from, to); input/output in 0–100 grid space
List<List<Point100>> buildRoutes(Point100 from, Point100 to) {
  const snap = [12.5, 37.5, 62.5, 87.5];
  double near(double v) => snap.reduce((p, c) => (c - v).abs() < (p - v).abs() ? c : p);
  final midX = near((from.x + to.x) / 2);
  final midY = near((from.y + to.y) / 2);
  final p1 = [from, Point100(midX, from.y), Point100(midX, to.y), to];
  final p2 = [from, Point100(from.x, midY), Point100(to.x, midY), to];
  final dx = (from.x - to.x).abs(), dy = (from.y - to.y).abs();
  return (dx > 1 && dy > 1) ? [p1, p2] : [p1];
}
```

---

## 6. Backend & API Integration Notes

1. **CORS** (`server/index.js` currently allows a single `FRONTEND_URL` origin with `credentials: true`). Mobile apps via Dio/`http` are non-browser clients and don't enforce CORS, so **no CORS change is needed** for the app itself. Only change CORS if you also host a new web admin panel on a different origin — then allowlist it:
   ```js
   const allowed = [process.env.FRONTEND_URL, process.env.ADMIN_WEB_URL].filter(Boolean);
   app.use(cors({ origin: allowed, credentials: true }));
   ```
2. **Base URL per environment:** emulator `http://10.0.2.2:5000` (Android) / `http://localhost:5000` (iOS sim) / LAN IP for devices / Render URL for prod. Keep `REACT_APP_API_URL` semantics as `API_BASE_URL` in the Flutter `.env`.
3. **Uploads:** `POST /api/events/create` and banners use Multer multipart (`eventImage`, `bannerImage`, `layoutImage`) — use Dio `FormData` + `MultipartFile.fromFile` (from `image_picker` paths). Image read-back is `${BASE}/uploads/<file>` with backslash normalization — centralize in `ImageUrl.resolve()`.
4. **Auth hardening (recommended before store release):** passwords are plaintext and admin is an email string-check; add bcrypt + real JWT with `isAdmin` claim and protect `POST/PUT/DELETE /api/events`, `POST /api/stalls/add`, `DELETE /api/stalls/...`, banner writes.
5. **Verify ambiguous endpoint:** web calls both `/api/visits/record` (VenueMap.jsx) and the documented `POST /api/visits` — confirm against `server/routes/visitRoutes.js` + `visitController.js` before coding `VisitRepository`.

## 7. Native Capabilities & Responsiveness Checklist

- [ ] Push notifications (`firebase_messaging`) for new events / event-day reminders — web has none; plan early.
- [ ] Secure token storage (`flutter_secure_storage`) + biometric gate for admin actions (optional).
- [ ] Offline map + event cache; queued visit/feedback posts with retry.
- [ ] Deep links: `wahap://event/<id>` for QR payloads so scanned codes open outside the scanner too.
- [ ] Permissions: camera (QR), photos (uploads), notifications; handle denied/permanently-denied states with settings redirect.
- [ ] Performance: `ListView.builder` everywhere (never map large lists into `Column`); `CachedNetworkImage` with placeholders; paginate `GET /api/events` if the catalog grows.
- [ ] QA matrix: Android emulator + iOS sim + one physical device per OS; test `10.0.2.2` vs LAN IP; test QR scan in low light; test map pinch-zoom vs editor-tap conflict.

## 8. Suggested Migration Order

1. Config + Dio + storage + router shell (attendee tabs, admin guard) — app runs with empty screens.
2. Auth screens (signin/signup, pending-redirect after QR).
3. Home + EventList + EventDetail (read-only, proves API integration).
4. QR scanner → deep link to event.
5. Venue map (flutter_map + markers + L-routes + feedback sheet + visited tracking).
6. Admin stack (dashboard CRUD, create/edit forms with image upload, map editor tap-to-place, banner manager).
7. Polish: offline cache, push, app icons/splash, release signing.
