/* ============================================================================
   TIMAWA — web push public configuration
   ----------------------------------------------------------------------------
   The VAPID public key below is safe to publish: it only identifies this app to
   the browser's push service. The matching PRIVATE key lives in
   tools/.vapid-private.pem and is used by tools/send_activity_push.py to send.

   Rotate both with:  python tools/generate_vapid_keys.py --force
   (every member then has to turn notifications on again)
   ========================================================================== */

window.TIMAWA_PUSH = {
    vapidPublicKey: 'BMPML20KEVtNTRYktjMGU9mShJgz4BDfYXcw6K6MDfxC7Ym_NfKztALDxFBWN49IMGmQRTjNuzVB58Pb3ov0S9c',
    collection: 'pushSubscriptions',
    defaultUrl: 'calendar.html'
};
